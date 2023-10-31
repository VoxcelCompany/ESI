import { Client, TextChannel } from "discord.js";
import MailServiceData from "../models/MailServiceData";
import mailRepository from "../repository/mail.repository";
import { getMomentDate } from "../utils/dates";

class MailService {
    private data: MailServiceData = {
        date: 0,
        morning: false,
        afternoon: false,
    };

    async sendMailWarning(client: Client): Promise<void> {
        const currentDate = getMomentDate();

        const isMorning = currentDate.hour() < 12 || (currentDate.hour() == 12 && currentDate.minute() < 30);
        const isAfternoon = currentDate.hour() > 14 || (currentDate.hour() == 14 && currentDate.minute() >= 0);

        if (
            (!isMorning && !isAfternoon) ||
            (isMorning && this.data.date == currentDate.date() && this.data.morning) ||
            (isAfternoon && this.data.date == currentDate.date() && this.data.afternoon)
        )
            return;

        const lastMail = await mailRepository.getLastMailFrom("noreply@sowesign.net");
        if (!lastMail) return;

        const mailDate = getMomentDate(lastMail.receivedDateTime);

        if (
            mailDate.date() != currentDate.date() ||
            (isMorning && mailDate.hour() > 13) ||
            (isAfternoon && mailDate.hour() < 14)
        )
            return;

        this.data = {
            date: currentDate.date(),
            morning: this.data.date == currentDate.date() ? this.data.morning : isMorning,
            afternoon: this.data.date == currentDate.date() ? this.data.afternoon : isAfternoon,
        };

        const channel = client.channels.cache.get(process.env.CHNL_SIGN) as TextChannel;

        if (channel) {
            await channel.send("📧 N'oubliez pas de signer !");
        }
    }
}

export default new MailService();
