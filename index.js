const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

require("./database")(client);
require("./events/ready")(client);
require("./events/interactionCreate")(client);
require("./events/messageCreate")(client);
require("./report")(client);
require("./events/protectionSystem")(client);

client.login(process.env.TOKEN);
