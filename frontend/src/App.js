import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// 上传页面组件
function UploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [outline, setOutline] = useState(null);
  const [pptContent, setPptContent] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 30 * 1024 * 1024) {
      setMessage('文件大小不能超过 30MB');
      return;
    }
    setFile(selectedFile);
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage('请先选择文件');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.message);
      
      if (data.data) {
        setOutline(data.data.outline);
        setPptContent(data.data.pptContent);
      }
    } catch (error) {
      console.error('上传错误:', error);
      setMessage('上传失败：' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanJsonString = (str) => {
    try {
      // 如果已经是对象，直接返回
      if (typeof str === 'object') return str;
      
      // 移除 markdown 代码块标记和多余的空格
      let cleaned = str;
      if (cleaned.includes('```json')) {
        cleaned = cleaned.replace(/```json\s*/, '').replace(/\s*```\s*$/, '');
      }
      
      // 尝试解析 JSON
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('清理 JSON 字符串失败:', error);
      console.log('原始字符串:', str);
      return null;
    }
  };

  const renderOutline = () => {
    if (!outline) return null;
    
    let outlineData;
    try {
      // 如果已经是对象，直接使用
      if (typeof outline === 'object') {
        outlineData = outline;
      } else {
        // 尝试清理和解析 JSON 字符串
        let cleanedStr = outline;
        if (cleanedStr.includes('```json')) {
          cleanedStr = cleanedStr.replace(/```json\s*/, '').replace(/\s*```\s*$/, '');
        }
        outlineData = JSON.parse(cleanedStr);
      }

      // 验证数据结构
      if (!outlineData || !outlineData.slides) {
        console.log('大纲数据:', outlineData);
        return <div className="error-message">大纲数据结构不完整</div>;
      }

      // 继续渲染大纲...
      return (
        <div className="outline-container">
          <h2>演讲大纲</h2>
          {outlineData.slides.map((slide, index) => (
            <div key={index} className="outline-slide">
              <h3>第 {slide.page_number || (index + 1)} 页</h3>
              {slide.subtitle && <h4>{slide.subtitle}</h4>}
              <div className="slide-content">
                {slide.notes && (
                  <div className="slide-notes">
                    <strong>备注：</strong> {slide.notes}
                  </div>
                )}
                <div className="slide-points">
                  {Array.isArray(slide.content) ? (
                    <>
                      <strong>要点：</strong>
                      <ul>
                        {slide.content.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p>{slide.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={handleGenerateScript}
            className="generate-script-btn"
            disabled={isLoading}
          >
            {isLoading ? '正在生成脚本...' : '开始生成脚本'}
          </button>
        </div>
      );
    } catch (error) {
      console.log('原始大纲数据:', outline);
      console.error('处理大纲错误:', error);
      return <div className="error-message">处理大纲时出错: {error.message}</div>;
    }
  };

  const handleGenerateScript = async () => {
    try {
        setIsLoading(true);
        console.log('发送请求数据:', {
            pptContent: pptContent,
            outline: outline
        });

        const response = await fetch('http://localhost:5000/api/generate-script', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pptContent: pptContent,
                outline: cleanJsonString(outline),  // 确保数据格式正确
                fileId: 1  // 如果需要fileId，从之前的上传响应中获取
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('生成脚本响应:', data);

        navigate('/script-editor', { 
            state: { 
                script: data.script,
                pptContent: pptContent,
                outline: outline
            } 
        });
    } catch (error) {
        console.error('生成脚本错误:', error);
        setMessage('生成脚本失败：' + error.message);
    } finally {
        setIsLoading(false);
    }
  };

  // 渲染 PPT 内容的函数
  const renderPPTContent = () => {
    if (!pptContent || !pptContent.slides) return null;
    
    return (
      <div className="ppt-content">
        <h2>PPT 内容</h2>
        <div className="slides-container">
          {pptContent.slides.map((slide, index) => (
            <div key={index} className="slide">
              <h3>幻灯片 {index + 1}</h3>
              <p><strong>标题：</strong> {slide.title}</p>
              <p><strong>内容：</strong> {slide.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="upload-container">
      <h1>AI视频生成器</h1>
      <div className="upload-form">
        <input 
          type="file" 
          accept=".pptx" 
          onChange={handleFileUpload}
          disabled={isLoading}
        />
        <button 
          onClick={handleSubmit} 
          disabled={isLoading || !file}
        >
          {isLoading ? '正在生成大纲...' : '上传并生成大纲'}
        </button>
      </div>
      
      {message && (
        <p className={`message ${message.includes('失败') ? 'error' : 'success'}`}>
          {message}
        </p>
      )}

      <div className="content-container">
        {renderPPTContent()}

        {renderOutline()}
      </div>
    </div>
  );
}

// 添加脚本编辑器组件
function ScriptEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scripts, setScripts] = useState([]);
  const [regenerateRequirements, setRegenerateRequirements] = useState({});
  const [isLoading, setIsLoading] = useState({});

  useEffect(() => {
    if (location.state?.script) {
      const scriptData = typeof location.state.script === 'string' 
        ? JSON.parse(location.state.script) 
        : location.state.script;
      setScripts(scriptData);
    }
  }, [location.state]);

  const handleRegenerateScript = async (pageIndex) => {
    try {
      setIsLoading(prev => ({ ...prev, [pageIndex]: true }));
      
      const response = await fetch('http://localhost:5000/api/regenerate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageIndex,
          requirement: regenerateRequirements[pageIndex],
          pptContent: location.state.pptContent,
          outline: location.state.outline
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setScripts(prev => {
        const newScripts = [...prev];
        newScripts[pageIndex] = data.script;
        return newScripts;
      });
    } catch (error) {
      console.error('重新生成脚本错误:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, [pageIndex]: false }));
    }
  };

  return (
    <div className="script-editor">
      <h1>演讲脚本</h1>
      <div className="script-content">
        {scripts.map((script, index) => (
          <div key={index} className="script-page">
            <h2>第 {index + 1} 页</h2>
            <div className="page-content">
              {script.content}
            </div>
            <div className="regenerate-section">
              <textarea
                placeholder="输入特殊要求..."
                value={regenerateRequirements[index] || ''}
                onChange={(e) => setRegenerateRequirements(prev => ({
                  ...prev,
                  [index]: e.target.value
                }))}
              />
              <button 
                onClick={() => handleRegenerateScript(index)}
                disabled={isLoading[index]}
              >
                {isLoading[index] ? '重新生成中...' : '重新生成'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 主应用组件
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/script-editor" element={<ScriptEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
