var authentication = require('../authentication/auth');
var operate_gaming_db = require('../database/gaming_room_db');

const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 3002
  });
//{room_name:{num_of_ready:0, player1:player1_name, player2:player2_name, board:[0000....]}}
var game_state = {};
// 目前在線上的web_socket
// {player_name:player_ws}
var ws_dict = {};

wss.on('connection', function (ws) {
    ws.on('message', function (data) {
      console.log('received: %s', data);
      parse_message(ws, data);
    });
    ws.on('close', function () {
      player_leave(ws);
    });
});

function player_leave(ws){
  for(let name of Object.keys(ws_dict)){
    if(ws_dict[name] == ws){
      delete ws_dict[name]
      operate_gaming_db.search_player_in_which_room(name).then(
        function (room_name) {
          operate_gaming_db.delete_player_from_gaming_room(room_name, name);
          
          if(game_state[room_name]["player1"] == name){
            delete game_state[room_name]["player1"];
          }
          else if(game_state[room_name]["player2"] == name){
            delete game_state[room_name]["player2"];
          }

          if(game_state[room_name]["player1"] == undefined && game_state[room_name]["player2"] == undefined){
            delete game_state[room_name]
          }
          console.log(game_state);
          if(game_state[room_name]){
            inform_player_personel_change(name, room_name);
          }
        } 
      )
    }
  }
}



function parse_message(ws, data){
  data = String(data).split("/");
  let jwt_token = data[0];
  let message = data[1];
  let next_step = data[2];
  let name = authentication.verify_jwt(jwt_token)._id;
  let room_name = authentication.verify_jwt(jwt_token).room_id;
  // 有人第一次加進來時
  if(!ws_dict[name]){
    ws_dict[name] = ws;
    
    // 將遊戲資訊寫進object內
    let temp_dict;
    if(game_state[room_name]){
      temp_dict = game_state[room_name];
    }
    else{
      temp_dict = {};
      temp_dict["num_of_ready"] = 0;
      temp_dict["next_step"] = "player1"
    }
    if(temp_dict["player1"]){
      temp_dict["player2"] = name;
    }
    else{
      temp_dict["player1"] = name;
    }
    // inform_player_room_info(ws);
    game_state[room_name] = temp_dict;
    console.log(game_state)
    
    ws.send(name + '已加入房間' + "//");
    ws.send("room_name:" + room_name + "//");
  }

  if(message == "" && next_step){
    next_move(room_name, name, next_step);
  }
  else if(message == "ready"){
    ready(room_name, name, ws);
  }
  else{
    broadcast(room_name, name, message);
  }

  // 給予剛連進來玩家當前房間資訊
  inform_player_game_info(ws, room_name);
  // 通知房間其他玩家 有玩家加入或退出
  inform_player_personel_change(name, room_name);
}

function inform_player_personel_change(name, room_name){
  let other_player;
  
  if(game_state[room_name]["player1"] == name){
    other_player = game_state[room_name]["player2"]
  }
  else{
    other_player = game_state[room_name]["player1"]
  }
  if(other_player){
    inform_player_game_info(ws_dict[other_player], room_name);
  }
}

function inform_player_game_info(ws, room_name){
  let player1 = game_state[room_name]["player1"];
  let player2 = game_state[room_name]["player2"];
  let message = `/${player1}/${player2}`;
  if(ws){
    ws.send(message)
    console.log(message)
  }
}


function broadcast(room_name, name, message){
  
}


// 處理遊戲的事情
function game(room_name, name, next_step){
  // game_state[room_name]["board"]
}

function ready(room_name, name){
  game_state[room_name]["num_of_ready"] += 1;
  if(!game_state[room_name]['player1']){
    game_state[room_name]['player1'] = ws;
  }
  else if(!game_state[room_name]['player2']){
    game_state[room_name]['player2'] = ws;
  }
  
  if(game_state[room_name]["num_of_ready"] == 2){
    let temp_board = [];
    for(let i = 0; i < 361; i++){
      temp_board.push("0");
    }
    // 初始棋盤
    game_state[room_name]["board"] = temp_board;
    console.log(room_name,"遊戲開始");
    console.log(game_state);
  }
}

function next_move(room_name, name, next_step){
  next_step = next_step.split(",");
  let x = next_step[0];
  let y = next_step[1];
  let whos_turn = game_state[room_name]["next_step"];
  if(name == game_state[room_name][whos_turn]){
    // 將下一步棋設定為只能另一位玩家下
    if(whos_turn == "player1"){
      game_state[room_name]["next_step"] = "player2";
    }
    else{
      game_state[room_name]["next_step"] = "player1";
    }
    
  }


}