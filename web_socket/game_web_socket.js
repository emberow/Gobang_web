var authentication = require('../authentication/auth');
var operate_gaming_db = require('../database/gaming_room_db');
const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 3002
  });

// 目前在線上的web_socket
var ws_dict = {};
wss.on('connection', function (ws) {
    ws.on('message', function (data) {
      console.log('received: %s', data);
      data = String(data).split("/");
      let jwt_token = data[0];
      let message = data[1];
      let next_step = data[2];
      console.log("next_step = ", next_step);
      let name = authentication.verify_jwt(jwt_token)._id;
      let room_id = authentication.verify_jwt(jwt_token).room_id;
      console.log("room_id = ", room_id)
      if(!ws_dict[name]){
        ws_dict[name] = ws;
        ws.send(name + '已加入房間');
        ws.send("room_id:" + room_id);
      }
    //   broadcast(name, message, ws);
    });
    ws.on('close', function () {
      for(let name of Object.keys(ws_dict)){
        if(ws_dict[name] == ws){
          delete ws_dict[name];
          operate_gaming_db.search_player_in_which_room(name).then(
            function (room_name) {
              operate_gaming_db.delete_player_from_gaming_room(room_name, name);
            } 
          )
          console.log(name," has disconnected");
        }
      }
    });
  });
