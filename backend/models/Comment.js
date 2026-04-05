const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        parentCommentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },

        text: {
            type: String,
            required: true
        },

        replies: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Comment" 
        }]
    },
    {timestamps: true}
    
);

module.exports = mongoose.model("Comment", commentSchema);