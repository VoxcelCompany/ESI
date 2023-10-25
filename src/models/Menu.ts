import {Moment} from "moment-timezone";

interface Menu {
    date: Moment;
    starter: Array<string>;
    main: Array<string>;
}

export default Menu;