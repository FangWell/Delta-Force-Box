import React from 'react';
import { calculateItemPosition } from '../../utils/gameLogic';
import styles from './Spinner.module.scss';

interface SpinnerProps {
  pos: [number, number];
  size: [number, number];
}

const Spinner: React.FC<SpinnerProps> = ({ pos, size }) => {
  const itemPosition = calculateItemPosition(pos, size);
  
  // 计算旋转器在物品中心的位置
  const spinnerLeft = itemPosition.left + (itemPosition.width / 2) - 15; // 15是旋转器半径
  const spinnerTop = itemPosition.top + (itemPosition.height / 2) - 15;
  
  return (
    <div 
      className={styles.spinner}
      style={{
        left: spinnerLeft,
        top: spinnerTop
      }}
    />
  );
};

export default Spinner;
