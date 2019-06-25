import TODO_CONFIG from '../config';
import PARSER_TEST from './parser_test';

const TOKEN_TYPE = {
    TIME: 'time',
    TAG: 'tag',
    TEXT: 'text',
    // 以下为MD的格式
    HYPERLINK: 'hyperlink',
    CODE: 'code',
    ITALIC: 'italic',
    EM: 'em',
    EM_ITALIC: 'em-italic',
    DELETE: 'delete',
};

export {TOKEN_TYPE};

const SPECIAL_SYMBOL = {
    LEFT_QUOTE: '[',
    RIGHT_QUOTE: ']',
    TIME: '>',
    COMMA: ',',
    LEFT_SMALL_QUOTE: '(',
    RIGHT_SMALL_QUOTE: ')',
    GRAVE_ACCENT: '`',
    STAR: '*',
    WAVE: '~',
};
const pauseSymbol = ['[', ']', '>', '`', '*', '~'];

/**
 *  基本格式：
 *  自定义命令 + 正文内容
 *  eg: >2d 15:13 [tag1, tag2] your plan
 *
 *  自定义命令：
 *   - >2d 15:30 >日期 时间
 *      - >2d: 两天之后
 *      - >ed: 每天
 *      - >ew-3: 每周三
 *   - [xxx, xxx, xxx]:tag
 *
 *  正文内容支持局部的MD格式：
 *   - **XXX** // 强调
 *   - [xxx](http://www.baidu.com) // 链接
 *    - `xxx` // 代码块
 *   - ~~xxx~~ // 删除线
 *   - *xxx* // italic
 *   - **xxx** // 强调
 *   - ***xxx*** // 强调 & italic
 *
 * 每个单元的返回的通用结果：
 * result: {
 *     startIndex: xxx,
 *     endIndex: xxx,
 *     key: xxx, // 代表所属语义
 *     content: xxx,
 *     data: {
 *         value: ''
 *     }
 * }
 */

