const {
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    MessageFlags
} = require('discord.js');
const config = require('../config');
const db = require('../database/db');

/**
 * Formats the current time in a specific timezone.
 * @param {string} timezone 
 * @returns {string}
 */
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
        return 'Invalid Timezone';
    }
}

/**
 * Safely replies to an interaction, handling timeout errors and already replied states.
 */
async function safeReply(interaction, options) {
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(options);
        } else {
            await interaction.reply(options);
        }
    } catch (error) {
        if (error.code !== 10062) console.error('Error sending interaction reply:', error);
    }
}

/**
 * Safely updates an interaction, falling back to followUp if needed.
 */
async function safeUpdate(interaction, options) {
    try {
        if (!interaction.replied && !interaction.deferred) {
            await interaction.update(options);
        } else {
            await interaction.editReply(options);
        }
    } catch (error) {
        if (error.code !== 10062) console.error('Error updating interaction:', error);
    }
}

/**
 * Logic for when a user clicks "Request Help" button.
 */
async function handleRequestHelp(interaction) {
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

    const timezoneInput = new TextInputBuilder()
        .setCustomId('timezone')
        .setLabel('Timezone')
        .setPlaceholder('e.g. EST, UTC+3')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const notesInput = new TextInputBuilder()
        .setCustomId('additional_notes')
        .setLabel('Additional Notes')
        .setPlaceholder('Any extra details...')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(skinInput),
        new ActionRowBuilder().addComponents(usernameInput),
        new ActionRowBuilder().addComponents(timezoneInput),
        new ActionRowBuilder().addComponents(notesInput)
    );

    await interaction.showModal(modal).catch(e => {
        if (e.code !== 10062) console.error('Error showing modal:', e);
    });
}

/**
 * Logic for when a helper accepts a request.
 */
async function handleAcceptRequest(interaction) {
    const embed = interaction.message.embeds[0];
    if (embed.title !== 'New Help Request') return;

    await interaction.deferUpdate().catch(() => null);
    const requesterId = embed.footer.text.replace('User ID: ', '');
    const requester = await interaction.guild.members.fetch(requesterId).catch(() => null);
    const username = requester ? requester.user.username : 'unknown';

    const channelName = `helprequest-${username}`;
    const topic = `User : ${username}\nHelper : ${interaction.user.username}\nID: ${requesterId}/${interaction.user.id}`;

    const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: config.categoryId,
        topic: topic,
        permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: requesterId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: interaction.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
        ],
    });

    // Update the request in the database
    try {
        await db.run(
            'UPDATE requests SET status = $1, accepted_by = $2, accepted_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND status = $4',
            ['accepted', interaction.user.id, requesterId, 'pending']
        );
    } catch (err) {
        console.error('Failed to log request acceptance to database:', err);
    }

    const timezone = embed.fields.find(f => f.name === 'Timezone')?.value || 'Not provided';
    const timestamp = Math.floor(Date.now() / 1000);
    const helperDisplay = `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`;
    const requesterDisplay = requester ? `${requester.user.globalName || requester.user.username} (${requester.user.username})` : 'unknown';

    const welcomeEmbed = new EmbedBuilder()
        .setTitle('Help Request Accepted')
        .setColor('#FF69B4')
        .setDescription(`Welcome ${requesterDisplay}. Your request is being handled by ${helperDisplay}.`)
        .addFields(
            { name: 'Piggy Skin', value: embed.fields[0].value, inline: true },
            { name: 'Roblox Username', value: embed.fields[1].value, inline: true },
            { name: 'Timezone', value: timezone, inline: true },
            { name: 'Time for user when sent', value: formatTimeInTimezone(timezone), inline: true },
            { name: 'Notes', value: embed.fields[4].value || 'None', inline: false },
            { name: 'Status', value: 'In Progress', inline: true },
            { name: 'Accepted At', value: `<t:${timestamp}:F>`, inline: true }
        );

    await channel.send({ content: `<@${requesterId}> <@${interaction.user.id}>`, embeds: [welcomeEmbed] });

    const acceptedEmbed = EmbedBuilder.from(embed)
        .setColor('Green')
        .setTitle('Request Accepted')
        .addFields({ name: 'Accepted By', value: helperDisplay });

    const disabledButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('accept_request').setLabel('Accepted').setStyle(ButtonStyle.Success).setDisabled(true),
        new ButtonBuilder().setCustomId('deny_request').setLabel('Deny').setStyle(ButtonStyle.Danger).setDisabled(true)
    );

    await safeUpdate(interaction, { embeds: [acceptedEmbed], components: [disabledButtons] });
}

