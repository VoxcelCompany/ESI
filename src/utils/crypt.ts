var CryptoJS = require("crypto-js");

export const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, process.env.SECRET_KEY).toString();
};

export const decrypt = (hash) => {
    const bytes = CryptoJS.AES.decrypt(hash, process.env.SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};