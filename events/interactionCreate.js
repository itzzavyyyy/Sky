module.exports = (client) => {

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const command = require(`../commands/${interaction.commandName}.js`);

  if (!command) return;

  command(interaction, client);

});

};
