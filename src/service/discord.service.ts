import { APIEmbedField } from "discord.js";
import { EdtChanges } from "../models/EdtChanges";

class DiscordService {
    private displayWeekdays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    private displayMonths = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Aout",
        "Septemebre",
        "Octobre",
        "Novembre",
        "Décembre",
    ];

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
            const dateDay = this.displayWeekdays[dateMoment.getDay() - 1];
            const fieldTitle = `${dateDay} ${dateMoment.getDate()} ${
                this.displayMonths[dateMoment.getMonth()]
            } ${dateMoment.getFullYear()}`;

            let fieldMessage = "";
            if (!newMC && !newAC) continue;
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
}

export default new DiscordService();
