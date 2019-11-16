import parser, {TOKEN_TYPE} from './parser';

const CIRCLE_STYLE = {
    ONCE: 0,
    EVERY_DAY: 1,
    EVERY_WEEK: 2,
    EVERY_MONTH: 3,
    CUSTOM: 4,
};

class ListData {
    constructor(string, config = {}) {
        // 初始化对象
        this.timer = {
            startTime: '', // 触发的时间
            circleStyle: CIRCLE_STYLE.ONCE, // 提醒周期
        };

        this.string = string || ''; // 输入的字符串
        this.done = config.done || false; // 是否已完成
        this.category = config.category || []; // 所属的大类
        this.tags = config.tags || []; // 所属的小类

        // 开始解析
        const preData = parser.parse(string); // 格式化的数据集（目前仅支持超链接）
        let formatData = [];
        preData.forEach((eachData) => {
            switch (eachData.type) {
                case TOKEN_TYPE.TAG: {
                    this.tags.push(...eachData.tags);
                    break;
                }
                default: {
                    formatData.push(eachData);
                }
            }
        });
    }

    todo(done) {
        this.done = done;
    }

    isDone() {
        return this.done;
    }

    isActive() {

    }

    getString() {
        return this.string;
    }

    // 获得需要持久化的数据
    getStoreData() {
        return {
            timer: this.timer,
            category: this.category,
            tags: this.tags,
        }
    }
}

// test
new ListData(`[aaa] ( [b,b,b])[ ,abc] def[aa [aaa](b,b,b)`);

export default ListData;