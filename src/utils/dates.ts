import moment from "moment-timezone";

export const getMomentDate = (date?: string | Date, format?: string) => {
    return moment(date, format).tz("Europe/Paris");
};