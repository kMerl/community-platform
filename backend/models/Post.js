const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        //voting
        voters: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                voteType: {
                    type: Number,
                    enum: [1, -1],
                    required: true
                }
            }
        ],

        
        flags: [
            {
                userId: String,
                reason: String
            }
        ],

        status: {
            type: String,
            enum: ["active", "review", "removed"],
            default: "active"
        }
        
        // comments: [
        //     {
        //         userId: {
        //             type: String,
        //             required: true
        //         },
        //         text:{
        //             type: String,
        //             required: true
        //         },
        //         createdAt:{
        //             type: Date,
        //             default: Date.now
        //         }   
        //     }
        // ]
    },
    { timestamps: true }    
);

module.exports = mongoose.model("Post", postSchema);