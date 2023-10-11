import moment from "moment-timezone";

export const getMomentDate = (date?: string | Date, format?: string) => {
    return date === undefined ?
        moment().tz("Europe/Paris") : format === undefined ?
            moment(date).tz("Europe/Paris") : moment(date, format).tz("Europe/Paris");
};