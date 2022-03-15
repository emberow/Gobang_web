const express = require('express');
const engine = require('ejs-locals');

var app = express();

// 提供來源檔案的目錄，script/css的來源檔案路徑改到這裡
app.use(express.static("public"));
//設定css的來源資料夾
// app.set("css", express.static(__dirname + "public/css"));

// ejs
app.engine('ejs',engine);
app.use(express.static(__dirname + '/static'));
app.set('files','./files');
app.set('view engine','ejs');

// bodyParser 處理get post封包
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())

var operate_account_data = require('./database/account_db');
var operate_web_socket = require('./web_socket/web_scoket');

var socket_list = [];

//頁面顯示---------------------------------------------------------
//登入介面
app.get('/', function(req, res){
  res.render('login');
}); 

//創建帳號
app.get('/create_account',function(req, res){
  res.render('create_account');
});

app.get('/index', function(req, res){
  let name = "aaa";
  // 防止重複連線
  if(socket_list.indexOf(name) == -1){
    operate_web_socket.connect_to_the_hall(name);
    socket_list.push(name);
  }
  res.render('index');
});

//處理ajax-------------------------------------------------------
//玩家登入，查詢搜尋資料庫中帳密一樣的人
app.post('/login_chk', function(req, res){
  var account = req.body.name;
  var password = req.body.password;
  const rules = /[^a-zA-X0-9_]{1}/;
  if(rules.test(account) || rules.test(password)){
    res.send({'message':"含有特殊字元"});
  }
  else{
    //資料庫處理
    operate_account_data.login_chk(account,password).then(
      function(is_valid){
        if(is_valid){
          res.send({'message':"登入成功"});
        }
        else{
          res.send({'message':"帳號或密碼錯誤"});
        }
      },
      function(err){throw err;}
    );
  }
});

//處理新增帳號
app.post('/account', function(req, res){
  var account = req.body.name;
  var password	 = req.body.pwd;
  var password_check = req.body.pwd_chk;
  const rules = /[^a-zA-X0-9_]{1}/;
  if(rules.test(account) || rules.test(password) || rules.test(password_check)){
    res.send({'message':"含有特殊字元"});
  }
  else{
    console.log(account,password,password_check)
    if (password != password_check){
      res.send({"message": "密碼與確認密碼不一致"});
    }
    else{
      operate_account_data.add_account(account, password).then(
        function(is_valid){
          if (is_valid == true){
            // 沒有找到帳戶資料回傳錯誤訊息給ajax
            res.send({"message": "建立帳戶成功"});
          }
          else{
            res.send({"message": "帳戶已存在"});
          }
        },
        function(error) {throw error}
      );
    }
  }
});


// check running enviroment
var port = process.env.PORT || 3000;

// create
app.listen(port);

// only print hint link for local enviroment
if (port === 3000) {
    console.log('RUN http://localhost:3000/');
}