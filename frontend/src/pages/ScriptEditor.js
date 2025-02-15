import React, { useState } from 'react';

function ScriptEditor() {
  const [scriptId, setScriptId] = useState('');
  const [script, setScript] = useState(null);
  const [scriptText, setScriptText] = useState('');
  const [message, setMessage] = useState('');

  const loadScript = async () => {
    if (!scriptId) return;
    try {
      const response = await fetch(`/api/script/${scriptId}`);
      const data = await response.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setScript(data.script);
        setScriptText(JSON.stringify(data.script, null, 2));
        setMessage('脚本加载成功');
      }
    } catch (error) {
      console.error(error);
      setMessage('加载脚本失败');
    }
  };

  const saveScript = async () => {
    try {
      const updatedScript = JSON.parse(scriptText);
      const response = await fetch(`/api/script/${scriptId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ script: updatedScript })
      });
      const data = await response.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage('脚本保存成功');
      }
    } catch (error) {
      console.error(error);
      setMessage('保存脚本失败');
    }
  };

  return (
    <div>
      <h1>脚本编辑</h1>
      <div>
        <input 
          type="text" 
          placeholder="输入脚本ID" 
          value={scriptId} 
          onChange={(e) => setScriptId(e.target.value)}
        />
        <button onClick={loadScript}>加载脚本</button>
      </div>
      {script && (
        <div>
          <textarea 
            rows="20" 
            cols="80" 
            value={scriptText} 
            onChange={(e) => setScriptText(e.target.value)}
          />
          <br />
          <button onClick={saveScript}>保存编辑</button>
        </div>
      )}
      <p>{message}</p>
    </div>
  );
}

export default ScriptEditor; 