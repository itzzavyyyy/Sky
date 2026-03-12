const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = (client, db) => {

const stickyCollection = db.collection("stickyMessages");

client.once("ready", async () => {

const stickyCommand = new SlashCommandBuilder()
.setName("sticky")
.setDescription("Create a sticky message")
.addChannelOption(option =>
option.setName("channel")
.setDescription("Channel for sticky")
.setRequired(true))
.addStringOption(option =>
option.setName("message")
.setDescription("Sticky message text")
.setRequired(true));

const unstickyCommand = new SlashCommandBuilder()
.setName("unsticky")
.setDescription("Remove sticky message")
.addChannelOption(option =>
option.setName("channel")
.setDescription("Channel")
.setRequired(true));

for (const guild of client.guilds.cache.values()) {

await guild.commands.create(stickyCommand.toJSON());
await guild.commands.create(unstickyCommand.toJSON());

}

console.log("Sticky commands registered");

});


client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

if (interaction.commandName === "sticky") {

const channel = interaction.options.getChannel("channel");
const message = interaction.options.getString("message");

await stickyCollection.updateOne(
{ channelId: channel.id },
{
$set: {
channelId: channel.id,
message: message,
lastMessageId: null
}
},
{ upsert: true }
);

return interaction.reply({
content: `📌 Sticky message set in ${channel}`,
ephemeral: true
});

}

if (interaction.commandName === "unsticky") {

const channel = interaction.options.getChannel("channel");

await stickyCollection.deleteOne({ channelId: channel.id });

return interaction.reply({
content: `❌ Sticky removed from ${channel}`,
ephemeral: true
});

}

});


client.on("messageCreate", async message => {

if (message.author.bot) return;

const data = await stickyCollection.findOne({ channelId: message.channel.id });

if (!data) return;

try {

if (data.lastMessageId) {

const oldMsg = await message.channel.messages
.fetch(data.lastMessageId)
.catch(() => null);

if (oldMsg) await oldMsg.delete();

}

const embed = new EmbedBuilder()
.setColor(0x0B3D91)
.setDescription("📌 " + data.message);

const newSticky = await message.channel.send({ embeds: [embed] });

await stickyCollection.updateOne(
{ channelId: message.channel.id },
{ $set: { lastMessageId: newSticky.id } }
);

} catch (err) {
console.log(err);
}

});

};
