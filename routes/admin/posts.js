const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    Post.find({}).then(posts => {

        res.render('admin/posts', {posts: posts});

    })
});

router.get('/create', (req, res) => {
    //res.send('It works...');
    res.render('admin/posts/create');
});

router.post('/create', (req, res) => {
    // res.send('It works...');
    let allowComments = false;
    if (req.body.allowComments) {
        allowComments = true;
    }

    let newPost = new Post({
        title: req.body.title,
        status: req.body.status,
        allowComments: allowComments,
        body: req.body.body
    });

    newPost.save().then(savedPost => {
        console.log(`Saved Post: ${savedPost}`);
        res.redirect('/admin/posts')
    }).catch(err => console.log(`COULD NOT SAVE POST BECAUSE: ${err}`));
});

router.get('/edit/:id', (req, res) => {
    // res.send('It works...');
    Post.findById(req.params.id).then(post => {

        res.render('admin/posts/edit', {post: post});

    });

});

//Using PUT instead of POST in Editing 'Post' object because it's BEST PRACTICE!
router.put('/edit/:id', (req, res) => {
    // res.send('it Works...');
    const id = req.params.id;
    Post.findById(id).then(post => {
        let allowComments = false;
        if (req.body.allowComments) {
            allowComments = true;
        }
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.save().then(updatedPost => {
            res.redirect('/admin/posts');
        }).catch(err => res.status(400).send(`COULD NOT SAVE BECAUSE: ${err}`));
    });
});

router.delete('/:id', (req, res) => {
    Post.findByIdAndDelete(req.params.id).then(deletedPost => {
        res.redirect('/admin/posts');
    }).catch(err => res.status(400).send(`COULD NOT DELETE POST BECAUSE: ${err}`));
});

module.exports = router;