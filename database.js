const { MongoClient } = require("mongodb");

module.exports = async (client) => {

  const mongo = new MongoClient(process.env.MONGO_URI);

  await mongo.connect();

  const db = mongo.db("botdata");

  client.commandsDB = db.collection("commands");

  console.log("Connected to MongoDB");

};
