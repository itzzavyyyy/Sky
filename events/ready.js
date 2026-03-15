const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {

client.once("clientReady", async () => {

  console.log("Infinity Sky is online!");

  client.user.setPresence({
    activities: [{ name: "I'm watching you!!", type: 3 }],
    status: "online"
  });

  const slashCommands = [

    new SlashCommandBuilder()
      .setName("say")
      .setDescription("Make the bot say something")
      .addStringOption(option =>
        option.setName("text").setDescription("Message").setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("roleusers")
      .setDescription("Show users in a role")
      .addRoleOption(option =>
        option.setName("role").setDescription("Select role").setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("addrole")
      .setDescription("Give role to user")
      .addUserOption(option =>
        option.setName("user").setDescription("User").setRequired(true)
      )
      .addRoleOption(option =>
        option.setName("role").setDescription("Role").setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("removerole")
      .setDescription("Remove role from user")
      .addUserOption(option =>
        option.setName("user").setDescription("User").setRequired(true)
      )
      .addRoleOption(option =>
        option.setName("role").setDescription("Role").setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription("Show user information")
      .addUserOption(option =>
        option.setName("user").setDescription("Select user").setRequired(false)
      ),

    new SlashCommandBuilder()
      .setName("grantperm")
      .setDescription("Allow user to use /tempperm")
      .addUserOption(option =>
        option.setName("user").setDescription("User").setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("tempperm")
      .setDescription("Temporarily become moderator for 15 minutes")

  ];

  await client.application.commands.set(slashCommands);

});

};
