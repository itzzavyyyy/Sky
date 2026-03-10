const { Client, GatewayIntentBits } = require("discord.js");
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

  // CREATE CUSTOM COMMAND
  if (args[0] === "!cc") {
    const cmd = args[1];
    const response = args.slice(2).join(" ");

    if (!cmd || !response) {
      return message.reply("Usage: !cc command response");
    }

    customCommands[cmd] = response;

    fs.writeFileSync("commands.json", JSON.stringify(customCommands, null, 2));

    message.reply(`Custom command !${cmd} saved permanently`);
  }

  // RUN CUSTOM COMMAND
  const command = args[0].replace("!", "");
  if (customCommands[command]) {
    message.reply(customCommands[command]);
  }
});

client.login(process.env.TOKEN);
