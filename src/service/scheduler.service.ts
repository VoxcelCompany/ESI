import { Client } from "discord.js";
import { Cron } from "../models/Cron";
import enigmaService from "./enigma.service";

class SchedulerService {
    private client: Client;
    private crons: Cron[] = [
        {
            callback: enigmaService.checkEdtUpdate,
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
            cron.callback(this.client);

            setInterval(() => {
                cron.callback(this.client);
            }, cron.timer);
        });
    }
}

export default new SchedulerService();
