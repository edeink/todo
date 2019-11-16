import {parse, stringify} from "../store/json";
import TODO_CONFIG from "../../config";
import parser from "./parser";
import fileHelper from "../../tool/file";

const store = window.localStorage;

const {
    CATEGORY_LIST, STORE_TODO_KEY,
    STORE_DONE_KEY, STORE_CATEGORY_KEY, STORE_ACTIVE_CATEGORY_KEY,
    RENDER_PARSE_KEY, RENDER_STRING_KEY,
    RENDER_TAGS_KEY, RENDER_TIME_KEY,
} = TODO_CONFIG;

const LIST_KEYS = [STORE_TODO_KEY, STORE_DONE_KEY];


const getAntiStoreKey = function (storeKey) {
    return storeKey === STORE_TODO_KEY ? STORE_DONE_KEY : STORE_TODO_KEY;
};

const getRealStoreKey = function (category, key) {
    return `__${category}_${key}`;
};

export default class DataManager {
    static readCategory() {
        const category = parse(store.getItem(STORE_CATEGORY_KEY), CATEGORY_LIST);
        store.setItem(STORE_CATEGORY_KEY, JSON.stringify(category));
        const activeCategoryKey = store.getItem(STORE_ACTIVE_CATEGORY_KEY) || category[0].key;
        return {
            category, activeCategoryKey
        }
    }

    static readData(activeCategoryKey) {
        const newTags = {};
        let data = [];
        LIST_KEYS.forEach((eachKey) => {
            const storeKey = getRealStoreKey(activeCategoryKey, eachKey);
            const tempData = parse(store.getItem(storeKey), []);
            tempData.forEach(function (eachData) {
                if (!eachData[RENDER_PARSE_KEY]) {
                    eachData[RENDER_PARSE_KEY] = parser.parse(eachData.value);
                    // 一般通用数据都放在第一条数据上
                    const firstRenderData = eachData[RENDER_PARSE_KEY][0];
                    eachData[RENDER_STRING_KEY] = firstRenderData[RENDER_STRING_KEY];
                    eachData[RENDER_TAGS_KEY] = firstRenderData[RENDER_TAGS_KEY];
                    eachData[RENDER_TIME_KEY] = eachData[RENDER_TIME_KEY] || firstRenderData[RENDER_TIME_KEY];
                    eachData[RENDER_TAGS_KEY].forEach(function (eachTag) {
                        newTags[eachTag] = true;
                    });
                }
            });
            data[eachKey] = tempData;
        });
        return {
            tags: Object.keys(newTags),
            data,
        }
    }

    // 将缓存的信息保存到配置文件
    static saveData2Config() {
        const {category} = DataManager.readCategory();
        let saveObj = {
            category: category,
            data: {}
        };
        category.forEach((eachCategory) => {
            const {key} = eachCategory;
            LIST_KEYS.forEach(function (eachKey) {
                const tempStoreKey = getRealStoreKey(key, eachKey);
                saveObj.data[tempStoreKey] = parse(store.getItem(tempStoreKey), []);
            });
        });
        fileHelper.save('config.json', JSON.stringify(saveObj));
    }

    // 将配置文件的信息写入缓存
    static saveConfig2Data(category, data) {
        // 保存到缓存中
        store.setItem(STORE_CATEGORY_KEY, JSON.stringify(category));
        let keys = Object.keys(data);
        keys.forEach(function (eachKey) {
            store.setItem(eachKey, stringify(data[eachKey]));
        });
    }
}