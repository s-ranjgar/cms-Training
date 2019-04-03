const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*',userAuthenticated ,(req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    Category.find({}).then(categories => {

        res.render('admin/categories', {categories: categories});

    })
});


router.post('/create', (req, res) => {
    // res.send('It works...')

    let errors = [];
    if(!req.body.name){
        errors.push({message: 'please add a Title'});
    }

    if(errors.length>0)
    {
        res.render('admin/categories/create',{errors:errors});
    }else {



        let newCategory = new Category({
            name: req.body.name
        });

        newCategory.save().then(savedCategory => {
            // console.log(`Saved Category: ${savedCategory}`);
            req.flash('success_message',`${savedCategory.name} was Created Successfully`);
            res.redirect('/admin/categories')
        }).catch(validator => {
            res.render('admin/categories/create',{errors:validator.errors});
            // console.log(`COULD NOT SAVE POST BECAUSE: ${validator}`);
        });
    }
});

router.get('/edit/:id',(req,res)=>{
    //res.send('It Works');
    Category.findOne({_id:req.params.id}).then(category=>{
        res.render('admin/categories/edit',{category:category});
    });

});

router.put('/edit/:id',(req,res)=>{
   Category.findById(req.params.id).then(category=>{
       category.name=req.body.name;
       category.save().then(updatedCategory=>{
           req.flash('success_message',`${updatedCategory.name} was Updated Successfully`);
           res.redirect('/admin/categories');
       }).catch(err => res.status(400).send(`COULD NOT SAVE BECAUSE: ${err}`));
   })
});

router.delete('/:id', (req, res) => {
    Category.findByIdAndDelete(req.params.id).then(deletedCategory => {
        req.flash('success_message',`${deletedCategory.name} was Deleted Successfully`);
        res.redirect('/admin/categories');
    }).catch(err => res.status(400).send(`COULD NOT DELETE Category BECAUSE: ${err}`));
});

module.exports = router;