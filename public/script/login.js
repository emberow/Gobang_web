// ajax應用
function account_chk(){
    var name = $('#name').val();     
    var password = $('#pwd').val();
    
    $.ajax({
        url: '/login_chk',
        data:"&name="+name+"&password="+password,  
        type : "post", 
        dataType:'json', 
        error:function(){   
            alert("連接server失敗");
        },
        success:function(data){   
            var message = data['message'];  
            if (message == "登入成功"){
                // 透過post的方式傳送表單
                var login_form = document.createElement("form");
                var params = {"account": name};
                login_form.action = '/index';      
                login_form.target = "_self";
                login_form.method = "get";      
                login_form.style.display = "none";
                //用來存取 參數的object 並加到表單之中
                // for (var x in params) { 
                //     var opt = document.createElement("textarea");      
                //     opt.name = x;      
                //     opt.value = params[x];      
                //     login_form.appendChild(opt);      
                // }      
                document.body.appendChild(login_form);
                login_form.submit();     
            }
            else{
                alert(message);
            }
        }
    });
}

function register(){
    var log_out_form = document.createElement("form");
    log_out_form.action = '/create_account';      
    log_out_form.target = "_self";
    log_out_form.method = "get";      
    document.body.appendChild(log_out_form);
    log_out_form.submit();     
}