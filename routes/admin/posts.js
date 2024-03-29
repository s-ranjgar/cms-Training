const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const {isEmpty} = require('../../helpers/upload-helper');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    Post.find({}).sort({date:-1}).populate('category').then(posts => {

        res.render('admin/posts', {posts: posts});

    })
});

router.get('/my-posts', (req, res) => {
    Post.find({user: req.user.id}).populate('category').then(posts => {

        res.render('admin/posts/my-posts', {posts: posts});

    })
});

router.get('/create', (req, res) => {
    //res.send('It works...');
    Category.find({}).then(categories => {
        res.render('admin/posts/create', {categories: categories});
    })
});

router.post('/create', (req, res) => {
    // res.send('It works...')

    let errors = [];
    if (!req.body.title) {
        errors.push({message: 'please add a Title'});
    }

    if (!req.body.status) {
        errors.push({message: 'please add a Status'});
    }

    if (!req.body.body) {
        errors.push({message: 'please add a Body'});
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', {errors: errors});
    } else {

        let allowComments = false;
        if (req.body.allowComments) {
            allowComments = true;
        }


        let filename = '';
        if (!isEmpty(req.files)) {

            let file = req.files.file;
            filename = Date.now() + '-' + file.name;

            file.mv('./public/uploads/' + filename, (err) => {
                if (err) throw err;
            });
        }

        let newPost = new Post({
            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            file: filename,
            category: req.body.category
        });

        newPost.save().then(savedPost => {
            // console.log(`Saved Post: ${savedPost}`);
            req.flash('success_message', `${savedPost.title} was Created Successfully`);
            res.redirect('/admin/posts')
        }).catch(validator => {
            res.render('admin/posts/create', {errors: validator.errors});
            // console.log(`COULD NOT SAVE POST BECAUSE: ${validator}`);
        });
    }
});

router.get('/edit/:id', (req, res) => {
    // res.send('It works...');
    Post.findById(req.params.id).then(post => {
        Category.find({}).then(categories => {
            res.render('admin/posts/edit', {post: post, categories: categories});
        });

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
        post.user = req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.category = req.body.category;

        if (!isEmpty(req.files)) {

            let file = req.files.file;
            let filename = Date.now() + '-' + file.name;
            post.file = filename;

            file.mv('./public/uploads/' + filename, (err) => {
                if (err) throw err;
            });
        }

        post.save().then(updatedPost => {
            req.flash('success_message', `${updatedPost.title} was Updated Successfully`);
            res.redirect('/admin/posts/my-posts');
        }).catch(err => res.status(400).send(`COULD NOT SAVE BECAUSE: ${err}`));
    });
});

router.delete('/:id', (req, res) => {
    Post.findByIdAndDelete(req.params.id).then(deletedPost => {
        Comment.deleteMany({_id: {$in: deletedPost.comments}}).then(deletedComments => {
            req.flash('success_message', `${deletedPost.title} was Deleted Successfully`);
            res.redirect('/admin/posts/my-posts');
        });
    }).catch(err => res.status(400).send(`COULD NOT DELETE POST BECAUSE: ${err}`));
});

module.exports = router;