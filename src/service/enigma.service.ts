import * as XLSX from "xlsx";
import Edt from "../models/Edt";
import EdtDb from "../models/EdtDb";
import EdtFile from "../models/EdtFile";
import EnigmaRepository from "../repository/enigma.repository";
import firebaseRepository from "../repository/firebase.repository";
import { getMomentDate } from "../utils/dates";
import Cursus from "../utils/enum/Cursus";

class Enigma {
    public async getEdtFileDataFromApi(cursus: Cursus): Promise<EdtFile> {
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

        const datas = await EnigmaRepository.getFile(fileId);

        return {
            id: datas.id,
            name: datas.name,
            lastModifiedDateTime: datas.lastModifiedDateTime,
            lastModifiedBy: {
                user: {
                    displayName: datas.lastModifiedBy?.user?.displayName ?? false,
                    email: datas.lastModifiedBy?.user?.email ?? false,
                }
            }
        }
    };

    public async getEdtFromApi(cur: Cursus, saveToDb = false): Promise<Edt> {
        let fileId: string;
        switch (cur) {
            case Cursus.RETAIL:
                fileId = process.env.MS_EXCEL_RETAIL_ID;
                break;
            case Cursus.CYBER:
                fileId = process.env.MS_EXCEL_CYBER_ID;
                break;
            default:
                throw new Error("Invalid cursus");
        }

        const fileContent: ArrayBuffer = await EnigmaRepository.getFileContent(fileId);

        const workbook = XLSX.read(fileContent, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawDatas: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const header = rawDatas[1];
        const edtDatas: Edt = {};

        rawDatas.slice(2).forEach((row) => {
            const rowInfos = {
                date: undefined,
                morning: undefined,
                afternoon: undefined,
            };

            row.forEach((value: any, i: number) => {
                while (!header[i] && i > 0) { i--; }

                const fieldName = this.translateFieldName(header[i]);

                if (fieldName !== false) {
                    rowInfos[fieldName] = fieldName === "date" ?
                        getMomentDate(new Date((value - 2) * 24 * 3600 * 1000 + Date.parse('1900-01-01'))).format("YYYY-MM-DD") :
                        value;
                }
            });

            if (rowInfos.date) {
                edtDatas[rowInfos.date] = {
                    morning: rowInfos.morning ? rowInfos.morning : false,
                    afternoon: rowInfos.afternoon ? rowInfos.afternoon : false,
                };
            }
        });

        if (saveToDb) {
            const infos = await this.getEdtFileDataFromApi(cur);

            const edtDb: EdtDb = {
                ...infos,
                datas: edtDatas,
            };

            await this.saveEdtToDb(edtDb, cur);
        }

        return edtDatas;
    };

    private translateFieldName(fieldName: string): string | false {
        switch (fieldName) {
            case fieldName.match(/date/i)?.input:
                return "date";
            case fieldName.match(/matin/i)?.input:
                return "morning";
            case fieldName.match(/apr(e|è)s(-| )midi/i)?.input:
                return "afternoon";
            default:
                return false;
        }
    };

    private async saveEdtToDb(datas: EdtDb, cur: Cursus): Promise<void> {
        await firebaseRepository.createData("edt", cur, datas);
    };

    public async getEdtFromDb(cur: Cursus): Promise<EdtDb> {
        return (await firebaseRepository.getAllData("edt"))[cur];
    }
}

export default new Enigma();