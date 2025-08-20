import React from 'react';
import { GRID_CONFIG } from '../../utils/gameLogic';
import styles from './Grid.module.scss';

interface GridProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
}

const Grid: React.FC<GridProps> = ({ 
  children, 
  width = GRID_CONFIG.GRID_SIZE, 
  height = GRID_CONFIG.GRID_SIZE 
}) => {
  // 创建指定尺寸网格的单元格
  const cells = [];
  for (let i = 0; i < width * height; i++) {
    cells.push(
      <div key={i} className={styles.cell} />
    );
  }

  return (
    <div 
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${width}, ${GRID_CONFIG.CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${height}, ${GRID_CONFIG.CELL_SIZE}px)`,
        gap: `${GRID_CONFIG.GAP}px`,
      }}
    >
      {cells}
      {children}
    </div>
  );
};

export default Grid;
