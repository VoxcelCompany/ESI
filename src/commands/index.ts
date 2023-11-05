import {CacheType, Client, Interaction, Message, ModalSubmitInteraction, TextChannel} from "discord.js";
import { ADMIN_USERS } from "../utils/constants/Admin";
import CommandType from "../utils/enum/CommandType";
import { aide } from "./aide";
import { edt } from "./edt";
import { info } from "./info";
import { say } from "./private/say";
import { wifi } from "./wifi";
import { osi } from "./osi";
import menu from "./actions/menu.action";

export default async (
    interaction: any | Interaction<CacheType> | ModalSubmitInteraction<CacheType>,
    client: Client,
    version: string,
    callDate: Date,
    uptime: Date
): Promise<void> => {
    const commandType = interaction.isCommand() ? CommandType.COMMAND : CommandType.BUTTON;
    const commandName =
        commandType == CommandType.COMMAND ? interaction.commandName.toLowerCase() : interaction.customId.toLowerCase();

    try {
        switch (true) {
            case /^aide$/.test(commandName):
                await aide({ interaction: interaction, version: version });
                return;
            case /^info$/.test(commandName):
                await info({ interaction: interaction, version: version, botUptime: uptime });
                return;
            case /^wifi$/.test(commandName):
                await wifi({ interaction: interaction, version: version });
                return;
            case /^edt$/.test(commandName):
                await edt({
                    weekNumber: interaction.options.get("semaine").value,
                    typeNumber: interaction.options.get("type")?.value,
                    interaction: interaction,
                    type: commandType,
                    client,
                });
                return;
            case /^edt[0-9]+$/.test(commandName):
                await edt({
                    weekNumber: commandName.replace("edt", ""),
                    interaction: interaction,
                    type: commandType,
                    client,
                });
                return;
            case /^osi$/.test(commandName):
                await osi({ interaction: interaction, choice: interaction.options.get("option").value });
                return;
            case /^menu$/.test(commandName):
                return await menu({
                    chosenOption: interaction.options.get('jour').value,
                    interaction: interaction,
                    commandType: commandType,
                });
            case /^menu\d{2}\/\d{2}\/\d{4}$/.test(commandName):
                return await menu({
                    chosenOption: commandName.replace('menu', ''),
                    interaction: interaction,
                    commandType: commandType,
                });
            // admin commands
            case /^say$/.test(commandName):
                await say({
                    client: client,
                    interaction: interaction,
                    channelId: interaction.options.get("channel").value,
                    message: interaction.options.get("message").value,
                    type: commandType,
                });
                return;
            default:
                await interaction?.deferUpdate();
                return;
        }
    } catch (err: any) {
        const chan = client.channels.cache.get(process.env.CHNL_ERROR);
        if (chan instanceof TextChannel)
            chan.send(
                `Error CMD[${commandName}|${commandType}] was generated by <@${interaction.user?.id}>-${interaction.user?.id}-${interaction.user?.username}<#${interaction.channel?.id}>-${interaction.channel?.id}-${interaction.channel?.name} :\n\`\`\`${err}\`\`\``
            ).catch(() => {});
        console.error(
            `Error CMD[${commandName}|${commandType}] was generated by <@${interaction.user?.id}>-${interaction.user?.id}-${interaction.user?.username}-<#${interaction.channel?.id}>-${interaction.channel?.id}-${interaction.channel?.name} :`,
            err
        );
    }
};

export const messageReceived = async (message: Message, client: Client): Promise<void> => {
    const authorId = message.author.id;

    if (ADMIN_USERS.includes(authorId)) {
        const commandName = message.content.toLowerCase();

        switch (true) {
            case /^\$say /.test(commandName):
                const params = message.content.split(" ");
                if (params.length < 3) return;
                await say({
                    client: client,
                    interaction: message,
                    type: CommandType.MESSAGE,
                    channelId: params[1],
                    message: params.slice(2).join(" "),
                });
                return;
        }
    }

    switch (true) {
        case /bien du plaisir/i.test(message.content):
            await message.channel.send("Dixit Thietty !");
            return;
    }
};
