var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/";

// 創建collection
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("chess_web");
    dbo.createCollection("account", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });

