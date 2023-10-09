const { aide } = require("../commands/aide");
const { devoir, addDevoir, forceAddDevoir, forceDeleteDevoir } = require("../commands/devoir");
const { devstats } = require("../commands/devstats");
const { edt } = require("../commands/edt");
const { addEdt, sendmpEdt, chmEdt } = require("../commands/private/edt");
const { addNote } = require("../commands/private/note");
const { stats } = require("../commands/stats");
const { sendBIEMessage } = require("../commands/private/bie");
const { details } = require("../commands/details");
const { edtchm } = require("../commands/edtchm");
const { salles } = require("../commands/salles");
const { info } = require("../commands/info");
const { merci } = require("../commands/merci");
const { wifi } = require("../commands/wifi");

const interactionLaunch = async (interaction, client, version, initDate, uptime) => {
    const commandName = interaction?.isCommand() ? interaction?.commandName?.toUpperCase() : interaction?.customId?.toUpperCase();
    const commandType = interaction?.isCommand() ? "COMMAND" : "BUTTON";
    try {
        switch (commandName) {
            case 'EDT':
                return await edt({ num: interaction.options.get('semaine').value, interaction: interaction, client: client, type: commandType });
            case 'EDT1':
                return await edt({ num: '1', interaction: interaction, client: client, type: commandType });
            case 'EDT2':
                return await edt({ num: '2', interaction: interaction, client: client, type: commandType });
            case 'EDT3':
                return await edt({ num: '3', interaction: interaction, client: client, type: commandType });
            case 'DEV':
                return await devoir({ interaction: interaction, client: client, version: version, type: commandType });
            case 'DEVOIRS':
                if (interaction.options._subcommand == "afficher") {
                    return await devoir({ interaction: interaction, client: client, version: version, type: commandType });
                } else if (interaction.options._subcommand == "forceadd") {
                    return await forceAddDevoir({ interaction: interaction, client: client });
                } else if (interaction.options._subcommand == "forcedelete") {
                    return await forceDeleteDevoir({ interaction: interaction, client: client });
                } else {
                    return await addDevoir({ interaction: interaction, client: client });
                }
            case 'STATS':
                if (interaction.options?._subcommand == "devoirs") {
                    return await devstats({ interaction: interaction, version: version });
                }
                return await stats({ interaction: interaction, client: client, version: version, type: commandType });
            case 'DEVSTATS':
                return await devstats({ interaction: interaction, version: version });
            case 'AIDE':
                return await aide({ interaction: interaction, version: version });
            case 'DETAILS1':
            case 'DETAILS2':
            case 'DETAILS3':
                return await details({ interaction: interaction });
            case 'EDTCHM1':
            case 'EDTCHM3':
            case 'EDTCHM2':
                return await edtchm({ interaction: interaction, client: client });
            case 'SALLE':
                return await salles({ interaction: interaction, version: version });
            case 'INFO':
                return await info({ interaction: interaction, version: version, time: initDate, botUptime: uptime });
            case 'MERCI':
                return await merci({ interaction: interaction, version: version });
            case 'WIFI':
                return await wifi({ interaction: interaction, version: version });
            // PRIVATE
            case 'EDTADD':
                return await addEdt({ interaction: interaction, client: client });
            case 'EDTSENDMP':
                return await sendmpEdt({ interaction: interaction, client: client });
            case 'EDTCHM':
                return await chmEdt({ interaction: interaction, client: client });
            case 'NOTE':
                return await addNote({ interaction: interaction, client: client, version: version });
            case 'BIE':
                return await sendBIEMessage({ interaction: interaction, client: client });
            default:
                return await interaction?.deferUpdate();
        }
    } catch (err) {
        client.channels.cache.get('process.env.CHNL_ERROR').send(`Error CMD[${commandName}|${commandType}] was generated by <@${interaction.author?.id}>-${interaction.author?.id}-${interaction.author?.username}#${interaction.author?.discriminator}\n\`\`\`${err}\`\`\``).catch(() => { ; });
        console.error(err);
    }
    return;
}

module.exports = { interactionLaunch }