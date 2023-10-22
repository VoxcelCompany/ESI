import { Client } from "discord.js";
import enigmaService from "./enigma.service";

class SchedulerService {
    private client: Client;

    public setClient(client: Client): this {
        this.client = client;

        this.launchHourlyCrons();
        this.launchMinutelyCrons();

        return this;
    }

    private launchHourlyCrons(): void {
        this.launchHourlyFunctions();
        setInterval(() => {
            this.launchHourlyFunctions();
        }, 3600000);
    }

    private launchMinutelyCrons(): void {
        this.launchMinutelyFunctions();
        setInterval(() => {
            this.launchMinutelyFunctions();
        }, 60000);
    }

    private launchHourlyFunctions(): void {
        if (!this.client) return;

        enigmaService.checkEdtUpdate(this.client);
    }

    private launchMinutelyFunctions(): void {
        if (!this.client) return;

        // TODO check date and send edt on sunday at 7pm
    }
}

export default new SchedulerService();
