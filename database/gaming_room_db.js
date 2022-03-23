const res = require('express/lib/response');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var operate_hall_web_socket = require('../web_socket/hall_web_scoket');

//搜尋房間是否存在
async function search_room(room_name){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("chess_web");
            var myobj = { room_name: room_name};
            dbo.collection("gaming_room").find(myobj).toArray(function(err, result) {
                if (err) throw err;
                if(result.length == 0){
                    resolve(true);
                }
                else{
                    resolve (false);
                }
                db.close();
            });
        });
    });
}

// 創建房間到database
function create_room_to_db(room_name, pwd){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("chess_web");
        var myobj = { room_name: room_name};
        dbo.collection("gaming_room").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("創建房間", room_name);
            db.close();
            });
    });
}

//新增房間
exports.create_room = async function(room_name, pwd){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("chess_web");
            var myobj = { room_name: room_name, password: pwd, player1: null, player2: null};
            search_room(room_name).then(
                function(is_valid){
                    if(is_valid){
                        create_room_to_db(room_name, pwd);
                        resolve(true);
                    }
                    else{
                        //創建房間失敗，房名相同
                        resolve(false);
                    }
                },
                function(err){
                    throw err;
                }
            );
        });
    });
}

// 回傳房間資訊
async function get_room_info(room_name) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("chess_web");
            var myobj = {room_name: room_name};
            dbo.collection("gaming_room").find(myobj).toArray(function(err, result) {
                if (err) throw err;
                resolve(result);
                db.close();
            });
        });
    });
}


// 將玩家加入到房間，
exports.add_player_to_gaming_room = async function(room_name, player_name){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("chess_web");
            var myquery = { room_name: room_name };
            // 判斷要新增為1號玩家或2號玩家
            get_room_info(room_name).then(
                function(room_info){
                    room_info = room_info[0];
                    let newvalues;
                    if(room_info){
                        if(room_info.player1 == null){
                            newvalues = { $set: {player1: player_name}};
                        }
                        else if(room_info.player2 == null){
                            newvalues = { $set: {player2: player_name}};
                        }
                        else{
                            resolve(false);
                        }
                        dbo.collection("gaming_room").updateOne(myquery, newvalues, function(err, res) {
                            if (err) throw err;
                            console.log(player_name, "已加入房間", room_name);
                            db.close();
                            resolve(true);
                        });
                    }
                    
                    
                },
                function(err) {throw err}
            );
        });
    });
}

// 刪除遊戲房間
async function delete_gaming_room(room_name){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("chess_web");
            var myquery = { room_name: room_name };
            dbo.collection("gaming_room").deleteOne(myquery, function(err, obj) {
                if (err) throw err;
                operate_hall_web_socket.delete_room_from_room_info(room_name);
                console.log("房間",room_name,"已經被刪除");
                db.close();
                resolve(true);
            });
        });
    });
}

function change_player_from_gaming_room_db(room_name, player1, player2){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("chess_web");
        var myquery = { room_name: room_name };
        var newvalues = { $set: {player1: player1, player2: player2 } };
        dbo.collection("gaming_room").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          db.close();
        });
    });
}

// 刪除房間內的玩家，如果房間內無玩家則刪除房間
exports.delete_player_from_gaming_room = function(room_name, player_name){
    get_room_info(room_name).then(
        function (room_info){
            room_info = room_info[0];
            if(room_info){
                console.log(room_info)
                let player1 = room_info.player1;
                let player2 = room_info.player2;
                if(player1 == player_name){
                    player1 = null;
                }
                else if(player2 == player_name){
                    player2 = null;
                }
                console.log("玩家", player_name, "已經退出房間", room_name);
                // 通知大廳該房間人數減少
                operate_hall_web_socket.delete_person_room_info(room_name);
                change_player_from_gaming_room_db(room_name, player1, player2)
                // 房間內沒人時 刪除房間
                if(player1 == null && player2 == null){
                    delete_gaming_room(room_name);
                    //通知大廳刪除房間
                    operate_hall_web_socket.inform_player_update_room_info(room_name, 0);
                }else{
                    //通知大廳，將房間人數修改為1人
                    operate_hall_web_socket.inform_player_update_room_info(room_name, 1);
                }
            }
            
        },
        function(err) {throw err}
    )
}

// 搜尋玩家在哪個房間
exports.search_player_in_which_room = async function(name){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("chess_web");
            var query = {player1: name};
            let room_name;
            let room_info;
            dbo.collection("gaming_room").find(query).toArray(function(err, result){
                if (err) throw err;
                room_info = result[0];
                if(room_info){
                    room_name = room_info.room_name;
                    resolve(room_name);
                }
                else{
                    query = {player2: name};
                    dbo.collection("gaming_room").find(query).toArray(function(err, result){
                        if (err) throw err;
                        db.close();
                        room_info = result[0];
                        if(room_info){
                            room_name = room_info.room_name;
                            resolve(room_name);
                        }
                        else{
                            resolve(false);
                        }
                    });
                }
            });
            
        });
    });
}