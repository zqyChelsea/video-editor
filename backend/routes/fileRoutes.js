const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const fileController = require('../controllers/fileController');

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

module.exports = router; 