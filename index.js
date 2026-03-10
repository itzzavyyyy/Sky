const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let customCommands = {};

if (fs.existsSync("./commands.json")) {
  customCommands = JSON.parse(fs.readFileSync("./commands.json"));
}

client.once("ready", () => {
  console.log("Aerialphile is online!");
});

client.on("messageCreate", message => {

  if (message.author.bot) return;

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

    message.reply(`
**Aerialphile Commands**

!cc <name> <response> - Create custom command  
!cd <name> - Delete custom command  
!cclist - Show custom commands  
!reminder <time> <text> - Set reminder
`);
  }

  // CREATE COMMAND
  if (command === "!cc") {

    if (!isAdmin) return message.channel.send("**Only admins can add commands.**");

    const name = args[1];
    const response = args.slice(2).join(" ");

    if (!name || !response) {
      return message.channel.send("**Usage:** !cc command response");
    }

    customCommands[name] = response;

    fs.writeFileSync("commands.json", JSON.stringify(customCommands, null, 2));

    message.channel.send(`**Command !${name} created.**`);
  }

  // DELETE COMMAND
  if (command === "!cd") {

    if (!isAdmin) return message.channel.send("**Only admins can delete commands.**");

    const name = args[1];

    if (!customCommands[name]) {
      return message.channel.send("**Command not found.**");
    }

    delete customCommands[name];

    fs.writeFileSync("commands.json", JSON.stringify(customCommands, null, 2));

    message.channel.send(`**Command !${name} deleted.**`);
  }

  // COMMAND LIST
  if (command === "!cclist") {

    const list = Object.keys(customCommands);

    if (list.length === 0) {
      return message.channel.send("**No custom commands created.**");
    }

    message.channel.send(`**Custom Commands:**\n${list.map(c => `!${c}`).join(", ")}`);
  }

  // REMINDER
  if (command === "!reminder") {

    const time = args[1];
    const text = args.slice(2).join(" ");

    if (!time || !text) {
      return message.channel.send("**Usage:** !reminder 10m do homework");
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

  if (customCommands[name]) {
    message.channel.send(customCommands[name]);
  }

});

client.login(process.env.TOKEN);
