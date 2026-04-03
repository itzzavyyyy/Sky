const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = (client) => {

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
`- **Admin Only**
/say - Make the bot say something  
/roleusers - Show users in a role  
/addrole - Give role to a user  
/removerole - Remove role from a user  
/cleanbot - Add channel to auto-clean list  
/rembot - Remove channel from auto-clean list  

- **Channel Management**
/addch - Give user access to a channel  
/remch - Remove user access from a channel  
/editch - Edit channel (name/lock)

- **Utility**
/userinfo - Show user info  

- **Fun / Auto**
/react - Auto react to a user  
/unreact - Stop auto reacting  

━━━━━━━━━━━━━━━━━━━━
💡 Use slash commands ( / ) to run these!`
        }
      );

    message.channel.send({ embeds: [embed] });

  }


  if (command === "!cc") {

    if (!isAdmin) return;

    const name = args[1];

    const response = args.slice(2).join(" ");

    await client.commandsDB.insertOne({ name, response });

    message.channel.send(`**Command !${name} created.**`);

  }


  if (command === "!cd") {

    if (!isAdmin) return;

    const name = args[1];

    await client.commandsDB.deleteOne({ name });

    message.channel.send(`**Command !${name} deleted.**`);

  }


  if (command === "!cclist") {

  const list = await client.commandsDB.find().toArray();

  if (list.length === 0) {
    return message.channel.send("No commands created.");
  }

  const formatted = list.map(c => {
    let preview = c.response || "No response";

    // trim long responses (clean look)
    if (preview.length > 70) preview = preview.slice(0, 70) + "...";

    return `**!${c.name}** ${preview}`;
  });

  const embed = new EmbedBuilder()
    .setTitle("Custom Command List")
    .setColor("#87CEEB") // sky blue
    .setDescription(formatted.join("\n"))
    .setFooter({ text: `Total Commands: ${list.length}` });

  message.channel.send({ embeds: [embed] });

  }


  if (command === "!remindme") {

    const time = args[1];

    const text = args.slice(2).join(" ");

    let ms = 0;

    if (time.endsWith("s")) ms = parseInt(time) * 1000;

    if (time.endsWith("m")) ms = parseInt(time) * 60000;

    if (time.endsWith("h")) ms = parseInt(time) * 3600000;

    if (time.endsWith("d")) ms = parseInt(time) * 86400000;

    message.channel.send(`**Reminder set for ${time}.**`);

    setTimeout(() => {

      message.channel.send(`${message.author} **Reminder:** ${text}`);

    }, ms);

  }


  const name = command.replace("!", "");

  const cmd = await client.commandsDB.findOne({ name });

  if (cmd) message.channel.send(cmd.response);

});

};
