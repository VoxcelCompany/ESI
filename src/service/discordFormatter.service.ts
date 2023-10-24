import { APIEmbedField } from "discord.js";
import { EdtChanges } from "../models/EdtChanges";
import { EdtDataCmd } from "../models/EdtDataCmd";
import { MONTHS, WEEK_DAYS } from "../utils/constants/Dates";

class DiscordFormatterService {
    public formatUpdateEdtFields(edtChanges: EdtChanges): APIEmbedField[] {
        const fields: APIEmbedField[] = [];

        const orderedEdtChangesByDate = Object.keys(edtChanges).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);

            return dateA.getTime() - dateB.getTime();
        });

        for (const [index, date] of orderedEdtChangesByDate.entries()) {
            if (index > 24) break;

            const newMC = edtChanges[date].newMorning;
            const newAC = edtChanges[date].newAfternoon;

            const oldMC = edtChanges[date].oldMorning;
            const oldAC = edtChanges[date].oldAfternoon;

            const dateMoment = new Date(date);
            const dateDay = WEEK_DAYS[dateMoment.getDay() - 1];
            const fieldTitle = `${dateDay} ${dateMoment.getDate()} ${
                MONTHS[dateMoment.getMonth()]
            } ${dateMoment.getFullYear()}`;

            if (!newMC && !newAC) continue;

            let fieldMessage = "";
            if (newMC) {
                fieldMessage += `Matin : *${oldMC}* >> **${newMC}**`;
            }
            if (newAC) {
                if (newMC) fieldMessage += "\n";
                fieldMessage += `Après-midi : *${oldAC}* >> **${newAC}**`;
            }

            const field: APIEmbedField = {
                name: fieldTitle,
                value: fieldMessage,
                inline: false,
            };

            fields.push(field);
        }

        return fields;
    }

    public formatEdtCommandFields(edtDatas: EdtDataCmd[]): {
        name: string;
        value: string;
    }[] {
        const messageFields = edtDatas.map((e) => {
            const field = {
                name: `${e.day}`,
                value: "",
            };

            if (e.morningcourse === false && e.afternooncourse === false) {
                // if no courses
                field.value = "*Entreprise*";
            } else if (!!e.morningcourse && !!e.afternooncourse) {
                // if courses morning and afternoon
                const morningCourse = e.morningcourse.toLowerCase().replace(/ /g, "");
                const afternoonCourse = e.afternooncourse.toLowerCase().replace(/ /g, "");

                if (morningCourse.startsWith(afternoonCourse) || afternoonCourse.startsWith(morningCourse)) {
                    // if same course
                    field.value = `**${e.morningcourse}**`;

                    if (!e.morningteacher && !e.afternoonteacher) return field;

                    if (e.morningteacher == e.afternoonteacher) {
                        field.value += `\n🧑‍🏫 *${e.morningteacher}*`;
                    } else {
                        field.value += `\n🧑‍🏫 *${e.morningteacher} / ${e.afternoonteacher}*`;
                    }
                } else {
                    // if different courses
                    field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**`;

                    if (!e.morningteacher && !e.afternoonteacher) return field;

                    if (e.morningteacher == e.afternoonteacher) {
                        field.value += `\n🧑‍🏫 *${e.morningteacher}*`;
                    } else if (!!e.morningteacher && !!e.afternoonteacher) {
                        field.value += `\n🧑‍🏫 *${e.morningteacher} / ${e.afternoonteacher}*`;
                    } else if (!!e.morningteacher) {
                        field.value += `\n🧑‍🏫 *${e.morningteacher} (matin)*`;
                    } else if (!!e.afternoonteacher) {
                        field.value += `\n🧑‍🏫 *${e.afternoonteacher} (après-midi)*`;
                    }
                }
            } else if (!!e.morningcourse) {
                // if only morning course
                field.value = `Matin : **${e.morningcourse}**`;

                if (!e.morningteacher) return field;

                field.value += `\n🧑‍🏫 *${e.morningteacher}*`;
            } else {
                // if only afternoon course
                field.value = `Après-midi : **${e.afternooncourse}**`;

                if (!e.afternoonteacher) return field;

                field.value += `\n🧑‍🏫 *${e.afternoonteacher}*`;
            }

            return field;
        });

        return messageFields;
    }
}

export default new DiscordFormatterService();
