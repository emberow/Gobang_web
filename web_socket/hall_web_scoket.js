var authentication = require('../authentication/auth');
var operate_gaming_room_db = require('../database/gaming_room_db');

const WebSocket = require('ws');
const res = require('express/lib/response');
const wss = new WebSocket.Server({
    port: 3001
  });

// {room_name: 房間人數}
var room_info = {};

// 目前在線上的web_socket
var ws_dict = {};
wss.on('connection', function (ws) {
  ws.on('message', function (data) {
    console.log('received: %s', data);
    data = String(data).split("/");
    let jwt_token = data[0];
    let message = data[1];
    let name = authentication.verify_jwt(jwt_token)._id;
    let room_name = data[2];
    let password = data[3];
    console.log(room_info)
    if(!ws_dict[name]){
      // 讓新加入的使用者可以知道目前房間資訊
      user_get_room_info(ws);
      ws_dict[name] = ws;
      ws.send("歡迎" + name);
    }
    // 使用者要創建房間或加入房間
    if(message == "" && room_name){
      user_create_room(ws, name, room_name, password);
    }
    else if(message == "enter_room" && room_name){
      user_enter_room(ws, name, room_name, password);
    }
    else{
      broadcast(name, message, ws);
    }
  });
  ws.on('close', function () {
    for(let name of Object.keys(ws_dict)){
      if(ws_dict[name] == ws){
        delete ws_dict[name];
        console.log(name," has disconnected");
      }
    }
  });
});

function user_enter_room(ws, name, room_name, password){
  console.log(name, "加入房間", room_name);
  operate_gaming_room_db.add_player_to_gaming_room(room_name, name).then(
    function (is_valid) {
      if(is_valid){
        // 成功加入房間
        room_info[room_name] += 1;
        ws.send("go_to_gaming_room_acknowledge");
      }
      else{
        // 失敗
      }
    } 
  )
}

function user_create_room(ws, name, room_name, password){
  console.log(name, "創建房間", room_name);
  // 判斷是否房名已被取走，在加人進去房間，再傳送給玩家進入房間許可
  new Promise((resolve, reject) => {
    operate_gaming_room_db.create_room(room_name, password).then(
      function (is_valid) {
        room_info[room_name] = 0;
        resolve(is_valid);
      }
    );
  }).then(
    function(is_create_room_successful){
      if(is_create_room_successful){
        operate_gaming_room_db.add_player_to_gaming_room(room_name, name).then(
          function (is_valid) {
            if(is_valid){
              room_info[room_name] += 1;
              ws.send("go_to_gaming_room_acknowledge");
              // 讓玩家更新房間資訊
              inform_player_add_room_info(room_name, 1);
            }
          }
        )
      }
      else{
        // 創建房間失敗
        ws.send("create_room_fail");
      }
    }
  )
}
  

//廣播
function broadcast(name, message, ignore_ws){
  if(!message) return;
  console.log(name + " : " + message)
    for(ws of Object.values(ws_dict) ){
      if(ws != ignore_ws){
          ws.send(name + " : " + message);
      }
    }
}

// 讓新加入的使用者能知道目前的房間資訊
function user_get_room_info(ws){
  for(room_name of Object.keys(room_info)){
    let num_of_people = room_info[room_name];
    let message = "create/" + room_name + "/" + num_of_people;
    ws.send(message);
  }
}

function inform_player_add_room_info(room_name, num_of_people){
  let message;
  message = "create/" + room_name + "/" + num_of_people;
  for(ws of Object.values(ws_dict) ){
    ws.send(message);
  }
}

exports.inform_player_update_room_info = function(room_name, num_of_people){
  // 先刪除再創造同名的一人房間
  let message = "delete/" + room_name;
  for(ws of Object.values(ws_dict) ){
    ws.send(message);
  }
  if(num_of_people == 1){
    inform_player_add_room_info(room_name, 1);
  }
}

// 刪除房間資訊
exports.delete_room_from_room_info = function (room_name) { 
  delete room_info[room_name];
}

// 更新房間人數
exports.delete_person_room_info = function (room_name) { 
  room_info[room_name] -= 1;
}

