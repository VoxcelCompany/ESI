import { Client } from "discord.js";
import { Cron } from "../models/Cron";
import EnigmaService from "./enigma.service";
import edtDeliveryService from "./edtDelivery.service";
import MenuService from "./menu.service";
import mailService from "./mail.service";
import SlashCommands from "../commands/slashCommands";
import MenuSlashCommand from "../commands/slashCommands/menu.slashCommand";
import { getMomentDate } from "../utils/dates";

class SchedulerService {
    private client: Client;
    private crons: Cron[] = [
        {
            callback: () => EnigmaService.checkEdtUpdate(this.client),
            timer: 1800000,
            launchOnStart: true,
        },
        {
            callback: () => edtDeliveryService.sendEdt(this.client),
            timer: 59000,
            launchOnStart: true,
        },
        {
            callback: () => MenuService.generateCrousMenus(),
            timer: 18000000,
            launchOnStart: false,
        },
        {
            callback: () => mailService.sendMailWarning(this.client),
            timer: 60000,
            launchOnStart: true,
        },
        {
            callback: async () => {
                if (MenuSlashCommand.currentDate.isBefore(getMomentDate(), 'date')) {
                    SlashCommands.updateSlashCommand('menu', await MenuSlashCommand.getSlashCommand());
                    MenuSlashCommand.currentDate = getMomentDate();
                }
            },
            timer: 60000,
            launchOnStart: false,
        },
    ];

    public setClient(client: Client): this {
        this.client = client;

        this.launchCrons();

        return this;
    }

    private launchCrons(): void {
        this.crons.forEach((cron) => {
            if (cron.launchOnStart) cron.callback();

            setInterval(() => {
                cron.callback();
            }, cron.timer);
        });
    }
}

export default new SchedulerService();
