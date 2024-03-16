const { query } = require('express');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongodb:27017/";

// 新增帳號之前 先搜尋是否有相同帳號，再將資料存入db
exports.add_account = async function(acc, pwd){
    return new Promise((resolve, reject) => {
        search_account(acc).then(
            function(is_valid){
                if(is_valid){
                    add_account_to_db(acc, pwd);
                    resolve(true);
                }
                else resolve(false);
            },
            function(err){
                resolve(false);
                throw err
            }
        );
    });
}

exports.login_chk = async function(acc, pwd){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("chess_web");
            var myobj = { account: acc, password: pwd};
            dbo.collection("account").find(myobj).toArray(function(err, result) {
                if (err) throw err;
                if(result.length == 0){
                    resolve(false)
                }
                else{
                    resolve(true);
                }
                db.close();
            });
        });
    });
}
//檢查database內是否有相同的帳號
async function search_account(acc){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("chess_web");
            var myobj = { account: acc};
            dbo.collection("account").find(myobj).toArray(function(err, result) {
                if (err) throw err;
                if(result.length == 0){
                    resolve(true)
                }
                else{
                    resolve (false);
                }
                db.close();
            });
        });
    });
}

function add_account_to_db(acc, pwd){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
            var dbo = db.db("chess_web");
            var myobj = { account: acc, password: pwd };
            dbo.collection("account").insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
            });
      });
}



