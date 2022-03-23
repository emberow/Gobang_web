const jwt_token = document.cookie.replace("jwt=", "");

window.onload = function(){
    // 使input_box可以只按enter傳送訊息
    $("#input_box").keydown(function(event) {
        if(event.keyCode == 13){
            enter_btn();
        };
    });
}

//判斷是否server准許前往gameing room
var go_flag = false;

const ws = new WebSocket('ws://localhost:3001');
ws.addEventListener("open", () =>{
    console.log("connected!");
    console.log(document.cookie)
    ws.send(jwt_token + "/");
})
ws.addEventListener("message",(received_data) =>{
    let message = received_data.data;
    if(message == "go_to_gaming_room_acknowledge"){
        go_to_the_gaming_room();
    }
    else if(message == "create_room_fail"){
        alert("新增房間失敗");
    }
    else if(message.split("/")[0] == "create" || message.split("/")[0] == "delete"){
        // server回傳房間改變的指令
        parse_action(message);
    }
    else{
        print_message_to_message_board(message);
    }
    
})

function parse_action(message) {
    message = message.split("/");
    let action = message[0];
    let room_name = message[1];
    let num_of_people = message[2];
    if(action == "create"){
        add_room_info(room_name, num_of_people);
    }
    else if(action == "delete"){
        delete_room_info(room_name, num_of_people);
    }
}

function add_room_info(room_name, num_of_people){
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    td1.textContent = room_name;
    td2.textContent = String(num_of_people) + " / 2";
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.setAttribute('id',room_name);
    let action = 'show_enter_room_form("' + room_name + '");'
    tr.setAttribute('onclick', action);
    let board = document.querySelector('.room_records');
    board.appendChild(tr);
}

function delete_room_info(room_name){
    let room_records = document.querySelector('.room_records');
    let room = document.getElementById(room_name);
    if(room){
        room_records.removeChild(room);
    }
}



function send_message_to_server(jwt_token, message){
    console.log(message)
    ws.send(jwt_token + "/" + message);
}





function print_message_to_message_board(message){
    // 用 createElement 增加一個 DOM 節點
    let str = document.createElement('p');
    // 先用 JS 寫好要增加的內容
    str.textContent = message;
    // 動態掛一個 class 屬性
    str.setAttribute('class','text_record');
    // 用 appendChild() 把上面寫好的子節點掛在既有的 h1 下面，新增的內容會依序排列在後面，不會被洗掉
    let board = document.querySelector('.talk_record');
    board.appendChild(str);
}



function enter_btn(){
    let message = $("#input_box").val();
    $("#input_box").val("");
    print_message_to_message_board(message);
    send_message_to_server(jwt_token, message);
}

function add_room_btn(){
    let form = $(".create_room_form");
    form.css({
        "display":'block',
        "background-color" : "white",
        "z-index": 2
    });
     $("body > div:not(.create_room_form)").css({
        opacity: 0.5
    });
}

function show_enter_room_form(room_name){
    $('#enter_room_name').attr('value', room_name);
    let form = $(".enter_room_form");
    form.css({
        "display":'block',
        "background-color" : "white",
        "z-index": 2
    });
     $("body > div:not(.enter_room_form)").css({
        opacity: 0.5
    });
}

// 創建房間的取消按鈕
function cancel_btn(){
    $(".create_room_form").css({
        "display":'none'
    });
    $(".enter_room_form").css({
        "display":'none'
    });
    $("body > div:not(.create_room_form):not(.enter_room_form)").css({
        opacity: 1
    });

}
// 創建房間的確認按鈕
function confirm_btn(){
    let room_name = $('#room_name').val();
    let password = $("#room_pwd").val();
    request_create_room(room_name, password);
}

// 進入房間表單的確認按鈕
function enter_room_confirm_btn(){
    let room_name = $('#enter_room_name').val();
    let password = $("#enter_room_pwd").val();
    request_enter_room(room_name, password);
}

function request_create_room(room_name, password) {
    ws.send(jwt_token + "//" + room_name + "/" + password);
}

function request_enter_room(room_name, password) {  
    ws.send(jwt_token + "/enter_room/" + room_name + "/" + password);
}



function go_to_the_gaming_room(){
    var form = document.createElement("form");
    form.action = '/gaming_room';      
    form.target = "_self";
    form.method = "get";      
    document.body.appendChild(form);
    form.submit();  
}


