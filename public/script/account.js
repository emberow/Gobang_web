// ajax應用
function account_chk(){
    var name = $('#name').val();     
    var pwd = $('#pwd').val();
    var pwd_chk = $('#pwd_chk').val();
    if(name == "" || pwd == "" || pwd_chk == ""){
        alert('欄位不得為空白');
    }
    else{
        $.ajax({
            url: '/account',
            data:"&name="+name+"&pwd="+pwd+"&pwd_chk="+pwd_chk,  
            type : "POST", 
            dataType:'json', 
            error:function(){   
                document.getElementById("txtHint").innerHTML = "連接server失敗";
            },
            success:function(data){   
                var message = data['message'];  
                if(message == "建立帳戶成功"){
                    document.getElementById("txtHint").innerHTML = message;   
                    alert('新增帳戶成功'); 
                    window.location.href  = '/';
                }
                else{
                    alert(message); 
                }                                                       
            }
        });
    }
}

function chnage_pwd(){
    var name = $('#name').val();     
    var pwd = $('#current_pwd').val();
    var new_pwd = $('#new_pwd').val();
    var new_pwd_chk = $('#new_pwd_chk').val();
    if(name == "" || pwd == "" || new_pwd == "" || new_pwd_chk == ""){
        alert('欄位不得為空白');
    }
    else{
        $.ajax({
            url: '/account',
            data:"&name="+name+"&pwd="+pwd+"&new_pwd="+new_pwd+"&new_pwd_chk="+new_pwd_chk,  
            type : "patch", 
            dataType:'json', 
            error:function(){   
                document.getElementById("txtHint").innerHTML = "連接server失敗";
            },
            success:function(data){   
                var message = data['message'];  
                if(message == "修改密碼成功"){
                    document.getElementById("txtHint").innerHTML = message;   
                    alert('修改密碼成功'); 
                    window.location.href  = '/index';
                }
                else{
                    alert(message); 
                }                                                       
            }
        });
    }
}

function back_to_login(){
    var form = document.createElement("form");
    form.action = '/';      
    form.target = "_self";
    form.method = "get";      
    document.body.appendChild(form);
    form.submit();     
}

function back_to_index(){
    var form = document.createElement("form");
    form.action = '/index';      
    form.target = "_self";
    form.method = "get";      
    document.body.appendChild(form);
    form.submit();     
}