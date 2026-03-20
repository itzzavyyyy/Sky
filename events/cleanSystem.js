module.exports = (client) => {

  // 🔹 COMMANDS
  client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;

    // ADD CHANNEL
    if (interaction.commandName === "cleanbot") {

      await client.cleanChannelsDB.updateOne(
        { guildId, channelId },
        { $set: { guildId, channelId } },
        { upsert: true }
      );

      return interaction.reply({
        content: "This channel is now auto-clean.",
        ephemeral: true
      });

    }

    // REMOVE CHANNEL
    if (interaction.commandName === "rembot") {

      await client.cleanChannelsDB.deleteOne({ guildId, channelId });

      return interaction.reply({
        content: "This channel is no longer auto-clean.",
        ephemeral: true
      });

    }

  });


  // 🔹 AUTO CLEAN LOGIC
  client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;

    const data = await client.cleanChannelsDB.findOne({ guildId, channelId });

    if (!data) return;

    // wait a bit so bot sends message first
    setTimeout(async () => {

      try {

        const messages = await interaction.channel.messages.fetch({ limit: 50 });

        const botMessages = messages.filter(m => m.author.id === client.user.id);

        for (const msg of botMessages.values()) {
          await msg.delete().catch(() => {});
        }

      } catch {}

    }, 2000);

  });

};
