import axios from "axios";

class MenuRepository {
    public async getCrousRUWebPage(): Promise<any> {
        return await axios.get("https://www.crous-lille.fr/restaurant/r-u-chatillon-lille-centre/");
    }
}

export default new MenuRepository();