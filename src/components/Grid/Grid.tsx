import React, { useState, useEffect } from 'react';
import { getResponsiveGridConfig } from '../../utils/gameLogic';
import styles from './Grid.module.scss';

interface GridProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
}

const Grid: React.FC<GridProps> = ({ 
  children, 
  width, 
  height 
}) => {
  const [gridConfig, setGridConfig] = useState(() => getResponsiveGridConfig());

  useEffect(() => {
    const handleResize = () => {
      setGridConfig(getResponsiveGridConfig());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gridWidth = width || gridConfig.GRID_SIZE;
  const gridHeight = height || gridConfig.GRID_SIZE;

  // 创建指定尺寸网格的单元格
  const cells = [];
  for (let i = 0; i < gridWidth * gridHeight; i++) {
    cells.push(
      <div key={i} className={styles.cell} />
    );
  }

  return (
    <div 
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${gridWidth}, ${gridConfig.CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${gridHeight}, ${gridConfig.CELL_SIZE}px)`,
        gap: `${gridConfig.GAP}px`,
        padding: `${gridConfig.PADDING}px`,
      }}
    >
      {cells}
      {children}
    </div>
  );
};

export default Grid;
