import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, GuildMember, ModalSubmitInteraction } from 'discord.js';
import enigmaService from '../service/enigma.service';
import { getCustomizedDate, getMomentDate } from '../utils/dates';
import CommandType from '../utils/enum/CommandType';
import Cursus from '../utils/enum/Cursus';
import { capitalize } from '../utils/stringManager';

interface EdtParams {
    num: string;
    interaction: ModalSubmitInteraction<CacheType>;
    type: CommandType;
}

export const edt = async (params: EdtParams): Promise<void> => {
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
            userCursus = Cursus.CYBER;
            break;
        case userRoles.includes(process.env.ROLE_RETAIL):
            userCursus = Cursus.RETAIL;
            break;
        default:
            await interaction.editReply({
                content: `Veuillez vous attribuer le rôle <@&${process.env.ROLE_CYBER}> ou <@&${process.env.ROLE_RETAIL}> pour utiliser cette commande.\nVous pouvez aussi utiliser \`/edt <num> <type>\` pour afficher l'emploi du temps d'une autre section.`,
            });
            return;
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
        const courseDate = getMomentDate(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

        if (!course || !courseDate.isSameOrAfter(weekDate) || !courseDate.isBefore(endWeekDate)) continue;

        edtDatas.push({
            day: displayWeekdays[courseDate.isoWeekday() - 1] ?? "Jour innatendu",
            daynb: courseDate.isoWeekday(),
            morningcourse: course.morning !== false ? course.morning.split(/ ?\(/)[0] : false,
            afternooncourse: course.afternoon !== false ? course.afternoon.split(/ ?\(/)[0] : false,
            morningteacher: course.morning !== false ? course.morning.split(/ ?\(/)?.[1]?.replace(")", "") : false,
            afternoonteacher: course.afternoon !== false ? course.afternoon.split(/ ?\(/)?.[1]?.replace(")", "") : false
        });
    }

    // Sort the array by day number
    edtDatas = edtDatas.sort((a, b) => a.daynb - b.daynb).map((e, i, a) => {
        if (
            a.length - 1 > i
            && e.morningteacher !== false && e.afternoonteacher !== false && e.morningteacher == e.afternoonteacher
            && a[i + 1].morningteacher !== false && a[i + 1].afternoonteacher !== false && e.morningteacher == a[i + 1].morningteacher && e.morningteacher == a[i + 1].afternoonteacher
        ) {
            e.morningteacher = false;
            e.afternoonteacher = false;
        }

        return e;
    });

    // format fields
    const messageFields: {
        name: string;
        value: string;
    }[] = edtDatas.map((e) => {
        const field = {
            name: `${e.day}`,
            value: ""
        };

        if (e.morningcourse === false && e.afternooncourse === false) { // if no courses
            field.value = "*Entreprise*";
        } else if (!!e.morningcourse && !!e.afternooncourse) { // if courses morning and afternoon
            const morningCourse = e.morningcourse.toLowerCase().replace(/ /g, "");
            const afternoonCourse = e.afternooncourse.toLowerCase().replace(/ /g, "");

            if (morningCourse.startsWith(afternoonCourse) || afternoonCourse.startsWith(morningCourse)) { // if same course
                if (!e.morningteacher && !e.afternoonteacher) {
                    field.value = `**${e.morningcourse}**`;
                } else if (e.morningteacher == e.afternoonteacher) {
                    field.value = `**${e.morningcourse}**\n🧑‍🏫 *${e.morningteacher}*`;
                } else {
                    field.value = `**${e.morningcourse}**\n🧑‍🏫 *${e.morningteacher} / ${e.afternoonteacher}*`;
                }
            } else { // if different courses
                if (!e.morningteacher && !e.afternoonteacher) {
                    field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**`;
                } else if (e.morningteacher == e.afternoonteacher) {
                    field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.morningteacher}*`;
                } else if (!!e.morningteacher && !!e.afternoonteacher) {
                    field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.morningteacher} / ${e.afternoonteacher}*`;
                } else if (!!e.morningteacher) {
                    field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.morningteacher} (matin)*`;
                } else if (!!e.afternoonteacher) {
                    field.value = `Matin : **${e.morningcourse}**\nAprès-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.afternoonteacher} (après-midi)*`;
                }
            }
        } else if (!!e.morningcourse) { // if only morning course
            if (!e.morningteacher) {
                field.value = `Matin : **${e.morningcourse}**`;
            } else {
                field.value = `Matin : **${e.morningcourse}**\n🧑‍🏫 *${e.morningteacher}*`;
            }
        } else { // if only afternoon course
            if (!e.afternoonteacher) {
                field.value = `Après-midi : **${e.afternooncourse}**`;
            } else {
                field.value = `Après-midi : **${e.afternooncourse}**\n🧑‍🏫 *${e.afternoonteacher}*`;
            }
        }

        return field;
    });

    // Set the message content, with formatted fields
    const messageContent = {
        embeds: [{
            color: 0x417e4c,
            title: `🗓️ **__${diplayWeek[num] !== undefined ? diplayWeek[num] : `Dans ${num} semaines`}__ ↔ ${displayDate}** `,
            fields: messageFields,
            footer: {
                text: `ENIGMA - ${capitalize(userCursus)}`,
                icon_url: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL
            }
        }],
    };

    // Add buttons to message
    const buttonsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`EDT${parseInt(num) - 1}`).setLabel("❰❰ ­ Précédent").setStyle(ButtonStyle.Success).setDisabled(parseInt(num) <= 1),
        new ButtonBuilder().setLabel("Détails").setStyle(ButtonStyle.Link).setURL(userCursus == Cursus.CYBER ? "https://enigmaschoolintra.sharepoint.com/:x:/r/sites/Organisation23_24/Documents%20partages/General/E4%202324%20Cyber.xlsx?d=wf21d48c0c9b3443abfe53d968ce58357&csf=1&web=1&e=G3Fc7m" : "https://enigmaschoolintra.sharepoint.com/:x:/r/sites/Organisation23_24/Documents%20partages/General/E4%202324%20Retail.xlsx?d=w2c56aa9e6d9049e3884418b1a70de3fb&csf=1&web=1&e=jqtjXd"),
        new ButtonBuilder().setCustomId(`EDT${parseInt(num) + 1}`).setLabel("Suivant ­ ❱❱").setStyle(ButtonStyle.Success).setDisabled(parseInt(num) >= 60),
    );
    messageContent["components"] = [buttonsRow];

    // Send the message
    await interaction.editReply(messageContent);

    // Add reactions to the message
    (await interaction.fetchReply()).react(process.env.EMOJI_MERCI);
}