import axios, { AxiosResponse } from "axios";
import * as XLSX from 'xlsx';
import { decrypt } from "../tasks/crypt";
// import * as sha1 from "sha1";
// import { encrypt, decrypt } from "../tasks/crypter.js";
// import { getAllData, createData } from "../firebase/firebase.js";
// import { getCurrentDate } from "../tasks/dates.js";

export enum ECursus {
  RETAIL = "RETAIL",
  CYBER = "CYBER",
}

interface IEdtInfo {
  id: string
  name: string
  lastModifiedDateTime: string
  lastModifiedBy: {
    user: {
      displayName: string
      email: string
    }
  }
}

interface IEdtContent {
  date: Date
  day: string
  morning: string
  afternoon: string
}

let msRefreshToken: string = decrypt(process.env.MS_REFRESH_TOKEN);
let msAccessToken: string | undefined;

const getAccessToken = async (): Promise<string> => {
  const url = `https://login.microsoftonline.com/${process.env.MS_APP_ID}/oauth2/v2.0/token`;
  const data = {
    grant_type: "refresh_token",
    refresh_token: msRefreshToken,
    client_id: process.env.MS_APP_CLIENT_ID,
    client_secret: process.env.MS_APP_CLIENT_SECRET
  };

  const response = await axios.post(url, new URLSearchParams(data), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  msAccessToken = response.data.access_token;

  return msAccessToken;
};

const isTokenValid = (): boolean => {
  if (!msAccessToken) return false;

  const base = msAccessToken.split(".")[1];

  const buff = Buffer.from(base, "base64");
  const json = JSON.parse(buff.toString("ascii"));

  const now = Date.now() / 1000;

  return now < json.exp;
}

export const getEdtInfo = async (cur: ECursus): Promise<IEdtInfo> => {
  let fileId: string;
  switch (cur) {
    case ECursus.RETAIL:
      fileId = process.env.MS_EXCEL_RETAIL_ID;
      break;
    case ECursus.CYBER:
      fileId = process.env.MS_EXCEL_CYBER_ID;
      break;
    default:
      throw new Error("Invalid cursus");
  }

  if (!isTokenValid()) await getAccessToken();

  const url = `https://graph.microsoft.com/v1.0/me/drives/${process.env.MS_DRIVE_GROUP_ID}/items/${fileId}`;
  const response: AxiosResponse<IEdtInfo> = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${msAccessToken}`
    }
  });

  return response.data;
};

const translateFieldName = (fieldName: string): string => {
  switch (fieldName.toLowerCase()) {
    case "jour":
      return "jour";
    case "matin":
      return "morning";
    case "apres-midi":
    case "après-midi":
    case "apres midi":
    case "après midi":
      return "afternoon";
    default:
      return fieldName;
  }
}

export const getEdt = async (cur: ECursus): Promise<IEdtContent[]> => {
  let fileId: string;
  switch (cur) {
    case ECursus.RETAIL:
      fileId = process.env.MS_EXCEL_RETAIL_ID;
      break;
    default:
      fileId = process.env.MS_EXCEL_CYBER_ID;
      break;
  }

  if (!isTokenValid()) await getAccessToken();

  const url = `https://graph.microsoft.com/v1.0/me/drives/${process.env.MS_DRIVE_GROUP_ID}/items/${fileId}/content`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${msAccessToken}`,
    },
    responseType: "arraybuffer"
  });

  const workbook = XLSX.read(response.data, { type: 'buffer' });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rawDatas: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

  const header = rawDatas[1];
  const objectDatas = rawDatas.slice(2).map((row) => {
    const obj: IEdtContent = {
      date: undefined,
      day: undefined,
      morning: undefined,
      afternoon: undefined
    };

    row.forEach((value: any, i: number) => {
      while (!header[i] && i > 0) { i--; }
      const fieldName = translateFieldName(header[i]);
      if (fieldName === "date") {
        obj[fieldName] = new Date((value - 2) * 24 * 3600 * 1000 + Date.parse('1900-01-01'));
      } else {
        obj[translateFieldName(header[i])] = value;
      }
    });
    return obj;
  });

  return objectDatas;
};