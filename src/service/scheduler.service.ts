import { Client } from "discord.js";
import { Cron } from "../models/Cron";
import EnigmaService from "./enigma.service";

class SchedulerService {
    private client: Client;
    private crons: Cron[] = [
        {
            callback: () => EnigmaService.checkEdtUpdate(this.client),
            timer: 1800000,
        },
    ];

    public setClient(client: Client): this {
        this.client = client;

        this.launchCrons();

        return this;
    }

    private launchCrons(): void {
        this.crons.forEach((cron) => {
            cron.callback();

            setInterval(() => {
                cron.callback();
            }, cron.timer);
        });
    }
}

export default new SchedulerService();
