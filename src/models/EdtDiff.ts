import Edt from "./Edt";

export default interface EdtDiff {
    isDiff: boolean;
    oldEdt?: Edt;
    newEdt?: Edt;
};