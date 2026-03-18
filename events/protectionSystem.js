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

      // check if timed out
      const isTimedOut =
        newMember.isCommunicationDisabled() ||
        newMember.communicationDisabledUntil;

      if (!isTimedOut) return;

      // check database
      const data = await client.protectedUsersDB.findOne({
        userId: newMember.id
      });

      if (!data) return;

      // remove timeout silently
      await newMember.timeout(null);

    } catch (err) {
      // completely silent
    }

  });

};
