export const TOKEN_TYPE = {
    TEXT: 'TEXT',
    TAG: 'TAG',
    HYPERLINK: 'HYPERLINK',
};

const SPECIAL_SYMBOL = {
    LEFT_QUOTE: '[',
    RIGHT_QUOTE: ']',
    LEFT_SMALL_QUOTE: '(',
    RIGHT_SMALL_QUOTE: ')',
    COMMA: ',',
};

const parser = {
    formatData: [],
    stringArray: [],
    parse: function (string) {
        if (typeof string !== 'string') {
            console.error('非法输入：string不是字符串，无法解析', string);
        } else {
            const stringArray = string.split('');
            this.stringArray = stringArray;
            let offset = 0;
            let startTxtIndex = 0;
            let endTxtIndex = 0;
            let startFindRightQuote = false;
            let startFindRightSmallQuote = false;
            let stringLen = stringArray.length;
            let leftQuoteIndex = -1;
            let rightQuoteIndex = -1;
            let leftSmallQuoteIndex = -1;
            let rightSmallQuoteIndex = -1;
            while (offset < stringLen) {
                let tempChar = stringArray[offset];
                // 寻找【左中括号】
                if (!startFindRightQuote && !startFindRightSmallQuote &&
                    tempChar === SPECIAL_SYMBOL.LEFT_QUOTE) {
                    startFindRightQuote = true;
                    leftQuoteIndex = offset;
                    endTxtIndex = offset - 1;
                }
                // 寻找【右中括号】
                else if (startFindRightQuote === true && tempChar === SPECIAL_SYMBOL.RIGHT_QUOTE) {
                    startFindRightQuote = false;
                    rightQuoteIndex = offset;
                    offset += 1;
                    // 寻找【左小括号】
                    tempChar = stringArray[offset];
                    if (tempChar === SPECIAL_SYMBOL.LEFT_SMALL_QUOTE) {
                        startFindRightSmallQuote = true;
                        leftSmallQuoteIndex = offset;
                    } else {
                        this.collectText(startTxtIndex, leftQuoteIndex);
                        this.collectTags(leftQuoteIndex, rightQuoteIndex);
                        leftQuoteIndex = rightQuoteIndex = -1;
                        offset -= 1;
                        startTxtIndex = offset;
                    }
                }
                // 寻找【右小括号】
                else if (startFindRightSmallQuote && tempChar === SPECIAL_SYMBOL.RIGHT_SMALL_QUOTE) {
                    startFindRightSmallQuote = false;
                    this.collectText(startTxtIndex, leftQuoteIndex);
                    this.collectHyperLink(leftQuoteIndex, rightQuoteIndex, leftSmallQuoteIndex, rightSmallQuoteIndex);
                    leftSmallQuoteIndex = rightSmallQuoteIndex = -1;
                    offset += 1;
                    startTxtIndex = offset;
                }

                // 遍历下一个字符
                offset++;
            }
        }
        return this.formatData;
    },
    // 收集纯文本信息
    collectText(startIndex, endIndex) {
        if (endIndex > 0 && startIndex + 1 !== endIndex) {
            this.formatData.push({
                type: TOKEN_TYPE.TEXT,
                text: this.stringArray.slice(startIndex + 1, endIndex).join(''),
            });
        }
    },
    // 收集标签
    collectTags(startIndex, endIndex) {
        if (startIndex !== endIndex) {
            let tempArray = this.stringArray.slice(startIndex + 1, endIndex);
            tempArray = tempArray.join('').split(SPECIAL_SYMBOL.COMMA);
            tempArray = tempArray.filter(function (eachValue) {
                return eachValue.trim() !== '';
            });
            this.formatData.push({
                type: TOKEN_TYPE.TAG,
                tags: tempArray,
            });
        }
    },
    // 收集超链接信息
    collectHyperLink(startIndex, endIndex, startLinkIndex, endLinkIndex) {
        if (startIndex !== endIndex) {
            this.formatData.push({
                type: TOKEN_TYPE.HYPERLINK,
                name : this.stringArray.slice(startIndex + 1, endIndex).join(''),
                link: this.stringArray.slice(startLinkIndex + 1, endLinkIndex).join(''),
            })
        }
    }
};

export default parser;