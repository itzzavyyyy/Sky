module.exports = (client) => {

  // 🔹 CACHE
  const reactMap = new Map();

  // 🔹 LOAD FROM DB ON START
  client.once("clientReady", async () => {

    const data = await client.reactDB.find().toArray();

    for (const entry of data) {
      reactMap.set(entry.userId, entry.emoji);
    }

    console.log("Auto React system loaded.");

  });


  // 🔹 COMMANDS
  client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    // ADD REACT
    if (interaction.commandName === "react") {

      const user = interaction.options.getUser("user");
      const emoji = interaction.options.getString("emoji");

      await client.reactDB.updateOne(
        { userId: user.id },
        { $set: { userId: user.id, emoji } },
        { upsert: true }
      );

      reactMap.set(user.id, emoji);

      return interaction.reply({
        content: `Now reacting to ${user.tag} with ${emoji}`,
        ephemeral: true
      });

    }

    // REMOVE REACT
    if (interaction.commandName === "unreact") {

      const user = interaction.options.getUser("user");

      await client.reactDB.deleteOne({ userId: user.id });

      reactMap.delete(user.id);

      return interaction.reply({
        content: `Stopped reacting to ${user.tag}`,
        ephemeral: true
      });

    }

  });


  // 🔹 MESSAGE LISTENER
  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    const emoji = reactMap.get(message.author.id);

    if (!emoji) return;

    try {
      await message.react(emoji);
    } catch {}

  });

};
