const rateLimit = require("express-rate-limit");

exports.voteLimiter = rateLimit({
    windowMs: 60*60*1000,
    max: 20,
    message: { error: "Too many votes, try again later" }
});

exports.flagLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: "Too many flags, try again later" }
});

exports.commentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { error: "Too many comments, try again later" }
});