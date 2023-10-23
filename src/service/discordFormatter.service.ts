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
                    if (!e.morningteacher && !e.afternoonteacher) {
                        field.value = `**${e.morningcourse}**`;
                    } else if (e.morningteacher == e.afternoonteacher) {
                        field.value = `**${e.morningcourse}**\n🧑‍🏫 *${e.morningteacher}*`;
                    } else {
                        field.value = `**${e.morningcourse}**\n🧑‍🏫 *${e.morningteacher} / ${e.afternoonteacher}*`;
                    }
                } else {
                    // if different courses
                    if (!e.morningteacher && !e.afternoonteacher) {
                        field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**`;
                    } else if (e.morningteacher == e.afternoonteacher) {
                        field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.morningteacher}*`;
                    } else if (!!e.morningteacher && !!e.afternoonteacher) {
                        field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.morningteacher} / ${e.afternoonteacher}*`;
                    } else if (!!e.morningteacher) {
                        field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.morningteacher} (matin)*`;
                    } else if (!!e.afternoonteacher) {
                        field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.afternoonteacher} (après-midi)*`;
                    }
                }
            } else if (!!e.morningcourse) {
                // if only morning course
                if (!e.morningteacher) {
                    field.value = `Matin : **${e.morningcourse}**`;
                } else {
                    field.value = `Matin : **${e.morningcourse}**\n🧑‍🏫 *${e.morningteacher}*`;
                }
            } else {
                // if only afternoon course
                if (!e.afternoonteacher) {
                    field.value = `Après-midi : **${e.afternooncourse}**`;
                } else {
                    field.value = `Après-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.afternoonteacher}*`;
                }
            }

            return field;
        });

        return messageFields;
    }
}

export default new DiscordFormatterService();
