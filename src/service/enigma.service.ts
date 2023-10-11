import EnigmaRepository from "../repository/enigma.repository";
import EdtFile from "../models/EdtFile";
import Cursus from "../utils/enum/Cursus";
import * as XLSX from "xlsx";
import Edt from "../models/Edt";

class Enigma {
    public async getEdtFileData(cursus: Cursus): Promise<EdtFile> {
        let fileId: string;
        switch (cursus) {
            case Cursus.RETAIL:
                fileId = process.env.MS_EXCEL_RETAIL_ID;
                break;
            case Cursus.CYBER:
                fileId = process.env.MS_EXCEL_CYBER_ID;
                break;
            default:
                throw new Error("Invalid cursus");
        }

        return await EnigmaRepository.getFile(fileId);
    };

    public async getEdt(cur: Cursus): Promise<Edt[]> {
        let fileId: string;
        switch (cur) {
            case Cursus.RETAIL:
                fileId = process.env.MS_EXCEL_RETAIL_ID;
                break;
            default:
                fileId = process.env.MS_EXCEL_CYBER_ID;
                break;
        }

        const fileContent: ArrayBuffer = await EnigmaRepository.getFileContent(fileId);

        const workbook = XLSX.read(fileContent, {type: 'buffer'});

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawDatas: any[][] = XLSX.utils.sheet_to_json(worksheet, {header: 1});

        const header = rawDatas[1];
        return rawDatas.slice(2).map((row) => {
            const obj: Edt = {
                date: undefined,
                day: undefined,
                morning: undefined,
                afternoon: undefined,
            };

            row.forEach((value: any, i: number) => {
                while (!header[i] && i > 0) {
                    i--;
                }
                const fieldName = this.translateFieldName(header[i]);
                obj[fieldName] = fieldName === "date" ?
                    new Date((value - 2) * 24 * 3600 * 1000 + Date.parse('1900-01-01')) :
                    value;
            });
            return obj;
        });
    };

    private translateFieldName(fieldName: string): string {
        switch (fieldName.toLowerCase()) {
            case "jour":
                return "jour";
            case "matin":
                return "morning";
            case "apres-midi":
            case "après-midi":
            case "apres midi":
            case "après midi":
                return "afternoon";
            default:
                return fieldName;
        }
    };
}

export default new Enigma();