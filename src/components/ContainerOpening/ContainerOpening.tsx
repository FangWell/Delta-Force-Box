import React, { useState, useCallback, useRef, useEffect } from 'react';
import Grid from '../Grid/Grid';
import Placeholder from '../Placeholder/Placeholder';
import Spinner from '../Spinner/Spinner';
import ItemComponent from '../Item/ItemComponent';
import { 
  AssignedItem, 
  GameConfig, 
  Container, 
  Item
} from '../../types';
import {
  generateContainerItems,
  delay,
  QUALITY_DURATIONS,
  QUALITY_COLORS
} from '../../utils/gameLogic';
import styles from './ContainerOpening.module.scss';

interface ContainerOpeningProps {
  gameConfig: GameConfig;
  containerName: string;
  onAnimationStateChange?: (isAnimating: boolean) => void;
}

// 开启状态枚举
enum OpeningState {
  IDLE = 'idle',
  OPENING = 'opening',
  COMPLETED = 'completed'
}

const ContainerOpening: React.FC<ContainerOpeningProps> = ({ 
  gameConfig, 
  containerName,
  onAnimationStateChange
}) => {
  const [assignedItems, setAssignedItems] = useState<AssignedItem[]>([]);
  const [revealedItems, setRevealedItems] = useState<AssignedItem[]>([]);
  const [currentSpinners, setCurrentSpinners] = useState<AssignedItem[]>([]);
  const [openingState, setOpeningState] = useState<OpeningState>(OpeningState.IDLE);
  const [revealedLog, setRevealedLog] = useState<Item[]>([]);
  
  // 用于取消动画的ref
  const animationCancelRef = useRef<boolean>(false);
  const currentContainerRef = useRef<string>(containerName);

  // 当容器切换时，清理状态
  useEffect(() => {
    if (currentContainerRef.current !== containerName) {
      console.log('容器切换，清理状态:', currentContainerRef.current, '->', containerName);
      // 取消当前动画
      animationCancelRef.current = true;
      
      // 通知父组件动画结束
      onAnimationStateChange?.(false);
      
      // 清理所有状态
      setAssignedItems([]);
      setRevealedItems([]);
      setCurrentSpinners([]);
      setOpeningState(OpeningState.IDLE);
      setRevealedLog([]);
      
      // 更新容器引用
      currentContainerRef.current = containerName;
      
      // 重置取消标志
      setTimeout(() => {
        animationCancelRef.current = false;
      }, 100);
    }
  }, [containerName, onAnimationStateChange]);

  // 开始开启容器
  const startOpening = useCallback(async () => {
    if (openingState === OpeningState.OPENING) return;
    
    // 取消之前的动画（如果有的话）
    animationCancelRef.current = true;
    
    // 等待一小段时间确保之前的动画被取消
    await delay(50);
    
    // 重置取消标志
    animationCancelRef.current = false;
    
    setOpeningState(OpeningState.OPENING);
    // 通知父组件动画开始
    onAnimationStateChange?.(true);
    
    setAssignedItems([]);  // 清除之前的分配物品
    setRevealedItems([]);
    setCurrentSpinners([]);
    setRevealedLog([]);
    
    try {
      const container: Container = gameConfig.containers[containerName];
      if (!container) {
        console.error(`Container ${containerName} not found`);
        setOpeningState(OpeningState.IDLE);
        onAnimationStateChange?.(false);
        return;
      }
      
      // 使用新的动态生成系统
      const newAssignedItems = generateContainerItems(
        container,
        gameConfig.items
      );
      
      // 检查是否被取消
      if (animationCancelRef.current) return;
      
      setAssignedItems(newAssignedItems);
      
      // 开始揭示动画
      await performRevealAnimation(newAssignedItems);
      
    } catch (error) {
      console.error('Error during container opening:', error);
      // 出错时也要通知动画结束
      onAnimationStateChange?.(false);
    } finally {
      // 只有在没有被取消的情况下才设置为完成状态
      if (!animationCancelRef.current) {
        setOpeningState(OpeningState.COMPLETED);
      }
      // 通知父组件动画结束
      onAnimationStateChange?.(false);
    }
  }, [gameConfig, containerName]);
  
  // 执行揭示动画
  const performRevealAnimation = async (items: AssignedItem[]) => {
    for (let i = 0; i < items.length; i++) {
      // 检查是否被取消
      if (animationCancelRef.current) {
        console.log('动画已取消');
        return;
      }
      
      const item = items[i];
      
      // 显示旋转器
      setCurrentSpinners(prev => [...prev, item]);
      
      // 等待品质对应的时间
      const duration = QUALITY_DURATIONS[item.item.quality] || 1000;
      await delay(duration);
      
      // 再次检查是否被取消（延迟后）
      if (animationCancelRef.current) {
        console.log('动画在延迟后被取消');
        return;
      }
      
      // 移除旋转器，显示物品
      setCurrentSpinners(prev => prev.filter(spinner => spinner !== item));
      setRevealedItems(prev => [...prev, item]);
      setRevealedLog(prev => [...prev, item.item]);
    }
  };
  
  // 跳过动画（加速）
  const skipAnimation = useCallback(() => {
    // 设置取消标志，停止当前动画
    animationCancelRef.current = true;
    
    // 立即显示所有结果
    setCurrentSpinners([]);
    setRevealedItems(assignedItems);
    setRevealedLog(assignedItems.map(item => item.item));
    setOpeningState(OpeningState.COMPLETED);
    
    // 通知父组件动画结束
    onAnimationStateChange?.(false);
    
    console.log('动画已跳过');
  }, [assignedItems, onAnimationStateChange]);

  // 按钮状态
  const container = gameConfig.containers[containerName];
  const canOpen = container && (openingState === OpeningState.IDLE || openingState === OpeningState.COMPLETED);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>三角洲行动 - 容器开启模拟</h1>
        <h2 className={styles.containerName}>{container?.name || containerName}</h2>
      </div>
      
      <div className={styles.gridContainer}>
        <Grid 
          width={container?.width || 4} 
          height={container?.height || 4}
        >
          {/* 显示占位符 */}
          {assignedItems.map((item, index) => (
            <Placeholder
              key={`placeholder-${index}`}
              pos={item.pos}
              size={item.size}
            />
          ))}
          
          {/* 显示旋转器 */}
          {currentSpinners.map((item, index) => (
            <Spinner
              key={`spinner-${index}`}
              pos={item.pos}
              size={item.size}
            />
          ))}
          
          {/* 显示已揭示的物品 */}
          {revealedItems.map((item, index) => (
            <ItemComponent
              key={`item-${index}`}
              item={item.item}
              pos={item.pos}
              size={item.size}
            />
          ))}
        </Grid>
      </div>
      
      <div className={styles.controls}>
        <button 
          className={styles.openButton}
          onClick={startOpening}
          disabled={!canOpen}
        >
          {openingState === OpeningState.OPENING ? '开启中...' : '开启容器'}
        </button>
        
        {openingState === OpeningState.OPENING && (
          <button 
            className={styles.skipButton}
            onClick={skipAnimation}
          >
            跳过动画
          </button>
        )}
      </div>
      
      {/* 物品记录 */}
      {revealedLog.length > 0 && (
        <div className={styles.log}>
          <h3>获得物品:</h3>
          <div className={styles.logList}>
            {revealedLog.map((item, index) => {
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
                <div key={index} className={styles.logItem}>
                  <span className={styles.logName}>{item.name}</span>
                  <span 
                    className={styles.logQuality}
                    style={{ color: QUALITY_COLORS[item.quality] }}
                  >
                    ({qualityNames[item.quality] || '白'})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContainerOpening;
