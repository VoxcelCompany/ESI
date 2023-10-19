import {Moment} from "moment-timezone";

interface Menu {
    date: Moment;
    starter: Array<string>;
    main: Array<string>;
}

const getDefaultMenu = (date: Moment): Menu => {
    return {
        date: date,
        starter: ["entrées non communiquées"],
        main: ["plats non communiqués"],
    };
};

export default Menu;

export {getDefaultMenu};