const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const customCommands = {};

client.once("ready", () => {
  console.log("Aerialphile is online!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(" ");

  // REMINDER COMMAND
  if (args[0] === "!reminder") {
    let time = args[1];
    let text = args.slice(2).join(" ");

    if (!time || !text) {
      return message.reply("Usage: !reminder 1h Do homework");
    }

    let ms = 0;

    if (time.endsWith("s")) ms = parseInt(time) * 1000;
    if (time.endsWith("m")) ms = parseInt(time) * 60000;
    if (time.endsWith("h")) ms = parseInt(time) * 3600000;

    message.reply(`⏰ Reminder set for ${time}`);

    setTimeout(() => {
      message.reply(`Reminder: ${text}`);
    }, ms);
  }

  // CUSTOM COMMAND CREATE
  if (args[0] === "!cc") {
    const cmd = args[1];
    const response = args.slice(2).join(" ");

    if (!cmd || !response) {
      return message.reply("Usage: !cc command response");
    }

    customCommands[cmd] = response;
    message.reply(`Custom command !${cmd} created`);
  }

  // RUN CUSTOM COMMAND
  if (customCommands[args[0].replace("!", "")]) {
    message.reply(customCommands[args[0].replace("!", "")]);
  }
});

client.login(process.env.TOKEN);
