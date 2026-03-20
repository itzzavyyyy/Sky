module.exports = (client) => {

  const TARGET_USER_ID = "747868137843589160";
  const EMOJI = "<a:a_beardance:1484666741685489795>";

  client.on("messageCreate", async (message) => {

    if (!message.guild) return;

    if (message.author.id !== TARGET_USER_ID) return;

    try {
      await message.react(EMOJI);
    } catch {}

  });

};
