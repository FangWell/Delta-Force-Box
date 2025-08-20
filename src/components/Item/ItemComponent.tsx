import React from 'react';
import { Item, CATEGORY_NAMES } from '../../types';
import { calculateItemPosition, QUALITY_COLORS } from '../../utils/gameLogic';
import styles from './ItemComponent.module.scss';

interface ItemComponentProps {
  item: Item;
  pos: [number, number];
  size: [number, number];
  onClick?: () => void;
}

const ItemComponent: React.FC<ItemComponentProps> = ({ 
  item, 
  pos, 
  size, 
  onClick 
}) => {
  const position = calculateItemPosition(pos, size);
  const backgroundColor = QUALITY_COLORS[item.quality] || '#9E9E9E';
  
  // 质量名称映射
  const qualityNames = {
    1: '白',
    2: '绿', 
    3: '蓝',
    4: '紫',
    5: '金',
    6: '红'
  };
  
  return (
    <div 
      className={styles.item}
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        backgroundColor
      }}
      onClick={onClick}
      title={`${item.name} - ${item.desc} [${CATEGORY_NAMES[item.category] || '未知分类'}]`}
    >
      <div className={styles.itemContent}>
        <span className={styles.itemName}>{item.name}</span>
        <span className={styles.itemQuality}>{qualityNames[item.quality] || '白'}</span>
        <span className={styles.itemCategory}>{CATEGORY_NAMES[item.category] || '未知'}</span>
      </div>
    </div>
  );
};

export default ItemComponent;
