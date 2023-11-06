import { SlashCommandBuilder } from "discord.js";

class EdtSlashCommand {
    public getSlashCommand(): Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> {
        return new SlashCommandBuilder()
            .setName("edt")
            .setDescription("Affiche l'emploi du temps sélectionné")
            .addStringOption((option) =>
                option
                    .setName("semaine")
                    .setDescription("Semaine concernée")
                    .setRequired(true)
                    .addChoices({
                        name: "Semaine actuelle",
                        value: "1",
                    })
                    .addChoices({
                        name: "Semaine prochaine",
                        value: "2",
                    })
                    .addChoices({
                        name: "Dans deux semaines",
                        value: "3",
                    })
            )
            .addStringOption((option) =>
                option
                    .setName("type")
                    .setDescription("Type d'emploi du temps")
                    .setRequired(false)
                    .addChoices({
                        name: "Cyber",
                        value: "1",
                    })
                    .addChoices({
                        name: "Retail",
                        value: "2",
                    })
            );
    }
}

export default new EdtSlashCommand();
