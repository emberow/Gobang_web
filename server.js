const express = require('express');
const engine = require('ejs-locals');

var app = express();

var operate_account_data = require('./database/account_db');
var operate_gaming_room_db = require('./database/gaming_room_db')
var operate_hall_web_socket = require('./web_socket/hall_web_scoket');
var operate_game_room_socket = require('./web_socket/game_web_socket');
var authentication = require('./authentication/auth');
var create_database_collection = require('./database/create_database_collection');

// bodyParser 處理get post封包
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json());
const cookieParser = require('cookie-parser') // 解析cookie模組
app.use(cookieParser()) //解析前端cookie

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
  const token = req.cookies.jwt;
  //沒有驗證就返回登入畫面
  if(token){
    // 解密token成user_data
    let user_data = authentication.verify_jwt(token);
    let name = user_data._id;
    // operate_hall_web_socket.connect_to_the_hall(name);

    res.render('index');
  }
  else{
    res.render('login');
  }
});

app.get('/gaming_room', function(req, res){
  // 判斷玩家在哪個房間
  let player_state = operate_hall_web_socket.player_state;
  let token = req.cookies.jwt;
  let name = authentication.verify_jwt(token)._id;
  operate_gaming_room_db.search_player_in_which_room(name).then(
    function(room_name){
      token = authentication.generate_auth_token(name, room_name);
      res.cookie("jwt", token, {
        maxAge: 86400000, // 只存在n秒，n秒後自動消失
        // httpOnly: true // 僅限後端存取，無法使用前端document.cookie取得
      })
      res.render('gaming_room');
    },
    function(err){throw err;}
  )
  // 重新製作新的token
});

//處理ajax-------------------------------------------------------
//玩家登入，查詢搜尋資料庫中帳密一樣的人
app.post('/login_chk', function(req, res){
  let account = req.body.name;
  let password = req.body.password;
  const rules = /[^a-zA-X0-9_]{1}/;
  if(rules.test(account) || rules.test(password)){
    res.send({'message':"含有特殊字元"});
  }
  else{
    //資料庫處理
    operate_account_data.login_chk(account,password).then(
      function(is_valid){
        if(is_valid){
          let token = authentication.generate_auth_token(account);

          console.log(authentication.verify_jwt(token))
          // res.setHeader("Authorization",token);
          res.cookie("jwt", token, {
            maxAge: 86400000, // 只存在n秒，n秒後自動消失
            // httpOnly: true // 僅限後端存取，無法使用前端document.cookie取得
          })
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
  console.log(req)
  let account = req.body.name;
  let password	 = req.body.pwd;
  let password_check = req.body.pwd_chk;
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


const init = async() => {
  while (true) {
    try {
      await create_database_collection.createCollections();
      console.log('Database initialized.')
      break;
    } catch (error) {
        console.log(error, 'Failed to connect to database. Retrying in 5 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  // 提供來源檔案的目錄，script/css的來源檔案路徑改到這裡
  app.use(express.static("public"));
  //設定css的來源資料夾
  // app.set("css", express.static(__dirname + "public/css"));

  // ejs
  app.engine('ejs',engine);
  app.use(express.static(__dirname + '/static'));
  app.set('files','./files');
  app.set('view engine','ejs');

  // check running enviroment
  const port = process.env.PORT || 3000;

  // create
  app.listen(port);

  console.log('Server is running on port ' + port)
}

init();