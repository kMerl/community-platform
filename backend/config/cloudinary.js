const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "dliqudaq7",
    api_key: "612723744546218",
    api_secret: "EohxeU3hglJqXlOnYp_p5lvvxQo"
});

module.exports = cloudinary;