/**
 * Logic for when a helper denies a request.
 */
async function handleDenyRequest(interaction) {
    const embed = interaction.message.embeds[0];
    if (embed.title !== 'New Help Request') return;

    await interaction.deferUpdate().catch(() => null);
    const helperDisplay = `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`;
    const deniedEmbed = EmbedBuilder.from(embed)
        .setColor('Red')
        .setTitle('Request Denied')
        .addFields({ name: 'Denied By', value: helperDisplay });

    const disabledButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('accept_request').setLabel('Accept').setStyle(ButtonStyle.Success).setDisabled(true),
        new ButtonBuilder().setCustomId('deny_request').setLabel('Denied').setStyle(ButtonStyle.Danger).setDisabled(true)
    );

    // Update the request in the database
    const requesterId = embed.footer.text.replace('User ID: ', '');
    try {
        await db.run(
            'UPDATE requests SET status = $1 WHERE user_id = $2 AND status = $3',
            ['denied', requesterId, 'pending']
        );
    } catch (err) {
        console.error('Failed to log request denial to database:', err);
    }

    await safeUpdate(interaction, { embeds: [deniedEmbed], components: [disabledButtons] });
}

/**
 * Logic for when a request is submitted via modal.
 */
async function handleSubmitRequest(interaction) {
    const piggySkin = interaction.fields.getTextInputValue('piggy_skin');
    const robloxUser = interaction.fields.getTextInputValue('roblox_username');
    const notes = interaction.fields.getTextInputValue('additional_notes') || 'None';
    const timezone = interaction.fields.getTextInputValue('timezone') || 'Not provided';
    const userDisplay = `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`;

    const requestsChannel = interaction.client.channels.cache.get(config.requestsChannelId);
    if (!requestsChannel) {
        return safeReply(interaction, { content: 'Error: Requests channel not found. Please contact staff.', flags: [MessageFlags.Ephemeral] });
    }

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
            { name: 'Status', value: 'Pending Review', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `User ID: ${interaction.user.id}` });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('accept_request').setLabel('Accept').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('deny_request').setLabel('Deny').setStyle(ButtonStyle.Danger)
    );

    // Initial Request Log to Database
    try {
        await db.run(
            'INSERT INTO requests (user_id, display_name, username, piggy_skin, roblox_username, timezone, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [
                interaction.user.id,
                interaction.user.globalName || interaction.user.username,
                interaction.user.username,
                piggySkin,
                robloxUser,
                timezone,
                notes,
                'pending'
            ]
        );
    } catch (err) {
        console.error('Failed to log request submission to database:', err);
    }

    await requestsChannel.send({ embeds: [requestEmbed], components: [row] });
    await safeReply(interaction, { content: 'Request submitted successfully! Staff will review it soon.', flags: [MessageFlags.Ephemeral] });
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const startTime = Date.now();
        try {
            // Priority 1: Buttons (Fastest interaction)
            if (interaction.isButton()) {
                const { customId } = interaction;
                if (customId === 'request_help') await handleRequestHelp(interaction);
                else if (customId === 'accept_request') await handleAcceptRequest(interaction);
                else if (customId === 'deny_request') await handleDenyRequest(interaction);
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
                        return safeReply(interaction, {
                            content: 'Only the Requester or Helper can confirm closing this ticket.',
                            flags: [MessageFlags.Ephemeral]
                        });
                    }

                    await interaction.deferUpdate().catch(() => null);

                    // Update the request in the database to 'closed'
                    if (requester) {
                        try {
                            await db.run(
                                'UPDATE requests SET status = $1 WHERE user_id = $2 AND status = $3',
                                ['closed', requester, 'accepted']
                            );
                        } catch (err) {
                            console.error('Failed to log request closure to database:', err);
                        }
                    }

                    await channel.delete().catch(() => null);
                }
            }

            // Priority 2: Modals
            else if (interaction.isModalSubmit()) {
                if (interaction.customId === 'submit_request') await handleSubmitRequest(interaction);
            }

            // Priority 3: Commands
            else if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (command) await command.execute(interaction);
            }

        } catch (error) {
            console.error('Interaction Error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await safeReply(interaction, { content: 'An error occurred while processing this interaction.', flags: [MessageFlags.Ephemeral] });
            }
        } finally {
            const duration = Date.now() - startTime;
            if (duration > 2500) {
                console.warn(`[PERF] Interaction ${interaction.id} took ${duration}ms!`);
            }
        }
    },
};
