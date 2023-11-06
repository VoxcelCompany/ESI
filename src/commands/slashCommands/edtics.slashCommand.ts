import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import Cursus from "../../utils/enum/Cursus";
import { capitalize } from "../../utils/stringManager";

class DownloadIcsSlashCommand {
    public getSlashCommand(): SlashCommandSubcommandsOnlyBuilder {
        return new SlashCommandBuilder()
            .setName("download")
            .setDescription("Téléchargement de fichiers")
            .addSubcommandGroup((option) =>
                option
                    .setName("edt")
                    .setDescription("Télécharger l'emploi du temps")
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("ics")
                            .setDescription("Télécharger l'emploi du temps au format ICS")
                            .addStringOption((option) =>
                                option
                                    .setName("cursus")
                                    .setDescription("Cursus")
                                    .setRequired(false)
                                    .addChoices({
                                        name: capitalize(Cursus.CYBER),
                                        value: "1",
                                    })
                                    .addChoices({
                                        name: capitalize(Cursus.RETAIL),
                                        value: "2",
                                    })
                            )
                    )
            );
    }
}

export default new DownloadIcsSlashCommand();
