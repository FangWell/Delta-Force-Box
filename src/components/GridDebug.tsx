import React, { useState, useEffect } from 'react';
import { getResponsiveGridConfig } from '../utils/gameLogic';

const GridDebug: React.FC = () => {
  const [gridConfig, setGridConfig] = useState(() => getResponsiveGridConfig());
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setGridConfig(getResponsiveGridConfig());
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // 键盘快捷键：按 D 键切换显示/隐藏
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'd' || event.key === 'D') {
        // 只有在没有输入框获得焦点时才触发
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // 计算网格总尺寸
  const totalGridWidth = gridConfig.GRID_SIZE * gridConfig.CELL_SIZE + 
                        (gridConfig.GRID_SIZE - 1) * gridConfig.GAP + 
                        gridConfig.PADDING * 2;
  
  const totalGridHeight = gridConfig.GRID_SIZE * gridConfig.CELL_SIZE + 
                         (gridConfig.GRID_SIZE - 1) * gridConfig.GAP + 
                         gridConfig.PADDING * 2;

  // 估算所有容器的padding和边距 - 与gameLogic.ts保持一致
  const estimateContainerSpacing = () => {
    let appPadding = 20;
    let containerPadding = 20;
    let gridContainerPadding = 15;
    let reservedSpace = 40; // 增加基础预留空间
    
    if (screenSize.width <= 360) {
      appPadding = 10;  // 增加最小边距
      containerPadding = 10;  // 增加最小边距
      gridContainerPadding = 8;  // 增加最小边距
      reservedSpace = 50;  // 小屏幕需要更多缓冲
    } else if (screenSize.width <= 480) {
      appPadding = 12; // 增加边距
      containerPadding = 12; // 增加边距
      gridContainerPadding = 10; // 增加边距
      reservedSpace = 45;
    } else if (screenSize.width <= 768) {
      appPadding = 15;
      containerPadding = 15;
      gridContainerPadding = 12;
    } else if (screenSize.width <= 1024) {
      appPadding = 18;
      containerPadding = 18;
      gridContainerPadding = 14;
    }
    
    return {
      totalSpacing: (appPadding + containerPadding + gridContainerPadding) * 2 + reservedSpace,
      breakdown: { appPadding, containerPadding, gridContainerPadding, reservedSpace }
    };
  };

  const spacing = estimateContainerSpacing();
  const finalTotalWidth = totalGridWidth + spacing.totalSpacing;

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        title="点击显示调试面板，或按 D 键"
        style={{
          position: 'fixed',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          border: '1px solid #444',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 1001,
          fontFamily: 'monospace',
          transition: 'background 0.2s ease',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.95)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
      >
        调试 (D)
      </button>
    );
  }

  return (
    <>
      {/* 隐藏按钮 */}
      <button
        onClick={() => setIsVisible(false)}
        title="点击隐藏调试面板，或按 D 键"
        style={{
          position: 'fixed',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          border: '1px solid #444',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 1001,
          fontFamily: 'monospace',
          transition: 'background 0.2s ease',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.95)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
      >
        隐藏 (D)
      </button>

      {/* 调试面板 */}
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '11px',
        zIndex: 1000,
        fontFamily: 'monospace',
        minWidth: '240px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid #444',
        transition: 'opacity 0.3s ease'
      }}>
        <div style={{ 
          borderBottom: '1px solid #333', 
          paddingBottom: '8px', 
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <strong>网格调试面板</strong>
          <span style={{ fontSize: '9px', opacity: 0.6 }}>按D键切换</span>
        </div>
        <div><strong>屏幕尺寸:</strong> {screenSize.width} x {screenSize.height}</div>
        <div><strong>网格配置:</strong></div>
        <div>- 单元格: {gridConfig.CELL_SIZE}px</div>
        <div>- 间隙: {gridConfig.GAP}px</div>
        <div>- 内边距: {gridConfig.PADDING}px</div>
        <div><strong>网格总尺寸:</strong></div>
        <div>- 纯网格宽度: {totalGridWidth}px</div>
        <div>- 纯网格高度: {totalGridHeight}px</div>
        <div><strong>容器边距分析:</strong></div>
        <div>- App边距: {spacing.breakdown.appPadding * 2}px</div>
        <div>- Container边距: {spacing.breakdown.containerPadding * 2}px</div>
        <div>- GridContainer边距: {spacing.breakdown.gridContainerPadding * 2}px</div>
        <div>- 视觉缓冲: {spacing.breakdown.reservedSpace}px</div>
        <div>- 总边距: {spacing.totalSpacing}px</div>
        <div><strong>最终计算:</strong></div>
        <div>- 总需求宽度: {finalTotalWidth}px</div>
        <div>- 剩余空间: {screenSize.width - finalTotalWidth}px</div>
        <div style={{ 
          color: (finalTotalWidth > screenSize.width) ? '#ff4757' : '#2ed573' 
        }}>
          <strong>适配状态:</strong> {
            finalTotalWidth <= screenSize.width 
              ? '✓ 完全适配' : '✗ 宽度超出'
          }
        </div>
        <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>
          * 增强视觉缓冲，防止边框紧贴屏幕边缘
        </div>
      </div>
    </>
  );
};

export default GridDebug;
