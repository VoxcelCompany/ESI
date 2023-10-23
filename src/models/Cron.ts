import { Client } from "discord.js";

export interface Cron {
    callback: (client: Client) => void;
    timer: number;
}
