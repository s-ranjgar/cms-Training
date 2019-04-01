const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');

const mongoose = require("mongoose");
const connectionString = 'mongodb://localhost:27017/cms';
mongoose.connect(connectionString, {useNewUrlParser: true}).then(db => {
    console.log('MONGO CONNECTED...');
}).catch(err => console.log(`COULD NOT CONNECTED BECAUSE : ${err}`));

app.use(express.static(path.join(__dirname, 'public')));

const {select} = require('./helpers/handlebars-helpers');

//Set View Engines
app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {select: select}}));
app.set('view engine', 'handlebars');

//Upload Middleware
app.use(upload());

//Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Method Override
app.use(methodOverride('_method'));

app.use(session({
    secret:'edwindiaz123',
    resave :true,
    saveUninitialized:true
}));
app.use(flash());

//Local Variables using Middleware
app.use((req,res,next)=>{
    res.locals.success_message=req.flash('success_message');
    next();
});

//Load Routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');

//Use Routds
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);

app.listen(4500, () => {
    console.log(`listening on port 4500`);
});