# 简介

一个超简洁的Electron应用

其灵感来源于@seal的`不再咬手手`。

![TODO](https://edeity.oss-cn-shenzhen.aliyuncs.com/public/todo.jpg)

## 下载安装

- 不定期发布

- [百度网盘](https://pan.baidu.com/s/1_ATx2kpTuqLoDP9BSHNNrg)：提取码: `i43x`
  - 若链接失效，请通知作者



————————————————————————开发相关——————————————————————



## 调试 或 构建

```shell
# 请勿使用npm

yarn # install deps 安装依赖

# 调试
yarn start # web页面调试
NODE_ENV=development electron .  # electron页面调试

# 构建
yarn clear # 清除旧代码
yarn build-web # 生成chrome插件
electron-builder # 生成electron应用

# 发布页面
yarn deploy # 发布github pages
```

## 功能

- [ ] UIL操作
  - [x] 基本操作
    - [x] 输入、显示、拖拽
  - [ ] 快捷键
    - [x] `Ctrl + Shift + D`：显示隐藏
    - [ ] `CTRL + Z`：事务级别的**Redo**、**Undo**等
- [ ] 分类
  - [x] 预置、未完成/已完成、自定义
  - [ ] 日期或时间分类
- [ ] 存储
  - [x] 持久化、导入导出
  - [ ] 后端同步
- [ ] 系统
  - [x] chrome插件
  - [ ] 系统提醒
  - [x] 系统托盘
  - [ ] 图标
- [x] 显示
  - [x] 主题色：
    - 黑色
    - 白色
  - [x] 简单的语法
    - 标签：`[A][B]`
    - 超链接：`[baidu](https://www.baidu.com)`
  - [ ] 行级富文本编辑器
- [ ] 发布
  - [ ] 自动更新
  - [ ] 持续集成
  - [ ] Github Release

## 其他

- 加速下载`Electron`（`.zshrc`或`.bashrc`配置文件）

```bash
export ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/"
```

由于未知的BUG，7.x版本的Electron暂时需要全局安装

```bash
yarn add electron --global
```

- 更新所有旧的依赖项

```bash
yarn upgrade-interactive [--latest]
```





重构：

- 分离数据和视图
- 拆分组件（合并Undo和Todo、解耦）