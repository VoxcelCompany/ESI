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
                $filter: `from/emailAddress/address eq '${email}'`,
            },
        });

        const orderedMails = response.data.value.sort((a, b) => {
            return new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime();
        });


        return orderedMails[0] ?? null;
    }
}

export default new MailRepository();
