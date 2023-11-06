import { CacheType, ModalSubmitInteraction } from "discord.js";
import OsiChoice from "../../utils/enum/OsiChoice";

interface OsiParams {
    interaction: ModalSubmitInteraction<CacheType>;
    choice: string;
}

export default async (params: OsiParams): Promise<void> => {
    const { interaction, choice } = params;

    await interaction.deferReply({ ephemeral: false });

    if (+choice == OsiChoice.IMAGE) {
        await interaction.editReply({
            files: [process.env.OSI_IMG],
        });
    } else {
        await interaction.editReply(
            `Mémo : Ah Petite Salope Tu Recraches La Purée !\nAh :                  APPLICATION \nPetite :             PRESENTATION\nSalope :           SESSION\nTu :                  TRANSPORT\nRecraches :    RESEAU\nLa :                   LIAISON\nPurée :             PHYSIQUE`
        );
    }
};
