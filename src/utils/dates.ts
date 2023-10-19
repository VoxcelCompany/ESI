import moment, {Moment} from "moment-timezone";

export const getMomentDate = (date?: string | Date, format?: string): Moment => {
    moment.locale('fr');
    return moment(date, format).tz("Europe/Paris");
};