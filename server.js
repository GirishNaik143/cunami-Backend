var express = require('express'),
path = require('path'),
     cors = require('cors');
    port = process.env.PORT || 4000,
    bodyParser = require('body-parser');
    const  mongoose = require('mongoose')
 
  

    //creating connection to database using cunamiDB
    mongoose.connect("mongodb://localhost:27017/cunamiDB", { useNewUrlParser: true } ).then(
          () => {console.log('Database connection is successful') },
          err => { console.log('Error when connecting to the database'+ err)}
);
mongoose.set('useCreateIndex', true);
const conn = mongoose.connection; 
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

    login = require('./api/login/loginModels')
    userDetails = require('./api/userDetails/userDetailsModels')
    
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
//calling routes
var routes = require('./api/login/loginRoutes');    routes(app);
var routes = require('./api/userDetails/userDetailsRoutes');    routes(app);

app.listen(port);
console.log('Cunami List started on:' + port);
