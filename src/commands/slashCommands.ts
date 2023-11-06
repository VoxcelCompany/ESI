import { ApplicationCommandData, Client, SlashCommandBuilder } from "discord.js";
import AideSlashCommand from "./slashCommands/aide.slashCommand";
import EdtSlashCommand from "./slashCommands/edt.slashCommand";
import InfoSlashCommand from "./slashCommands/info.slashCommand";
import MenuSlashCommand from "./slashCommands/menu.slashCommand";
import OsiSlashCommand from "./slashCommands/osi.slashCommand";
import SaySlashCommand from "./slashCommands/say.slashCommand";
import WifiSlashCommand from "./slashCommands/wifi.slashCommand";

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
            })
        );
    }

    public async updateSlashCommand(
        commandName: string,
        newSlashCommand: Partial<ApplicationCommandData>
    ): Promise<void> {
        await this.updateSlashCommandsByGuild(commandName, process.env.GLD_ADMIN, newSlashCommand);
        if (process.env.NODE_ENV !== "development") {
            await this.updateSlashCommandsByGuild(commandName, process.env.GLD_ENIGMA, newSlashCommand);
        }
    }

    private async updateSlashCommandsByGuild(
        commandName: string,
        guildId: string,
        newSlashCommand: Partial<ApplicationCommandData>
    ): Promise<void> {
        const commands = await this.client.guilds.cache.get(guildId).commands.fetch();
        const command = commands.find((command) => command.name === commandName);

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
        const command = commands.find((command) => command.name === commandName);

        if (command) {
            await command.delete();
        }
    }

    private async getCommands(guildId: string): Promise<Array<SlashCommandBuilder | any>> {
        const commands: Array<SlashCommandBuilder | any> = [];

        // PUBLIC COMMANDS

        commands.push(await MenuSlashCommand.getSlashCommand());

        commands.push(AideSlashCommand.getSlashCommand());
        commands.push(EdtSlashCommand.getSlashCommand());
        commands.push(InfoSlashCommand.getSlashCommand());
        commands.push(WifiSlashCommand.getSlashCommand());
        commands.push(OsiSlashCommand.getSlashCommand());

        if (guildId != process.env.GLD_ADMIN) return commands;

        // PRIVATE COMMANDS

        commands.push(SaySlashCommand.getSlashCommand());

        return commands;
    }
}

export default new SlashCommands();
