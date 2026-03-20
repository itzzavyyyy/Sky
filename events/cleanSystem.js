module.exports = (client) => {

  // 🔹 COMMANDS (add/remove channel)
  client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;

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

    if (interaction.commandName === "rembot") {

      await client.cleanChannelsDB.deleteOne({ guildId, channelId });

      return interaction.reply({
        content: "This channel is no longer auto-clean.",
        ephemeral: true
      });

    }

  });


  // 🔹 AUTO CLEAN (OTHER BOTS ONLY)
  client.on("messageCreate", async (message) => {

    if (!message.guild) return;

    const channelId = message.channel.id;
    const guildId = message.guild.id;

    const data = await client.cleanChannelsDB.findOne({ guildId, channelId });

    if (!data) return;

    // ❌ ignore your own bot
    if (message.author.id === client.user.id) return;

    // ✅ only target OTHER bots
    if (!message.author.bot) return;

    try {

      await message.delete().catch(() => {});

    } catch {}

  });

};
