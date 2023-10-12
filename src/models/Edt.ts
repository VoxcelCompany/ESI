export default interface Edt {
    [key: string]: {
        morning: string | false;
        afternoon: string | false;
    };
}