const {
ContextMenuCommandBuilder,
ApplicationCommandType,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

const ReportLimit = require("./reportLimitSchema");

const REPORT_CHANNEL_ID = "1481238594533326958";
const MOD_ROLE_ID = "1467028343705571328";

module.exports = (client) => {

client.once("clientReady", async () => {

const command = new ContextMenuCommandBuilder()
.setName("Report")
.setType(ApplicationCommandType.Message);

for (const guild of client.guilds.cache.values()) {
await guild.commands.create(command);
}

console.log("Report command loaded");

});

client.on("interactionCreate", async interaction => {

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

};
