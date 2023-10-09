import moment from "moment-timezone";

export const getCurrentDate = (date: string | boolean = false, format = false) => {
    return typeof date === "boolean"  ? moment().tz("Europe/Paris") : format === false ? moment(date).tz("Europe/Paris") : moment(date, format).tz("Europe/Paris");
}