const {
ContextMenuCommandBuilder,
ApplicationCommandType,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

const mongoose = require("mongoose");

const REPORT_CHANNEL_ID = "1481238594533326958";
const MOD_ROLE_ID = "1467028343705571328";
const PROTECTED_ROLE_ID = "1467028343705571328";

// Report limit schema
const reportLimitSchema = new mongoose.Schema({
userId: String,
reportCount: Number,
resetTime: Number
});

const ReportLimit = mongoose.models.ReportLimit || mongoose.model("ReportLimit", reportLimitSchema);

// Sticky schema
const stickySchema = new mongoose.Schema({
channelId: String,
message: String,
lastMessageId: String
});

const Sticky = mongoose.models.Sticky || mongoose.model("Sticky", stickySchema);

module.exports = (client) => {

client.once("ready", async () => {

const reportCommand = new ContextMenuCommandBuilder()
.setName("Report")
.setType(ApplicationCommandType.Message);

for (const guild of client.guilds.cache.values()) {

await guild.commands.create(reportCommand);

await guild.commands.create({
name: "sticky",
description: "Set a sticky message",
options: [
{
name: "channel",
description: "Channel",
type: 7,
required: true
},
{
name: "message",
description: "Sticky message",
type: 3,
required: true
}
]
});

await guild.commands.create({
name: "unsticky",
description: "Remove sticky message",
options: [
{
name: "channel",
description: "Channel",
type: 7,
required: true
}
]
});

}

console.log("Report + Sticky commands loaded");

});

client.on("interactionCreate", async interaction => {

// REPORT SYSTEM

if (interaction.isMessageContextMenuCommand()) {

if (interaction.commandName !== "Report") return;

const msg = interaction.targetMessage;

if (msg.author.id === interaction.user.id) {
return interaction.reply({
content: "You cannot report your own message.",
ephemeral: true
});
}

const now = Date.now();

let data = await ReportLimit.findOne({
userId: interaction.user.id
});

if (!data) {

data = await ReportLimit.create({
userId: interaction.user.id,
reportCount: 0,
resetTime: now + 3600000
});

}

if (now > data.resetTime) {

data.reportCount = 0;
data.resetTime = now + 3600000;

}

if (data.reportCount >= 2) {

return interaction.reply({
content: "You have reached the report limit. You can report again in 1 hour.",
ephemeral: true
});

}

data.reportCount += 1;
await data.save();

const reportChannel = client.channels.cache.get(REPORT_CHANNEL_ID);

if (!reportChannel) {
return interaction.reply({
content: "Report channel not found.",
ephemeral: true
});
}

const embed = new EmbedBuilder()
.setTitle("Message Report")
.setColor(0x0B3D91)
.addFields(
{
name: "Reporter",
value: `${interaction.user.tag}`,
inline: true
},
{
name: "Message Author",
value: `${msg.author.tag}`,
inline: true
},
{
name: "Channel",
value: `<#${msg.channel.id}>`,
inline: true
},
{
name: "Message Content",
value: msg.content || "No text content"
}
)
.setTimestamp();

const jumpButton = new ButtonBuilder()
.setLabel("Jump to Message")
.setStyle(ButtonStyle.Link)
.setURL(msg.url);

const acceptButton = new ButtonBuilder()
.setCustomId("report_accept")
.setLabel("Accept")
.setStyle(ButtonStyle.Success);

const rejectButton = new ButtonBuilder()
.setCustomId("report_reject")
.setLabel("Reject")
.setStyle(ButtonStyle.Danger);

const row1 = new ActionRowBuilder().addComponents(jumpButton);
const row2 = new ActionRowBuilder().addComponents(acceptButton, rejectButton);

await reportChannel.send({
content: `<@&${MOD_ROLE_ID}>`,
embeds: [embed],
components: [row1, row2]
});

interaction.reply({
content: "Report submitted to moderators.",
ephemeral: true
});

}

// STICKY COMMANDS

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "sticky") {

const channel = interaction.options.getChannel("channel");
const message = interaction.options.getString("message");

let data = await Sticky.findOne({
channelId: channel.id
});

if (!data) {

data = await Sticky.create({
channelId: channel.id,
message: message,
lastMessageId: null
});

} else {

data.message = message;
await data.save();

}

return interaction.reply({
content: `📌 Sticky message set in ${channel}`,
ephemeral: true
});

}

if (interaction.commandName === "unsticky") {

const channel = interaction.options.getChannel("channel");

await Sticky.deleteOne({
channelId: channel.id
});

return interaction.reply({
content: `❌ Sticky removed from ${channel}`,
ephemeral: true
});

}

}

// REPORT BUTTONS

if (interaction.isButton()) {

if (interaction.customId === "report_accept") {

await interaction.update({
content: "Report accepted by " + interaction.user.tag,
components: []
});

}

if (interaction.customId === "report_reject") {

await interaction.update({
content: "Report rejected by " + interaction.user.tag,
components: []
});

}

}

});

// STICKY MESSAGE SYSTEM

client.on("messageCreate", async message => {

if (message.author.bot) return;

const data = await Sticky.findOne({
channelId: message.channel.id
});

if (!data) return;

try {

if (data.lastMessageId) {

const oldMsg = await message.channel.messages
.fetch(data.lastMessageId)
.catch(() => null);

if (oldMsg) await oldMsg.delete();

}

const embed = new EmbedBuilder()
.setColor(0xF1C40F)
.setDescription(`📌 ${data.message}`);

const newMsg = await message.channel.send({
embeds: [embed]
});

data.lastMessageId = newMsg.id;
await data.save();

} catch (err) {
console.log(err);
}

});

// ROLE TIMEOUT PROTECTION

client.on("guildMemberUpdate", async (oldMember, newMember) => {

if (!newMember.roles.cache.has(1467028343705571328)) return;

if (!newMember.isCommunicationDisabled()) return;

try {

await newMember.timeout(null);

} catch (err) {
console.log(err);
}

});

};
