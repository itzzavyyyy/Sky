const { MongoClient } = require("mongodb");

module.exports = async (client) => {

  const mongo = new MongoClient(process.env.MONGO_URI);

  await mongo.connect();

  const db = mongo.db("botdata");

  client.commandsDB = db.collection("commands");
  client.protectedUsersDB = db.collection("protectedUsers");

  console.log("Connected to MongoDB");

};
