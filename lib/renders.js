// Skin locations are based on the work of Confuser, with 1.8 updates by Jake0oo0
// https://github.com/confuser/serverless-mc-skin-viewer
// Permission to use & distribute https://github.com/confuser/serverless-mc-skin-viewer/blob/master/LICENSE

var logging = require("./logging");
var fs = require("fs");
var Canvas = require("canvas");
var Image = Canvas.Image;
var exp = {};

// scales an image from the +imagedata+ onto the +context+
// scaled by a factor of +scale+ with options +d_x+ and +d_y+
function scale_image(imageData, context, d_x, d_y, scale) {
  var width = imageData.width;
  var height = imageData.height;
  context.clearRect(0, 0, width, height); // Clear the spot where it originated from
  for (var y = 0; y < height; y++) { // height original
    for (var x = 0; x < width; x++) { // width original
      // Gets original colour, then makes a scaled square of the same colour
      var index = (x + y * width) * 4;
      context.fillStyle = "rgba(" + imageData.data[index + 0] + ", " + imageData.data[index + 1] + ", " + imageData.data[index + 2] + ", " + imageData.data[index + 3] + ")";
      context.fillRect(d_x + x * scale, d_y + y * scale, scale, scale);
    }
  }
}

// makes images less worse by using binary transparency
function enhance(context) {
  var imagedata = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  var data = imagedata.data;
  // data is [r,g,b,a, r,g,b,a, *]
  for (var i = 3; i < data.length; i += 4) {
    // round to 0 or 255
    data[i] = Math.round(data[i] / 255) * 255;
  }
  context.putImageData(imagedata, 0, 0);
}

// draws the helmet on to the +skin_canvas+
// using the skin from the +model_ctx+ at the +scale+
exp.draw_helmet = function(skin_canvas, model_ctx, scale) {
  // Helmet - Front
//  model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
    model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
  model_ctx.drawImage(skin_canvas, 40 * scale, 8 * scale, 8 * scale, 8 * scale, 2 * scale, 3 / 1.2 * scale, 8 * scale, 8 * scale);
  // Helmet - Right
//  model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
    model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
    model_ctx.drawImage(skin_canvas, 48 * scale, 8 * scale, 8 * scale, 8 * scale, 10 * scale, 13 / 1.2 * scale, 8 * scale, 8 * scale);
  // Helmet - Top
//  model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
    model_ctx.setTransform(1, 0.5 , 1 ,-0.5, 0, 0);
  model_ctx.scale(-1, 1);
  model_ctx.drawImage(skin_canvas, 40 * scale, 0, 8 * scale, 8 * scale, -16 / 1.2 * scale, -3 * scale, 8 * scale, 8 * scale);



    // Helmet - Front（背面）
//  model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
    // Helmet - Right
//  model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
    model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
    model_ctx.drawImage(skin_canvas, 32 * scale, 8 * scale, 8 * scale, 8 * scale, 32 * scale, 24 / 1.2 * scale, 8 * scale, 8 * scale);
    // Helmet - Top
//  model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
    model_ctx.setTransform(1, 0.5 , 1 ,-0.5, 0, 0);
    model_ctx.scale(-1, 1);
    model_ctx.drawImage(skin_canvas, 40 * scale, 0, 8 * scale, 8 * scale, -29 / 1.2 * scale, 8 * scale, 8 * scale, 8 * scale);
};

// draws the head on to the +skin_canvas+
// using the skin from the +model_ctx+ at the +scale+
exp.draw_head = function(skin_canvas, model_ctx, scale) {
  // Head - Front
  model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
  model_ctx.drawImage(skin_canvas, 8 * scale, 8 * scale, 8 * scale, 8 * scale, 2 * scale, 3 / 1.2 * scale, 8 * scale, 8 * scale);
  // Head - Right
  model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
  model_ctx.drawImage(skin_canvas, 16 * scale, 8 * scale, 8 * scale, 8 * scale, 10 * scale, 13 / 1.2 * scale, 8 * scale, 8 * scale);
  // Head - Top
  model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
  model_ctx.scale(-1, 1);
  model_ctx.drawImage(skin_canvas, 8 * scale, 0, 8 * scale, 8 * scale, -3 * scale, 5 * scale, 8 * scale, 8 * scale);


    // Head - Top(背面)
    model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
    model_ctx.scale(-1, 1);
    model_ctx.drawImage(skin_canvas, 8 * scale, 0, 8 * scale, 8 * scale, 8 * scale, 16 * scale, 8 * scale, 8 * scale);
    // Head - Front(背面)
    model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
    model_ctx.drawImage(skin_canvas, 24 * scale, 8 * scale, 8 * scale, 8 * scale, 24 * scale, -8 / 1.2 * scale, 8 * scale, 8 * scale);
    // Head - Right（背面）
    model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
    model_ctx.drawImage(skin_canvas, 0, 8 * scale, 8 * scale, 8 * scale, 32 * scale, 24 / 1.2 * scale, 8 * scale, 8 * scale);

};