const parser = {
    // 将用户输入解析为Todo识别的数据
    parse(txt, closeTips) {
        if (typeof txt !== 'string' || txt.length === 0) {
            if (closeTips !== true) {
                console.log('输入的数据有误，请确保输入源为非空字符串');
            }
            return false;
        }
        txt = txt.trim();
        let length = txt.length;
        let offset = 0;
        let collection = [];
        let startTextIndex = -1;
        // 逐字解析
        while (offset < length) {
            const result = parser.analyze(txt, offset);
            if (result) {
                let nextOffset = result.end + 1;
                if (nextOffset <= offset) {
                    offset = offset + 1;
                    if (closeTips !== true) {
                        console.log(`解析错误: ${txt}, ${offset}`)
                    }
                } else {
                    // 处理正常文字流
                    if (startTextIndex !== -1) {
                        let textResult = parser.getText(txt, startTextIndex, offset - 1);
                        collection.push(textResult);
                        startTextIndex = -1;
                    }
                    offset = nextOffset;
                }
                collection.push(result);
            } else {
                if (startTextIndex === -1) {
                    startTextIndex = offset;
                }
                offset = offset + 1;
            }
        }
        // 处理正常文字流
        if (startTextIndex !== -1) {
            let textResult = parser.getText(txt, startTextIndex);
            collection.push(textResult);
        }
        // 默认完整的解析在第一个结构中
        collection[0][TODO_CONFIG.RENDER_STRING_KEY] = explain.getMessage(collection);
        if(closeTips !== true) {
            // console.log(`执行解析数据: ${txt}`);
            console.log(`txt: ${txt}, parseData:`, collection);
        }
        return collection;
    },
    analyze(txt, offset) {
        let symbol = txt[offset];
        let result = null;

        let isFind = pauseSymbol.indexOf(symbol) !== -1;
        if (isFind) {
            switch (symbol) {
                case SPECIAL_SYMBOL.LEFT_QUOTE: {
                    result = parser.quoteParse(txt, offset);
                    break;
                }
                case SPECIAL_SYMBOL.TIME: {
                    result = parser.timeParse(txt, offset);
                    break;
                }
                case SPECIAL_SYMBOL.GRAVE_ACCENT: {
                    result = parser.codeParse(txt, offset);
                    break;
                }
                case SPECIAL_SYMBOL.STAR: {
                    result = parser.emParse(txt, offset);
                    break;
                }
                case SPECIAL_SYMBOL.WAVE: {
                    result = parser.delLineParse(txt, offset);
                    break;
                }
                default: {
                    // do nothing
                }
            }
        }

        return result;
    },
    getText(txt, offset, nextOffset) {
        if (typeof nextOffset !== 'undefined') {
            const content = txt.substring(offset, nextOffset + 1);
            return {
                begin: offset,
                end: nextOffset,
                key: TOKEN_TYPE.TEXT,
                content,
                data: {
                    value: content
                }
            }
        } else {
            const content = txt.substr(offset);
            return {
                begin: offset,
                end: txt.length - 1,
                key: TOKEN_TYPE.TEXT,
                content,
                data: {
                    value: content
                }
            }
        }
    },
    // 删除线
    delLineParse(txt, offset) {
        txt = txt.substr(offset);
        if (txt[1] !== SPECIAL_SYMBOL.WAVE) {
            return null;
        }
        let end = txt.indexOf('~~', 3);
        if (end === -1) {
            return null;
        }
        return {
            begin: offset,
            end: end + offset + 1,
            key: TOKEN_TYPE.DELETE,
            content: txt.substring(0, end + 2),
            data: {
                value: txt.substring(2, end),
            }
        }
    },
    // 加强等级
    emParse(txt, offset) {
        txt = txt.substr(offset);
        let end = 0;
        let key = null;
        let content = null;
        let value = null;

        // 期望加强等级
        let expectLevel = 0;
        if (txt[1] === SPECIAL_SYMBOL.STAR) {
            if (txt[2] === SPECIAL_SYMBOL.STAR) {
                expectLevel = 2;
            } else {
                expectLevel = 1;
            }
        }
        // 实际加强等级
        let realLevel = -1;

        // 以下代码暂不循环了，罗列所有情况，这样直观一点
        switch (expectLevel) {
            case 0: {
                end = txt.indexOf('*', 2);
                if (end !== -1) {
                    realLevel = 0;
                }
                break;
            }
            case 1: {
                end = txt.indexOf('**', 3);
                if (end === -1) {
                    end = txt.indexOf('*', 3);
                    if (end !== -1) {
                        realLevel = 0;
                    }
                } else {
                    realLevel = 1;
                }
                break;
            }
            case 2: {
                end = txt.indexOf('***', 4);
                if (end === -1) {
                    end = txt.indexOf('**', 4);
                    if (end === -1) {
                        end = txt.indexOf('*', 4);
                        if (end !== -1) {
                            realLevel = 0;
                        }
                    } else {
                        realLevel = 1;
                    }
                } else {
                    realLevel = 2;
                }
                break;
            }
            default: // do nothing
        }

        if (realLevel === -1) {
            return null;
        }
        // 最后得出结果
        switch (realLevel) {
            case 0: {
                key = TOKEN_TYPE.ITALIC;
                value = txt.substring(1, end);
                content = txt.substring(0, end + 1);
                break;
            }
            case 1: {
                key = TOKEN_TYPE.EM;
                value = txt.substring(2, end);
                end = end + 1;
                content = txt.substring(0, end + 1);
                break;
            }
            case 2: {
                key = TOKEN_TYPE.EM_ITALIC;
                value = txt.substring(3, end);
                end = end + 2;
                content = txt.substring(0, end + 1);
                break;
            }
            default: // do nothing
        }
        return {
            begin: offset,
            end: end + offset,
            key,
            content,
            data: {value}
        }
    },
    // 代码块
    codeParse(txt, offset) {
        txt = txt.substr(offset);
        let end = 0;

        end = txt.indexOf(SPECIAL_SYMBOL.GRAVE_ACCENT, 2);

        if (end === -1) {
            return null;
        } else {
            return {
                begin: offset,
                end: end + offset,
                key: TOKEN_TYPE.CODE,
                content: txt.substring(0, end + 1),
                data: {
                    value: txt.substring(1, end)
                }
            }
        }
    },
    quoteParse(txt, offset) {
        txt = txt.substr(offset);
        let end = 0;
        let content = null;
        let data = null;
        let key = TOKEN_TYPE.TAG;

        end = txt.indexOf(SPECIAL_SYMBOL.RIGHT_QUOTE);

        if (end === -1) {
            return null
        }

        content = txt.substring(0, end + 1);
        let preData = txt.substring(1, end);
        // 假如是超链接
        if (txt[end + 1] === SPECIAL_SYMBOL.LEFT_SMALL_QUOTE) {
            let endSmall = txt.indexOf(SPECIAL_SYMBOL.RIGHT_SMALL_QUOTE);
            if (endSmall !== -1) {
                content = txt.substring(0, endSmall + 1);
                key = TOKEN_TYPE.HYPERLINK;
                data = {
                    value: txt.substring(1, end),
                    link: txt.substring(end + 2, endSmall),
                };
                end = endSmall;
            }
            return {
                begin: offset,
                end: end + offset,
                key,
                content,
                data
            }
        } else {
            // 是普通分类
            let tags = preData.split(SPECIAL_SYMBOL.COMMA);
            tags = tags.map((eachData) => {
                return eachData.trim();
            });
            return {
                begin: offset,
                end: end + offset,
                key,
                content,
                data: {
                    tags,
                    value: tags.join('、')
                }
            }
        }
    },
    // 时间
    timeParse(txt, offset) {
        txt = txt.substr(offset);
        let firIndex = txt.indexOf(' ');
        let secIndex = txt.indexOf(' ', firIndex + 1);
        let delay = txt.substring(offset + 1, firIndex); // 推迟的时间

        if (secIndex !== -1) {
            let clock = txt.substring(firIndex + 1, secIndex); // 选中的时间
            let timeStamp = explain.getTimeStamp(delay, clock);
            return {
                begin: offset,
                end: secIndex + offset,
                content: txt.substring(0, secIndex),
                key: TOKEN_TYPE.TIME,
                data: {
                    delay,
                    clock,
                    timeStamp,
                    value: clock
                }
            }
        } else {
            // 处理只有>，后面无命令的情况
            if (txt[1] === ' ') {
                return;
            }
            let timeStamp = explain.getTimeStamp(delay);
            return {
                begin: offset,
                end: firIndex + offset,
                content: txt.substring(0, firIndex),
                key: TOKEN_TYPE.TIME,
                data: {
                    delay,
                    timeStamp,
                }
            }
        }

    },
    test() {
        PARSER_TEST.forEach(function (eachData) {
            parser.parse(eachData);
        });
    }
};

