const TOKEN_TYPE = {
    TIME: 'time',
    Tag: 'tag',
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
 *  基本格式： >2d 15:13 [tag1, tag2] your plan
 *  属于：自定义命令 + 正文内容
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
 * 每个单元的返回的通用结果
 * result: {
 *     startIndex: xxx,
 *     endIndex: xxx,
 *     key: xxx, // 代表所属语义
 *     content: xxx,
 *     data: '' // 由content转化的data
 * }
 */

const parser = {
    // 将用户输入解析为Todo识别的数据
    parse(txt) {
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
                    console.log(`解析错误: ${txt}, ${offset}`)
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
        console.log(`txt: ${txt}, parseData:`, collection);
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
                    result = parser.starParse(txt, offset);
                    break;
                }
                case SPECIAL_SYMBOL.WAVE: {
                    result = parser.deleteParse(txt, offset);
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
        if(nextOffset) {
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
    deleteParse(txt, offset) {
        txt = txt.substr(offset);
        if(txt[1] !== SPECIAL_SYMBOL.WAVE) {
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
            data: txt.substring(2, end),
        }
    },
    starParse(txt, offset) {
        txt = txt.substr(offset);
        let end = 0;
        let key = null;
        let content = null;
        let data = null;

        // 期望加强等级
        let expectLevel = 0;
        if(txt[1] === SPECIAL_SYMBOL.STAR) {
            if(txt[2] === SPECIAL_SYMBOL.STAR) {
                expectLevel = 2;
            } else {
                expectLevel = 1;
            }
        }
        // 实际加强等级
        let realLevel = -1;

        // 以下代码暂不循环了，罗列所有情况，这样直观一点
        switch(expectLevel) {
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
                        if(end !== -1) {
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

        if(realLevel === -1) {
            return null;
        }
        // 最后得出结果
        switch (realLevel) {
            case 0: {
                key = TOKEN_TYPE.ITALIC;
                data = txt.substring(1, end);
                content = txt.substring(0, end + 1);
                break;
            }
            case 1: {
                key = TOKEN_TYPE.EM;
                data = txt.substring(2, end);
                end = end + 1;
                content = txt.substring(0, end + 1);
                break;
            }
            case 2: {
                key = TOKEN_TYPE.EM_ITALIC;
                data = txt.substring(3, end);
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
            data
        }
    },
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
                data: txt.substring(1, end)
            }
        }
    },
    quoteParse(txt, offset) {
        txt = txt.substr(offset);
        let end = 0;
        let content = null;
        let data = null;
        let key = TOKEN_TYPE.Tag;

        end = txt.indexOf(SPECIAL_SYMBOL.RIGHT_QUOTE);

        if (end === -1) {
            return null
        }

        content = txt.substring(0, end + 1);
        let preData = txt.substring(1, end);
        // 假如是超链接
        if(txt[end + 1] === SPECIAL_SYMBOL.LEFT_SMALL_QUOTE) {
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
        } else {
            // 是普通分类
            data = preData.split(SPECIAL_SYMBOL.COMMA);
            data = data.map((eachData) => {
                return eachData.trim();
            });
        }

        return {
            begin: offset,
            end: end + offset,
            key,
            content,
            data
        }
    },
    timeParse(txt, offset) {
        txt = txt.substr(offset);
        let firIndex = txt.indexOf(' ');
        let secIndex = txt.indexOf(' ', firIndex + 1);
        let delay = txt.substring(offset + 1, firIndex); // 推迟的时间

        if (secIndex !== -1) {
            let clock = txt.substring(firIndex + 1, secIndex); // 选中的时间
            return {
                begin: offset,
                end: secIndex + offset,
                content: txt.substring(0, secIndex),
                key: TOKEN_TYPE.TIME,
                data: {
                    delay,
                    clock
                }
            }
        } else {
            // 处理只有>，后面无命令的情况
            if(txt[1] === ' ') {
                return;
            }
            return {
                begin: offset,
                end: firIndex + offset,
                content: txt.substring(0, firIndex),
                key: TOKEN_TYPE.TIME,
                data: {
                    delay,
                }
            }
        }

    },
    test() {
        const testData = [
            // // 时间
            // '>1s 推迟一秒',
            // '> 15:30 没有推迟时间的时间输入',
            // '> 错误的时间输入',
            // '>ew 15:20 ', // ew会被解析成时间，15:20会被解析成文本
            // '>ew 15:20 后面有字',
            // '巴拉巴拉 >2d 24:30 时间解析不解析', // 应该解析
            // '>2d 13 半个时间',
            // '> 周六 中文的时间',
            // // 分类
            // ' [hahah, lalala] 正常的分类输入',
            // '[ 错误的分类输入',
            // '[只有分类]',
            // '巴拉巴拉 [出现在中间, 的分类] 分类解析不解析', // 应该解析
            // // 超链接
            // '我跟你讲，[baidu](https://www.baidu.com)真的很好用',
            // '假如[分类][链接](https://www.baidu.com)同时存在',
            // 代码
            // '代码`console.log("aa")`部分',
            // '这种情况``应该解析为纯文本',
            // 强调
            // '* italic *文本',
            // '**em ** 强调',
            // '*** italic&em ***强调和意大利',
            // '**fa*', // 应该被解析成Italic，
            // '***fa*', // 应该被解析成Italic
            // '***fa**', // 应该被解析成em
            // '****fa***', // 应该被解析成Italic & em
            // 删除线
            // '~~aaa~~ 你好啊',
            // 完整的功能
            // '>2d 13:20 [A, B] 所有的[格式](www.baidu.com) *能* **否** ***正*** `常` ~~展~~ 示？'
        ];
        testData.forEach(function (eachData) {
            parser.parse(eachData);
        });
    }
};

parser.test();

export default parser;