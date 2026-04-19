const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");

const {
    createPost, 
    getPosts,
    getPostById,
    vote,
    getFlaggedPosts,
    approvePost,
    removePost,
    getProfile,
    getRemovedPosts
} = require("../controllers/postController");

const {flagPost} = require("../controllers/postController");

const {addComment, getComments} = require("../controllers/postController");

const { 
    postLimiter, 
    voteLimiter, 
    flagLimiter, 
    commentLimiter 
} = require("../middleware/rateLimiter");

//const upload = require("../middleware/upload");


//create post

router.post("/", auth, createPost);

//get all posts
router.get("/", optionalAuth, getPosts);
router.get("/profile/:userId", optionalAuth, getProfile);

//vote on post (protected route)
router.post("/:id/vote", auth, voteLimiter, vote);

//flag on post (protected)
router.post("/:id/flag", auth, flagLimiter, flagPost);

//comment on post (protected)
router.post("/:id/comment", auth, commentLimiter, addComment);
router.get("/:id/comments", getComments);

//moderator
router.get("/flagged", auth, getFlaggedPosts);
router.get("/removed", auth, getRemovedPosts);
router.post("/:id/approve", auth, approvePost);
router.post("/:id/remove", auth, removePost);
router.get("/:id", optionalAuth, getPostById);

module.exports = router;
