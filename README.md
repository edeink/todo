# 简介

一个超简单的Electron应用

其灵感来源于@seal的`不再咬手手`。

![TODO](https://edeity.oss-cn-shenzhen.aliyuncs.com/public/todo.png)

## 下载安装

-  [百度网盘](https://pan.baidu.com/s/1EcMd2Zbo2Nh96J__-1EBQQ)、提取码: `c1g2`

## 调试 或 构建 

```shell
# 请勿使用npm
yarn # install deps 安装依赖
yarn start & yarn start-app # 调试
yarn clear && yarn build && yarn dist # 构建
```

## 功能

- [x] 基本功能：输入显示

- [x] 拖拽
- [ ] 分类
  - [x] 预置分类
  - [x] 未完成/已完成
  - [ ] 自定义分类
  - [ ] 日期分类
- [ ] 提醒
  - [ ] 闹钟提醒(`>7 12:10`、`>ed 12:10`、`>ew 12:10`)
- [x] 存储
  - [x] 持久化
  - [x] 导入导出
- [ ] 系统
  - [x] 快捷键(`Ctrl + Shift + D`)
  - [ ] 托盘
  - [ ] 图标
  - [ ] 自动更新