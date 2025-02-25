const express = require('express');
const multer = require('multer');
const router = express.Router();
const fileController = require('../controllers/fileController');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 50 * 1024 * 1024, // 100MB 限制
    }
});

// 文件上传路由
router.post('/upload', upload.single('file'), fileController.uploadFile);

// 获取脚本
router.get('/script/:id', fileController.getScript);

// 编辑脚本
router.post('/script/:id', fileController.updateScript);

// 生成音频（模拟每个句子的音频生成）
router.post('/generateAudio', fileController.generateAudio);

// 添加生成脚本路由
router.post('/generate-script', fileController.generateScript);

// 添加重新生成脚本路由
router.post('/regenerate-script', fileController.regenerateScript);

router.get('/files/:id', fileController.getFileInfo);

// 获取所有文件列表
router.get('/files', fileController.getAllFiles);

module.exports = router; 