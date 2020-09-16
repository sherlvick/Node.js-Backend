/*
var express = require('express'),//require is used to load and cache js modules
    app = express(),
    port = process.env.PORT || 4000;//The process.env property returns an object containing the user environment
 

    // request handlers
app.get('/', (req, res) => {   //// respond with "hello world" when a GET request is made to the homepage
    res.send('Hello World');

});


app.listen(port, () => {
    console.log('Server started on: ' + port);//callback function on event listener
    console.log(process.env.PORT);
    console.log("hi");
});
*/

require('dotenv').config();
const utils = require('./utils.js'); 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
 
const app = express();
const port = process.env.PORT || 4000;
 
/* static user details for validation
const userData = {
  userId: ["789789","1213"],
  password: ["123456","sherl@"],
  name: ["Aman","Ash"],
  username: ["sherlvick","sunny"],
  isAdmin: true
};*/
const userData = {
  userId: [],
  password: [],
  name: [],
  username: [],
  isAdmin: true
};
let count = 0
// enable CORS
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));//Returns middleware that only parses JSON and only looks at requests where the Content-Type header matches the type option.
 


// validate the user credentials
app.post('/signin', function (req, res) {
    const user = req.body.username;
    const pwd = req.body.password;
   
    // return 400 status if username/password is not exist
    if (!user || !pwd) {
      return res.status(400).json({
        error: true,
        message: "Username or Password is required."
      });
    }
    const index_db = userData.username.indexOf(user)
    // return 401 status if the credential is not match.
    if (index_db == -1){
      return res.status(402).json({
        error: true,
        message: "Username does not exist. Signup required."
      });
    }
    if (pwd !== userData.password[index_db]) {
      return res.status(401).json({
        error: true,
        message: "Username or Password is wrong."
      });
    }
   
    // generate token
    const token = utils.generateToken(userData, index_db);
    // get basic user details
    const userObj = utils.getCleanUser(userData, index_db);
    // return the token along with user details
    return res.json({ user: userObj, token });
  });

  app.post('/signup', function(req, res){
    const name = req.body.name;
    const user = req.body.username;
    const pwd = req.body.password;

    // return 400 status if username/password is not exist
    if (!user || !pwd || !name) {
      return res.status(400).json({
        error: true,
        message: "Username/Password/Name is required."
      });
    }
    const index_db = userData.username.indexOf(user)
    //return 402 status if username already exists
    if (index_db !== -1 ) {
      return res.status(402).json({
        error: true,
        message: "Username already exists."
      });
    }
    userData.username.push(user);
    userData.name.push(name);
    userData.password.push(pwd);
    userData.userId.push(count);
    count += 1//to increase id so it will be unique

    const token = utils.generateToken(userData, count);
    // get basic user details
    const userObj = utils.getCleanUser(userData, count);
    console.log(userData)
    return res.json({ user: userObj, token });
  });


  // verify the token and return it if it's valid
app.get('/verifyToken', function (req, res) {
    // check header or url parameters or post parameters for token
    var token = req.query.token;
    if (!token) {
      return res.status(400).json({
        error: true,
        message: "Token is required."
      });
    }
    // check token that was passed by decoding token using secret
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
      if (err) return res.status(401).json({
        error: true,
        message: "Invalid token."
      });
      const index = userData.name.indexOf(user.name)
      // return 401 status if the userId does not match.
      if (index == -1 || user.userId !== userData.userId[index]) {
        return res.status(401).json({
          error: true,
          message: "Invalid user."
        });
      }
      // get basic user details
      var userObj = utils.getCleanUser(userData, index);
      return res.json({ user: userObj, token });
    });
  });

  //middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes, this helps to know if the request is authenticated or not.
app.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.headers['authorization'];
    if (!token) return next(); //if no token, continue
   
    token = token.replace('Bearer ', '');
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
      if (err) {
        return res.status(401).json({
          error: true,
          message: "Invalid user."
        });
      } else {
        req.user = user; //set the user to req so other routes can use it
        next();
      }
    });
  });
   
  // request handlers
  app.get('/', (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
    res.send('Welcome to the Node.js Tutorial! - ' + req.user.name);
  });

  app.listen(port, () => {
    console.log('Server started on: ' + port);
  });

[
  {
    "userId": 0,
    "password": "1234",
    name: 'sumit',
    username:'sumit',
    isAdmin: true
  },
  {
    "userId": 1,
    "password": "1235",
    name: 'Sunny',
    username:'sunny',
    isAdmin: true
  }
]