// import fastJson from 'fast-json-stringify';
import TODO_CONFIG from '../config';

const {RENDER_ACTIVE_KEY, RENDER_STRING_KEY, RENDER_TIME_KEY} = TODO_CONFIG;

// 该方法只针对列表数据，用以过滤不必要的数据
const stringify = function (array) {
    if(array.length === 0) {
        return '[]'
    } else {
        let newArray = [];
        array.forEach((eachData) => {
            let tempData = {
                value: eachData.value,
                [RENDER_ACTIVE_KEY]: eachData[RENDER_ACTIVE_KEY],
                [RENDER_STRING_KEY]: eachData[RENDER_STRING_KEY],
            };
            if (eachData[RENDER_TIME_KEY]) {
                tempData[RENDER_TIME_KEY] = eachData[RENDER_TIME_KEY]
            }
            newArray.push(tempData);
        });
        return JSON.stringify(newArray) ;
    }
};

// 一个包含错误处理的parse
const parse = function(value, defaultValue) {
    let data = null;
    try {
        data = JSON.parse(value);
    } catch (err) {

    }
    if (!data) {
        data = defaultValue;
    }
    return data;
};

const copy = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

export {stringify, parse, copy};