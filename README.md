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
	- [ ] 输入显示
	- [x] 拖拽
- [ ] 分类
	- [x] 预置分类
	- [x] 未完成/已完成
	- [ ] 自定义分类
	- [ ] 日期分类
- [ ] 标签
- [ ] 提醒
	- [ ] 闹钟提醒(`>7 12:10`、`>ed 12:10`、`>ew 12:10`)
- [ ] 存储
	- [x] 持久化
	- [x] 导入导出
	- [ ] 后端同步
- [ ] 快捷键
	- [x] `Ctrl + Shift + D`：显示隐藏
- [ ] 系统
	- [ ] 托盘
	- [ ] 图标
	- [ ] 自动更新