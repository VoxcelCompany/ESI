export interface Cron {
    callback: () => void;
    timer: number;
    launchOnStart: boolean;
}
