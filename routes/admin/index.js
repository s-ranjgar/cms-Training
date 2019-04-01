const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const faker = require('faker');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {

    // res.send('it works');
    res.render('admin/index');
});

router.post('/generate-fake-posts', (req, res) => {
    // console.log('Working...');
    for (let i = 0; i < req.body.amount; i++) {

        const newPost = new Post({
            title: faker.name.title(),
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