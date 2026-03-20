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


  // 🔹 AUTO CLEAN (ONLY current command reply)
  client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;

    const data = await client.cleanChannelsDB.findOne({ guildId, channelId });

    if (!data) return;

    // skip system commands themselves
    if (["cleanbot", "rembot"].includes(interaction.commandName)) return;

    try {

      // wait for bot to send reply
      setTimeout(async () => {

        const reply = await interaction.fetchReply().catch(() => null);

        if (!reply) return;

        // ensure it's bot message (extra safety)
        if (reply.author.id !== client.user.id) return;

        await reply.delete().catch(() => {});

      }, 1500);

    } catch {}

  });

};
