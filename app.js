const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');

app.use(express.static(path.join(__dirname,'public')));

//Set View Engines
app.engine('handlebars',exphbs({defaultLayout: 'home'}));
app.set('view engine','handlebars');

//Load Routds
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');

//Use Routds
app.use('/',home);
app.use('/admin',admin);

app.listen(4500,()=>{
    console.log(`listening on port 4500`);
});