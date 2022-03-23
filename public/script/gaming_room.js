const jwt_token = document.cookie.replace("jwt=", "");
const ws = new WebSocket('ws://localhost:3002');
ws.addEventListener("open", () =>{
    ws.send(jwt_token + "/");
});
ws.addEventListener("message",(received_data) =>{
    let message = parse_message(received_data);
    if(message){
        print_message_to_message_board(message);
    }
});

window.onload = function(){
    // 使input_box可以只按enter傳送訊息
    $("#input_box").keydown(function(event) {
        if(event.keyCode == 13){
            enter_btn();
        };
    });
}

window.onload = init_game();

function init_game(){
    document.querySelector(".gaming_block").style.border = "solid 1px black";
    var ready_button = document.createElement('p');
    ready_button.textContent = "點此準備";
    ready_button.setAttribute('class','ready_button');
    ready_button.setAttribute('onclick','ready_button();');
    let board = document.querySelector('.gaming_block');
    board.appendChild(ready_button);
    
}


function draw_gaming_board(){
    // 使邊框消失
    $('.gaming_block').css({
        "border-style":"none"
    });
    // 畫棋盤的線
    let windowWidth = window.innerWidth*0.4;
    let unit = windowWidth /19;
    let offset = 0.01 * window.innerWidth;

    let gaming_block = $(".gaming_block");
    for(let i = 0; i < 19; i++){
        let row = document.createElement('div');
        row.setAttribute('class', "row");
        row.style.display = "flex";
        for(let j = 0; j < 19; j++){
            let col = document.createElement('div');
            col.setAttribute('class','col');
            col.setAttribute('onclick',`send_next_step(${i},${j});`);
            col.style.border = "1px solid black"
            row.appendChild(col);
        }
        gaming_block.append(row);
    }
}

function ready_button(){
    send_message_to_server("ready", "");
    document.querySelector('.gaming_block').style.border = "solid 0px black";
    document.querySelector('.ready_button').style.display = "none"
    draw_gaming_board();
}

function leave_button(){
    var form = document.createElement("form");
    form.action = '/index';      
    form.target = "_self";
    form.method = "get";      
    document.body.appendChild(form);
    form.submit();     
}



function send_next_step(i,j){
    let message = jwt_token + "//" + i + "," + j;
    ws.send(message);
}

let player1;
let player2;
function print_message_to_message_board(message){
    message = message;
    var str = document.createElement('p');
    str.textContent = message;
    str.setAttribute('class','text_record');
    let board = document.querySelector('.talk_block');
    board.appendChild(str);
}



function enter_btn(){
    let message = $("#input_box").val();
    $("#input_box").val("");
    print_message_to_message_board(message);
    send_message_to_server(message, "");
}

function send_message_to_server(message, next_step){
    ws.send(jwt_token + "/" + message + "/" + next_step);
}

function parse_message(received_data) {
    let message = received_data.data;
    
    message = message.split("/");
    if(message[1] != player1 || message[2] != player2){
        player1 = message[1];
        player2 = message[2];
        document.getElementById("player1").innerHTML = player1;
        document.getElementById("player2").innerHTML = player2;
    }
    return message[0];
}