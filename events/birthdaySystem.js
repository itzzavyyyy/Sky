module.exports = (client) => {

  const BDAY_CHANNEL_ID = "1467026393010536723"; 

  // 📅 Month names
  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  // ✅ Custom validation (Feb max 29)
  function isValidDate(day, month) {
    if (month < 1 || month > 12) return false;
    if (day < 1) return false;

    const daysInMonth = {
      1: 31, 2: 29, 3: 31, 4: 30,
      5: 31, 6: 30, 7: 31, 8: 31,
      9: 30, 10: 31, 11: 30, 12: 31
    };

    return day <= daysInMonth[month];
  }

  // 🎂 SLASH COMMAND HANDLER
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {

      // 🎂 SET BIRTHDAY
      if (interaction.commandName === "setbirthday") {
        const day = interaction.options.getInteger("day");
        const month = interaction.options.getInteger("month");

        if (!isValidDate(day, month)) {
          return interaction.reply({
            content: "❌ Invalid date! Example: April has 30 days.",
            ephemeral: true
          });
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

        return interaction.reply({
          content: `🎉 Birthday saved: **${day} ${monthNames[month - 1]}**`,
          ephemeral: true
        });
      }

      // 📋 SEE BIRTHDAYS
      if (interaction.commandName === "seebday") {

        const birthdays = await client.birthdayDB.find({
          guildId: interaction.guild.id
        }).toArray();

        if (!birthdays.length) {
          return interaction.reply({
            content: "❌ No birthdays saved in this server.",
            ephemeral: true
          });
        }

        // sort by month → day
        birthdays.sort((a, b) => {
          if (a.month === b.month) return a.day - b.day;
          return a.month - b.month;
        });

        const list = birthdays.map(b =>
          `🎂 <@${b.userId}> → ${b.day} ${monthNames[b.month - 1]}`
        ).join("\n");

        const { EmbedBuilder } = require("discord.js");

        const embed = new EmbedBuilder()
          .setColor("#87CEEB") // 🌤️ sky blue
          .setTitle("🎉 Birthday List")
          .setDescription(list)
          .setFooter({ text: `${birthdays.length} birthdays saved` });

        return interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      }

    } catch (err) {
      console.error("Birthday System Error:", err);
      if (!interaction.replied) {
        interaction.reply({ content: "❌ Error occurred", ephemeral: true });
      }
    }
  });

  // 🎉 BIRTHDAY CHECK SYSTEM 
  client.once("ready", () => {

    console.log("🎂 Birthday system loaded");

    setInterval(async () => {

  const now = new Date();

  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();

  if (hours !== 14 || minutes !== 30) return;

  const todayDay = now.getUTCDate();
  const todayMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();

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

}, 1000 * 60);
  });

};
