import moment, {Moment} from "moment-timezone";

/**
 *
 * @param date Facultative, default to current date
 * @param format Facultative, corresponding to the format of the date
 * @returns Moment
 */
export const getMomentDate = (date?: string | Date, format?: string): Moment => {
    moment.locale('fr');
    return moment(date, format).tz("Europe/Paris");
};

/**
 *
 * @param semaine Number of weeks to add to the current date, can be negative
 * @returns Moment
 */
export const getCustomizedDate = (semaine: number = 0): Moment => {
    const date = getMomentDate().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(semaine, "weeks");

    if (date.isoWeekday() >= 6) date.add(1, "weeks");

    return date.isoWeekday(1);
};
