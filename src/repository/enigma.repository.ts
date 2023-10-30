import axios, { AxiosResponse } from "axios";
import EdtFile from "../models/EdtFile";
import { decrypt } from "../utils/crypt";
import microsoftRepository from "./microsoft.repository";

class EnigmaRepository {
    public async getFile(fileId: string): Promise<EdtFile> {
        const url = `https://graph.microsoft.com/v1.0/me/drives/${process.env.MS_DRIVE_GROUP_ID}/items/${fileId}`;
        const response: AxiosResponse<EdtFile> = await axios.get<EdtFile>(url, {
            headers: {
                Authorization: `Bearer ${await microsoftRepository.getAccessToken()}`,
            },
        });

        return response.data;
    }

    public async getFileContent(fileId: string): Promise<ArrayBuffer> {
        const url = `https://graph.microsoft.com/v1.0/me/drives/${process.env.MS_DRIVE_GROUP_ID}/items/${fileId}/content`;
        const response: AxiosResponse<ArrayBuffer> = await axios.get<ArrayBuffer>(url, {
            headers: {
                Authorization: `Bearer ${await microsoftRepository.getAccessToken()}`,
            },
            responseType: "arraybuffer",
        });

        return response.data;
    }
}

export default new EnigmaRepository();
