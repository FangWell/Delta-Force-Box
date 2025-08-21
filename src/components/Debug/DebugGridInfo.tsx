import React, { useState, useEffect } from 'react';
import { getResponsiveGridConfig } from '../../utils/gameLogic';

const DebugGridInfo: React.FC = () => {
  const [config, setConfig] = useState(() => getResponsiveGridConfig());
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setConfig(getResponsiveGridConfig());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 计算网格总宽度
  const totalGridWidth = config.GRID_SIZE * config.CELL_SIZE + 
                        (config.GRID_SIZE - 1) * config.GAP + 
                        config.PADDING * 2;

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      fontFamily: 'monospace'
    }}>
      <div>屏幕宽度: {screenWidth}px</div>
      <div>网格尺寸: {config.CELL_SIZE}px</div>
      <div>间隙: {config.GAP}px</div>
      <div>内边距: {config.PADDING}px</div>
      <div>总宽度: {totalGridWidth}px</div>
      <div style={{ color: totalGridWidth > screenWidth - 40 ? '#ff4757' : '#2ed573' }}>
        适配: {totalGridWidth <= screenWidth - 40 ? '✓' : '✗'}
      </div>
    </div>
  );
};

export default DebugGridInfo;
