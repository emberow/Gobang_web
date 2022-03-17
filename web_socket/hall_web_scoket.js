var authentication = require('../authentication/auth');
const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 3001
  });

// 目前在線上的web_socket
var ws_list = [];

wss.on('connection', function (ws) {

  ws_list.push(ws);
  ws.send("歡迎xxx")
  ws.on('message', function (data) {
    console.log('received: %s', data);
    data = String(data).split("/");
    let jwt_token = data[0];
    let message = data[1];
    let name = authentication.verify_jwt(jwt_token)._id;
    broadcast(name, message, ws);
  });
  ws.on('close', function () {
    ws_list.pop();
    
    console.log("client has disconnected");
  });
});
  
// 有人連進來將websocket加進list裡面，斷線則從list移除
// exports.connect_to_the_hall = function(name){
//   console.log(name + "aaa");
// }

//廣播
function broadcast(name, message, ignore_ws){
  if(!message) return;
  console.log(name + " : " + message)
    for(ws of ws_list){
      if(ws != ignore_ws){
          ws.send(name + " : " + message);
      }
    }
}