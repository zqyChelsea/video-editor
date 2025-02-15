import React from 'react';

function VideoEditor() {
  return (
    <div>
      <h1>视频编辑</h1>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '30%', borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          <h2>添加字幕</h2>
          {/* 这里可以进一步扩展音频生成及字幕同步功能 */}
          <p>字幕区域 (功能待添加)</p>
        </div>
        <div style={{ width: '70%', paddingLeft: '10px' }}>
          <h2>课件与时间轴</h2>
          <p>视频编辑区域 (功能待添加)</p>
        </div>
      </div>
    </div>
  );
}

export default VideoEditor; 