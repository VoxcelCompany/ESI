import { Client, SlashCommandBuilder } from 'discord.js';

export const setSlashCommands = async (guildId: string, client: Client) => {
    const guild = client.guilds.cache.get(guildId);

    if (!guild) return;

    const commandsToCreate: Array<SlashCommandBuilder | any> = [];

    commandsToCreate.push(new SlashCommandBuilder()
        .setName('aide')
        .setDescription('Affiche la liste des commandes disponibles par le robot'),
    );

    commandsToCreate.push(new SlashCommandBuilder()
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
        ),
    );

    // commandsToCreate.push(new SlashCommandBuilder()
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

    // commandsToCreate.push(new SlashCommandBuilder()
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

    commandsToCreate.push(new SlashCommandBuilder()
        .setName('info')
        .setDescription('Affiche diverses informations concernant le robot'),
    );

    commandsToCreate.push(new SlashCommandBuilder()
        .setName('wifi')
        .setDescription('Affiche diverses informations concernant la connexion wifi d\'Enigma'),
    );

    if (guildId != process.env.GLD_ADMIN) { // PUBLIC COMMANDS
        commandsToCreate.push(new SlashCommandBuilder()
            .setName('devoirs')
            .setDescription('Gestion des devoirs')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('afficher')
                    .setDescription('Affiche les devoirs actuels'),
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('ajouter')
                    .setDescription('Demande l\'ajout d\'un nouveau devoir')
                    .addStringOption(option =>
                        option.setName('date')
                            .setDescription('Date au format JJ/MM/AAAA')
                            .setRequired(true),
                    )
                    .addStringOption(option =>
                        option.setName('matiere')
                            .setDescription('Nom de la matière concernée')
                            .setRequired(true),
                    )
                    .addStringOption(option =>
                        option.setName('description')
                            .setDescription('Détails du devoir à effectuer')
                            .setRequired(true),
                    ),
            ),
        );
    } else { // PRIVATE COMMANDS
        commandsToCreate.push(new SlashCommandBuilder()
            .setName('devoirs')
            .setDescription('Gestion des devoirs')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('afficher')
                    .setDescription('Affiche les devoirs actuels'),
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('ajouter')
                    .setDescription('Demande l\'ajout d\'un nouveau devoir')
                    .addStringOption(option =>
                        option.setName('date')
                            .setDescription('Date au format JJ/MM/AAAA')
                            .setRequired(true),
                    )
                    .addStringOption(option =>
                        option.setName('matiere')
                            .setDescription('Nom de la matière concernée')
                            .setRequired(true),
                    )
                    .addStringOption(option =>
                        option.setName('description')
                            .setDescription('Détails du devoir à effectuer')
                            .setRequired(true),
                    ),
            ),
        );

        commandsToCreate.push(new SlashCommandBuilder()
            .setName('esi')
            .setDescription('Affichage du message de bienvenue'),
        );
    }

    // command creation
    await Promise.all(commandsToCreate.map(async (command) => {
        await guild.commands.create(command.toJSON());
    }));
};