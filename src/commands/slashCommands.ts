import { Client, SlashCommandBuilder } from "discord.js";
import getMenuSlashCommand from "./slashCommands/menu.slashCommand";

class SlashCommands {
    private client: Client;
    private commands: Array<SlashCommandBuilder | any> = [];

    public setClient(client: Client): void {
        this.client = client;
    }

    public async setSlashCommands(): Promise<void> {
        await this.setSlashCommandsByGuild(process.env.GLD_ADMIN);
        if (process.env.NODE_ENV !== "development") {
            await this.setSlashCommandsByGuild(process.env.GLD_ENIGMA);
        }
    }

    public async setSlashCommandsByGuild(guildId: string) {
        if (!this.client) return;

        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) return;

        this.commands.push(
            new SlashCommandBuilder()
                .setName("aide")
                .setDescription("Affiche la liste des commandes disponibles par le robot")
        );

        this.commands.push(new SlashCommandBuilder()
            .setName('edt')
            .setDescription('Affiche l\'emploi du temps sélectionné')
            .addStringOption(option =>
                option.setName('semaine')
                    .setDescription('Semaine concernée')
                    .setRequired(true)
                    .addChoices({
                        name: 'Semaine actuelle',
                        value: '1',
                    })
                    .addChoices({
                        name: 'Semaine prochaine',
                        value: '2',
                    })
                    .addChoices({
                        name: 'Dans deux semaines',
                        value: '3',
                    }),
            )
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('Type d\'emploi du temps')
                    .setRequired(false)
                    .addChoices({
                        name: 'Cyber',
                        value: '1',
                    })
                    .addChoices({
                        name: 'Retail',
                        value: '2',
                    }),
            )
        );

        this.commands.push(await getMenuSlashCommand());

        // this.commands.push(new SlashCommandBuilder()
        //     .setName('stats')
        //     .setDescription('Affiche les statistiques enregistrées par le robot')
        //     .addSubcommand(subcommand =>
        //         subcommand
        //             .setName('globales')
        //             .setDescription('Statistiques globales')
        //     )
        //     .addSubcommand(subcommand =>
        //         subcommand
        //             .setName('devoirs')
        //             .setDescription('Statistiques concernant uniquement les devoirs')
        //     )
        // )

        // this.commands.push(new SlashCommandBuilder()
        //     .setName('merci')
        //     .setDescription('Commande de remerciement')
        //     .addStringOption(option =>
        //         option.setName('option')
        //             .setDescription('Option de la commande')
        //             .setRequired(true)
        //             .addChoices({
        //                 name: 'Classement',
        //                 value: '1'
        //             })
        //             .addChoices({
        //                 name: 'Personnels',
        //                 value: '2'
        //             })
        //     )
        // )

        this.commands.push(
            new SlashCommandBuilder().setName("info").setDescription("Affiche diverses informations concernant le robot")
        );

        this.commands.push(
            new SlashCommandBuilder()
                .setName("wifi")
                .setDescription("Affiche diverses informations concernant la connexion wifi d'ENIGMA")
        );

        this.commands.push(
            new SlashCommandBuilder()
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
                )
        );

        if (guildId != process.env.GLD_ADMIN) {
            // PUBLIC COMMANDS
            this.commands.push(
                new SlashCommandBuilder()
                    .setName("devoirs")
                    .setDescription("Gestion des devoirs")
                    .addSubcommand((subcommand) =>
                        subcommand.setName("afficher").setDescription("Affiche les devoirs actuels")
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("ajouter")
                            .setDescription("Demande l'ajout d'un nouveau devoir")
                            .addStringOption((option) =>
                                option.setName("date").setDescription("Date au format JJ/MM/AAAA").setRequired(true)
                            )
                            .addStringOption((option) =>
                                option.setName("matiere").setDescription("Nom de la matière concernée").setRequired(true)
                            )
                            .addStringOption((option) =>
                                option
                                    .setName("description")
                                    .setDescription("Détails du devoir à effectuer")
                                    .setRequired(true)
                            )
                    )
            );
        } else {
            // PRIVATE COMMANDS
            this.commands.push(
                new SlashCommandBuilder()
                    .setName("devoirs")
                    .setDescription("Gestion des devoirs")
                    .addSubcommand((subcommand) =>
                        subcommand.setName("afficher").setDescription("Affiche les devoirs actuels")
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("ajouter")
                            .setDescription("Demande l'ajout d'un nouveau devoir")
                            .addStringOption((option) =>
                                option.setName("date").setDescription("Date au format JJ/MM/AAAA").setRequired(true)
                            )
                            .addStringOption((option) =>
                                option.setName("matiere").setDescription("Nom de la matière concernée").setRequired(true)
                            )
                            .addStringOption((option) =>
                                option
                                    .setName("description")
                                    .setDescription("Détails du devoir à effectuer")
                                    .setRequired(true)
                            )
                    )
            );

            this.commands.push(
                new SlashCommandBuilder()
                    .setName("say")
                    .setDescription("Envoie un message dans un salon choisi")
                    .addChannelOption((option) =>
                        option.setName("channel").setDescription("Salon où envoyer le message").setRequired(true)
                    )
                    .addStringOption((option) =>
                        option.setName("message").setDescription("Message à envoyer").setRequired(true)
                    )
            );
        }

        // command creation
        await Promise.all(
            this.commands.map(async (command) => {
                await guild.commands.create(command.toJSON());
            })
        );
    }
}

export default new SlashCommands();