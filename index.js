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

  const isAdmin =
    message.member.permissions.has(PermissionsBitField.Flags.Administrator);

  // CREATE CUSTOM COMMAND
  if (args[0] === "!cc") {

    if (!isAdmin) {
      return message.reply("❌ Only admins can create commands.");
    }

    const cmd = args[1];
    const response = args.slice(2).join(" ");

    if (!cmd || !response) {
      return message.reply("Usage: !cc command response");
    }

    customCommands[cmd] = response;
    fs.writeFileSync("commands.json", JSON.stringify(customCommands, null, 2));

    message.reply(`✅ Custom command !${cmd} created.`);
  }

  // DELETE COMMAND
  if (args[0] === "!cd") {

    if (!isAdmin) {
      return message.reply("❌ Only admins can delete commands.");
    }

    const cmd = args[1];

    if (!customCommands[cmd]) {
      return message.reply("Command does not exist.");
    }

    delete customCommands[cmd];

    fs.writeFileSync("commands.json", JSON.stringify(customCommands, null, 2));

    message.reply(`🗑 Command !${cmd} deleted.`);
  }

  // LIST COMMANDS
  if (args[0] === "!cclist") {

    const list = Object.keys(customCommands);

    if (list.length === 0) {
      return message.reply("No custom commands created yet.");
    }

    message.reply(`📜 Custom Commands:\n${list.map(c => `!${c}`).join(", ")}`);
  }

  // RUN COMMAND
  const command = args[0].replace("!", "");

  if (customCommands[command]) {
    message.reply(customCommands[command]);
  }

});

client.login(process.env.TOKEN);
