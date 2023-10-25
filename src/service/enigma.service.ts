import { BaseGuildTextChannel, Client, ThreadAutoArchiveDuration } from "discord.js";
import * as XLSX from "xlsx";
import Edt from "../models/Edt";
import { EdtChanges, EdtDiff } from "../models/EdtChanges";
import EdtDb from "../models/EdtDb";
import EdtFile from "../models/EdtFile";
import EnigmaRepository from "../repository/enigma.repository";
import firebaseRepository from "../repository/firebase.repository";
import { CURSUS } from "../utils/constants/Cursus";
import { getMomentDate } from "../utils/dates";
import Cursus from "../utils/enum/Cursus";
import { capitalize } from "../utils/stringManager";
import DiscordFormatterService from "./discordFormatter.service";

class EnigmaService {
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
                },
            },
        };
    }

    private async getEdtFromApi(cursus: Cursus, saveToDb = false): Promise<Edt> {
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

        const fileContent: ArrayBuffer = await EnigmaRepository.getFileContent(fileId);

        const workbook = XLSX.read(fileContent, { type: "buffer" });

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
                while (!header[i] && i > 0) {
                    i--;
                }

                const fieldName = this.translateFieldName(header[i]);

                if (fieldName !== false) {
                    rowInfos[fieldName] =
                        fieldName === "date"
                            ? getMomentDate(new Date((value - 2) * 24 * 3600 * 1000 + Date.parse("1900-01-01"))).format(
                                  "YYYY-MM-DD"
                              )
                            : value;
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
            this.getEdtFileDataFromApi(cursus).then((infos) => {
                const edtDb: EdtDb = {
                    ...infos,
                    datas: edtDatas,
                };

                firebaseRepository.createData("edt", cursus, edtDb);
            });
        }

        return edtDatas;
    }

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
    }

    public async getEdtUpdate(cursus: Cursus, oldEdt?: EdtDb): Promise<EdtDiff> {
        if (!oldEdt) oldEdt = await this.getEdtFromDb(cursus);
        const edtInfo = await this.getEdtFileDataFromApi(cursus);

        if (!oldEdt || !oldEdt.lastModifiedDateTime) {
            this.getEdtFromApi(cursus, true);
            return { isDiff: false };
        }

        const newDate = getMomentDate(edtInfo.lastModifiedDateTime);
        const oldDate = getMomentDate(oldEdt?.lastModifiedDateTime);

        if (!newDate.isAfter(oldDate)) return { isDiff: false };

        const newEdt = await this.getEdtFromApi(cursus, true);
        const edtChangesData: EdtChanges = {};
        const today = getMomentDate(new Date()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

        for (const date in newEdt) {
            if (getMomentDate(date, "YYYY-MM-DD").isBefore(today)) continue;

            const isSameMorningCourse = newEdt[date].morning === oldEdt.datas[date].morning;
            const isSameAfternoonCourse = newEdt[date].afternoon === oldEdt.datas[date].afternoon;

            if (isSameMorningCourse && isSameAfternoonCourse) continue;

            if (!isSameMorningCourse && !isSameAfternoonCourse) {
                edtChangesData[date] = {
                    oldMorning: oldEdt.datas[date].morning,
                    oldAfternoon: oldEdt.datas[date].afternoon,
                    newMorning: newEdt[date].morning,
                    newAfternoon: newEdt[date].afternoon,
                };
            } else if (!isSameMorningCourse) {
                edtChangesData[date] = {
                    oldMorning: oldEdt.datas[date].morning,
                    oldAfternoon: oldEdt.datas[date].afternoon,
                    newMorning: newEdt[date].morning,
                    newAfternoon: false,
                };
            } else {
                edtChangesData[date] = {
                    oldMorning: oldEdt.datas[date].morning,
                    oldAfternoon: oldEdt.datas[date].afternoon,
                    newMorning: false,
                    newAfternoon: newEdt[date].afternoon,
                };
            }
        }

        return {
            isDiff: true,
            edtChanges: {
                authorName: edtInfo.lastModifiedBy.user.displayName,
                data: edtChangesData,
            },
        };
    }

    private async alertEdtUpdate(client: Client, cursus: Cursus, edtUpdate: EdtDiff): Promise<void> {
        const formatedFields = DiscordFormatterService.formatUpdateEdtFields(edtUpdate.edtChanges.data);

        if (formatedFields.length === 0) return;

        let channelId = "";
        switch (cursus) {
            case Cursus.RETAIL:
                channelId = process.env.CHNL_RETAIL_ALERT;
                break;
            case Cursus.CYBER:
                channelId = process.env.CHNL_CYBER_ALERT;
                break;
            default:
                throw new Error("Invalid cursus");
        }
        const channel = client.channels.cache.get(channelId) as BaseGuildTextChannel;

        const msg = await channel.send({
            content: `<a:bell:868901922483097661> <@&${process.env.ROLE_NOTIFIED}>`,
            embeds: [
                {
                    title: `Changement${formatedFields.length > 1 ? "s" : ""} dans l'emploi du temps`,
                    description: `${
                        formatedFields.length > 1
                            ? "Plusieurs changements ont étés détectés"
                            : "Un changement a été détecté"
                    } dans l'emploi du temps de la section ${capitalize(cursus)} !\n\n`,
                    color: 0x00ff00,
                    fields: formatedFields,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `${
                            edtUpdate.edtChanges.authorName !== false ? `${edtUpdate.edtChanges.authorName} - ` : ""
                        }${cursus}`,
                    },
                },
            ],
        });

        const threadTitles = [
            `Ça bouge en ${capitalize(cursus)} !`,
            `${edtUpdate.edtChanges.authorName} a encore fait des siennes...`,
            `Que se passe-t-il en ${capitalize(cursus)} ?`,
            `Mais pourquoi ${edtUpdate.edtChanges.authorName} ??`,
            "PITIÉ",
            "Saperlipopette...",
            "$%*µ£",
            "Mais c'est pas possible !",
            `Arrête ça ${edtUpdate.edtChanges.authorName}`,
            `Ça vous apprendra les ${cursus.toLowerCase()}`,
        ];
        const threadTitle = threadTitles[Math.floor(Math.random() * threadTitles.length)];

        // create thread with message
        await msg.startThread({
            name: threadTitle,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
        });
    }

    public checkEdtUpdate(client: Client): void {
        CURSUS.forEach(async (cursus: Cursus) => {
            const edtUpdate = await this.getEdtUpdate(cursus);

            if (!edtUpdate.isDiff) return;

            await this.alertEdtUpdate(client, cursus, edtUpdate);
        });
    }

    public async getEdtFromDb(cursus: Cursus): Promise<EdtDb> {
        return (await firebaseRepository.getAllData("edt"))[cursus];
    }

    public async getLatestEdt(cursus: Cursus, client: Client): Promise<EdtDb> {
        const edtDbDatas = await this.getEdtFromDb(cursus);
        const edtFileDatas = await this.getEdtFileDataFromApi(cursus);

        if (!edtDbDatas.lastModifiedDateTime) {
            const edtDatas = await this.getEdtFromApi(cursus, true);

            return {
                ...edtFileDatas,
                datas: edtDatas,
            };
        }

        const edtFileDate = getMomentDate(edtFileDatas.lastModifiedDateTime);
        const edtDbDate = getMomentDate(edtDbDatas.lastModifiedDateTime);

        if (edtFileDate.isSameOrBefore(edtDbDate, "minutes")) return edtDbDatas;

        const edtDatas = await this.getEdtFromApi(cursus, true);

        this.getEdtUpdate(cursus, edtDbDatas).then((r) => {
            this.alertEdtUpdate(client, cursus, r);
        });

        return {
            ...edtFileDatas,
            datas: edtDatas,
        };
    }
}

export default new EnigmaService();