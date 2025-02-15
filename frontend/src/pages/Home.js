import React, { useState } from 'react';

function Home() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setUploadStatus(`上传成功，脚本ID：${data.id}`);
      console.log('生成的脚本：', data.script);
    } catch (error) {
      console.error(error);
      setUploadStatus('上传失败');
    }
  };

  return (
    <div>
      <h1>文件上传</h1>
      <input type="file" accept=".pdf,.pptx" onChange={handleFileChange} />
      <button onClick={handleUpload}>上传文件</button>
      <p>{uploadStatus}</p>
    </div>
  );
}

export default Home; 