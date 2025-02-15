const fs = require('fs').promises;
const path = require('path');
const { parsePPTFile, generateOutline, generateScript } = require('../services/kiwiService');


let scripts = {};  // key: 脚本ID, value: 脚本内容

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有文件上传' });
        }

        
        const pptContent = await parsePPTFile(req.file.path);
        const outline = await generateOutline(pptContent);

        
        const outlinesDir = path.join(__dirname, '../../outlines');
        try {
            await fs.mkdir(outlinesDir, { recursive: true });
        } catch (err) {
            console.log('outlines 目录已存在');
        }

        
        const outlineFileName = `outline_${Date.now()}.json`;
        const outlinePath = path.join(outlinesDir, outlineFileName);
        await fs.writeFile(outlinePath, JSON.stringify(outline, null, 2));

        res.json({
            message: '文件上传成功，大纲已生成',
            data: {
                outline: outline,
                outlineFile: outlineFileName,
                pptContent: pptContent // 可选：如果需要在前端显示PPT内容
            }
        });
    } catch (error) {
        console.error('文件处理错误:', error);
        res.status(500).json({
            error: '文件处理失败',
            details: error.message
        });
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
    try {
        const { pptContent, outline } = req.body;
        
        if (!pptContent || !outline) {
            return res.status(400).json({ 
                error: '缺少必要的参数' 
            });
        }

        console.log('开始生成脚本');
        const script = await generateScript(pptContent, outline);
        
        res.json({ 
            message: '脚本生成成功',
            script: script 
        });
    } catch (error) {
        console.error('生成脚本错误:', error);
        res.status(500).json({ 
            error: '生成脚本失败: ' + error.message 
        });
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