const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, MessageFlags } = require('discord.js');

function formatTimeInTimezone(timezone) {
    if (!timezone || timezone === 'Not provided') return 'Not provided';
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: timezone,
            hour12: false
        });
        const parts = formatter.formatToParts(now);
        const map = new Map(parts.map(p => [p.type, p.value]));
        return `${map.get('hour')}:${map.get('minute')} (${map.get('day')}/${map.get('month')}/${map.get('year')})`;
    } catch (e) {
        return 'Timezone provided is invalid';
    }
}

async function safeReply(interaction, options) {
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(options);
        } else {
            await interaction.reply(options);
        }
    } catch (error) {
        if (error.code === 10062) {
            console.error('Interaction timed out or was already acknowledged.');
        } else {
            console.error('Error sending interaction reply:', error);
        }
    }
}

async function safeUpdate(interaction, options) {
    try {
        if (!interaction.replied && !interaction.deferred) {
            await interaction.update(options);
        } else {
            await interaction.followUp(options);
        }
    } catch (error) {
        if (error.code === 10062) {
            console.error('Interaction timed out or was already acknowledged.');
        } else {
            console.error('Error updating interaction:', error);
        }
    }
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const startTime = Date.now();
        try {
            if (interaction.isButton()) {
                const { customId } = interaction;
                const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
                const CATEGORY_ID = process.env.CATEGORY_ID;

                if (customId === 'request_help') {
                    const modal = new ModalBuilder()
                        .setCustomId('submit_request')
                        .setTitle('Piggy Help Request');

                    const skinInput = new TextInputBuilder()
                        .setCustomId('piggy_skin')
                        .setLabel('Piggy Skin')
                        .setPlaceholder('Enter the piggy skin name')
                        .setStyle(TextInputStyle.Short);

                    const usernameInput = new TextInputBuilder()
                        .setCustomId('roblox_username')
                        .setLabel('Roblox Username')
                        .setPlaceholder('Your Roblox Username')
                        .setStyle(TextInputStyle.Short);

                    const notesInput = new TextInputBuilder()
                        .setCustomId('additional_notes')
                        .setLabel('Additional Notes')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false);

                    const timezoneInput = new TextInputBuilder()
                        .setCustomId('timezone')
                        .setLabel('Timezone')
                        .setPlaceholder('e.g. Asia/Riyadh, EST, UTC+3')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false);

                    const firstActionRow = new ActionRowBuilder().addComponents(skinInput);
                    const secondActionRow = new ActionRowBuilder().addComponents(usernameInput);
                    const thirdActionRow = new ActionRowBuilder().addComponents(timezoneInput);
                    const fourthActionRow = new ActionRowBuilder().addComponents(notesInput);

                    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

                    await interaction.showModal(modal).catch(e => console.error('Error showing modal:', e));
                }

                else if (customId === 'accept_request') {
                    await interaction.deferUpdate().catch(() => null);

                    const embed = interaction.message.embeds[0];
                    const requesterId = embed.footer.text.replace('User ID: ', '');
                    const requester = await interaction.guild.members.fetch(requesterId).catch(() => null);
                    const username = requester ? requester.user.username : 'unknown';

                    const channelName = `helprequest-${username}`;
                    const topic = `User : ${username}\nHelper : ${interaction.user.username}\nID: ${requesterId}/${interaction.user.id}`;

                    const channel = await interaction.guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: CATEGORY_ID,
                        topic: topic,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionsBitField.Flags.ViewChannel],
                            },
                            {
                                id: requesterId,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                            },
                            {
                                id: interaction.client.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
                            }
                        ],
                    });

                    const timezoneField = embed.fields.find(f => f.name === 'Timezone');
                    const timezone = timezoneField ? timezoneField.value : 'Not provided';
                    const timestamp = Math.floor(Date.now() / 1000);

                    const requesterDisplayName = requester ? (requester.user.globalName || requester.user.username) : 'unknown';
                    const requesterDisplay = requester ? `${requesterDisplayName} (${requester.user.username})` : 'unknown';
                    const helperDisplay = `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`;

                    const welcomeEmbed = new EmbedBuilder()
                        .setTitle('Help Request')
                        .setColor('#FF69B4')
                        .setDescription(`Welcome ${requesterDisplay}. Your request has been accepted by ${helperDisplay}.`)
                        .addFields(
                            { name: 'Piggy Skin', value: embed.fields[0].value, inline: true },
                            { name: 'Roblox Username', value: embed.fields[1].value, inline: true },
                            { name: 'Timezone', value: timezone, inline: true },
                            { name: 'Time for user when sent', value: formatTimeInTimezone(timezone), inline: true },
                            { name: 'Notes', value: embed.fields[2].value },
                            { name: 'Status', value: 'In Progress', inline: true },
                            { name: 'Accepted At', value: `<t:${timestamp}:F>`, inline: true }
                        );

                    await channel.send({ embeds: [welcomeEmbed] });
                    await channel.send({ content: `<@${requesterId}> <@${interaction.user.id}>` });

                    const acceptedEmbed = EmbedBuilder.from(embed)
                        .setColor('Green')
                        .setTitle('Request Accepted')
                        .addFields({ name: 'Accepted By', value: helperDisplay });

                    const disabledButtons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('accept_request').setLabel('Accept').setStyle(ButtonStyle.Success).setDisabled(true),
                        new ButtonBuilder().setCustomId('deny_request').setLabel('Deny').setStyle(ButtonStyle.Danger).setDisabled(true)
                    );

                    await safeUpdate(interaction, { embeds: [acceptedEmbed], components: [disabledButtons] });
                }

                else if (customId === 'deny_request') {
                    await interaction.deferUpdate().catch(() => null);

                    const embed = interaction.message.embeds[0];
                    const helperDisplay = `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`;
                    const deniedEmbed = EmbedBuilder.from(embed)
                        .setColor('Red')
                        .setTitle('Request Denied')
                        .addFields({ name: 'Denied By', value: helperDisplay });

                    const disabledButtons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('accept_request').setLabel('Accept').setStyle(ButtonStyle.Success).setDisabled(true),
                        new ButtonBuilder().setCustomId('deny_request').setLabel('Deny').setStyle(ButtonStyle.Danger).setDisabled(true)
                    );

                    await safeUpdate(interaction, { embeds: [deniedEmbed], components: [disabledButtons] });
                }

                else if (customId === 'confirm_close') {
                    const channel = interaction.channel;
                    let requester = null;
                    let helper = null;

                    if (channel.topic && channel.topic.includes('ID:')) {
                        const idLine = channel.topic.split('\n').find(line => line.startsWith('ID:'));
                        if (idLine) {
                            const ids = idLine.replace('ID: ', '').split('/');
                            requester = ids[0];
                            helper = ids[1];
                        }
                    }

                    if (interaction.user.id !== requester && interaction.user.id !== helper) {
                        return safeReply(interaction, { content: 'Only the Requester or Helper can confirm closing this ticket.', flags: [MessageFlags.Ephemeral] });
                    }

                    await interaction.deferUpdate().catch(() => null);
                    await channel.delete().catch(() => null);
                }
            }

            else if (interaction.isModalSubmit()) {
                if (interaction.customId === 'submit_request') {
                    const REQUESTS_CHANNEL_ID = process.env.REQUESTS_CHANNEL_ID;
                    const piggySkin = interaction.fields.getTextInputValue('piggy_skin');
                    const robloxUser = interaction.fields.getTextInputValue('roblox_username');
                    const notes = interaction.fields.getTextInputValue('additional_notes') || 'None';
                    const timezone = interaction.fields.getTextInputValue('timezone') || 'Not provided';
                    const timestamp = Math.floor(Date.now() / 1000);
                    const userDisplay = `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`;

                    const requestsChannel = interaction.client.channels.cache.get(REQUESTS_CHANNEL_ID);
                    if (requestsChannel) {
                        const requestEmbed = new EmbedBuilder()
                            .setTitle('New Help Request')
                            .setColor('Yellow')
                            .setDescription(`A new request has been submitted by ${userDisplay}.`)
                            .addFields(
                                { name: 'Piggy Skin', value: piggySkin, inline: true },
                                { name: 'Roblox Username', value: robloxUser, inline: true },
                                { name: 'Timezone', value: timezone, inline: true },
                                { name: 'Time for user when sent', value: formatTimeInTimezone(timezone), inline: true },
                                { name: 'Additional Notes', value: notes },
                                { name: 'Status', value: 'Pending review', inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: `User ID: ${interaction.user.id}` });

                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('accept_request')
                                .setLabel('Accept')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('deny_request')
                                .setLabel('Deny')
                                .setStyle(ButtonStyle.Danger),
                        );

                        await requestsChannel.send({ embeds: [requestEmbed], components: [row] });
                    }

                    await safeReply(interaction, { content: 'Request submitted successfully. It will be reviewed shortly.', flags: [MessageFlags.Ephemeral] });
                }
            }

            else if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }
                await command.execute(interaction);
            }

        } catch (error) {
            console.error('Interaction Error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await safeReply(interaction, { content: 'There was an error executing this interaction.', flags: [MessageFlags.Ephemeral] });
            }
        } finally {
            const duration = Date.now() - startTime;
            if (duration > 2000) {
                console.warn(`[PERF] Interaction ${interaction.id} took ${duration}ms to process!`);
            }
        }
    },
};
