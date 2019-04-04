const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcryptjs = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {

    // res.send('it works');
    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({}).skip((perPage * page) - perPage).limit(perPage).sort({date:-1}).populate('user').then(posts => {
        Post.countDocuments({}).then(postCount => {
            Category.find({}).then(categories => {
                res.render('home/index', {
                    posts: posts,
                    categories: categories,
                    current: parseInt(page),
                    pages: Math.ceil(postCount / perPage)
                });
            });
        });
    });
});

router.get('/about', (req, res) => {

    // res.send('it works');
    res.render('home/about');
});

router.get('/login', (req, res) => {

    // res.send('it works');
    res.render('home/login');
});

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    // console.log(password);
    User.findOne({email: email}).then(user => {
        if (!user) return done(null, false, {message: 'No User Found'});
        bcryptjs.compare(password, user.password, (err, matched) => {
            if (err) throw err;
            if (matched) {
                return done(null, user);
            } else {
                done(null, false, {message: 'Incorrect Password'});
            }
        });
    });
}));

router.post('/login', (req, res, next) => {

    // res.send('it works');
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
    //res.render('home/login');
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
});

router.get('/register', (req, res) => {

    // res.send('it works');
    res.render('home/register');
});

router.post('/register', (req, res) => {

    // res.send('it works');
    let errors = [];
    if (!req.body.firstName) {
        errors.push({message: 'please add a FirstName'});
    }

    if (!req.body.lastName) {
        errors.push({message: 'please add a LastName'});
    }

    if (!req.body.email) {
        errors.push({message: 'please add an EMail'});
    }

    if (!req.body.password) {
        errors.push({message: 'please enter a Password'});
    }

    if (!req.body.passwordConfirm) {
        errors.push({message: 'Confirm Password can not be empty'});
    }

    if (req.body.password !== req.body.passwordConfirm) {
        errors.push({message: 'Password fields do not match'});
    }

    if (errors.length > 0) {
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
    } else {
        User.findOne({email: req.body.email}).then(findUser => {


            if (!findUser) {
                let newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password
                });

                bcryptjs.genSalt(10, (err, salt) => {
                    bcryptjs.hash(newUser.password, salt, (err, hash) => {

                        newUser.password = hash;

                        newUser.save().then(savedUser => {
                            req.flash('success_message', `${savedUser.email} was Registered Successfully, You Can Login NOW.`);
                            res.redirect('/login');
                        }).catch(err => res.status(400).send(`COULD NOT Create User BECAUSE: ${err}`));
                    });
                });
            } else {
                req.flash('error_message', `${findUser.email} already Exists, You Can Login NOW.`);
                res.redirect('/login');
                // res.render('home/register', {errors: errors,
                //     firstName: req.body.firstName,
                //     lastName: req.body.lastName,
                //     email: req.body.email
                // });
            }
        });

    }


});

router.get('/post/:sulg', (req, res) => {

    // res.send('it works');

    //Populating Comments and User of each Comment with Post
    Post.findOne({slug: req.params.slug}).populate({
        path: 'comments', match: {approveComment: true}, populate: {
            path: 'user',
            model: 'users'
        }
    }).then(post => {
        Category.find({}).then(categories => {
            res.render('home/post', {post: post, categories: categories});
        });

    })
});

module.exports = router;