var logging = require("./logging");
var node_redis = require("redis");
var config = require("../config");
var url = require("url");

var redis = null;

// sets up redis connection
// flushes redis when using ephemeral storage (e.g. Heroku)
function connect_redis() {
  logging.log("connecting to redis...");
  // parse redis env
  var redis_env = process.env.REDISCLOUD_URL || process.env.REDIS_URL;
  var redis_url = redis_env ? url.parse(redis_env) : {};
  redis_url.port = redis_url.port || 6379;
  redis_url.hostname = redis_url.hostname || "localhost";
  // connect to redis
  redis = node_redis.createClient(redis_url.port, redis_url.hostname);
  if (redis_url.auth) {
    redis.auth(redis_url.auth.split(":")[1]);
  }
  redis.on("ready", function() {
    logging.log("Redis connection established.");
    if (process.env.EPHEMERAL_STORAGE) {
      logging.log("Storage is ephemeral, flushing redis");
      redis.flushall();
    }
  });
  redis.on("error", function(err) {
    logging.error(err);
  });
  redis.on("end", function() {
    logging.warn("Redis connection lost!");
  });
}

var exp = {};

// returns the redis instance
exp.get_redis = function() {
  return redis;
};


// updates the redis instance's server_info object
// callback: error, info object
exp.info = function(callback) {
  redis.info(function(err, res) {
    // parse the info command and store it in redis.server_info

    // this code block was taken from mranney/node_redis#on_info_cmd
    // http://git.io/LBUNbg
    var lines = res.toString().split("\r\n");
    var obj = {};
    lines.forEach(function(line) {
      var parts = line.split(":");
      if (parts[1]) {
        obj[parts[0]] = parts[1];
      }
    });
    obj.versions = [];
    if (obj.redis_version) {
      obj.redis_version.split(".").forEach(function(num) {
        obj.versions.push(+num);
      });
    }
    redis.server_info = obj;

    callback(err, redis.server_info);
  });
};

// sets the timestamp for +userId+
// if +temp+ is true, the timestamp is set so that the record will be outdated after 60 seconds
// these 60 seconds match the duration of Mojang's rate limit ban
// callback: error
exp.update_timestamp = function(rid, userId, temp, callback) {
  logging.debug(rid, "updating cache timestamp (" + temp + ")");
  var sub = temp ? config.caching.local - 60 : 0;
  var time = Date.now() - sub;
  // store userId in lower case if not null
  userId = userId && userId.toLowerCase();
  redis.hmset(userId, "t", time, function(err) {
    callback(err);
  });
};

// create the key +userId+, store +skin_hash+, +cape_hash+ and time
// if either +skin_hash+ or +cape_hash+ are undefined, they will not be stored
// this feature can be used to write both cape and skin at separate times
// +callback+ contans error
exp.save_hash = function(rid, userId, skin_hash, cape_hash, callback) {
  logging.debug(rid, "caching skin:" + skin_hash + " cape:" + cape_hash);
  var time = Date.now();
  // store shorter null byte instead of "null"
  skin_hash = skin_hash === null ? "" : skin_hash;
  cape_hash = cape_hash === null ? "" : cape_hash;
  // store userId in lower case if not null
  userId = userId && userId.toLowerCase();
  if (skin_hash === undefined) {
    redis.hmset(userId, "c", cape_hash, "t", time, function(err) {
      callback(err);
    });
  } else if (cape_hash === undefined) {
    redis.hmset(userId, "s", skin_hash, "t", time, function(err) {
      callback(err);
    });
  } else {
    redis.hmset(userId, "s", skin_hash, "c", cape_hash, "t", time, function(err) {
      callback(err);
    });
  }
};

// removes the hash for +userId+ from the cache
exp.remove_hash = function(rid, userId) {
  logging.debug(rid, "deleting hash from cache");
  redis.del(userId.toLowerCase(), "h", "t");
};

// get a details object for +userId+
// {skin: "0123456789abcdef", cape: "gs1gds1g5d1g5ds1", time: 1414881524512}
// callback: error, details
// details is null when userId not cached
exp.get_details = function(userId, callback) {
  // get userId in lower case if not null
  userId = userId && userId.toLowerCase();
  redis.hgetall(userId, function(err, data) {
    var details = null;
    if (data) {
      details = {
        skin: data.s === "" ? null : data.s,
        cape: data.c === "" ? null : data.c,
        time: Number(data.t)
      };
    }
    callback(err, details);
  });
};

connect_redis();
module.exports = exp;