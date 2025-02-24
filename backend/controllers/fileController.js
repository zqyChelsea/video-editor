const fs = require('fs').promises;
const path = require('path');
const { parsePPTFile, generateOutline, generateScript } = require('../services/kiwiService');
const pool = require('../database');

let scripts = {};  // key: 脚本ID, value: 脚本内容

exports.uploadFile = async (req, res) => {
    let connection;
    let fileId;

    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有上传文件' });
        }

        connection = await pool.getConnection();
        
        // 保存文件信息到数据库
        const [result] = await connection.execute(
            'INSERT INTO files (original_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?)',
            [
                req.file.originalname,
                req.file.path,
                req.file.mimetype.substring(0, 50), // 限制类型长度
                req.file.size
            ]
        );

        fileId = result.insertId;

        // 解析PPT文件
        const outputPath = path.join(__dirname, '../temp', `${fileId}_output.txt`);
        const pptContent = await parsePPTFile(req.file.path, outputPath);

        // 生成大纲
        const outline = await generateOutline(pptContent);
        console.log('生成的大纲:', outline);

        // 更新数据库中的大纲
        await connection.execute(
            'UPDATE files SET outline_json = ?, status = ? WHERE id = ?',
            [outline, 'processed', fileId]
        );

        res.json({
            message: '文件上传成功',
            fileId: fileId,
            data: {
                outline: outline,
                pptContent: pptContent
            }
        });

    } catch (error) {
        console.error('处理上传文件错误:', error);
        
        // 如果fileId存在，更新错误状态
        if (fileId && connection) {
            try {
                await connection.execute(
                    'UPDATE files SET status = ? WHERE id = ?',
                    ['error', fileId]
                );
            } catch (updateError) {
                console.error('更新状态错误:', updateError);
            }
        }

        res.status(500).json({
            error: '处理文件失败: ' + error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.getScript = (req, res) => {
  const id = req.params.id;
  if (!scripts[id]) {
    return res.status(404).json({ error: '未找到脚本' });
  }
  res.json({ id: id, script: scripts[id] });
};

exports.updateScript = (req, res) => {
  const id = req.params.id;
  if (!scripts[id]) {
    return res.status(404).json({ error: '未找到脚本' });
  }
  // 用请求体中的新脚本替换旧的
  scripts[id] = req.body.script;
  res.json({ id: id, script: scripts[id] });
};

exports.generateAudio = (req, res) => {
  // 模拟生成音频逻辑，实际项目中可以调用音频生成 API
  const { sentence } = req.body;
  res.json({ audioUrl: 'http://example.com/generated-audio.mp3', sentence });
};

exports.generateScript = async (req, res) => {
    const { fileId, pptContent, outline } = req.body;
    let connection;

    try {
        if (!fileId || !pptContent || !outline) {
            return res.status(400).json({
                error: '缺少必要参数'
            });
        }

        connection = await pool.getConnection();
        
        // 生成脚本
        const script = await generateScript(pptContent, outline);
        console.log('生成的脚本:', script); // 添加日志

        // 确保script不是undefined
        if (!script) {
            throw new Error('脚本生成失败');
        }

        // 更新数据库中的脚本
        await connection.execute(
            'UPDATE files SET script_json = ? WHERE id = ?',
            [JSON.stringify(script), fileId] // 确保存储为JSON字符串
        );

        res.json({
            message: '脚本生成成功',
            script: script
        });

    } catch (error) {
        console.error('生成脚本错误:', error);
        res.status(500).json({
            error: '生成脚本失败: ' + error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.regenerateScript = async (req, res) => {
    try {
        const { pageIndex, requirement, pptContent, outline } = req.body;
        
        if (pageIndex === undefined || !pptContent || !outline) {
            return res.status(400).json({ 
                error: '缺少必要的参数' 
            });
        }

        console.log('开始重新生成脚本');
        const script = await generateScript(pptContent[pageIndex], outline[pageIndex], requirement);
        
        res.json({ 
            message: '脚本重新生成成功',
            script: script 
        });
    } catch (error) {
        console.error('重新生成脚本错误:', error);
        res.status(500).json({ 
            error: '重新生成脚本失败: ' + error.message 
        });
    }
};

// 获取文件信息
exports.getFileInfo = async (req, res) => {
    const fileId = req.params.id;
    
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM files WHERE id = ?',
            [fileId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: '文件不存在' });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('获取文件信息错误:', error);
        res.status(500).json({
            error: '获取文件信息失败: ' + error.message
        });
    } finally {
        connection.release();
    }
}; 