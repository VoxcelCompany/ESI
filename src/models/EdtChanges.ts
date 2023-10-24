export interface EdtChanges {
    [key: string]: {
        oldMorning: string | false;
        oldAfternoon: string | false;
        newMorning: string | false;
        newAfternoon: string | false;
    };
}

export interface EdtDiff {
    isDiff: boolean;
    edtChanges?: {
        authorName: string | false;
        data: EdtChanges;
    }
};