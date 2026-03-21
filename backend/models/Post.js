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

        //voting score
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

        //additional fields
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

    },
    { timestamps: true }    
);

module.exports = mongoose.model("Post", postSchema);



//for vote count controller logic:::::

// const post = await Post.findById(postId);

// const existingVote = post.voters.find(
//   v => v.userId.toString() === userId
// );

// if (!existingVote) {
//   // new vote
//   post.voters.push({ userId, voteType });
//   post.voteCount += voteType;

// } else if (existingVote.voteType !== voteType) {
//   // change vote
//   post.voteCount += (voteType - existingVote.voteType);
//   existingVote.voteType = voteType;

// } else {
//   // remove vote (same clicked again)
//   post.voteCount -= existingVote.voteType;
//   post.voters = post.voters.filter(
//     v => v.userId.toString() !== userId
//   );
// }

// await post.save();