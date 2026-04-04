const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
    createPost, 
    getPosts,
    vote,
    getFlaggedPosts,
    approvePost,
    removePost
} = require("../controllers/postController");

const {flagPost} = require("../controllers/postController");

const {addComment, getComments} = require("../controllers/postController");

//const upload = require("../middleware/upload");


//create post

router.post("/", auth, createPost);

//get all posts
router.get("/", getPosts);

//vote on post (protected route)
router.post("/:id/vote", auth, vote);

//flag on post (protected)
router.post("/:id/flag", auth, flagPost);

//comment on post (protected)
router.post("/:id/comment", auth, addComment);
router.get("/:id/comments", getComments);

//moderator
router.get("/flagged", auth, getFlaggedPosts);
router.post("/:id/approve", auth, approvePost);
router.post("/:id/remove", auth, removePost);

module.exports = router;
