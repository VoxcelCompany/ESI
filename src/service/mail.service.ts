import { Client, TextChannel } from "discord.js";
import MailServiceData from "../models/MailServiceData";
import mailRepository from "../repository/mail.repository";
import { CURSUS } from "../utils/constants/Cursus";
import EDT_DB_DATE_FORMAT from "../utils/constants/EdtDbDateFormat";
import { getMomentDate } from "../utils/dates";
import enigmaService from "./enigma.service";

class MailService {
    private client: Client;

    private data: MailServiceData = {
        date: 0,
        morning: false,
        afternoon: false,
    };

    async sendMailWarning(client: Client): Promise<void> {
        if (!this.client) this.client = client;

        const currentDate = getMomentDate();

        const isCourseToday = await this.isCourseToday(currentDate.format(EDT_DB_DATE_FORMAT));
        if (!isCourseToday) return;

        const isMorning =
            (currentDate.hour() == 9 && currentDate.minute() >= 30) ||
            (currentDate.hour() > 9 && currentDate.hour() <= 13);
        const isAfternoon = currentDate.hour() >= 14 && currentDate.hour() <= 17;

        console.log(isMorning, isAfternoon);

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
            morning: isMorning,
            afternoon: isAfternoon,
        };

        const channel = client.channels.cache.get(process.env.CHNL_SIGN) as TextChannel;

        if (channel) {
            await channel.send("📧 N'oubliez pas de signer !");
        }
    }

    private async isCourseToday(courseDate: string): Promise<boolean> {
        let isCourseToday = false;

        for (const cursus of CURSUS) {
            const edt = await enigmaService.getLatestEdt(cursus, this.client);
            console.log(edt.datas[courseDate]);
            if (
                edt &&
                edt.datas[courseDate] &&
                (edt.datas[courseDate].morning !== false || edt.datas[courseDate].afternoon !== false)
            ) {
                isCourseToday = true;
                break;
            }
        }

        return isCourseToday;
    }
}

export default new MailService();
