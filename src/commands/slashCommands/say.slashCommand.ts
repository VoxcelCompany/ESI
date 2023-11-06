import { SlashCommandBuilder } from "discord.js";

class SaySlashCommand {
    public getSlashCommand(): Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> {
        return new SlashCommandBuilder()
            .setName("say")
            .setDescription("Envoie un message dans un salon choisi")
            .addChannelOption((option) =>
                option.setName("channel").setDescription("Salon où envoyer le message").setRequired(true)
            )
            .addStringOption((option) =>
                option.setName("message").setDescription("Message à envoyer").setRequired(true)
            );
    }
}

export default new SaySlashCommand();
