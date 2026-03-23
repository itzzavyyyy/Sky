const { EmbedBuilder } = require("discord.js");

const LOG_CHANNEL_ID = "1485575354499207258";

module.exports = (client) => {

  // =======================
  // 🔹 COMMAND LOGS (unchanged)
  // =======================
  client.on("interactionCreate", async (interaction) => {

    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) return;

    try {

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (!logChannel) return;

      const user = `${interaction.user.tag} (${interaction.user.id})`;
      const command = `/${interaction.commandName}`;
      const channel = `<#${interaction.channel.id}>`;

      let target = null;
      let role = null;

      try { target = interaction.options.getUser("user"); } catch {}
      try { role = interaction.options.getRole("role"); } catch {}

      const embed = new EmbedBuilder()
        .setTitle("Command Log")
        .setColor(0x3498db)
        .addFields(
          { name: "User", value: user },
          { name: "Command", value: command, inline: true },
          { name: "Channel", value: channel, inline: true }
        )
        .setTimestamp();

      if (target) {
        embed.addFields({
          name: "Target",
          value: `${target.tag} (${target.id})`,
          inline: true
        });
      }

      if (role) {
        embed.addFields({
          name: "Role",
          value: `${role.name} (${role.id})`,
          inline: true
        });
      }

      embed.addFields({
        name: "Status",
        value: "SUCCESS",
        inline: true
      });

      await logChannel.send({ embeds: [embed] });

    } catch {}

  });


  // =======================
  // 🔹 TRACK BOT TIMEOUT REMOVALS (FLAG SYSTEM)
  // =======================
  const recentlyRemoved = new Set();

  // expose helper so protection system can mark it
  client.markTimeoutRemoved = (userId) => {
    recentlyRemoved.add(userId);
    setTimeout(() => recentlyRemoved.delete(userId), 5000);
  };


  // =======================
  // 🔹 TIMEOUT REMOVED LOG (ONLY BOT)
  // =======================
  client.on("guildMemberUpdate", async (oldMember, newMember) => {

    try {

      if (
        oldMember.communicationDisabledUntilTimestamp &&
        !newMember.communicationDisabledUntilTimestamp
      ) {

        if (!recentlyRemoved.has(newMember.id)) return;

        const channel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (!channel) return;

        const embed = new EmbedBuilder()
          .setTitle("Protected Timeout Removed (Bot)")
          .setColor(0x3498db)
          .addFields(
            { name: "User", value: `${newMember.user.tag}`, inline: true },
            { name: "User ID", value: newMember.id, inline: true }
          )
          .setTimestamp();

        await channel.send({ embeds: [embed] });

      }

    } catch {}

  });


  // =======================
  // 🔹 BOT MESSAGE DELETE (clean system)
  // =======================
  client.on("messageDelete", async (message) => {

    try {

      if (!message.guild) return;
      if (!message.author?.bot) return;

      const data = await client.cleanChannelsDB.findOne({
        guildId: message.guild.id,
        channelId: message.channel.id
      });

      if (!data) return;

      const channel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle("Bot Message Deleted (Clean System)")
        .setColor(0xe74c3c)
        .addFields(
          { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
          { name: "Bot", value: `${message.author.tag}`, inline: true },
          { name: "Content", value: message.content?.slice(0, 1000) || "None" }
        )
        .setTimestamp();

      await channel.send({ embeds: [embed] });

    } catch {}

  });

};
