import React, { useState, useCallback, useRef, useEffect } from 'react';
import Grid from '../Grid/Grid';
import Placeholder from '../Placeholder/Placeholder';
import Spinner from '../Spinner/Spinner';
import ItemComponent from '../Item/ItemComponent';
import MiniGameManager from '../MiniGames/MiniGameManager';
import { 
  AssignedItem, 
  GameConfig, 
  Container, 
  Item,
  StatisticsEvent
} from '../../types';
import {
  generateContainerItems,
  delay,
  QUALITY_DURATIONS,
  QUALITY_COLORS
} from '../../utils/gameLogic';
import { recordOpeningEvent } from '../../utils/statistics';
import styles from './ContainerOpening.module.scss';

interface ContainerOpeningProps {
  gameConfig: GameConfig;
  containerName: string;
  onAnimationStateChange?: (isAnimating: boolean) => void;
  onStatisticsUpdate?: () => void; // 新增：统计数据更新回调
}

// 开启状态枚举
enum OpeningState {
  IDLE = 'idle',
  MINI_GAME = 'mini_game',  // 新增：小游戏状态
  OPENING = 'opening',
  COMPLETED = 'completed'
}

const ContainerOpening: React.FC<ContainerOpeningProps> = ({ 
  gameConfig, 
  containerName,
  onAnimationStateChange,
  onStatisticsUpdate // 新增：统计数据更新回调
}) => {
  const [assignedItems, setAssignedItems] = useState<AssignedItem[]>([]);
  const [revealedItems, setRevealedItems] = useState<AssignedItem[]>([]);
  const [currentSpinners, setCurrentSpinners] = useState<AssignedItem[]>([]);
  const [openingState, setOpeningState] = useState<OpeningState>(OpeningState.IDLE);
  const [revealedLog, setRevealedLog] = useState<Item[]>([]);
  const [showMiniGame, setShowMiniGame] = useState<boolean>(false);
  const [isOperationLocked, setIsOperationLocked] = useState<boolean>(false); // 操作锁定
  const [lockCountdown, setLockCountdown] = useState<number>(0); // 锁定倒计时
  
  // 用于取消动画的ref
  const animationCancelRef = useRef<boolean>(false);
  const currentContainerRef = useRef<string>(containerName);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 清理倒计时定时器
  const clearCountdownTimer = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // 启动锁定倒计时
  const startLockCountdown = useCallback((seconds: number = 3) => {
    clearCountdownTimer();
    setLockCountdown(seconds);
    
    countdownIntervalRef.current = setInterval(() => {
      setLockCountdown(prev => {
        if (prev <= 1) {
          clearCountdownTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdownTimer]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return clearCountdownTimer;
  }, [clearCountdownTimer]);

  // 计算按钮文本
  const getButtonText = useCallback(() => {
    if (openingState === OpeningState.OPENING) {
      return '开启中...';
    }
    
    if (isOperationLocked && lockCountdown > 0) {
      return `开启容器(${lockCountdown}s)`;
    }
    
    if (isOperationLocked || openingState === OpeningState.MINI_GAME) {
      return '开启容器';
    }
    
    return '开启容器';
  }, [openingState, isOperationLocked, lockCountdown]);

  // 计算按钮是否禁用
  const isButtonDisabled = useCallback(() => {
    const container = gameConfig.containers[containerName];
    if (!container) return true;
    
    // 如果正在操作中，按钮禁用
    if (isOperationLocked) return true;
    
    // 如果正在开启或进行小游戏，按钮禁用
    if (openingState === OpeningState.OPENING || openingState === OpeningState.MINI_GAME) return true;
    
    // 只有在IDLE或COMPLETED状态下才能开启
    return !(openingState === OpeningState.IDLE || openingState === OpeningState.COMPLETED);
  }, [gameConfig, containerName, isOperationLocked, openingState]);

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
      setShowMiniGame(false);
      setIsOperationLocked(false); // 重置操作锁定
      setLockCountdown(0); // 重置倒计时
      clearCountdownTimer(); // 清理倒计时定时器
      
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
    // 防止重复操作
    if (isOperationLocked || openingState === OpeningState.OPENING || openingState === OpeningState.MINI_GAME) {
      console.log('操作被锁定或状态不允许:', { isOperationLocked, openingState });
      return;
    }
    
    console.log('开始开启容器操作...');
    setIsOperationLocked(true);
    startLockCountdown(3); // 启动3秒倒计时
    
    // 检查是否需要小游戏
    const container: Container = gameConfig.containers[containerName];
    if (!container) {
      console.error(`Container ${containerName} not found`);
      setIsOperationLocked(false);
      return;
    }
    
    // 如果容器配置了小游戏，先进入小游戏状态
    if (container.miniGame && container.miniGame.enabled) {
      setOpeningState(OpeningState.MINI_GAME);
      setShowMiniGame(true);
      // 小游戏状态下暂时保持锁定，等待小游戏结果
      return;
    }
    
    // 没有小游戏的话直接开始开启流程
    await performActualOpening();
  }, [gameConfig, containerName, openingState, isOperationLocked]);

  // 实际的开启流程（从小游戏中分离出来）
  const performActualOpening = useCallback(async () => {
    console.log('执行实际开启流程...');
    
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
    setShowMiniGame(false); // 关闭小游戏界面

    try {
      const container: Container = gameConfig.containers[containerName];
      if (!container) {
        console.error(`Container ${containerName} not found`);
        setOpeningState(OpeningState.IDLE);
        setIsOperationLocked(false);
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
      
      // 记录统计数据
      if (!animationCancelRef.current) {
        const container = gameConfig.containers[containerName];
        const statisticsEvent: StatisticsEvent = {
          containerName: containerName,
          containerDisplayName: container?.name || containerName,
          items: newAssignedItems.map(item => item.item),
          timestamp: Date.now()
        };
        
        recordOpeningEvent(statisticsEvent);
        
        // 通知父组件统计数据已更新
        onStatisticsUpdate?.();
      }
      
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
      // 释放操作锁定
      setIsOperationLocked(false);
      setLockCountdown(0);
      clearCountdownTimer();
    }
  }, [gameConfig, containerName, onAnimationStateChange, onStatisticsUpdate]);
  
  // 小游戏成功回调
  const handleMiniGameSuccess = useCallback(() => {
    console.log('小游戏完成，开始开启容器');
    performActualOpening();
  }, [performActualOpening]);

  // 小游戏失败回调
  const handleMiniGameFail = useCallback(() => {
    console.log('小游戏失败，返回初始状态');
    setOpeningState(OpeningState.IDLE);
    setShowMiniGame(false);
    setIsOperationLocked(false); // 释放锁定
    setLockCountdown(0);
    clearCountdownTimer();
  }, [clearCountdownTimer]);
  
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
    
  }, [assignedItems, onAnimationStateChange]);

  // 获取容器信息
  const container = gameConfig.containers[containerName];

  return (
    <div className={styles.container}>
      {/* 小游戏组件 */}
      {showMiniGame && container?.miniGame && (
        <MiniGameManager
          config={container.miniGame}
          onSuccess={handleMiniGameSuccess}
          onFail={handleMiniGameFail}
        />
      )}
      
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
          className={`${styles.openButton} ${isButtonDisabled() ? styles.disabled : ''}`}
          onClick={startOpening}
          disabled={isButtonDisabled()}
        >
          {getButtonText()}
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
