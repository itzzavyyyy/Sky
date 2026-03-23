const { EmbedBuilder } = require("discord.js");

const LOG_CHANNEL_ID = "1485575354499207258";

module.exports = (client) => {

  client.on("interactionCreate", async (interaction) => {

    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) return;

    try {

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (!logChannel) return;

      // basic info
      const user = `${interaction.user.tag} (${interaction.user.id})`;
      const command = `/${interaction.commandName}`;
      const channel = `<#${interaction.channel.id}>`;

      // try to auto-detect target & role
      let target = null;
      let role = null;

      try {
        target = interaction.options.getUser("user");
      } catch {}

      try {
        role = interaction.options.getRole("role");
      } catch {}

      const embed = new EmbedBuilder()
        .setTitle("Command Log")
        .setColor(0x3498db) // blue default
        .addFields(
          { name: "User", value: user, inline: false },
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

    } catch (err) {
      console.error("Logger Error:", err);
    }

  });

};
