module.exports = (client) => {

  client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "setstatus") {

      const text = interaction.options.getString("text");
      const type = interaction.options.getString("type");

      const activityTypes = {
        PLAYING: 0,
        STREAMING: 1,
        LISTENING: 2,
        WATCHING: 3,
        COOKING: 4
      };

      try {

        await client.user.setPresence({
          activities: [{
            name: text,
            type: activityTypes[type],
            url: type === "STREAMING" ? "https://twitch.tv/discord" : undefined
          }],
          status: "online"
        });

        return interaction.reply({
          content: `Status updated to **${type.toLowerCase()} ${text}**`,
          ephemeral: true
        });

      } catch (err) {

        return interaction.reply({
          content: "Failed to update status.",
          ephemeral: true
        });

      }

    }

  });

};
