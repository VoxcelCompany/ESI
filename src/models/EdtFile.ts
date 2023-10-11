export default interface EdtFile {
    id: string;
    name: string;
    lastModifiedDateTime: string;
    lastModifiedBy: {
        user: {
            displayName: string
            email: string
        }
    };
};