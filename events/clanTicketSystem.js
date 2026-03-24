const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const CATEGORY_ID = "1486052592550285564";
const SUPPORT_ROLE_ID = "1471182651397247084";

module.exports = (client) => {

  const openTickets = new Set();

  client.on("interactionCreate", async (interaction) => {

    try {

      // ================= COMMANDS =================
      if (interaction.isChatInputCommand()) {

        // PANEL
        if (interaction.commandName === "ticket") {

          const embed = new EmbedBuilder()
            .setTitle("📩 Apply to join a clan")
            .setDescription(
`If you are looking to join one of the clans, create a ticket below.

Click the button to start your application.`
            )
            .setColor(0x000000)
            .setImage("https://i.imgur.com/yourBanner.png"); // 🔥 PUT REAL IMAGE

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("apply_clan")
              .setLabel("Apply")
              .setStyle(ButtonStyle.Primary)
          );

          await interaction.channel.send({ embeds: [embed], components: [row] });
          return interaction.reply({ content: "Sent.", ephemeral: true });
        }

        // ADD CLAN
        if (interaction.commandName === "addclan") {

          const name = interaction.options.getString("name");
          const description = interaction.options.getString("description");
          const details = interaction.options.getString("details");
          const role = interaction.options.getRole("leader_role");
          const link = interaction.options.getString("link");

          await client.clansDB.updateOne(
            { name },
            {
              $set: {
                name,
                description,
                details,
                leaderRoleId: role.id,
                link
              }
            },
            { upsert: true }
          );

          return interaction.reply({ content: `Clan ${name} added.`, ephemeral: true });
        }

        // REMOVE CLAN
        if (interaction.commandName === "removeclan") {

          const name = interaction.options.getString("name");

          await client.clansDB.deleteOne({ name });

          return interaction.reply({ content: `Clan ${name} removed.`, ephemeral: true });
        }
      }

      // ================= BUTTON → MODAL =================
      if (interaction.isButton()) {

        if (interaction.customId === "apply_clan") {

          const modal = new ModalBuilder()
            .setCustomId("clan_modal")
            .setTitle("Clan Application");

          const tag = new TextInputBuilder()
            .setCustomId("tags")
            .setLabel("Player Tag(s)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const type = new TextInputBuilder()
            .setCustomId("type")
            .setLabel("Clan Type")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(tag),
            new ActionRowBuilder().addComponents(type)
          );

          return interaction.showModal(modal);
        }

        // CONFIRM
        if (interaction.customId.startsWith("confirm_")) {

          const clanName = interaction.customId.replace("confirm_", "");
          const clan = await client.clansDB.findOne({ name: clanName });

          await interaction.channel.permissionOverwrites.edit(clan.leaderRoleId, {
            ViewChannel: true
          });

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("support")
              .setLabel("Support")
              .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
              .setCustomId("delete")
              .setLabel("Delete")
              .setStyle(ButtonStyle.Danger)
          );

          await interaction.channel.send({
            content: `<@&${clan.leaderRoleId}>`,
            components: [row]
          });

          return interaction.update({ content: "Clan selected.", components: [] });
        }

        // SUPPORT
        if (interaction.customId === "support") {
          return interaction.reply({
            content: `🛠️ Support requested by ${interaction.user}\n<@&${SUPPORT_ROLE_ID}>`
          });
        }

        // DELETE
        if (interaction.customId === "delete") {

          if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID)) {
            return interaction.reply({ content: "Only support staff can delete.", ephemeral: true });
          }

          await interaction.reply("Deleting...");

          setTimeout(() => {
            interaction.channel.delete().catch(() => {});
          }, 2000);
        }
      }

      // ================= MODAL =================
      if (interaction.isModalSubmit()) {

        if (interaction.customId === "clan_modal") {

          if (openTickets.has(interaction.user.id)) {
            return interaction.reply({ content: "You already have a ticket.", ephemeral: true });
          }

          openTickets.add(interaction.user.id);

          const tags = interaction.fields.getTextInputValue("tags");
          const type = interaction.fields.getTextInputValue("type");

          // ✅ reply first (fix error)
          await interaction.reply({ content: "Creating ticket...", ephemeral: true });

          const channel = await interaction.guild.channels.create({
            name: `clan-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
              },
              {
                id: interaction.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel]
              },
              {
                id: SUPPORT_ROLE_ID,
                allow: [PermissionsBitField.Flags.ViewChannel]
              }
            ]
          });

          const embed = new EmbedBuilder()
            .setTitle("Clan Application")
            .setColor(0x000000)
            .addFields(
              { name: "User", value: `${interaction.user}`, inline: true },
              { name: "Tags", value: tags, inline: true },
              { name: "Type", value: type, inline: true }
            );

          const clans = await client.clansDB.find().toArray();

          const menu = new StringSelectMenuBuilder()
            .setCustomId("select_clan")
            .setPlaceholder("Select a clan")
            .addOptions(
              clans.length
                ? clans.map(c => ({
                    label: c.name,
                    description: c.description,
                    value: c.name
                  }))
                : [{ label: "No clans added", value: "none" }]
            );

          await channel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(menu)]
          });
        }
      }

      // ================= SELECT CLAN =================
      if (interaction.isStringSelectMenu()) {

        if (interaction.customId === "select_clan") {

          const clan = await client.clansDB.findOne({ name: interaction.values[0] });

          if (!clan) {
            return interaction.reply({ content: "Clan not found.", ephemeral: true });
          }

          const embed = new EmbedBuilder()
            .setTitle(clan.link ? `[${clan.name}](${clan.link})` : clan.name)
            .setDescription(clan.details)
            .setColor(0x000000);

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`confirm_${clan.name}`)
              .setLabel("Confirm")
              .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
              .setCustomId("back")
              .setLabel("Back")
              .setStyle(ButtonStyle.Secondary)
          );

          return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
      }

    } catch (err) {
      console.error(err);
    }

  });

};
