
const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 3001
  });

// 目前在線上的web_socket
var ws_list = [];
  
// 有人連進來將websocket加進list裡面，斷線則從list移除
exports.connect_to_the_hall = function(name){
    wss.on('connection', function (ws) {
        console.log('new client connection');
        ws_list.push(ws);
        ws.send("歡迎");
        ws.on('message', function (message) {
          console.log('received: %s', message);
          message = String(message);
          broadcast(message, ws);
        });
        ws.on('close', function () {
            ws_list.splice(ws_list.indexOf(ws), 1);
          console.log("client has disconnected");
        });
      });
}

//廣播
function broadcast(message, ignore_ws){
    for(ws of ws_list){
        if(ws != ignore_ws){
            ws.send(message);
            console.log(message)
        }
    }
}