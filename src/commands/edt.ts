import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, GuildMember, ModalSubmitInteraction } from 'discord.js';
import { Moment } from 'moment';
import enigmaService from '../service/enigma.service';
import { getMomentDate } from '../utils/dates';
import CommandType from '../utils/enum/CommandType';
import Cursus from '../utils/enum/Cursus';
import { capitalize } from '../utils/string';

interface IAideParams {
    num: string;
    interaction: ModalSubmitInteraction<CacheType>;
    type: CommandType;
}

const getCustomizedDate = (semaine: number = 0): Moment => {
    const date = getMomentDate().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(semaine, "weeks");

    if (date.isoWeekday() >= 6) date.add(1, 'weeks');

    return date.isoWeekday(1);
}

export const edt = async (params: IAideParams) => {
    const { num, interaction, type } = params;

    if (type == CommandType.BUTTON) {
        await interaction.deferUpdate();
    } else {
        await interaction.deferReply({ ephemeral: false });
    }

    const userRoles = (interaction.member as GuildMember).roles.cache.map((r) => r.id);

    let userCursus: Cursus;

    switch (true) {
        case userRoles.includes(process.env.ROLE_CYBER):
            console.log("cyber", process.env.ROLE_CYBER, 1161967520845144135);
            userCursus = Cursus.CYBER;
            break;
        case userRoles.includes(process.env.ROLE_RETAIL):
        default:
            userCursus = Cursus.RETAIL;
            break;
    }

    const weekDate = getCustomizedDate(parseInt(num) - 1);
    const endWeekDate = weekDate.clone().add(5, "days");
    const displayDate = weekDate.format("DD/MM/YYYY");

    const displayWeekdays = ["⎯ Lundi", "⎯ Mardi", "⎯ Mercredi", "⎯ Jeudi", "⎯ Vendredi"];
    const diplayWeek = {
        "1": "Cette semaine",
        "2": "Semaine prochaine",
    };
    const edtFromDb = (await enigmaService.getEdtFromDb(userCursus)).datas;
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

        if (course) {
            const courseDate = getMomentDate(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

            if (courseDate.isSameOrAfter(weekDate) && courseDate.isBefore(endWeekDate)) {
                edtDatas.push({
                    day: displayWeekdays[courseDate.isoWeekday() - 1] ?? "Jour innatendu",
                    daynb: courseDate.isoWeekday(),
                    morningcourse: course.morning !== false ? course.morning.split("(")[0] : false,
                    afternooncourse: course.afternoon !== false ? course.afternoon.split("(")[0] : false,
                    morningteacher: course.morning !== false ? course.morning.split("(")?.[1]?.replace(")", "") : false,
                    afternoonteacher: course.afternoon !== false ? course.afternoon.split("(")?.[1]?.replace(")", "") : false,
                });
            }
        }
    }

    // Sort the array by day number
    edtDatas = edtDatas.sort((a, b) => a.daynb - b.daynb).map((e, i, a) => {
        if (a.length - 1 > i) {
            if (e.morningteacher !== false && e.afternoonteacher !== false && e.morningteacher == e.afternoonteacher) {
                if (a[i + 1].morningteacher !== false && a[i + 1].afternoonteacher !== false && e.morningteacher == a[i + 1].morningteacher && e.morningteacher == a[i + 1].afternoonteacher) {
                    e.morningteacher = false;
                    e.afternoonteacher = false;
                }
            }
        }

        return e;
    });

    // Set the message content, with formatted fields
    const messageContent = {
        embeds: [{
            color: 0x417e4c,
            title: `🗓️ **__${diplayWeek[num] !== undefined ? diplayWeek[num] : `Dans ${num} semaines`}__ ↔ ${displayDate}** `,
            fields: edtDatas.map((e) => {
                const field = {
                    name: `${e.day}`,
                    value: ""
                };

                if (e.morningcourse === false && e.afternooncourse === false) { // if no courses
                    field.value = "*Entreprise*";
                } else if (!!e.morningcourse && !!e.afternooncourse) { // if courses morning and afternoon
                    const morningCourse = e.morningcourse.toLowerCase().replace(/ /g, "");
                    const afternoonCourse = e.afternooncourse.toLowerCase().replace(/ /g, "");

                    if (morningCourse.startsWith(afternoonCourse) || afternoonCourse.startsWith(morningCourse)) {
                        if (!e.morningteacher && !e.afternoonteacher) {
                            field.value = `${e.morningcourse ? `**${e.morningcourse}**` : "Aucun cours"}`;
                        } else if (e.morningteacher == e.afternoonteacher) {
                            field.value = `${e.morningcourse ? `**${e.morningcourse}**\n🧑‍🏫 *${e.morningteacher}*` : "Aucun cours"}`;
                        } else {
                            field.value = `${e.morningcourse ? `**${e.morningcourse}**\n🧑‍🏫 *${e.morningteacher} / ${e.afternoonteacher}*` : "Aucun cours"}`;
                        }
                    }
                } else if (!!e.morningcourse) { // if only morning course
                    if (!e.morningteacher) {
                        field.value = `${e.morningcourse ? `Matin : **${e.morningcourse}**` : "Aucun cours"}`;
                    } else {
                        console.log(e.morningcourse, e.morningteacher);
                        field.value = `${e.morningcourse ? `Matin : **${e.morningcourse}**\n🧑‍🏫 *${e.morningteacher}*` : "Aucun cours"}`;
                    }
                } else { // if only afternoon course
                    if (!e.afternoonteacher) {
                        field.value = `${e.afternooncourse ? `Après-midi : **${e.afternooncourse}**` : "Aucun cours"}`;
                    } else {
                        field.value = `${e.afternooncourse ? `Après-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.afternoonteacher}*` : "Aucun cours"}`;
                    }
                }

                return field;
            }),
            footer: {
                text: `ENIGMA - ${capitalize(userCursus)}`,
                icon_url: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL
            }
        }],
    };

    const buttonsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`EDT${parseInt(num) - 1}`).setLabel("❰❰ ­ Précédent").setStyle(ButtonStyle.Success).setDisabled(parseInt(num) <= 1),
        new ButtonBuilder().setCustomId(`EDT${parseInt(num) + 1}`).setLabel("Suivant ­ ❱❱").setStyle(ButtonStyle.Success).setDisabled(parseInt(num) >= 60),
    );
    messageContent["components"] = [buttonsRow];

    await interaction.editReply(messageContent);

    return (await interaction.fetchReply()).react(process.env.EMOJI_MERCI);
}