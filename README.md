# Harmonizer Platform

该项目提供了一个将 2D 图片与 3D 模型融合渲染的平台，方便用户根据背景图片手动自定义调整模型的角度，并通过图像和谐化模型进行优化。

- `server` 文件夹为后端相关代码，包括路由导航、模型加载等
- `ui` 文件夹为前端相关代码

和谐化部分的算法实现以及模型权重文件来自 Zhanghan Ke 等人的论文 “[Harmonizer: Learning to Perform White-Box Image and Video Harmonization](https://github.com/ZHKKKe/Harmonizer)”

## 构建前端网页
```
cd ui
yarn install
yarn build
```

## 安装后端依赖
```
pip install -r requirements.txt
```

## 启动服务
```
python launch.py
```
