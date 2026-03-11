const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const { MongoClient } = require("mongodb");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const mongo = new MongoClient(process.env.MONGO_URI);

let commands;

async function startDatabase() {

  await mongo.connect();

  const db = mongo.db("botdata");

  commands = db.collection("commands");

  console.log("Connected to MongoDB");

}

startDatabase();

client.once("ready", () => {
  console.log("Aerialphile is online!");
});

client.on("messageCreate", async message => {

  if (message.author.bot) return;

  if (!message.content.startsWith("!")) return;

  const args = message.content.split(" ");

  const command = args[0].toLowerCase();

  const isAdmin = message.member.permissions.has(
    PermissionsBitField.Flags.Administrator
  );

  // HELP COMMAND
  if (command === "!help") {

    if (!isAdmin) {
      return message.channel.send("**Only admins can use this command.**");
    }

    message.channel.send(`
**Aerialphile Commands**

**Admin Commands**
- !cc <name> <response>
- !cd <name>

**User Commands**
- !cclist
- !reminder <time> <text>
`);
  }

  // CREATE CUSTOM COMMAND
  if (command === "!cc") {

    if (!isAdmin) {
      return message.channel.send("**Only admins can add commands.**");
    }

    const name = args[1];
    const response = args.slice(2).join(" ");

    if (!name || !response) {
      return message.channel.send("**Usage:** !cc name response");
    }

    await commands.insertOne({
      name: name,
      response: response
    });

    message.channel.send(`**Command !${name} created.**`);
  }

  // DELETE COMMAND
  if (command === "!cd") {

    if (!isAdmin) {
      return message.channel.send("**Only admins can delete commands.**");
    }

    const name = args[1];

    await commands.deleteOne({ name: name });

    message.channel.send(`**Command !${name} deleted.**`);
  }

  // COMMAND LIST
  if (command === "!cclist") {

    const list = await commands.find().toArray();

    if (list.length === 0) {
      return message.channel.send("**No custom commands created.**");
    }

    const names = list.map(c => `!${c.name}`).join(", ");

    message.channel.send(`**Commands:** ${names}`);
  }

  // REMINDER
  if (command === "!reminder") {

    const time = args[1];
    const text = args.slice(2).join(" ");

    if (!time || !text) {
      return message.channel.send("**Usage:** !reminder 10m text");
    }

    let ms = 0;

    if (time.endsWith("s")) ms = parseInt(time) * 1000;
    if (time.endsWith("m")) ms = parseInt(time) * 60000;
    if (time.endsWith("h")) ms = parseInt(time) * 3600000;

    message.channel.send(`**Reminder set for ${time}.**`);

    setTimeout(() => {
      message.channel.send(`${message.author} **Reminder:** ${text}`);
    }, ms);
  }

  // RUN CUSTOM COMMAND
  const name = command.replace("!", "");

  const cmd = await commands.findOne({ name: name });

  if (cmd) {
    message.channel.send(cmd.response);
  }

});

client.login(process.env.TOKEN);
