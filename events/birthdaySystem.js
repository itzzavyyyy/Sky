module.exports = (client) => {

  const BDAY_CHANNEL_ID = "1467026393010536723"; 
  // 🎂 SLASH COMMAND HANDLER (INSIDE THIS FILE)
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "setbirthday") return;

    try {
      const day = interaction.options.getInteger("day");
      const month = interaction.options.getInteger("month");

      if (day < 1 || day > 31 || month < 1 || month > 12) {
        return interaction.reply({ content: "❌ Invalid date!", ephemeral: true });
      }

      await client.birthdayDB.updateOne(
        {
          userId: interaction.user.id,
          guildId: interaction.guild.id
        },
        {
          $set: {
            day,
            month,
            lastWishedYear: null
          }
        },
        { upsert: true }
      );

      interaction.reply(`🎉 Birthday saved: ${day}/${month}`);

    } catch (err) {
      console.error("Birthday CMD Error:", err);
      if (!interaction.replied) {
        interaction.reply({ content: "❌ Error saving birthday", ephemeral: true });
      }
    }
  });

  // 🎉 BIRTHDAY CHECK SYSTEM
  client.once("ready", () => {

    console.log("🎂 Birthday system loaded");

    setInterval(async () => {
      const now = new Date();
      const todayDay = now.getDate();
      const todayMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      try {
        const birthdays = await client.birthdayDB.find({
          day: todayDay,
          month: todayMonth
        }).toArray();

        for (const bday of birthdays) {

          if (bday.lastWishedYear === currentYear) continue;

          const guild = client.guilds.cache.get(bday.guildId);
          if (!guild) continue;

          const channel = guild.channels.cache.get(BDAY_CHANNEL_ID);
          if (!channel) continue;

          await channel.send(`🎉 Happy Birthday <@${bday.userId}>! 🥳`);

          await client.birthdayDB.updateOne(
            { _id: bday._id },
            { $set: { lastWishedYear: currentYear } }
          );
        }

      } catch (err) {
        console.error("Birthday System Error:", err);
      }

    }, 1000 * 60 * 60); // every 1 hour

  });

};
