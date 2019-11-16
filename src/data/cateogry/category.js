export default class CategoryData {
    constructor(key, value, config = {}) {
        this.key = key; // 保存的key
        this.value = value; // 显示的文案
        this.active = config.active || false; // 是否激活
    }

    getKey() {
        return this.key;
    }

    isActive() {
        return this.active;
    }
}