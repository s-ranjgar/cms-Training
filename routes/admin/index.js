const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const faker = require('faker');
const {userAuthenticated} = require('../../helpers/authentication');
const mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId;


router.all('/*', (req, res, next) => {
// router.all('/*',userAuthenticated ,(req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {

    // res.send('it works');
    let promises = [];
    if (req.user) {
        promises = [
            // Post.countDocuments({user:req.user.id}).exec(),
            Post.aggregate([
                {
                    $match: {
                        user: objectId(req.user.id.toString())
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: {$sum: 1}
                    }
                }
            ]).exec(),
            Category.countDocuments({user: req.user.id}).exec(),
            Comment.countDocuments({user: req.user.id}).exec()
        ];
    } else {
        promises = [
            // Post.countDocuments({}).exec(),
            Post.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: {$sum: 1}
                    }
                }
            ]).exec(),
            Category.countDocuments({}).exec(),
            Comment.countDocuments({}).exec()
        ];
    }

    //Using Promise for Using ONE Get from DB
    Promise.all(promises).then(([postCount, categoryCount, commentCount]) => {
        console.log(postCount);
        let publicCount = postCount.find(i => i._id === 'public');
        let privateCount = postCount.find(i => i._id === 'private');
        let draftCount = postCount.find(i => i._id === 'draft');

        res.render('admin/index', {
            postCount: (publicCount ? publicCount.count : 0) + (privateCount ? privateCount.count : 0) + (draftCount ? draftCount.count : 0),
            commentCount: commentCount,
            categoryCount: categoryCount,
            publicCount: publicCount ? publicCount.count : 0,
            privateCount: privateCount ? privateCount.count : 0,
            draftCount: draftCount ? draftCount.count : 0
        });

        // Post.countDocuments({}).then(postCount => {
        //     Comment.countDocuments({}).then(commentCount => {
        //         Category.countDocuments({}).then(categoryCount => {
        //             res.render('admin/index', {
        //                 postCount: postCount,
        //                 commentCount: commentCount,
        //                 categoryCount: categoryCount
        //             });
        //         });
        //     });
    });

});

router.post('/generate-fake-posts', (req, res) => {
    // console.log('Working...');
    for (let i = 0; i < req.body.amount; i++) {

        const newPost = new Post({
            user: req.user.id,
            title: faker.name.title(),
            slug: faker.name.title(),
            status: faker.random.arrayElement(['public', 'private', 'draft']),
            allowComments: faker.random.boolean(),
            body: faker.lorem.sentence()
        });
        newPost.save().then(savedPost => {
        });
    }

    res.redirect('/admin/posts');
});

module.exports = router;