import { EventAttributes, createEvents } from "ics";
import EdtDb from "../models/EdtDb";
import EDT_DB_DATE_FORMAT from "../utils/constants/EdtDbDateFormat";
import { getMomentDate } from "../utils/dates";
import Cursus from "../utils/enum/Cursus";
import { capitalize } from "../utils/stringManager";

class IcsService {
    public getIcsFile() {
        return "ics";
    }

    public generateIcsFile(edtDatas: Omit<EdtDb, "icsDatas">, cursus: Cursus): string | false {
        const calName = `Emploi du temps ${capitalize(cursus)}`;
        const events: EventAttributes[] = [];

        for (const date in edtDatas.datas) {
            const course = edtDatas.datas[date];
            const courseDate = getMomentDate(date, EDT_DB_DATE_FORMAT);

            if (course.morning) {
                events.push({
                    title: course.morning,
                    start: [courseDate.year(), courseDate.month() + 1, courseDate.date(), 9, 30],
                    duration: { hours: 3, minutes: 30 },
                    calName,
                });
            }

            if (course.afternoon) {
                events.push({
                    title: course.afternoon,
                    start: [courseDate.year(), courseDate.month() + 1, courseDate.date(), 14, 0],
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

export default new IcsService();
