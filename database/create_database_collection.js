const MongoClient = require('mongodb').MongoClient;

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '27017';
var url = `mongodb://${DB_HOST}:${DB_PORT}/`;

exports.createCollections = async() => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const dbo = client.db("chess_web");

    // Create "account" collection
    await dbo.createCollection("account");
    console.log("Account collection created!");

    // Create "player" collection
    await dbo.createCollection("player");
    console.log("Player collection created!");

    // Create "gaming_room" collection
    await dbo.createCollection("gaming_room");
    console.log("Gaming room collection created!");

    // Close the connection
    await client.close();
    console.log("Connection closed.");
}
