import { CacheType, Client, Interaction, ModalSubmitInteraction, TextChannel } from "discord.js";
import CommandType from "../utils/enum/CommandType";
import { aide } from "./aide";
import { edt } from "./edt";
import { info } from "./info";
import { wifi } from "./wifi";

export default async (interaction: any | Interaction<CacheType> | ModalSubmitInteraction<CacheType>, client: Client, version: string, callDate: Date, uptime: Date): Promise<any> => {
    const commandType = interaction.isCommand() ? CommandType.COMMAND : CommandType.BUTTON;
    const commandName = commandType == CommandType.COMMAND ?
        interaction.commandName.toLowerCase() : interaction.customId.toLowerCase();

    try {
        switch (true) {
            case /^aide$/.test(commandName):
                return await aide({ interaction: interaction, version: version });
            case /^info$/.test(commandName):
                return await info({ interaction: interaction, version: version, time: callDate, botUptime: uptime });
            case /^wifi$/.test(commandName):
                return await wifi({ interaction: interaction, version: version });
            case /^edt$/.test(commandName):
                return await edt({ num: interaction.options.get('semaine').value, interaction: interaction, type: commandType });
            case /^edt[0-9]+$/.test(commandName):
                return await edt({ num: commandName.replace('edt', ''), interaction: interaction, type: commandType });
            // case /devoir/.test(commandName):
            //     return await devoir({ interaction: interaction, client: client, version: version, type: commandType });
            // case /devoirs/.test(commandName):
            //     if (interaction.options._subcommand == "afficher") {
            //         return await devoir({ interaction: interaction, client: client, version: version, type: commandType });
            //     } else if (interaction.options._subcommand == "forceadd") {
            //         return await forceAddDevoir({ interaction: interaction, client: client });
            //     } else if (interaction.options._subcommand == "forcedelete") {
            //         return await forceDeleteDevoir({ interaction: interaction, client: client });
            //     } else {
            //         return await addDevoir({ interaction: interaction, client: client });
            //     }
            // case /stats/.test(commandName):
            //     if (interaction.options?._subcommand == "devoirs") {
            //         return await devstats({ interaction: interaction, version: version });
            //     }
            //     return await stats({ interaction: interaction, client: client, version: version, type: commandType });
            // case /devstats/.test(commandName):
            //     return await devstats({ interaction: interaction, version: version });
            default:
                return await interaction?.deferUpdate();
        }
    } catch (err: any) {
        const chan = client.channels.cache.get(process.env.CHNL_ERROR);
        if (chan instanceof TextChannel) chan.send(`Error CMD[${commandName}|${commandType}] was generated by <@${interaction.author?.id}>-${interaction.author?.id}-${interaction.author?.username}#${interaction.author?.discriminator}\n\`\`\`${err}\`\`\``).catch(() => {

        });
        console.error(`Error CMD[${commandName}|${commandType}] was generated by <@${interaction.author?.id}>-${interaction.author?.id}-${interaction.author?.username}#${interaction.author?.discriminator}:`, err);
    }
};