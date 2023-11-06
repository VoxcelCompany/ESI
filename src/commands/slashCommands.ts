import { ApplicationCommandData, Client, SlashCommandBuilder } from "discord.js";
import EdtIcsSlashCommand from "./slashCommands/edtIcs.slashCommand";
import MenuSlashCommand from "./slashCommands/menu.slashCommand";

class SlashCommands {
    private client: Client;

    public setClient(client: Client): void {
        this.client = client;
    }

    public async setSlashCommands(): Promise<void> {
        await this.setSlashCommandsByGuild(process.env.GLD_ADMIN);
        if (process.env.NODE_ENV !== "development") {
            await this.setSlashCommandsByGuild(process.env.GLD_ENIGMA);
        }
    }

    public async setSlashCommandsByGuild(guildId: string): Promise<void> {
        if (!this.client) return;

        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) return;

        const commands: Array<SlashCommandBuilder | any> = await this.getCommands(guildId);

        // command creation
        await Promise.all(
            commands.map(async (command) => {
                await guild.commands.create(command.toJSON());
            }),
        );
    }

    public async updateSlashCommand(commandName: string, newSlashCommand: Partial<ApplicationCommandData>): Promise<void> {
        await this.updateSlashCommandsByGuild(commandName, process.env.GLD_ADMIN, newSlashCommand);
        if (process.env.NODE_ENV !== "development") {
            await this.updateSlashCommandsByGuild(commandName, process.env.GLD_ENIGMA, newSlashCommand);
        }
    }

    private async updateSlashCommandsByGuild(commandName: string, guildId: string, newSlashCommand: Partial<ApplicationCommandData>): Promise<void> {
        const commands = await this.client.guilds.cache.get(guildId).commands.fetch();
        const command = commands.find(command => command.name === commandName);

        if (command) {
            await command.edit(newSlashCommand);
        }
    }

    public async deleteSlashCommand(commandName: string): Promise<void> {
        await this.deleteSlashCommandsByGuild(commandName, process.env.GLD_ADMIN);
        if (process.env.NODE_ENV !== "development") {
            await this.deleteSlashCommandsByGuild(commandName, process.env.GLD_ENIGMA);
        }
    }

    private async deleteSlashCommandsByGuild(commandName: string, guildId: string): Promise<void> {
        const commands = await this.client.guilds.cache.get(guildId).commands.fetch();
        const command = commands.find(command => command.name === commandName);

        if (command) {
            await command.delete();
        }
    }

    private async getCommands(guildId: string): Promise<Array<SlashCommandBuilder | any>> {
        const commands: Array<SlashCommandBuilder | any> = [];

        commands.push(
            new SlashCommandBuilder()
                .setName("aide")
                .setDescription("Affiche la liste des commandes disponibles par le robot"),
        );

        commands.push(new SlashCommandBuilder()
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
            ),
        );

        commands.push(await MenuSlashCommand.getSlashCommand());

        commands.push(EdtIcsSlashCommand.getSlashCommand());

        // commands.push(new SlashCommandBuilder()
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

        // commands.push(new SlashCommandBuilder()
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

        commands.push(
            new SlashCommandBuilder().setName("info").setDescription("Affiche diverses informations concernant le robot"),
        );

        commands.push(
            new SlashCommandBuilder()
                .setName("wifi")
                .setDescription("Affiche diverses informations concernant la connexion wifi d'ENIGMA"),
        );

        commands.push(
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
                        }),
                ),
        );

        if (guildId != process.env.GLD_ADMIN) return commands;

        // PRIVATE COMMANDS

        commands.push(
            new SlashCommandBuilder()
                .setName("say")
                .setDescription("Envoie un message dans un salon choisi")
                .addChannelOption((option) =>
                    option.setName("channel").setDescription("Salon où envoyer le message").setRequired(true),
                )
                .addStringOption((option) =>
                    option.setName("message").setDescription("Message à envoyer").setRequired(true),
                ),
        );

        return commands;
    }
}

export default new SlashCommands();