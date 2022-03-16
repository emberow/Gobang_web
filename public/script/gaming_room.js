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
    let c = document.getElementById("gaming_board");
    c.setAttribute("width",windowWidth);
    c.setAttribute("height",windowWidth);
    let ctx = c.getContext("2d");
    console.log(windowWidth);
    
    for(let i = 0; i < 19; i++){
        ctx.moveTo(0, i*unit+offset);
        ctx.lineTo(windowWidth, i*unit+offset);
        ctx.stroke();

        ctx.moveTo(i*unit+offset, 0);
        ctx.lineTo(i*unit+offset, windowWidth);
        ctx.stroke();
    }
    
}
draw_gaming_board()