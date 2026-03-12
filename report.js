const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (client) => {

client.once("clientReady", async () => {

const commands = [
new ContextMenuCommandBuilder()
.setName("Report")
.setType(ApplicationCommandType.Message)
];

await client.application.commands.create(commands[0]);

});

client.on("interactionCreate", async interaction => {

if (!interaction.isMessageContextMenuCommand()) return;
if (interaction.commandName !== "Report") return;

const reportedMessage = interaction.targetMessage;

const reportChannelId = "1481238594533326958";
const channel = client.channels.cache.get(reportChannelId);

if (!channel) {
return interaction.reply({ content: "Report channel not found.", ephemeral: true });
}

const embed = new EmbedBuilder()
.setTitle("Message Reported")
.setColor(0x0B3D91)
.addFields(
{ name: "Reporter", value: `${interaction.user.tag}`, inline: true },
{ name: "Message Author", value: `${reportedMessage.author.tag}`, inline: true },
{ name: "Channel", value: `${reportedMessage.channel}`, inline: true },
{ name: "Message", value: reportedMessage.content || "No text (maybe image)", inline: false }
)
.setTimestamp();

const button = new ButtonBuilder()
.setLabel("Jump to Message")
.setStyle(ButtonStyle.Link)
.setURL(reportedMessage.url);

const row = new ActionRowBuilder().addComponents(button);

channel.send({
embeds: [embed],
components: [row]
});

interaction.reply({
content: "**Report submitted to moderators.**",
ephemeral: true
});

});

};
