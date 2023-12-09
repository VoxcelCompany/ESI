import axios from "axios";
import Mail from "../models/Mail";
import microsoftRepository from "./microsoft.repository";

class MailRepository {
    public async getLastMailFrom(email: string): Promise<Mail | null> {
        const response = await axios.get("https://graph.microsoft.com/v1.0/me/mailfolders/inbox/messages", {
            headers: {
                Authorization: `Bearer ${await microsoftRepository.getAccessToken()}`,
            },
            params: {
                $select: "subject,from,receivedDateTime",
                $filter: `receivedDateTime ge 1900-01-01T00:00:00Z and from/emailAddress/address eq '${email}'`,
                $orderby: "receivedDateTime desc",
                $top: 1,
            },
        });

        return response.data?.value?.[0] || null;
    }
}

export default new MailRepository();
