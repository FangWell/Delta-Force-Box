// 指纹破译游戏组件
import React, { useState, useEffect, useCallback } from 'react';
import { MiniGameResult } from '../MiniGameManager';
import FingerprintSVG from './FingerprintSVG';
import styles from './FingerprintGame.module.scss';

export interface FingerprintGameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  onComplete: (result: MiniGameResult) => void;
}

interface FingerprintPattern {
  id: string;
  pattern: string; // SVG路径数据
  isTarget: boolean;
}

const FingerprintGame: React.FC<FingerprintGameProps> = ({
  difficulty,
  timeLimit = 30,
  onComplete
}) => {
  const [patterns, setPatterns] = useState<FingerprintPattern[]>([]);
  const [targetPattern, setTargetPattern] = useState<FingerprintPattern | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // 生成指纹图案
  const generateFingerprintPatterns = useCallback(() => {
    const patternCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
    const newPatterns: FingerprintPattern[] = [];
    
    // 创建目标指纹
    const targetId = `pattern_target_${Date.now()}`;
    const target: FingerprintPattern = {
      id: targetId,
      pattern: generateFingerprintSVG(Math.random()),
      isTarget: true
    };
    
    setTargetPattern(target);
    
    // 创建选项指纹（包含目标）
    newPatterns.push({ ...target, isTarget: false }); // 正确答案
    
    // 创建错误答案
    for (let i = 1; i < patternCount; i++) {
      newPatterns.push({
        id: `pattern_${i}_${Date.now()}`,
        pattern: generateFingerprintSVG(Math.random() + i),
        isTarget: false
      });
    }
    
    // 随机打乱数组
    const shuffled = newPatterns.sort(() => Math.random() - 0.5);
    setPatterns(shuffled);
  }, [difficulty]);

  // 生成SVG指纹路径
  const generateFingerprintSVG = (seed: number): string => {
    // 使用种子生成一致的指纹图案
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    
    let path = '';
    const centerX = 60;
    const centerY = 60;
    const layers = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
    
    for (let layer = 0; layer < layers; layer++) {
      const radius = 15 + layer * 8;
      const points = 16 + layer * 4;
      
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const noise = random(seed + layer * 100 + i) * 3 - 1.5;
        const r = radius + noise;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        if (i === 0) {
          path += `M ${x.toFixed(1)} ${y.toFixed(1)} `;
        } else {
          path += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
        }
      }
      path += 'Z ';
    }
    
    return path;
  };

  // 开始游戏
  useEffect(() => {
    if (!gameStarted) {
      generateFingerprintPatterns();
      setGameStarted(true);
    }
  }, [gameStarted, generateFingerprintPatterns]);

  // 计时器
  useEffect(() => {
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleTimeUp = () => {
    setShowResult(true);
    setTimeout(() => {
      onComplete({ success: false, timeUsed: timeLimit });
    }, 1000);
  };

  const handlePatternSelect = (patternId: string) => {
    if (selectedPattern || showResult) return;
    
    setSelectedPattern(patternId);
    setShowResult(true);
    
    const selected = patterns.find(p => p.id === patternId);
    const isCorrect = selected?.pattern === targetPattern?.pattern;
    const timeUsed = timeLimit - timeLeft;
    const score = isCorrect ? Math.max(100 - timeUsed * 2, 10) : 0;
    
    setTimeout(() => {
      onComplete({ 
        success: isCorrect, 
        score,
        timeUsed
      });
    }, 1500);
  };

  return (
    <div className={styles.fingerprintGame}>
      {/* 游戏头部 */}
      <div className={styles.gameHeader}>
        <div className={styles.timer}>
          <span className={styles.timerIcon}>⏱️</span>
          <span className={`${styles.timeText} ${timeLeft <= 5 ? styles.urgent : ''}`}>
            {timeLeft}s
          </span>
        </div>
        <div className={styles.difficulty}>
          难度: {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}
        </div>
      </div>

      {/* 目标指纹 */}
      <div className={styles.targetSection}>
        <h4>🎯 目标指纹</h4>
        <div className={styles.targetFingerprint}>
          {targetPattern && (
            <FingerprintSVG 
              pattern={targetPattern.pattern}
              className={styles.targetPattern}
            />
          )}
        </div>
        <p>请从下方选择与目标指纹匹配的选项</p>
      </div>

      {/* 选项指纹 */}
      <div className={styles.optionsSection}>
        <h4>🔍 选择匹配的指纹</h4>
        <div className={styles.fingerprintGrid}>
          {patterns.map((pattern, index) => (
            <div
              key={pattern.id}
              className={`${styles.fingerprintOption} ${
                selectedPattern === pattern.id ? styles.selected : ''
              } ${showResult && pattern.pattern === targetPattern?.pattern ? styles.correct : ''}
              ${showResult && selectedPattern === pattern.id && pattern.pattern !== targetPattern?.pattern ? styles.wrong : ''}`}
              onClick={() => handlePatternSelect(pattern.id)}
            >
              <FingerprintSVG 
                pattern={pattern.pattern}
                className={styles.optionPattern}
              />
              <div className={styles.optionLabel}>选项 {index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 游戏提示 */}
      <div className={styles.gameHint}>
        💡 仔细观察指纹的纹路特征，找到与目标完全匹配的指纹
      </div>
    </div>
  );
};

export default FingerprintGame;
