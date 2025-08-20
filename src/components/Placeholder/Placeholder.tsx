import React from 'react';
import { calculateItemPosition } from '../../utils/gameLogic';
import styles from './Placeholder.module.scss';

interface PlaceholderProps {
  pos: [number, number];
  size: [number, number];
}

const Placeholder: React.FC<PlaceholderProps> = ({ pos, size }) => {
  const position = calculateItemPosition(pos, size);
  
  return (
    <div 
      className={styles.placeholder}
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height
      }}
    />
  );
};

export default Placeholder;
