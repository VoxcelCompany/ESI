import { Client, TextChannel, ThreadAutoArchiveDuration } from "discord.js";
import { Moment } from "moment";
import { CURSUS } from "../utils/constants/Cursus";
import { MONTHS, WEEK_DAYS } from "../utils/constants/Dates";
import { getMomentDate } from "../utils/dates";
import Cursus from "../utils/enum/Cursus";
import discordFormatterService from "./discordFormatter.service";
import edtService from "./edt.service";

class EdtDeliveryService {
    lastDateSent: Moment;

    async sendEdt(client: Client) {
        const currentDate = getMomentDate();

        if (currentDate.day() !== 0 && currentDate.hours() !== 7 && currentDate.minutes() !== 1) return;

        if (this.lastDateSent) {
            const isAlreadySent = this.lastDateSent
                .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                .isSame(currentDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));

            if (isAlreadySent) return;
        }

        await Promise.all(
            CURSUS.map(async (cursus) => {
                const weekNumber = 1;
                const edtDatas = await edtService.getEdtDatas(weekNumber, cursus, client);
                const messageFields = discordFormatterService.formatEdtCommandFields(edtDatas);

                const messageContent = edtService.getEdtMessageContent(messageFields, +weekNumber, cursus, false);

                let channelId: string;
                switch (cursus) {
                    case Cursus.CYBER:
                        channelId = process.env.CHNL_CYBER;
                        break;
                    case Cursus.RETAIL:
                        channelId = process.env.CHNL_RETAIL;
                        break;
                    default:
                        throw new Error("Cursus not found");
                }

                const channel = client.channels.cache.get(channelId) as TextChannel;

                if (channel) {
                    const message = await channel.send(messageContent);

                    message.react(process.env.EMOJI_MERCI);

                    const displayDate = `${WEEK_DAYS[0]} ${currentDate.date()} ${
                        MONTHS[currentDate.month()]
                    } ${currentDate.year()}`;

                    message.startThread({
                        name: `🗓️ EDT - ${displayDate}`,
                        autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                    });
                }
            })
        );

        this.lastDateSent = currentDate.clone();
    }
}

export default new EdtDeliveryService();
