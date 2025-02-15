const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

const API_URL = "https://api.kiwiai.cc/v1/chat/completions";
const API_KEY = "sk-BgKY1jaYh7yLFIRGW06yOziHg21pDcvwGqLJGGHDmKbbtEQz";

async function readPromptFile(filename) {
    try {
        const promptPath = path.join(__dirname, filename);
        return await fs.readFile(promptPath, 'utf8');
    } catch (error) {
        console.error(`读取 ${filename} 失败:`, error);
        throw error;
    }
}

async function callKiwiAPI(prompt) {
    console.log('正在调用 Kiwi AI API...');
    console.log('Prompt:', prompt);
    
    try {
        const response = await axios.post(API_URL, {
            model: "o1-preview-2024-09-12",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('API 响应:', response.data);
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Kiwi AI API 调用失败:', error.response?.data || error.message);
        throw error;
    }
}

// PPT 解析函数
exports.parsePPTFile = async function(filePath) {
    console.log('开始解析 PPT 文件:', filePath);
    try {
        // 创建输出文件路径
        const outputPath = path.join(__dirname, '../temp', `${Date.now()}_output.txt`);
        
        // 确保temp目录存在
        await fs.mkdir(path.join(__dirname, '../temp'), { recursive: true });
        
        // 调用Python脚本
        const result = await new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', [
                path.join(__dirname, '../scripts/pptx_parser.py'),
                filePath,
                outputPath
            ]);
            
            let errorOutput = '';
            
            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            pythonProcess.on('close', async (code) => {
                if (code !== 0) {
                    reject(new Error(`Python脚本执行失败: ${errorOutput}`));
                    return;
                }
                
                try {
                    // 读取生成的文本文件
                    const text = await fs.readFile(outputPath, 'utf8');
                    
                    // 解析文本内容
                    const slides = text.split(/===\s*幻灯片\s*\d+\s*===/)
                        .filter(content => content.trim())
                        .map((content, index) => ({
                            title: `幻灯片 ${index + 1}`,
                            content: content.trim()
                        }));
                    
                    resolve({ slides });
                    
                    // 清理临时文件
                    await fs.unlink(outputPath).catch(console.error);
                } catch (err) {
                    reject(err);
                }
            });
        });
        
        console.log('PPT 解析结果:', result);
        return result;
        
    } catch (error) {
        console.error('PPT 解析错误:', error);
        throw new Error('PPT 解析失败: ' + error.message);
    }
};

// 生成大纲函数
exports.generateOutline = async function(pptContent) {
    console.log('开始生成大纲');
    console.log('PPT 内容:', pptContent);

    try {
        const promptPath = path.join(__dirname, 'prompt1.txt');
        const prompt = await fs.readFile(promptPath, 'utf8');
        
        console.log('发送请求到 Kiwi AI');
        const response = await axios.post(API_URL, {
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: prompt
                },
                {
                    role: "user",
                    content: JSON.stringify(pptContent)
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Kiwi AI 响应:', response.data);
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('生成大纲错误:', error);
        if (error.response) {
            console.error('API 错误响应:', error.response.data);
        }
        throw new Error('生成大纲失败: ' + error.message);
    }
};

// 生成脚本函数
exports.generateScript = async function(pptContent, outline) {
    console.log('开始生成脚本');
    console.log('PPT 内容:', pptContent);
    console.log('大纲内容:', outline);

    try {
        const promptPath = path.join(__dirname, 'prompt2.txt');
        const prompt = await fs.readFile(promptPath, 'utf8');
        
        console.log('发送请求到 Kiwi AI');
        const response = await axios.post(API_URL, {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: prompt
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        pptContent: pptContent,
                        outline: outline
                    })
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Kiwi AI 响应:', response.data);
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('生成脚本错误:', error);
        if (error.response) {
            console.error('API 错误响应:', error.response.data);
        }
        throw new Error('生成脚本失败: ' + error.message);
    }
}; 