const TIME_UNIT = {
    MINUTE: 'm',
    HOURS: 'h',
    DAY: 'd',
    SECOND: 's',
};

const TIME_UNIT_ARRAY = Object.values(TIME_UNIT);

const explain = {
    getTimeStamp(delay, clock) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        let date = now.getDate();
        let hour = now.getHours();
        let minutes = now.getMinutes();
        let second = now.getSeconds();
        // 分析delay
        if (delay) {
            let unit = delay[delay.length - 1];
            let value = null;
            if (TIME_UNIT_ARRAY.indexOf(unit) === -1) {
                unit = TIME_UNIT.DAY;
                value = delay;
            } else {
                value = parseInt(delay.substring(0, delay.length - 1));
            }
            switch (unit) {
                case TIME_UNIT.SECOND: {
                    second += value;
                    break;
                }
                case TIME_UNIT.MINUTE: {
                    minutes += value;
                    break;
                }
                case TIME_UNIT.HOURS: {
                    hour += value;
                    break;
                }
                case TIME_UNIT.DAY:
                default:
                    date += value;
                    break;
            }
        }
        // 分析时间
        if (clock) {
            let clockArray = clock.split(':');
            hour = clockArray[0];
            minutes = clockArray[1];
        }
        let newDate = new Date(year, month, date, hour, minutes, second);
        return newDate.getTime();
    },
    getMessage(collection) {
        let str = '';
        collection.forEach(function (eachBlock) {
            let eachData = eachBlock.data;
            if (eachBlock.key === TOKEN_TYPE.TIME || eachBlock.key === TOKEN_TYPE.TAG) {

            } else {
                str += eachData.value;
            }
        });
        return str;
    },
};

parser.test();

export default parser;