import { Client } from "discord.js";

export interface Cron {
    callback: () => void;
    timer: number;
}
