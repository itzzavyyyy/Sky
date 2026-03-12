const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { MongoClient } = require("mongodb");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

require("./report.js")(client);

const mongo = new MongoClient(process.env.MONGO_URI);

let commands;


// DATABASE
async function startDatabase() {

  await mongo.connect();

  const db = mongo.db("botdata");

  commands = db.collection("commands");

  console.log("Connected to MongoDB");

  require("./sticky.js")(client, db);
  
}

startDatabase();


// READY EVENT
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
        option.setName("text")
          .setDescription("Message to send")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("roleusers")
      .setDescription("Show users in a role")
      .addRoleOption(option =>
        option.setName("role")
          .setDescription("Select role")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("addrole")
      .setDescription("Give role to user")
      .addUserOption(option =>
        option.setName("user")
          .setDescription("User")
          .setRequired(true)
      )
      .addRoleOption(option =>
        option.setName("role")
          .setDescription("Role")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("removerole")
      .setDescription("Remove role from user")
      .addUserOption(option =>
        option.setName("user")
          .setDescription("User")
          .setRequired(true)
      )
      .addRoleOption(option =>
        option.setName("role")
          .setDescription("Role")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription("Show user information")
      .addUserOption(option =>
        option.setName("user")
          .setDescription("Select user")
          .setRequired(false)
      )

  ];

  await client.application.commands.set(slashCommands);

});


// SLASH COMMAND HANDLER
client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;


  if (interaction.commandName === "say") {

    const text = interaction.options.getString("text");

    await interaction.reply({ content: "Message sent.", ephemeral: true });

    interaction.channel.send(text);

  }


  if (interaction.commandName === "roleusers") {

    const role = interaction.options.getRole("role");

    await interaction.guild.members.fetch();

    const members = role.members.map(m => `<@${m.id}>`);

    interaction.reply(`**Users with ${role.name} (${members.length}):**\n${members.join("\n")}`);

  }


  if (interaction.commandName === "addrole") {

    const user = interaction.options.getMember("user");
    const role = interaction.options.getRole("role");

    await user.roles.add(role);

    interaction.reply(`**${user.user.username} was given ${role}.**`);

  }


  if (interaction.commandName === "removerole") {

    const user = interaction.options.getMember("user");
    const role = interaction.options.getRole("role");

    await user.roles.remove(role);

    interaction.reply(`**${role} removed from ${user.user.username}.**`);

  }


  if (interaction.commandName === "userinfo") {

    const user = interaction.options.getUser("user") || interaction.user;

    const member = await interaction.guild.members.fetch(user.id);

    await interaction.guild.members.fetch();

    const members = interaction.guild.members.cache
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
      .map(m => m.id);

    const rank = members.indexOf(user.id) + 1;

    const roles = member.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position);

    const roleMentions = roles.map(role => role.toString()).join(" ");

    const topRole = roles.first();

    const embed = new EmbedBuilder()
      .setTitle("User Information")
      .setColor(topRole ? topRole.color : 0x2b2d31)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "Username", value: user.tag, inline: true },
        { name: "User ID", value: user.id, inline: true },
        { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>` },
        { name: "Joined Server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` },
        { name: "Server Rank", value: `#${rank}`, inline: true },
        { name: "Top Role", value: topRole ? topRole.toString() : "None", inline: true },
        { name: "Roles", value: roleMentions || "None" },
        { name: "Total Roles", value: roles.size.toString(), inline: true }
      )
      .setFooter({
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    interaction.reply({ embeds: [embed] });

  }

});


// MESSAGE COMMANDS
client.on("messageCreate", async message => {

  if (message.author.bot) return;

  if (!message.content.startsWith("!")) return;

  const args = message.content.split(" ");

  const command = args[0].toLowerCase();

  const isAdmin = message.member.permissions.has(
    PermissionsBitField.Flags.Administrator
  );


  if (command === "!ahelp") {

    const embed = new EmbedBuilder()
      .setTitle("Infinity Sky Commands")
      .setColor(0x0B3D91)
      .addFields(
        {
          name: "Admin Commands",
          value:
`!cc <name> <response>
!cd <name>`
        },
        {
          name: "User Commands",
          value:
`!cclist
!remindme <time> <text>`
        },
        {
          name: "Slash Commands",
          value:
`/say
/roleusers
/addrole
/removerole
/userinfo`
        }
      );

    message.channel.send({ embeds: [embed] });

  }


  if (command === "!cc") {

    if (!isAdmin) return;

    const name = args[1];
    const response = args.slice(2).join(" ");

    await commands.insertOne({ name, response });

    message.channel.send(`**Command !${name} created.**`);

  }


  if (command === "!cd") {

    if (!isAdmin) return;

    const name = args[1];

    await commands.deleteOne({ name });

    message.channel.send(`**Command !${name} deleted.**`);

  }


  if (command === "!cclist") {

    const list = await commands.find().toArray();

    if (list.length === 0) return message.channel.send("No commands created.");

    const names = list.map(c => `!${c.name}`).join(", ");

    message.channel.send(`**Commands:** ${names}`);

  }


  if (command === "!remindme") {

    const time = args[1];
    const text = args.slice(2).join(" ");

    let ms = 0;

    if (time.endsWith("s")) ms = parseInt(time) * 1000;
    if (time.endsWith("m")) ms = parseInt(time) * 60000;
    if (time.endsWith("h")) ms = parseInt(time) * 3600000;

    message.channel.send(`**Reminder set for ${time}.**`);

    setTimeout(() => {

      message.channel.send(`${message.author} **Reminder:** ${text}`);

    }, ms);

  }


  const name = command.replace("!", "");

  const cmd = await commands.findOne({ name });

  if (cmd) message.channel.send(cmd.response);

});

client.login(process.env.TOKEN);
