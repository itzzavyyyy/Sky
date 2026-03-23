const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {

  // 🔹 COMMAND HANDLER PART
  client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    // PROTECT
    if (interaction.commandName === "protect") {

      const user = interaction.options.getUser("user");

      await client.protectedUsersDB.updateOne(
        { userId: user.id },
        { $set: { userId: user.id, protected: true } },
        { upsert: true }
      );

      return interaction.reply({
        content: `${user.tag} is now protected.`,
        ephemeral: true
      });

    }

    // UNPROTECT
    if (interaction.commandName === "unprotect") {

      const user = interaction.options.getUser("user");

      await client.protectedUsersDB.deleteOne({ userId: user.id });

      return interaction.reply({
        content: `${user.tag} is no longer protected.`,
        ephemeral: true
      });

    }

    // LIST
    if (interaction.commandName === "protectedlist") {

      const list = await client.protectedUsersDB.find().toArray();

      if (list.length === 0) {
        return interaction.reply({
          content: "No protected users.",
          ephemeral: true
        });
      }

      const users = list.map(u => `• <@${u.userId}> (ID: ${u.userId})`).join("\n");

      const embed = new EmbedBuilder()
        .setTitle("Protected Users")
        .setDescription(users)
        .setColor(0x2b2d31);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });

    }

  });


  // 🔹 CORE LOGIC (ANTI TIMEOUT)
  client.on("guildMemberUpdate", async (oldMember, newMember) => {

    try {

      const isTimedOut =
        newMember.isCommunicationDisabled() ||
        newMember.communicationDisabledUntil;

      if (!isTimedOut) return;

      const data = await client.protectedUsersDB.findOne({
        userId: newMember.id
      });

      if (!data) return;

      await newMember.timeout(null);

      // 🔹 MARK FOR LOGGER
      if (client.markTimeoutRemoved) {
        client.markTimeoutRemoved(newMember.id);
      }

    } catch {}

  });


  // 🔹 BACKUP CHECK (every 5 minutes)
  client.once("clientReady", () => {

    setInterval(async () => {

      try {

        const protectedUsers = await client.protectedUsersDB.find().toArray();

        for (const data of protectedUsers) {

          const userId = data.userId;

          for (const guild of client.guilds.cache.values()) {

            try {

              const member = await guild.members.fetch(userId).catch(() => null);
              if (!member) continue;

              const isTimedOut =
                member.isCommunicationDisabled() ||
                member.communicationDisabledUntil;

              if (!isTimedOut) continue;

              await member.timeout(null);

              // 🔹 MARK FOR LOGGER
              if (client.markTimeoutRemoved) {
                client.markTimeoutRemoved(member.id);
              }

            } catch {}

          }

        }

      } catch {}

    }, 5 * 60 * 1000); // 5 minutes

  });

};
