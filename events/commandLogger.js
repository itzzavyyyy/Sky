const { EmbedBuilder, AuditLogEvent } = require("discord.js");

const LOG_CHANNEL_ID = "1485575354499207258";

module.exports = (client) => {

  // 🔹 helper to send logs
  async function sendLog(guild, embed) {
    try {
      const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
      if (!channel) return;
      await channel.send({ embeds: [embed] });
    } catch {}
  }


  // 🔹 MESSAGE DELETE
  client.on("messageDelete", async (message) => {

    if (!message.guild) return;

    const embed = new EmbedBuilder()
      .setTitle("Message Deleted")
      .setColor(0xe74c3c)
      .addFields(
        { name: "Author", value: `${message.author?.tag || "Unknown"}`, inline: true },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
        { name: "Content", value: message.content?.slice(0, 1000) || "None" }
      )
      .setTimestamp();

    sendLog(message.guild, embed);

  });


  // 🔹 MEMBER UPDATE (timeouts / roles)
  client.on("guildMemberUpdate", async (oldMember, newMember) => {

    const guild = newMember.guild;

    try {

      // TIMEOUT REMOVED
      if (
        oldMember.communicationDisabledUntilTimestamp &&
        !newMember.communicationDisabledUntilTimestamp
      ) {

        const embed = new EmbedBuilder()
          .setTitle("Timeout Removed")
          .setColor(0x3498db)
          .addFields(
            { name: "User", value: `${newMember.user.tag}`, inline: true },
            { name: "User ID", value: newMember.id, inline: true }
          )
          .setTimestamp();

        return sendLog(guild, embed);
      }

      // ROLE ADDED
      const addedRoles = newMember.roles.cache.filter(
        role => !oldMember.roles.cache.has(role.id)
      );

      if (addedRoles.size > 0) {

        for (const role of addedRoles.values()) {

          const embed = new EmbedBuilder()
            .setTitle("Role Added")
            .setColor(0x2ecc71)
            .addFields(
              { name: "User", value: `${newMember.user.tag}`, inline: true },
              { name: "Role", value: role.name, inline: true }
            )
            .setTimestamp();

          sendLog(guild, embed);
        }
      }

      // ROLE REMOVED
      const removedRoles = oldMember.roles.cache.filter(
        role => !newMember.roles.cache.has(role.id)
      );

      if (removedRoles.size > 0) {

        for (const role of removedRoles.values()) {

          const embed = new EmbedBuilder()
            .setTitle("Role Removed")
            .setColor(0xe67e22)
            .addFields(
              { name: "User", value: `${newMember.user.tag}`, inline: true },
              { name: "Role", value: role.name, inline: true }
            )
            .setTimestamp();

          sendLog(guild, embed);
        }
      }

    } catch {}

  });


  // 🔹 TIMEOUT APPLIED
  client.on("guildMemberUpdate", async (oldMember, newMember) => {

    if (!newMember.communicationDisabledUntilTimestamp) return;

    if (
      oldMember.communicationDisabledUntilTimestamp !==
      newMember.communicationDisabledUntilTimestamp
    ) {

      const embed = new EmbedBuilder()
        .setTitle("User Timed Out")
        .setColor(0xf1c40f)
        .addFields(
          { name: "User", value: `${newMember.user.tag}`, inline: true },
          { name: "Until", value: `<t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:F>` }
        )
        .setTimestamp();

      sendLog(newMember.guild, embed);
    }

  });

};
