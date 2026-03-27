module.exports = (client) => {

  const USER_EMOJIS = {
    "747868137843589160": "<a:a_beardance:1484666741685489795>",
    "722454528317849711": "<:mahii_chup_bkl:1159024330760531978>"
  };

  client.on("messageCreate", async (message) => {

    if (!message.guild) return;

    const emoji = USER_EMOJIS[message.author.id];

    if (!emoji) return; // ignore other users

    try {
      await message.react(emoji);
    } catch (err) {
      console.log("React error:", err);
    }

  });

};
