import Edt from "./Edt";
import EdtFile from "./EdtFile";

export default interface EdtDb extends EdtFile {
    datas: Edt;
    icsDatas: string | false;
};