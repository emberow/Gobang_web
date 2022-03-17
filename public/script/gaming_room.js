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