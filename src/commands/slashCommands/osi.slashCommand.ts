import { SlashCommandBuilder } from "discord.js";

class OsiSlashCommand {
    public getSlashCommand(): Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> {
        return new SlashCommandBuilder()
            .setName("osi")
            .setDescription("Affiche diverses informations concernant le réseau OSI")
            .addStringOption((option) =>
                option
                    .setName("option")
                    .setDescription("Option de la commande")
                    .setRequired(true)
                    .addChoices({
                        name: "Mémo",
                        value: "1",
                    })
                    .addChoices({
                        name: "Image",
                        value: "2",
                    })
            );
    }
}

export default new OsiSlashCommand();
