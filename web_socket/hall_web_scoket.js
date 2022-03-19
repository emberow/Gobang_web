var authentication = require('../authentication/auth');
var operate_gaming_room_db = require('../database/gaming_room_db');
const WebSocket = require('ws');
const res = require('express/lib/response');
const wss = new WebSocket.Server({
    port: 3001
  });

var room_info = {};

// 目前在線上的web_socket
var ws_dict = {};
wss.on('connection', function (ws) {
  console.log("connect!");
  ws.on('message', function (data) {
    console.log('received: %s', data);
    data = String(data).split("/");
    let jwt_token = data[0];
    let message = data[1];
    let name = authentication.verify_jwt(jwt_token)._id;
    let room_name = data[2];
    let password = data[3];
    if(!ws_dict[name]){
      ws_dict[name] = ws;
      ws.send("歡迎" + name);
    }
    // 使用者要創建房間或加入房間
    if(message == "" && room_name){
      user_create_room(ws, name, room_name, password);
    }
    broadcast(name, message, ws);
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

function user_create_room(ws, name, room_name, password){
  console.log(name, "創建房間", room_name);
  // 判斷是否房名已被取走，在加人進去房間，再傳送給玩家進入房間許可
  new Promise((resolve, reject) => {
    operate_gaming_room_db.create_room(room_name, password).then(
      function (is_valid) {
        resolve(is_valid);
      }
    );
  }).then(
    function(is_create_room_successful){
      if(is_create_room_successful){
        operate_gaming_room_db.add_player_to_gaming_room(room_name, name).then(
          function (is_valid) {
            if(is_valid){
              room_info[room_name] = name;
              ws.send("go_to_gaming_room_acknowledge");
              // 讓玩家更新房間資訊
              inform_player_room_info("create", room_name, 1);
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

function inform_player_room_info(action, room_name, num_of_people){
  let message;
  if(action == "create"){
    message = "create/" + room_name + "/" + num_of_people;
  }
  else if(action == "delete"){
    message = "delete" + room_name
  }

  for(ws of Object.values(ws_dict) ){
    ws.send(message);
  }
}

