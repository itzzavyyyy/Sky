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

    if (!isAdmin) return;    

    const embed = new EmbedBuilder()
      .setTitle("Infinity Sky Commands")
      .setColor(0x0B3D91)
      .addFields(
   {
    name: " ** <a:arrowwhite:1470901738050424844> Prefix Commands 🌌** ",
    value:
`**Prefix (<:StarExclamationMark:1482117449003438221>)**
<:WhiteArrow:1490409444150874215> !cc <name> <response> → Create custom command  
<:WhiteArrow:1490409444150874215> !ce <name> <new response> → Edit existing command  
<:WhiteArrow:1490409444150874215> !cd <name> → Delete custom command  
<:WhiteArrow:1490409444150874215> !cclist
<:WhiteArrow:1490409444150874215> !remindme <time> <text>

** <a:arrowwhite:1470901738050424844> Slash Commands (/)**  
<:WhiteArrow:1490409444150874215> /say → Make the bot say something  
<:WhiteArrow:1490409444150874215> /roleusers → Show users in a role  
<:WhiteArrow:1490409444150874215> /addrole → Give role to a user  
<:WhiteArrow:1490409444150874215> /removerole → Remove role  
<:WhiteArrow:1490409444150874215> /cleanbot → Automatically deletes bot messages in a channel  
<:WhiteArrow:1490409444150874215> /rembot → Disable auto-clean for that channel
<:WhiteArrow:1490409444150874215> /addch → Give access (user/role)  
<:WhiteArrow:1490409444150874215> /remch → Remove access  
<:WhiteArrow:1490409444150874215> /editch → Edit channel (name/lock)
<:WhiteArrow:1490409444150874215> /userinfo → Show user info
<:WhiteArrow:1490409444150874215> /react → Auto react to user  
<:WhiteArrow:1490409444150874215> /unreact → Stop auto reacting`
  },
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


  if (command === "!ce") {

  if (!isAdmin) return;

  const name = args[1];

  const newResponse = args.slice(2).join(" ");

  await client.commandsDB.updateOne(
    { name },
    { $set: { response: newResponse } }
  );

  message.channel.send(`**Command !${name} updated.**`);

}


  if (command === "!cclist") {

    if (!isAdmin) return;    

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
