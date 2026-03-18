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
  .setName("protect")
  .setDescription("Protect a user from timeouts")
  .addUserOption(option =>
    option.setName("user").setDescription("User").setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

new SlashCommandBuilder()
  .setName("unprotect")
  .setDescription("Remove protection from a user")
  .addUserOption(option =>
    option.setName("user").setDescription("User").setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

new SlashCommandBuilder()
  .setName("protectedlist")
  .setDescription("Show protected users")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
  .setName("setstatus")
  .setDescription("Change bot status")
  .addStringOption(option =>
    option.setName("text")
      .setDescription("Status text")
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName("type")
      .setDescription("Activity type")
      .setRequired(true)
      .addChoices(
        { name: "Playing", value: "PLAYING" },
        { name: "Watching", value: "WATCHING" },
        { name: "Listening", value: "LISTENING" },
        { name: "Streaming", value: "STREAMING" }
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
  ];

  await client.application.commands.set(slashCommands);

});

};
