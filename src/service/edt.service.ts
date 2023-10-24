import { ActionRowBuilder, AnyComponentBuilder, ButtonBuilder, ButtonStyle, Client, GuildMember, InteractionEditReplyOptions, MessagePayload } from "discord.js";
import { EdtDataCmd } from "../models/EdtDataCmd";
import { WEEK_DAYS } from "../utils/constants/Dates";
import { getCustomizedDate, getMomentDate } from "../utils/dates";
import Cursus from "../utils/enum/Cursus";
import enigmaService from "./enigma.service";
import { capitalize } from "../utils/stringManager";

class EdtService {
    public getUserCursus(
        user: GuildMember,
        typeNum?: number
    ): {
        userCursus: Cursus;
        errorMessage?: string;
    } {
        if (!typeNum) {
            const userRoles = user.roles.cache.map((r) => r.id);

            switch (true) {
                case userRoles.includes(process.env.ROLE_CYBER):
                    return { userCursus: Cursus.CYBER };
                case userRoles.includes(process.env.ROLE_RETAIL):
                    return { userCursus: Cursus.RETAIL };
                default:
                    return {
                        userCursus: Cursus.CYBER,
                        errorMessage: `Veuillez vous attribuer le rôle <@&${process.env.ROLE_CYBER}> ou <@&${process.env.ROLE_RETAIL}> pour utiliser cette commande.\nVous pouvez aussi utiliser \`/edt <weekNumber> <type>\` pour afficher l'emploi du temps d'une autre section.`,
                    };
            }
        } else {
            switch (typeNum) {
                case 1:
                    return { userCursus: Cursus.CYBER };
                case 2:
                    return { userCursus: Cursus.RETAIL };
                default:
                    return {
                        userCursus: Cursus.CYBER,
                        errorMessage: `Votre numéro de section est invalide.`,
                    };
            }
        }
    }

    public async getEdtDatas(weekNumber: number, userCursus: Cursus, client: Client): Promise<EdtDataCmd[]> {
        const weekDate = getCustomizedDate(weekNumber - 1);
        const endWeekDate = weekDate.clone().add(5, "days");

        const edtFromDb = (await enigmaService.getLatestEdt(userCursus, client)).datas;
        let edtDatas: {
            day: string;
            daynb: number;
            morningcourse: string | false;
            afternooncourse: string | false;
            morningteacher: string | false;
            afternoonteacher: string | false;
        }[] = [];

        // Add all courses of the week to the array
        for (const date in edtFromDb) {
            const course = edtFromDb[date];
            const courseDate = getMomentDate(date).set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
            });

            let displayWeek: string;
            if (WEEK_DAYS[courseDate.isoWeekday() - 1] !== undefined) {
                displayWeek = `⎯ ${WEEK_DAYS[courseDate.isoWeekday() - 1]}`;
            } else {
                displayWeek = `⎯ Jour inconu`;
            }

            if (!course || !courseDate.isSameOrAfter(weekDate) || !courseDate.isBefore(endWeekDate)) continue;

            edtDatas.push({
                day: displayWeek,
                daynb: courseDate.isoWeekday(),
                morningcourse: course.morning !== false ? course.morning.split(/ ?\(/)[0] : false,
                afternooncourse: course.afternoon !== false ? course.afternoon.split(/ ?\(/)[0] : false,
                morningteacher: course.morning !== false ? course.morning.split(/ ?\(/)?.[1]?.replace(")", "") : false,
                afternoonteacher:
                    course.afternoon !== false ? course.afternoon.split(/ ?\(/)?.[1]?.replace(")", "") : false,
            });
        }

        // Sort the array by day number
        edtDatas = edtDatas
            .sort((a, b) => a.daynb - b.daynb)
            .map((e, i, a) => {
                if (
                    a.length - 1 > i &&
                    e.morningteacher !== false &&
                    e.afternoonteacher !== false &&
                    e.morningteacher == e.afternoonteacher &&
                    a[i + 1].morningteacher !== false &&
                    a[i + 1].afternoonteacher !== false &&
                    e.morningteacher == a[i + 1].morningteacher &&
                    e.morningteacher == a[i + 1].afternoonteacher
                ) {
                    e.morningteacher = false;
                    e.afternoonteacher = false;
                }

                return e;
            });

        return edtDatas;
    }

    public getEdtMessageContent(
        messageFields: {
            name: string;
            value: string;
        }[],
        weekNumber: number,
        userCursus: Cursus,
        showButtons: boolean = true
    ): MessagePayload | InteractionEditReplyOptions {
        const weekDate = getCustomizedDate(+weekNumber - 1);
        const displayDate = weekDate.format("DD/MM/YYYY");
        const diplayWeek = {
            "1": "Cette semaine",
            "2": "Semaine prochaine",
        };

        const messageContent = {
            embeds: [
                {
                    color: 0xff0000,
                    title: `🗓️ **__${
                        diplayWeek[weekNumber] !== undefined ? diplayWeek[weekNumber] : `Dans ${weekNumber} semaines`
                    }__ ↔ ${displayDate}** `,
                    fields: messageFields,
                    footer: {
                        text: `ENIGMA - ${capitalize(userCursus)}`,
                    },
                },
            ],
        };

        if (!showButtons) return messageContent;

        const buttonsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`EDT${weekNumber - 1}`)
                .setLabel("❰❰ ­ Précédent")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(weekNumber <= 1),
            new ButtonBuilder()
                .setLabel("Détails")
                .setStyle(ButtonStyle.Link)
                .setURL(userCursus == Cursus.CYBER ? process.env.LINK_CYBER : process.env.LINK_RETAIL),
            new ButtonBuilder()
                .setCustomId(`EDT${weekNumber + 1}`)
                .setLabel("Suivant ­ ❱❱")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(weekNumber >= 60)
        );
        (messageContent as InteractionEditReplyOptions).components = buttonsRow;

        return messageContent;
    }
}

export default new EdtService();
