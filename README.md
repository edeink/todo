# 简介

一个超简单的Electron应用

其灵感来源于@seal的`不再咬手手`。

![TODO](https://edeity.oss-cn-shenzhen.aliyuncs.com/public/todo.jpg)

## 下载安装

- [百度网盘](https://pan.baidu.com/s/1_ATx2kpTuqLoDP9BSHNNrg)：提取码: `i43x`
  - 若链接失效，请通知作者

## 调试 或 构建 

```shell
# 请勿使用npm
yarn # install deps 安装依赖
yarn start & yarn start-app # 调试
yarn clear && yarn build && yarn dist # 构建
```

## 功能

- [ ] UIL操作
	- [x] 输入、显示
	- [x] 拖拽
	- [ ] 快捷键
	  - [x] `Ctrl + Shift + D`：显示隐藏
	  - [ ] `CTRL + Z`：撤销
	- [ ] 分类
		- [x] 预置分类
		- [x] 未完成/已完成
		- [ ] 自定义分类
		- [ ] 日期分类
- [ ] 存储
	- [x] 持久化
	- [x] 导入导出
	- [ ] 后端同步
- [ ] 系统
	- [ ] 提醒
	  - [ ] 定时任务
	- [ ] 托盘
	- [ ] 图标
	- [ ] 自动更新
- [ ] 语法
  - [x] 解析
    - [x] 自定义语法
      - 时间：`>7day 13:10 `
      - 标签：`[A, B]`
    - [x] 部分行级Markdown语法
      - 超链接：`[baidu](https://www.baidu.com)`
      - 强调：`*xxx*`、`**xxx**`、`***xxx**&`
      - 修饰：\``code`\`、`~~delete~~`
  - [ ] 输入时高亮