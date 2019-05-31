const TODO_CONFIG = {
    LIMIT_WORDS: 24, // 允许输入的字
    // 默认分类
    CATEGORY : [
        {key: 'work', value: '工作'},
        {key: 'home', value: '家庭'},
        {key: 'study', value: '学习'},
        {key: 'other', value: '其它'}
    ],
    // 存储的key值
    TODO_KEY: 'todo',
    DONE_KEY: 'done',
}

export default TODO_CONFIG;