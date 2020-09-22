const { v4: uuidv4 } = require('uuid');

//sql connectivity
const Db = require('./Db.js');

require('dotenv').config();
const utils = require('./utils.js'); 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
 
const app = express();
const port = process.env.PORT || 4000;
let count = 0

// enable CORS
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));//Returns middleware that only parses JSON and only looks at requests where the Content-Type header matches the type option.
 
//------------------API's--------------------

// validate the user credentials
app.post('/signin', function (req, res) {
    const user = req.body.username;
    const pwd = req.body.password;
    const usertype = req.body.usertype;
   
    // return 400 status if username/password is not exist
    if (!user || !pwd || !usertype) {
      return res.status(400).json({
        error: true,
        message: "Username or Password is required."
      });
    }
    
    // return 401 status if the credential is not match.
    async function validateLogin(user,usertype){
      const count = await Db.isUserExists(user,usertype);
      console.log('after await', count);
      if (!count){
        return res.status(402).json({
          error: true,
          message: "Username does not exist. Signup required."
        });
      }
      const record = await Db.getRecord(user,usertype);
      if (pwd !== record['password']){
        return res.status(401).json({
          error: true,
          message: "Username or Password is wrong."
        });
      }
      const token = utils.generateToken(user, record['name'], record['userId']);
      const userObj = utils.getCleanUser(user, record['name'], record['userId']);
      return res.json({ user: userObj, token });
    }
    validateLogin(user,usertype);
  });

  // ----------------------------------------
  app.post('/signup', function(req, res){
    const name = req.body.name;
    const user = req.body.username;
    const pwd = req.body.password;
    const usertype = req.body.usertype;
    const uid = uuidv4();
    // return 400 status if username/password is not exist
    if (!user || !pwd || !name || !usertype) {
      return res.status(400).json({
        error: true,
        message: "All fields are required."
      });
    }
    //return 402 status if username already exists
    async function userNameExist(user,usertype) {
      const count = await Db.isUserExists(user,usertype);
      console.log('after await', count);
      if (count) {
        return res.status(402).json({
          error: true,
          message: "Username already exists."
        });
      }
      Db.saveUser(uid,user,name,pwd,usertype);
      const token = utils.generateToken(user, name, uid);
      const userObj = utils.getCleanUser(user, name, uid);
      console.log("User created");
      console.log(user, name, pwd, uid);
      return res.json({ user: userObj, token });
      }
    userNameExist(user,usertype);//calling isUserExist function if not saving in DB
  });

  app.post('/saveProfile', function(req, res) {
    var email = req.body.email;
    console.log(email);
  })

  //------------------------------------------------
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
      
      async function maintainBrowserRefresh(user){
        const count = await Db.isUserExists(user.username);
        const record = await Db.getRecord(user.username);
        // return 401 status if the userId does not match.
        if(count == 0 || user.userId !== record['userId']){
          return res.status(401).json({
            error: true,
            message: "Invalid user."
          });
        }
        // get basic user details
        var userObj = utils.getCleanUser(user.username, user.name, user.uid );
        return res.json({ user: userObj, token });
      }
      maintainBrowserRefresh(user);
    });
  });

//--------------------------------------------------
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
   
  //------------------------------------------------------
  // request handlers
  // app.get('/', (req, res) => {
  //   if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
  //   res.send('Welcome to the Node.js Tutorial! - ' + req.user.name);
  // });


  app.listen(port, () => {
    console.log('Server started on: ' + port);
    Db.connectDb();
  });

