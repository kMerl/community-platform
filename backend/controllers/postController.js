//vote on post
const Post = require("../models/Post"); 
//const cloudinary = require("../config/cloudinary");
const Comment = require("../models/Comment");
const User = require("../models/User");

const buildPostQuery = (extra = {}) =>
    Post.find(extra)
        .populate("author", "name reputation createdAt")
        .sort({ createdAt: -1 });

const attachCommentStats = async (posts, currentUserId) => {
    const postIds = posts.map((post) => post._id);
    const commentStats = await Comment.aggregate([
        { $match: { postId: { $in: postIds } } },
        {
            $group: {
                _id: "$postId",
                commentCount: { $sum: 1 }
            }
        }
    ]);

    const statsMap = commentStats.reduce((acc, item) => {
        acc[item._id.toString()] = item.commentCount;
        return acc;
    }, {});

    return posts.map((post) => {
        const data = post.toObject();
        const existingVote = currentUserId
            ? post.voters.find((vote) => vote.userId.toString() === currentUserId)
            : null;

        return {
            ...data,
            commentCount: statsMap[post._id.toString()] || 0,
            viewerVote: existingVote?.voteType || 0
        };
    });
};

//create post

exports.createPost = async(req, res) => {
    try{
        const {title, content} = req.body;

        const post = await Post.create({
            title, content, author: req.user.id
        });

        res.status(201).json(post);
    } catch(err){
        res.status(500).json({error: err.message});
    }
};

//get all posts

exports.getPosts = async (req, res) => {
    try{
        const query = { status: "active" };

        if (req.query.author) {
            query.author = req.query.author;
        }

        const posts = await buildPostQuery(query);
        const hydratedPosts = await attachCommentStats(posts, req.user?.id);

        res.json(hydratedPosts);
    } catch(err){
        res.status(500).json({error: err.message});
    }  
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findOne({
            _id: req.params.id,
            status: { $ne: "removed" }
        }).populate("author", "name reputation createdAt");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const [hydratedPost] = await attachCommentStats([post], req.user?.id);
        res.json(hydratedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//vote
exports.vote = async (req, res) => {
    try{
        const {voteType} = req.body;

        if (![1, -1].includes(voteType)) {
            return res.status(400).json({ message: "Invalid vote type" });
        }
        
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({message: "Post not found"});

        //check already voted
        const existingVote = post.voters.find(
            v => v.userId.toString() === req.user.id
        );

        if(existingVote){

            //undo reputation
            const oldReputation = (existingVote.voteType === 1?-5:2);
            await User.findByIdAndUpdate(post.author, { $inc: { reputation: oldReputation } });

            //remove vote
            post.votes -= existingVote.voteType;
            existingVote.voteType = voteType;

        } else {
            //new vote
            post.voters.push({
                userId: req.user.id, 
                voteType
            });
        }
        
        //update rep
        const reputationChange = voteType === 1?5:-2;
        await User.findByIdAndUpdate(post.author, {
            $inc: {
                reputation: reputationChange
            }
        })

        //update vote
        post.votes += voteType;
        await post.save();
        res.json(post);

    } catch(err){
        res.status(500).json({error: err.message});
    }
};

//flag post
exports.flagPost = async (req, res) => {
    try{
        const {reason = "Needs moderator review"} = req.body;
        const post = await Post.findById(req.params.id);

        if (!post){
            return res.status(404).json({message: "Post not found"});
        }

        //already flagged
        const alreadyFlagged = post.flags.find(
            f => f.userId.toString() === req.user.id
        );

        if (alreadyFlagged) {
            return res.status(400).json({message:"Already flagged"});
        }
    
    //add flag
    post.flags.push({
        userId: req.user.id,
        reason
    });
    //threshold
    if (post.flags.length >= 3){
        post.status = "review";
    }

    await post.save();
    res.json(post);

    } catch(err) {
        res.status(500).json({error: err.message});
    }
};

//moderator get flagged posts
exports.getFlaggedPosts = async (req, res) => {
    if (req.user.role !== "moderator") {
        return res.status(403).json({ msg: "Access denied" });
    }
    
    const posts = await Post.find({status: "review"}).populate("author", "name");
    res.json(posts);
};

//moderator action on flagged post
exports.approvePost = async (req, res) => {

    if (req.user.role !== "moderator") {
        return res.status(403).json({ msg: "Access denied" });
    }

    const post = await Post.findById(req.params.id);

    post.status = "active";;
    post.flags = [];

    await post.save();

    //reputation
    await User.findByIdAndUpdate(post.author, {$inc:{
        reputation: 10
    }});

    res.json(post);
};

//moderator remove flagged post
exports.removePost = async(req,res) => {

    if (req.user.role !== "moderator") {
        return res.status(403).json({ msg: "Access denied" });
    }

    const post = await Post.findById(req.params.id);
    
    post.status = "removed";
    await post.save();

    //reputation
    await User.findByIdAndUpdate(post.author, {$inc: {reputation: -10}});
    res.json(post);
};



//comments

exports.addComment = async (req, res) => {
    try{
        const {text, parentCommentId} = req.body;
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        // post.comments.push({
        //     userId: req.user.id,
        //     text
        // });
        

        //validation
        let parent = null;
        
        if (parentCommentId) {
            parent = await Comment.findById(parentCommentId);

            if (!parent) {
                return res.status(404).json({ message: "Parent comment not found" });
            }
        }

        const comment = await Comment.create({
            postId: req.params.id,
            userId: req.user.id,
            text,
            parentCommentId: parentCommentId || null
        });
        
        if (parent){ 
            parent.replies.push(comment._id);
            await parent.save();
        }
        res.status(201).json(comment);
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
}

exports.getComments = async (req, res) => {
    try{
        const comments = await Comment.find({
            postId: req.params.id
        })
            .populate("userId", "name"); //get all comments and replies flat

            const map = {};

            comments.forEach(c => {
                map[c._id.toString()] = { ...c._doc, replies: [] };
            });

            const tree = [];

            comments.forEach(c => {
                if (c.parentCommentId) {
                    //attach reply to parent
                     const parent = map[c.parentCommentId.toString()];
                    
                     if (parent) {
                        parent.replies.push(map[c._id.toString()]);
                    }
                } else{
                    tree.push(map[c._id.toString()]); //if top level comment
                }
            });

        res.json(tree);
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const postCount = await Post.countDocuments({
            author: user._id,
            status: { $ne: "removed" }
        });

        const commentCount = await Comment.countDocuments({ userId: user._id });

        res.json({
            ...user.toObject(),
            stats: {
                postCount,
                commentCount
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
