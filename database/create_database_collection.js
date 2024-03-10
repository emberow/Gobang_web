const MongoClient = require('mongodb').MongoClient;

const url = "mongodb://localhost:27017/";

async function createCollections() {
    try {
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
    } catch (err) {
        console.error("Error:", err);
    }
}

createCollections();
