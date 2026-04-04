//vote on post
const Post = require("../models/Post"); 
//const cloudinary = require("../config/cloudinary");

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
        const posts = await Post.find()
        .populate("author", "name")
        .sort({createdAt: -1});
    
        res.json(posts);
    } catch(err){
        res.status(500).json({error: err.message});
    }  
};

//vote
exports.vote = async (req, res) => {
    try{
        const {voteType} = req.body;
        
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({message: "Post not found"});

        //check already voted
        const existingVote = post.voters.find(
            v => v.userId.toString() === req.user.id
        );

        if(existingVote){
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
        const {reason} = req.body;
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
        userID: req.user.id,
        reason
    });
    //threshold
    if (post.flags.length >= 3){
        post.status = "under_review";
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
    
    const posts = await Post.find({status: "under_review"});
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
    res.json(post);
};



//comments
exports.addComment = async (req, res) => {
    try{
        const {text} = req.body;
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        post.comments.push({
            userId: req.user.id,
            text
        });

        await post.save()
        res.json(post);
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
}

exports.getComments = async (req, res) => {
    try{
        const {text} = req.body;
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        res.json(post.comments);
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
};