// draws the body on to the +skin_canvas+
// using the skin from the +model_ctx+ at the +scale+
// parts are labeled as if drawn from the skin's POV
exp.draw_body = function(rid, skin_canvas, model_ctx, scale) {
  if (skin_canvas.height === 32 * scale) {
    logging.debug(rid, "uses old skin format");

      // Right Leg
      // Right Leg - Right
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 4 * scale, 20 * scale, 4 * scale, 12 * scale, 8 * scale, 24.4 / 1.2 * scale, 4 * scale, 12 * scale);
      // Right Leg - Front
      model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 0 * scale, 20 * scale, 4 * scale, 12 * scale, 12 * scale, 36.4 / 1.2 * scale, 4 * scale, 12 * scale);

    // Left Leg
    // Left Leg - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 4 * scale, 20 * scale, 4 * scale, 12 * scale, 4 * scale, 24.4 / 1.2 * scale, 4 * scale, 12 * scale);


      // Arm Right
      // Arm Right - Right
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, 0, 10 / 1.2 * scale, 4 * scale, 12 * scale);
        // Arm Right - Top
      model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, -12 * scale, 12 / 1.2 * scale, 4 * scale, 4 * scale);

    // Body
    // Body - Front
    model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
    model_ctx.drawImage(skin_canvas, 20 * scale, 20 * scale, 8 * scale, 12 * scale, 4 * scale, 10 / 1.2 * scale, 8 * scale, 12 * scale);

      // Arm Left
      // Arm Left - Front(Right)
      model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 40 * scale, 20 * scale, 4 * scale, 12 * scale, -20 * scale, 26 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Right - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, -16 * scale, 10 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Left - Top
      model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
      model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, 6 * scale, 22 * scale, 4 * scale, 4 * scale);


      // Right Leg （背面）
      // Right Leg - Right
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 8 * scale, 20 * scale, 4 * scale, 12 * scale, 29 * scale, 14.4 / 1.2 * scale, 4 * scale, 12 * scale);
      // Right Leg - Front
      model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 0 * scale, 20 * scale, 4 * scale, 12 * scale, 33 * scale, 47.4 / 1.2 * scale, 4 * scale, 12 * scale);

      // Left Leg
      // Left Leg - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 8 * scale, 20 * scale, 4 * scale, 12 * scale, 25 * scale, 14.4 / 1.2 * scale, 4 * scale, 12 * scale);

      // Arm Right(背面)
      // Arm Right - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, 21 * scale, 0 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Right - Top
      model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, 0 * scale, 25 / 1.2 * scale, 4 * scale, 4 * scale);

      // Body(背面)
      // Body - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 32 * scale, 20 * scale, 8 * scale, 12 * scale, 25 * scale, 0 / 1.2 * scale, 8 * scale, 12 * scale);

      // Arm Left (背面)
      // Arm Left - Front(Right)
      model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 40 * scale, 20 * scale, 4 * scale, 12 * scale, -41 * scale, 37 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Right - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, -37 * scale, 0 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Left - Top
      model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
      model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, -4 * scale, 40  / 1.2 * scale, 4 * scale, 4 * scale);





  } else {
    logging.debug(rid, "uses new skin format");
      // Right Leg
      // Right Leg - Right
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 4 * scale, 20 * scale, 4 * scale, 12 * scale, 8 * scale, 24.4 / 1.2 * scale, 4 * scale, 12 * scale);
      // Right Leg - Front
      model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 0 * scale, 20 * scale, 4 * scale, 12 * scale, 12 * scale, 36.4 / 1.2 * scale, 4 * scale, 12 * scale);

      // Left Leg
      // Left Leg - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 4 * scale, 20 * scale, 4 * scale, 12 * scale, 4 * scale, 24.4 / 1.2 * scale, 4 * scale, 12 * scale);


      // Arm Right
      // Arm Right - Right
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, 0, 10 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Right - Top
      model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, -12 * scale, 12 / 1.2 * scale, 4 * scale, 4 * scale);

      // Body
      // Body - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 20 * scale, 20 * scale, 8 * scale, 12 * scale, 4 * scale, 10 / 1.2 * scale, 8 * scale, 12 * scale);

      // Arm Left
      // Arm Left - Front(Right)
      model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 40 * scale, 20 * scale, 4 * scale, 12 * scale, -20 * scale, 26 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Right - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, -16 * scale, 10 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Left - Top
      model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
      model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, 6 * scale, 22 * scale, 4 * scale, 4 * scale);




      // Right Leg （背面）
      // Right Leg - Right
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 8 * scale, 20 * scale, 4 * scale, 12 * scale, 29 * scale, 14.4 / 1.2 * scale, 4 * scale, 12 * scale);
      // Right Leg - Front
      model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 0 * scale, 20 * scale, 4 * scale, 12 * scale, 33 * scale, 47.4 / 1.2 * scale, 4 * scale, 12 * scale);

      // Left Leg
      // Left Leg - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 8 * scale, 20 * scale, 4 * scale, 12 * scale, 25 * scale, 14.4 / 1.2 * scale, 4 * scale, 12 * scale);

      // Arm Right(背面)
      // Arm Right - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, 21 * scale, 0 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Right - Top
      model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, 0 * scale, 25 / 1.2 * scale, 4 * scale, 4 * scale);

      // Body(背面)
      // Body - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.drawImage(skin_canvas, 32 * scale, 20 * scale, 8 * scale, 12 * scale, 25 * scale, 0 / 1.2 * scale, 8 * scale, 12 * scale);

      // Arm Left (背面)
      // Arm Left - Front(Right)
      model_ctx.setTransform(1, -0.5, 0, 1.2, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 40 * scale, 20 * scale, 4 * scale, 12 * scale, -41 * scale, 37 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Right - Front
      model_ctx.setTransform(1, 0.5, 0, 1.2, 0, 0);
      model_ctx.scale(-1, 1);
      model_ctx.drawImage(skin_canvas, 44 * scale, 20 * scale, 4 * scale, 12 * scale, -37 * scale, 0 / 1.2 * scale, 4 * scale, 12 * scale);
      // Arm Left - Top
      model_ctx.setTransform(-1, 0.5, 1, 0.5, 0, 0);
      model_ctx.drawImage(skin_canvas, 44 * scale, 16 * scale, 4 * scale, 4 * scale, -4 * scale, 40  / 1.2 * scale, 4 * scale, 4 * scale);
  }
};

