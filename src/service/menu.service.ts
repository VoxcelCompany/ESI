import MenuRepository from "../repository/menu.repository";
import * as jsdom from "jsdom";
import Menu from "../models/Menu";
import { Moment } from "moment-timezone";
import { getMomentDate } from "../utils/dates";
import { capitalize } from "../utils/stringManager";

class MenuService {
    private crousMenus: Array<Menu> = [];

    public async getDays(format: string = "dddd D MMMM"): Promise<Array<string>> {
        if (this.crousMenus.length === 0) await this.generateCrousMenus();
        return this.crousMenus.map((menu) => capitalize(menu.date.format(format)));
    }

    public async getLastDate(): Promise<Moment> {
        if (this.crousMenus.length === 0) await this.generateCrousMenus();
        if (this.crousMenus.length === 0) return getMomentDate();

        return this.crousMenus[this.crousMenus.length - 1].date;
    }

    public async getDayMenu(date: Moment): Promise<Menu> {
        if (this.crousMenus.length === 0) await this.generateCrousMenus();

        const defaultMenu: Menu = this.getDefaultMenu(date);
        if (this.crousMenus.length === 0) return defaultMenu;

        const dayMenu: Menu = this.crousMenus.find((menu) => menu.date.isSame(date, 'day'));

        return dayMenu ?? defaultMenu;
    }

    public async generateCrousMenus(): Promise<void> {
        const menuDocument: Document = await this.getCrousMenuDocument();

        const menusTitles: Array<string> = this.getWeekMenusTitles(menuDocument);
        const menusMeals: HTMLCollectionOf<Element> = this.getWeekMenusMeals(menuDocument);

        const newCrousMenus: Array<Menu> = [];

        menusTitles.forEach((title: string, index: number) => {
            newCrousMenus.push(this.htmlToMenu(menusMeals[index], this.crousMenuTitleToDate(title)));
        });

        this.crousMenus = newCrousMenus;
    }

    private async getCrousMenuDocument(): Promise<Document> {
        const RUPage = await MenuRepository.getCrousRUWebPage();
        return (new jsdom.JSDOM(RUPage.data)).window.document;
    }

    private getWeekMenusTitles(menuDocument: Document): Array<string> {
        const menusTitlesElements: HTMLCollectionOf<Element> = menuDocument.getElementsByClassName('menu_date_title');
        return Array.from(menusTitlesElements).map(element => element.textContent);
    }

    private getWeekMenusMeals(menuDocument: Document): HTMLCollectionOf<Element> {
        return menuDocument.getElementsByClassName("meal_foodies");
    }

    private htmlToMenu(htmlCollection: Element, date: Moment): Menu {
        let dateLunch = htmlCollection.querySelectorAll("ul");
        let result: Menu = this.getDefaultMenu(date);

        try {
            result.starter = this.clearArrayOfMeals(dateLunch[0].innerHTML.split('</li><li>'));
            result.main = this.clearArrayOfMeals(dateLunch[1].innerHTML.split('</li><li>'));

            result.main.forEach((plat, index) => {
                const dom = new jsdom.JSDOM('<!doctype html><body>' + plat,
                    {contentType: 'text/html'});
                result.main[index] = dom.window.document.querySelector("body").textContent;
            });

        } catch (e) {
            result = this.getDefaultMenu(date);
        }

        return result;
    }

    private clearArrayOfMeals(meals: Array<string>): Array<string> {
        return meals.map(
            (meal: string) => {
                return meal.trim().replace(/<\/?li>/g, "");
            },
        );
    }

    private crousMenuTitleToDate(title: string): Moment {
        const titleWords: Array<string> = title.split(" ");
        return getMomentDate(titleWords.slice(3).join(" "), "LL");
    }

    private getDefaultMenu(date: Moment): Menu {
        return {
            date: date,
            starter: ["entrées non communiquées"],
            main: ["plats non communiqués"],
        };
    };

}

export default new MenuService();