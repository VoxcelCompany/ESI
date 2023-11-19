import { EventAttributes, createEvents } from "ics";
import EdtDb from "../models/EdtDb";
import firebaseRepository from "../repository/firebase.repository";
import EDT_DB_DATE_FORMAT from "../utils/constants/EdtDbDateFormat";
import { getMomentDate } from "../utils/dates";
import Cursus from "../utils/enum/Cursus";
import { capitalize } from "../utils/stringManager";

class EdtIcsService {
    public async getIcsFile(cursus: Cursus): Promise<{ success: boolean; content: string }> {
        const ics = (await firebaseRepository.getData("edt", cursus)) as EdtDb;

        if (!ics || !ics.icsDatas)
            return {
                success: false,
                content: "Aucun emploi du temps trouvé",
            };

        return {
            success: true,
            content: ics.icsDatas,
        };
    }

    public generateIcsFile(edtDatas: Omit<EdtDb, "icsDatas">, cursus: Cursus): string | false {
        const calName = `Emploi du temps ${capitalize(cursus)}`;
        const events: EventAttributes[] = [];

        for (const date in edtDatas.datas) {
            const course = edtDatas.datas[date];
            const courseDate = getMomentDate(date, EDT_DB_DATE_FORMAT);

            if (course.morning) {
                const morningHour = courseDate.hour(9).minute(30);
                if (morningHour.utcOffset() === 60 && process.env.NODE_ENV !== "development")
                    morningHour.subtract(1, "hours");
                else if (morningHour.utcOffset() === 120 && process.env.NODE_ENV !== "development")
                    morningHour.subtract(2, "hours");

                events.push({
                    title: course.morning,
                    start: [
                        courseDate.year(),
                        courseDate.month() + 1,
                        courseDate.date(),
                        morningHour.hour(),
                        morningHour.minute(),
                    ],
                    duration: { hours: 3, minutes: 30 },
                    calName,
                });
            }

            if (course.afternoon) {
                const afternoonHour = courseDate.hour(14).minute(0);
                if (afternoonHour.utcOffset() === 60 && process.env.NODE_ENV !== "development")
                    afternoonHour.subtract(1, "hours");
                else if (afternoonHour.utcOffset() === 120 && process.env.NODE_ENV !== "development")
                    afternoonHour.subtract(2, "hours");

                events.push({
                    title: course.afternoon,
                    start: [
                        courseDate.year(),
                        courseDate.month() + 1,
                        courseDate.date(),
                        afternoonHour.hour(),
                        afternoonHour.minute(),
                    ],
                    duration: { hours: 3, minutes: 30 },
                    calName,
                });
            }
        }

        const { error, value } = createEvents(events);

        if (error) {
            console.log(error);
            return false;
        }

        return value;
    }
}

export default new EdtIcsService();
