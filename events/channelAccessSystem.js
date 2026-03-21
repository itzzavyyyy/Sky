const { PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {

  // 🔹 WHITELIST ROLE IDS (for /editch)
  const EDIT_WHITELIST_ROLES = [
    "1467861426357141555",
    "1485056893843148820"
  ];

  client.on("interactionCreate", async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    const channel = interaction.options.getChannel("channel") || interaction.channel;
    const user = interaction.options.getMember("user");

    // 🔹 /addch
    if (interaction.commandName === "addch") {

      await channel.permissionOverwrites.edit(user, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      return interaction.reply({
        content: `${user.user.tag} now has access to ${channel}.`,
        ephemeral: true
      });

    }

    // 🔹 /remch
    if (interaction.commandName === "remch") {

      await channel.permissionOverwrites.delete(user);

      return interaction.reply({
        content: `${user.user.tag} access removed from ${channel}.`,
        ephemeral: true
      });

    }

    // 🔹 /editch
    if (interaction.commandName === "editch") {

      const member = interaction.member;

      const hasRole = member.roles.cache.some(r => EDIT_WHITELIST_ROLES.includes(r.id));
      const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

      if (!hasRole && !isAdmin) {
        return interaction.reply({
          content: "You are not allowed to use this command.",
          ephemeral: true
        });
      }

      const name = interaction.options.getString("name");
      const lock = interaction.options.getBoolean("lock");

      if (name) {
        await channel.setName(name);
      }

      if (lock !== null) {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SendMessages: !lock
        });
      }

      return interaction.reply({
        content: `Channel updated.`,
        ephemeral: true
      });

    }

  });

};
