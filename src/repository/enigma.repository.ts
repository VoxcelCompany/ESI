import axios, {AxiosResponse} from "axios";
import {decrypt} from "../utils/crypt";
import EdtFile from "../models/EdtFile";
// import * as sha1 from "sha1";
// import { encrypt, decrypt } from "../tasks/crypter.js";
// import { getAllData, createData } from "../firebase/firebase.js";
// import { getCurrentDate } from "../tasks/dates.js";

class EnigmaRepository {
    msRefreshToken: string;
    msAccessToken: string | undefined;

    constructor() {
        this.msRefreshToken = decrypt(process.env.MS_REFRESH_TOKEN);
    }

    public async getFile(fileId: string): Promise<EdtFile> {
        if (!this.isTokenValid()) await this.getAccessToken();

        const url = `https://graph.microsoft.com/v1.0/me/drives/${process.env.MS_DRIVE_GROUP_ID}/items/${fileId}`;
        const response: AxiosResponse<EdtFile> = await axios.get<EdtFile>(url, {
            headers: {
                Authorization: `Bearer ${this.msAccessToken}`,
            },
        });

        return response.data;
    }

    public async getFileContent(fileId: string): Promise<ArrayBuffer> {
        if (!this.isTokenValid()) await this.getAccessToken();

        const url = `https://graph.microsoft.com/v1.0/me/drives/${process.env.MS_DRIVE_GROUP_ID}/items/${fileId}/content`;
        const response: AxiosResponse<ArrayBuffer> = await axios.get<ArrayBuffer>(url, {
            headers: {
                Authorization: `Bearer ${this.msAccessToken}`,
            },
            responseType: "arraybuffer",
        });

        return response.data;
    }

    private async getAccessToken(): Promise<void> {
        const url = `https://login.microsoftonline.com/${process.env.MS_APP_ID}/oauth2/v2.0/token`;
        const data = {
            grant_type: "refresh_token",
            refresh_token: this.msRefreshToken,
            client_id: process.env.MS_APP_CLIENT_ID,
            client_secret: process.env.MS_APP_CLIENT_SECRET,
        };

        const response = await axios.post(url, new URLSearchParams(data), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        this.msAccessToken = response.data.access_token;
    };

    private isTokenValid(): boolean {
        if (!this.msAccessToken) return false;

        const base = this.msAccessToken.split(".")[1];

        const buff = Buffer.from(base, "base64");
        const json = JSON.parse(buff.toString("ascii"));

        const now = Date.now() / 1000;

        return now < json.exp;
    };
}

export default new EnigmaRepository();