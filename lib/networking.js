var http_code = require("http").STATUS_CODES;
var logging = require("./logging");
var request = require("request");
var config = require("../config");
var skins = require("./skins");

var session_url = "https://sessionserver.mojang.com/session/minecraft/profile/";
var skins_url = "https://skins.minecraft.net/MinecraftSkins/";
var capes_url = "https://skins.minecraft.net/MinecraftCloaks/";
var textures_url = "http://textures.minecraft.net/texture/";
var mojang_urls = [skins_url, capes_url];

var skinme_skins_url = "http://www.skinme.cc/skins/";
var skinme_capes_url = "http://www.skinme.cc/cloaks/";
var skinme_image_prefix = "skinme";
var skinme_urls = [skinme_skins_url, skinme_capes_url];

var exp = {};

// extracts the +type+ [SKIN|CAPE] URL
// from the nested & encoded +profile+ object
// returns the URL or null if not present
function extract_url(profile, type) {
  var url = null;
  if (profile && profile.properties) {
    profile.properties.forEach(function(prop) {
      if (prop.name === "textures") {
        var json = new Buffer(prop.value, "base64").toString();
        var props = JSON.parse(json);
        url = props && props.textures && props.textures[type] && props.textures[type].url || null;
      }
    });
  }
  return url;
}

// helper method that calls `get_username_url`, `get_uuid_url` or `get_skinid_url` based on the +usedId+
// +userId+ is used for usernames or skinid while +profile+ is used for UUIDs
function get_url(rid, userId, profile, type, callback) {
  if (userId.indexOf(skinme_image_prefix) !== -1) {
    exp.get_skinid_url(rid, userId, type, function(err, url) {
      callback(err, url || null);
    });
  } else if (userId.length <= 16) {
    // username
    exp.get_username_url(rid, userId, type, function(err, url) {
      callback(err, url || null);
    });
  } else {
    exp.get_uuid_url(profile, type, function(url) {
      callback(null, url || null);
    });
  }
}

// exracts the skin URL of a +profile+ object
// returns null when no URL found (user has no skin)
exp.extract_skin_url = function(profile) {
  return extract_url(profile, "SKIN");
};

// exracts the cape URL of a +profile+ object
// returns null when no URL found (user has no cape)
exp.extract_cape_url = function(profile) {
  return extract_url(profile, "CAPE");
};

// performs a GET request to the +url+
// +options+ object includes these options:
//   encoding (string), default is to return a buffer
// callback: the body, response,
// and error buffer. get_from helper method is available
exp.get_from_options = function(rid, url, options, callback) {
  request.get({
    url: url,
    headers: {
      "User-Agent": "https://crafatar.com"
    },
    timeout: config.server.http_timeout,
    followRedirect: false,
    encoding: options.encoding || null,
  }, function(error, response, body) {
    // log url + code + description
    var code = response && response.statusCode;

    var logfunc = code && code < 405 ? logging.debug : logging.warn;
    logfunc(rid, url, code || error && error.code, http_code[code]);

    switch (code) {
      case 200:
      case 301:
      case 302: // never seen, but mojang might use it in future
      case 307: // never seen, but mojang might use it in future
      case 308: // never seen, but mojang might use it in future
        // these are okay
        break;
      case 404:
      case 204:
      case 429: // this shouldn't usually happen, but occasionally does
      case 500:
      case 503:
      case 504:
        // we don't want to cache this
        body = null;
        break;
      default:
        if (!error) {
          // Probably 500 or the likes
          logging.error(rid, "Unexpected response:", code, body);
        }
        body = null;
        break;
    }

    if (body && !body.length) {
      // empty response
      body = null;
    }

    callback(body, response, error);
  });
};

// helper method for get_from_options, no options required
exp.get_from = function(rid, url, callback) {
  exp.get_from_options(rid, url, {}, function(body, response, err) {
    callback(body, response, err);
  });
};

// make a request to skins.miencraft.net
// the skin url is taken from the HTTP redirect
// type reference is above
exp.get_username_url = function(rid, name, type, callback) {
  exp.get_from(rid, mojang_urls[type] + name + ".png", function(body, response, err) {
    if (!err) {
      if (response) {
        callback(err, response.statusCode === 404 ? null : response.headers.location);
      } else {
        callback(err, null);
      }
    } else {
      callback(err, null);
    }
  });
};

// make a request to skinme.cc
// the skin url is taken from the HTTP redirect
// type reference is above
exp.get_skinid_url = function(rid, skinid, type, callback) {
  skinid = skinid.replace(skinme_image_prefix, '');
  var url = skinme_urls[type] + skinid + ".png";
  exp.get_from(rid, url, function(body, response, err) {
    if (!err) {
      if (response) {
        callback(err, response.statusCode === 404 ? null : url);
      } else {
        callback(err, null);
      }
    } else {
      callback(err, null);
    }
  });
};

// gets the URL for a skin/cape from the profile
// +type+ specifies which to retrieve
exp.get_uuid_url = function(profile, type, callback) {
  var url = null;
  if (type === 0) {
    url = exp.extract_skin_url(profile);
  } else if (type === 1) {
    url = exp.extract_cape_url(profile);
  }
  callback(url || null);
};

// make a request to sessionserver for +uuid+
// callback: error, profile
exp.get_profile = function(rid, uuid, callback) {
  if (!uuid) {
    callback(null, null);
  } else {
    exp.get_from_options(rid, session_url + uuid, { encoding: "utf8" }, function(body, response, err) {
      try {
        body = body ? JSON.parse(body) : null;
        callback(err || null, body);
      } catch(e) {
        if (e instanceof SyntaxError) {
          logging.warn(rid, "Failed to parse JSON", e);
          logging.debug(rid, body);
          callback(err || null, null);
        } else {
          throw e;
        }
      }
    });
  }
};

// get the skin URL for +userId+
// +profile+ is used if +userId+ is a uuid
exp.get_skin_url = function(rid, userId, profile, callback) {
  get_url(rid, userId, profile, 0, function(err, url) {
    callback(err, url);
  });
};

// get the cape URL for +userId+
// +profile+ is used if +userId+ is a uuid
exp.get_cape_url = function(rid, userId, profile, callback) {
  get_url(rid, userId, profile, 1, function(err, url) {
    callback(err, url);
  });
};

// download the +tex_hash+ image from the texture server
// and save it in the +outpath+ file
// callback: error, response, image buffer
exp.save_texture = function(rid, tex_hash, outpath, callback) {
  if (tex_hash) {
    var textureurl = textures_url + tex_hash;
    exp.get_from(rid, textureurl, function(img, response, err) {
      if (err) {
        callback(err, response, null);
      } else {
        skins.save_image(img, outpath, function(img_err, saved_img) {
          callback(img_err, response, saved_img);
        });
      }
    });
  } else {
    callback(null, null, null);
  }
};

module.exports = exp;