

const ws = new WebSocket('ws://localhost:3001');
ws.addEventListener("open", () =>{
    console.log("connected!");
})
ws.addEventListener("message",(received_data) =>{
    let message = received_data.data;
    console.log(message)
    print_message_to_message_board(message);
})

function print_message_to_message_board(message){
    // 用 createElement 增加一個 DOM 節點
    var str = document.createElement('p');
    // 先用 JS 寫好要增加的內容
    str.textContent = message;
    // 動態掛一個 class 屬性
    str.setAttribute('class','text_record');
    // 用 appendChild() 把上面寫好的子節點掛在既有的 h1 下面，新增的內容會依序排列在後面，不會被洗掉
    let board = document.querySelector('.talk_record');
    board.appendChild(str);
}

function send_message_to_server(message){
    ws.send(message);
}

function enter_btn(){
    let message = $("#input_box").val();
    $("#input_box").val("");
    print_message_to_message_board(message);
    send_message_to_server(message);
}

function add_room_btn(){
    let form = $(".create_room_form");
    form.css({
        "display":'block'
    });
    //這裡有問題
    //  $("*:not(.create_room_form)").css({
    //     opacity: 0.5
    // });
}

function cancel_btn(){
    $(".create_room_form").css({
        "display":'none'
    });

}




