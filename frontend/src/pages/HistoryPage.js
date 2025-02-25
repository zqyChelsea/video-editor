import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HistoryPage() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeTab, setActiveTab] = useState('outline'); // 'outline' 或 'script'
    const navigate = useNavigate();

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/files');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('获取文件列表失败:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('zh-CN');
    };

    const viewScript = (file) => {
        navigate('/script-editor', {
            state: {
                script: file.script,
                pptContent: null,
                outline: file.outline
            }
        });
    };

    const toggleFileDetails = (file) => {
        setSelectedFile(selectedFile?.id === file.id ? null : file);
        setActiveTab('outline'); // 重置为大纲标签
    };

    const renderFileContent = (file) => {
        if (activeTab === 'outline' && file.outline) {
            return (
                <div className="content-preview outline-preview">
                    <h4>课件大纲</h4>
                    {file.outline.slides?.map((slide, index) => (
                        <div key={index} className="slide-preview">
                            <h5>第 {index + 1} 页</h5>
                            {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
                            {slide.notes && <p className="notes">备注: {slide.notes}</p>}
                            {slide.content && (
                                <div className="content">
                                    <strong>内容:</strong>
                                    <ul>
                                        {Array.isArray(slide.content) 
                                            ? slide.content.map((item, i) => <li key={i}>{item}</li>)
                                            : <li>{slide.content}</li>
                                        }
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        } else if (activeTab === 'script' && file.script) {
            return (
                <div className="content-preview script-preview">
                    <h4>生成的脚本</h4>
                    {Array.isArray(file.script) ? file.script.map((scriptItem, index) => (
                        <div key={index} className="script-section">
                            <h5>第 {index + 1} 页</h5>
                            <p>{scriptItem.content || scriptItem}</p>
                        </div>
                    )) : (
                        <p>{JSON.stringify(file.script, null, 2)}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">错误: {error}</div>;

    return (
        <div className="history-container">
            <h1>生成历史</h1>
            <div className="files-list">
                {files.map((file) => (
                    <div key={file.id} className="file-item">
                        <div className="file-info">
                            <div className="file-header" onClick={() => toggleFileDetails(file)}>
                                <h3>{file.original_name}</h3>
                                <p>创建时间: {formatDate(file.created_at)}</p>
                                <p>状态: {file.status}</p>
                            </div>
                            {selectedFile?.id === file.id && (
                                <div className="file-details">
                                    <div className="tabs">
                                        <button 
                                            className={`tab ${activeTab === 'outline' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('outline')}
                                        >
                                            大纲
                                        </button>
                                        <button 
                                            className={`tab ${activeTab === 'script' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('script')}
                                        >
                                            脚本
                                        </button>
                                    </div>
                                    {renderFileContent(file)}
                                </div>
                            )}
                        </div>
                        <div className="file-actions">
                            {file.script && (
                                <button 
                                    onClick={() => viewScript(file)}
                                    className="view-script-btn"
                                >
                                    编辑脚本
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HistoryPage;