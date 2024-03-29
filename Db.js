var mysql = require('mysql');
var con ; 
async function connectDb(){
    con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "############",
        database: "Ecommerce"
    });
    
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });
}

//DATABASE layer----queries---

function isUserExists(username,usertype){
    return new Promise((resolve, reject) => {
        let sql ;
        if(usertype=="org") sql = "SELECT COUNT(*) AS cnt FROM employer WHERE username=?";
        else sql = "SELECT COUNT(*) AS cnt FROM user WHERE username=?";
        
        con.query(sql, [username], (error, results) => {
        if (error) {
            reject(console.error(error.message));
        }else{
            results = JSON.stringify(results);
            results = JSON.parse(results);
            results = results[0];
            resolve(results['cnt']);
        }                
        });
    });
}

function getRecord(username,usertype){
    return new Promise((resolve, reject) => {
        let sql ;
        if(usertype=="org") sql = `SELECT * FROM employer WHERE username=?`;
        else sql = `SELECT * FROM user WHERE username=?`;        
        con.query(sql, [username], (error, results) => {
            if (error) {
                reject(console.error(error.message));
            }else{
                results = JSON.stringify(results);
                results = JSON.parse(results);
                results = results[0];
                console.log("User fetched");
                console.log(results);
                resolve(results);
            }
        });
    });
}

function saveUser(uid,user,name,pwd,usertype){
    let sql; 
    if(usertype=="org") sql = `INSERT INTO employer(userId,name,username,password)
    VALUES(?,?,?,?)`;
    else sql = `INSERT INTO user(userId,name,username,password)
    VALUES(?,?,?,?)`; 
    con.query(sql, [uid,name,user,pwd], (error, results) => {
        if (error) {
            return console.error(error.message);
        }
    }); 
}

module.exports = {
    connectDb,
    isUserExists,
    saveUser,
    getRecord
  }
