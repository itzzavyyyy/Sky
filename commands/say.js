module.exports = async (interaction) => {

  const text = interaction.options.getString("text");

  await interaction.reply({ content: "Message sent.", ephemeral: true });

  interaction.channel.send(text);

};
