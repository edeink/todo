// import fastJson from 'fast-json-stringify';
// >2d 13:20 [A, B] 所有的[格式](www.baidu.com) *能* **否** ***正*** `常` ~~展~~ 示？

const stringify = function (array) {
    let newArray = [];
    array.forEach((eachData) => {
        newArray.push({
            value: eachData.value
        });
    });
    return JSON.stringify(newArray) ;
};

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

export {stringify, parse};