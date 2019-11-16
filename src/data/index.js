import ListData from "./list/data";
import CategoryData from "./cateogry/category";

const DEFAULT_DATA = {
    string: '',
    detail: {
        done: false,
    }
};

export default class DAO {
    static readData(queryCondition) {
        switch (queryCondition.category) {
            case 'default': {
                return [
                    new ListData('你好啊，兄弟', {
                        detail: {
                            done: false,
                        }
                    }),
                ];
            }
            case 'others': {
                return [
                    new ListData( '老子今天不上班', {
                        detail:  {
                            done: true
                        }
                    }),
                ];
            }
            default: return null;
        }
    }

    static readCategory() {
        return [
            new CategoryData('default', '默认'),
            new CategoryData('others', '其它', {active: true}),
        ]
    }

    static createData(data) {
        return new ListData(data);
    }
}