// sets up the necessary components to draw the skin model
// uses the +img+ skin with options of drawing
// the +helm+ and the +body+
// callback: error, image buffer
exp.draw_model = function(rid, img, scale, helm, body, callback) {
  var image = new Image();

  image.onerror = function(err) {
    callback(err, null);
  };

  image.onload = function() {
    var width = 64 * scale ;
    var original_height = image.height === 32 ? 32 : 64;
    var height = original_height * scale ;
    var model_canvas = new Canvas(20 * scale * 2 + (scale * 2), (body ? 44.8 : 17.6) * scale);
    var skin_canvas = new Canvas(width, height);
    var model_ctx = model_canvas.getContext("2d");
    var skin_ctx = skin_canvas.getContext("2d");

    skin_ctx.drawImage(image, 0, 0, 64, original_height);
    // Scale it
    scale_image(skin_ctx.getImageData(0, 0, 64, original_height), skin_ctx, 0, 0, scale);
    if (body) {
      exp.draw_body(rid, skin_canvas, model_ctx, scale);
    }
    exp.draw_head(skin_canvas, model_ctx, scale);
    if (helm) {
      exp.draw_helmet(skin_canvas, model_ctx, scale);
    }

    // FIXME: This is a temporary fix for #32
    enhance(model_ctx);

    model_canvas.toBuffer(function(err, buf) {
      callback(err, buf);
    });
  };

  image.src = img;
};

// helper method to open a render from +renderpath+
// callback: error, image buffer
exp.open_render = function(rid, renderpath, callback) {
  fs.readFile(renderpath, function(err, buf) {
    callback(err, buf);
  });
};


module.exports = exp;