import { CacheType, Client, GuildTextBasedChannel, Message, ModalSubmitInteraction } from "discord.js";
import CommandType from "../../../utils/enum/CommandType";

interface SayParams {
    client: Client;
    interaction: ModalSubmitInteraction<CacheType> | Message<boolean>;
    channelId: string;
    message: string;
    type: CommandType;
}

export default async (params: SayParams): Promise<void> => {
    const { interaction, client, message, channelId, type } = params;

    if (type === CommandType.COMMAND) await (interaction as ModalSubmitInteraction).deferReply({ ephemeral: true });

    const channel = client.channels.cache.get(channelId) as GuildTextBasedChannel;

    if (!channel) {
        if (type === CommandType.COMMAND) {
            await (interaction as ModalSubmitInteraction).editReply({
                content: `Le salon <#${channelId}> n'existe pas.`,
            });
        } else {
            (interaction as Message).reply({
                content: `Le salon <#${channelId}> n'existe pas.`,
            });
        }
        return;
    }

    const newMessage = message.replace(/\\n/g, "\n");

    await channel.send(newMessage);

    if (type === CommandType.COMMAND) {
        await (interaction as ModalSubmitInteraction).editReply({
            content: `Message envoyé avec succès dans <#${channelId}>.`,
        });
    } else {
        (interaction as Message).reply({
            content: `Message envoyé avec succès dans <#${channelId}>.`,
        });
    }
};
