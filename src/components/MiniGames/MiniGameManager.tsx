// 小游戏管理器 - 处理小游戏状态和结果
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MiniGameConfig } from '../../types';
import FingerprintGame from './FingerprintGame/FingerprintGame';
import PasswordCrackingGame from './PasswordCrackingGame/PasswordCrackingGame';
import styles from './MiniGameManager.module.scss';

export interface MiniGameManagerProps {
  config: MiniGameConfig;
  onSuccess: () => void;
  onFail: () => void;
}

export interface MiniGameResult {
  success: boolean;
  score?: number;
  timeUsed?: number;
}

const MiniGameManager: React.FC<MiniGameManagerProps> = ({
  config,
  onSuccess,
  onFail
}) => {
  const [isProcessing, setIsProcessing] = useState(false); // 防止重复操作
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return clearTimeouts;
  }, [clearTimeouts]);

  const handleGameComplete = useCallback((result: MiniGameResult) => {
    // 防止重复处理
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // 清理之前的定时器
    clearTimeouts();
    
    if (result.success) {
      // 成功后直接继续，不显示提示界面
      onSuccess();
    } else {
      // 失败后直接回到开启前状态，不显示提示界面
      onFail();
    }
  }, [isProcessing, onSuccess, onFail, clearTimeouts]);

  const renderMiniGame = () => {
    switch (config.gameType) {
      case 'fingerprint_decipher':
        return (
          <FingerprintGame
            difficulty={config.difficulty}
            timeLimit={config.timeLimit}
            onComplete={handleGameComplete}
          />
        );
      case 'password_cracking':
        return (
          <PasswordCrackingGame
            onSuccess={() => handleGameComplete({ success: true })}
            onFail={() => handleGameComplete({ success: false })}
          />
        );
      default:
        return (
          <div className={styles.notImplemented}>
            <h3>小游戏开发中</h3>
            <p>游戏类型：{config.gameType}</p>
          </div>
        );
    }
  };

  // 获取游戏标题
  const getGameTitle = () => {
    switch (config.gameType) {
      case 'fingerprint_decipher':
        return '🔍 指纹破译挑战';
      case 'password_cracking':
        return '🔐 密码破解挑战';
      case 'memory_match':
        return '🧠 记忆匹配挑战';
      case 'puzzle_solve':
        return '🧩 解谜挑战';
      default:
        return '🎮 小游戏挑战';
    }
  };

  // 只显示游戏界面，不显示结果提示
  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameHeader}>
        <h3>{getGameTitle()}</h3>
        <div className={styles.gameInfo}>
          <div className={styles.difficulty}>
            <span className={styles.difficultyLabel}>难度：</span>
            <span className={`${styles.difficultyValue} ${styles[config.difficulty]}`}>
              {config.difficulty === 'easy' ? '简单' : 
               config.difficulty === 'medium' ? '中等' : '困难'}
            </span>
          </div>
          {config.timeLimit && (
            <div className={styles.timeLimit}>
              <span>时间限制：{config.timeLimit}秒</span>
            </div>
          )}
        </div>
      </div>
      {renderMiniGame()}
    </div>
  );
};

export default MiniGameManager;
