import axios from "axios";
import { decrypt } from "../utils/crypt";

class MicrosoftRepository {
    private msRefreshToken: string;
    private msAccessToken: string | undefined;

    constructor() {
        this.msRefreshToken = decrypt(process.env.MS_REFRESH_TOKEN);
    }

    private isTokenValid(): boolean {
        if (!this.msAccessToken) return false;

        const base = this.msAccessToken.split(".")[1];

        const buff = Buffer.from(base, "base64");
        const json = JSON.parse(buff.toString("ascii"));

        const now = Date.now() / 1000;

        return now < json.exp;
    }

    public async getAccessToken(): Promise<string> {
        if (this.isTokenValid()) return this.msAccessToken;

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

        return this.msAccessToken;
    }
}

export default new MicrosoftRepository();
