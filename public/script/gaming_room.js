const jwt_token = document.cookie.replace("jwt=", "");
const ws = new WebSocket('ws://localhost:3002');
ws.addEventListener("open", () =>{
    console.log("connected!");
    console.log(document.cookie)
    ws.send(jwt_token + "/");
});
ws.addEventListener("message",(received_data) =>{
    let message = received_data.data;
    console.log(message);
    print_message_to_message_board(message);
});

function leave_button(){
    var form = document.createElement("form");
    form.action = '/index';      
    form.target = "_self";
    form.method = "get";      
    document.body.appendChild(form);
    form.submit();     
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
draw_gaming_board()

function send_next_step(i,j){
    console.log(i,j)
}

function print_message_to_message_board(message){
    var str = document.createElement('p');
    str.textContent = message;
    str.setAttribute('class','text_record');
    let board = document.querySelector('.talk_block');
    board.appendChild(str);
}

window.onload = function(){
    // 使input_box可以只按enter傳送訊息
    $("#input_box").keydown(function(event) {
        if(event.keyCode == 13){
            enter_btn();
        };
    });
}

function enter_btn(){
    let message = $("#input_box").val();
    $("#input_box").val("");
    print_message_to_message_board(message);
    send_message_to_server(jwt_token, message, "");
}

function send_message_to_server(jwt_token, message, next_step){
    console.log(message);
    console.log(next_step);
    ws.send(jwt_token + "/" + message + "/" + next_step);
}