const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const User = require('../../models/User');
const Comment = require('../../models/Comment');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    Comment.find({user: req.user.id}).populate('user').then(comments => {
        res.render('admin/comments', {comments: comments});
    })
});

router.post('/', (req, res) => {
    // res.send('it Works...');
    Post.findById(req.body.id).then(post => {
        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
        });

        post.comments.push(newComment);
        post.save().then(savedPost => {
            newComment.save().then(savedComment => {
                // req.flash('success_message', `${req.user.email} Added a Comment to ${post.title} Successfully, and waiting for Approving`);
                req.flash('success_message', `Your Comment will be reviewed in a moment`);
                res.redirect(`/post/${post.id}`);
            })
        })
    })
});

router.delete('/:id', (req, res) => {
    // Post.findOne({comments: {$in:[req.params.id]}}).then(usedPost => {
    //     usedPost.comments.remove(req.params.id);
    //     usedPost.save().then(updatedPost => {
    //         Comment.findByIdAndDelete(req.params.id).then(deletedComment => {
    //             req.flash('success_message', 'Comment was Deleted Successfully');
    //             res.redirect('/admin/comments');
    //         });
    //     });
    //
    // });

    Comment.findOneAndDelete({_id: req.params.id}).then(deltedComment => {
        Post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, updatedPost) => {
            if (err) console.log(err);
            req.flash('success_message', 'Comment was Deleted Successfully');
            res.redirect('/admin/comments');
        })
    })
});

router.post('/approve-Comment', (req, res) => {
    //res.send(req.body);
    Comment.findOneAndUpdate({_id: req.body.id}, {$set: {approveComment: req.body.approveComment}}).then((err, updatedComment) => {
        if (err) console.log(err);
        // req.flash('success_message', 'Status of Comment was Updated Successfully');
        res.status(200).send('Status of Comment was Updated Successfully');
    })
});

module.exports = router;