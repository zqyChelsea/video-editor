# 简易AI生成并编辑视频网站设计文档

## 项目概述
该项目旨在创建一个用户友好的网站，允许用户上传PDF或PPTX文件，系统将通过调用Kiwi AI API生成视频脚本，并提供编辑和视频制作功能。

## 功能需求

1. **文件上传**
   - 用户可以通过前端界面上传PDF或PPTX文件。

2. **脚本生成**
   - 系统调用Kiwi AI API读取上传的文件，并生成视频脚本，脚本以JSON格式存储。

3. **脚本查看与编辑**
   - 用户可以查看每一页幻灯片对应的脚本，并通过API修改脚本，直到满意为止。

4. **字幕添加与时间轴**
   - 脚本完成后，用户点击按钮进入新页面，左侧为添加字幕的区域，右侧显示课件和时间轴。

5. **声音生成与字幕添加**
   - 用户的所有脚本句子将被拆分，用户可以在左侧调用API生成每个句子的声音，并添加字幕。

6. **视频编辑**
   - 右侧显示课件和时间轴，用户可以进行视频编辑。

## 技术栈
- 前端：React.js / Vue.js
- 后端：Node.js / Python Flask
- 数据库：MongoDB / PostgreSQL
- API：Kiwi AI API

## 项目结构

/video-generator
│
├── /frontend                  # 前端代码
│   ├── /src
│   │   ├── /components        # 组件
│   │   ├── /pages             # 页面
│   │   ├── /services          # API服务
│   │   └── App.js             # 主应用文件
│   └── package.json           # 前端依赖
│
├── /backend                   # 后端代码
│   ├── /controllers           # 控制器
│   ├── /models                # 数据模型
│   ├── /routes                # 路由
│   ├── /services              # API服务
│   └── server.js              # 服务器入口文件
│
├── /uploads                   # 上传的文件存储
│
├── /scripts                   # 脚本生成与处理
│
└── README.md                  # 项目说明文件