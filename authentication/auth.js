const jwt = require('jsonwebtoken');
// 設定密鑰
const SECRET = 'thisismynewproject'
// 建立 Token

exports.generate_auth_token = function(account, room_id){
    const token = jwt.sign({ _id: account, room_id: room_id}, SECRET, { expiresIn: '1 day' })
    return token;
}

// 解密jwt_token
exports.verify_jwt = function(token){
    const data = jwt.verify(token, SECRET);
    return data;
}

