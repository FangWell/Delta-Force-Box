import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PasswordCrackingGame.module.scss';

export interface PasswordCrackingGameProps {
  onSuccess: () => void;
  onFail: () => void;
}

interface Letter {
  char: string;
  color: 'green' | 'white';
  id: string;
}

interface Column {
  letters: Letter[]; // 循环字符池
  locked: boolean;
  targetCharIndex: number; // 目标字符在池中的索引
  lockedChar?: string;
  scrollOffset: number; // 0-1之间的滚动偏移
}

const PasswordCrackingGame: React.FC<PasswordCrackingGameProps> = ({ onSuccess }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());
  const isPausedRef = useRef(false);
  const [currentCol, setCurrentCol] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const gameCompletedRef = useRef(false);
  const [initialized, setInitialized] = useState(false);
  
  // 游戏常量
  const NUM_COLS = 5;
  const LETTERS_PER_COLUMN = 20; // 每列的字符池大小
  const VISIBLE_ROWS = 5; // 可见行数
  const TARGET_ROW = 2; // 目标行索引（第3行）
  
  // 响应式行高
  const getRowHeight = useCallback(() => {
    if (window.innerWidth <= 480) return 40;
    if (window.innerWidth <= 768) return 45;
    return 50;
  }, []);
  
  const [rowHeight, setRowHeight] = useState(getRowHeight());
  const ROW_HEIGHT = rowHeight;
  const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
  const SCROLL_SPEED = 1.0; // 每秒滚动1个字符位置
  const PAUSE_DURATION = 1000;
  const PROB_CORRECT = 0.02; // 绿色字符出现概率
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const newRowHeight = getRowHeight();
      if (newRowHeight !== rowHeight) {
        setRowHeight(newRowHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rowHeight, getRowHeight]);

  // 列引用
  const columnsRef = useRef<Column[]>([]);
  const columnRefsRef = useRef<(HTMLDivElement | null)[]>([]);
  const errorRefsRef = useRef<(HTMLDivElement | null)[]>([]);

  const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // 生成随机字符
  const getRandomChar = useCallback(() => {
    return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
  }, []);

  // 生成字符池
  const generateLetterPool = useCallback((targetChar: string) => {
    const pool: Letter[] = [];
    
    // 控制绿色字符出现概率和位置
    const shouldHaveGreen = Math.random() < PROB_CORRECT;
    const targetIndex = shouldHaveGreen ? 
      Math.floor(Math.random() * LETTERS_PER_COLUMN) : // 随机位置
      Math.floor(LETTERS_PER_COLUMN / 2); // 固定在中间但不会是绿色
    
    for (let i = 0; i < LETTERS_PER_COLUMN; i++) {
      let char: string;
      let color: 'green' | 'white';
      
      if (shouldHaveGreen && i === targetIndex) {
        char = targetChar;
        color = 'green';
      } else {
        // 生成不与目标字符相同的随机字符
        do {
          char = getRandomChar();
        } while (char === targetChar);
        color = 'white';
      }
      
      pool.push({
        char,
        color,
        id: `${i}-${Math.random().toString(36)}`
      });
    }
    
    return { pool, targetIndex: shouldHaveGreen ? targetIndex : -1 };
  }, [getRandomChar, PROB_CORRECT, LETTERS_PER_COLUMN]);

  // 初始化游戏
  const initGame = useCallback(() => {
    if (initialized) return;
    
    // 生成密码
    const newPassword = Array.from({ length: NUM_COLS }, () => getRandomChar());
    console.log('Password (for debug):', newPassword.join(' '));
    
    // 初始化列
    columnsRef.current = newPassword.map((char) => {
      const { pool, targetIndex } = generateLetterPool(char);
      return {
        letters: pool,
        locked: false,
        targetCharIndex: targetIndex,
        scrollOffset: 0, // 从顶部开始
      };
    });
    
    // 初始化DOM引用
    columnRefsRef.current = Array(NUM_COLS).fill(null);
    errorRefsRef.current = Array(NUM_COLS).fill(null);
    
    setInitialized(true);
    console.log('Password (for debug):', newPassword.join(' '));
  }, [initialized, NUM_COLS, getRandomChar, generateLetterPool]);

  // 计算字符在屏幕上的位置
  const getLetterScreenPosition = useCallback((letterIndex: number, scrollOffset: number) => {
    // letterIndex: 字符在池中的索引
    // scrollOffset: 0-1之间，表示滚动进度
    const virtualPosition = letterIndex - scrollOffset;
    return virtualPosition * ROW_HEIGHT;
  }, [ROW_HEIGHT]);

  // 获取当前可见字符
  const getVisibleLetters = useCallback((column: Column) => {
    const visibleLetters: { letter: Letter; screenY: number; isVisible: boolean }[] = [];
    
    column.letters.forEach((letter, index) => {
      const screenY = getLetterScreenPosition(index, column.scrollOffset);
      const isVisible = screenY >= -ROW_HEIGHT && screenY < CONTAINER_HEIGHT + ROW_HEIGHT;
      
      visibleLetters.push({
        letter,
        screenY,
        isVisible
      });
    });
    
    return visibleLetters.filter(item => item.isVisible);
  }, [getLetterScreenPosition, ROW_HEIGHT, CONTAINER_HEIGHT]);

  // 更新DOM显示
  const updateColumnDisplay = useCallback((colIndex: number) => {
    const columnEl = columnRefsRef.current[colIndex];
    const column = columnsRef.current[colIndex];
    
    if (!columnEl || !column) return;
    
    // 清空现有内容
    columnEl.innerHTML = '';
    
    // 获取可见字符并创建DOM元素
    const visibleLetters = getVisibleLetters(column);
    
    visibleLetters.forEach(({ letter, screenY }) => {
      const letterEl = document.createElement('div');
      letterEl.textContent = letter.char;
      letterEl.className = `${styles.letter} ${letter.color === 'green' ? styles.greenText : ''}`;
      letterEl.style.top = `${screenY}px`;
      letterEl.style.position = 'absolute';
      letterEl.style.left = '0';
      letterEl.style.right = '0';
      
      columnEl.appendChild(letterEl);
    });
  }, [getVisibleLetters]);

  // 动画循环
  const animate = useCallback((time: number) => {
    if (isPausedRef.current || gameCompletedRef.current) {
      return;
    }
    
    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    // 更新每列的滚动偏移
    for (let col = 0; col < NUM_COLS; col++) {
      const column = columnsRef.current[col];
      if (column.locked) continue;
      
      // 更新滚动偏移
      const scrollDelta = (SCROLL_SPEED * dt) / 1000; // 转换为秒
      column.scrollOffset += scrollDelta;
      
      // 循环处理
      if (column.scrollOffset >= LETTERS_PER_COLUMN) {
        column.scrollOffset -= LETTERS_PER_COLUMN;
      }
      
      // 更新显示
      updateColumnDisplay(col);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [NUM_COLS, SCROLL_SPEED, LETTERS_PER_COLUMN, updateColumnDisplay]);

  // 开始动画
  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // 显示错误
  const showError = useCallback((colIndex: number) => {
    isPausedRef.current = true;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    // 视觉反馈
    if (errorRefsRef.current[colIndex]) {
      errorRefsRef.current[colIndex]!.style.backgroundColor = 'red';
    }
    
    setTimeout(() => {
      isPausedRef.current = false;
      
      if (errorRefsRef.current[colIndex]) {
        errorRefsRef.current[colIndex]!.style.backgroundColor = 'transparent';
      }
      
      if (!gameCompletedRef.current) {
        startAnimation();
      }
    }, PAUSE_DURATION);
  }, [PAUSE_DURATION, startAnimation]);

  // 尝试锁定列
  const tryLock = useCallback((colIndex: number) => {
    const column = columnsRef.current[colIndex];
    if (column.locked || isPausedRef.current || colIndex !== currentCol || gameCompletedRef.current) {
      return;
    }
    
    // 如果这个列没有绿色字符，有几率重新生成字符池
    if (column.targetCharIndex === -1) {
      // 30%的概率重新生成字符池（增加绿色字符出现机会）
      if (Math.random() < 0.3) {
        const newPassword = [];
        for (let i = 0; i < NUM_COLS; i++) {
          newPassword.push(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
        }
        const { pool, targetIndex } = generateLetterPool(newPassword[colIndex]);
        column.letters = pool;
        column.targetCharIndex = targetIndex;
        updateColumnDisplay(colIndex);
        console.log(`Column ${colIndex} regenerated, has green: ${targetIndex !== -1}`);
      }
      
      // 如果仍然没有绿色字符，显示错误
      if (column.targetCharIndex === -1) {
        showError(colIndex);
        return;
      }
    }
    
    // 计算目标字符的当前屏幕位置
    const targetScreenY = getLetterScreenPosition(column.targetCharIndex, column.scrollOffset);
    const targetRowY = TARGET_ROW * ROW_HEIGHT;
    
    // 检查目标字符是否在目标行附近
    const tolerance = ROW_HEIGHT / 4; // 允许1/4行高的误差
    const isInTargetZone = Math.abs(targetScreenY - targetRowY) < tolerance;
    
    if (isInTargetZone) {
      // 成功锁定
      column.locked = true;
      column.lockedChar = column.letters[column.targetCharIndex].char;
      
      // 对齐到精确位置
      const alignOffset = (targetRowY - getLetterScreenPosition(column.targetCharIndex, 0)) / ROW_HEIGHT;
      column.scrollOffset = column.targetCharIndex - alignOffset;
      
      updateColumnDisplay(colIndex);
      setCurrentCol(prev => prev + 1);
      
      // 检查是否完成
      if (colIndex === NUM_COLS - 1) {
        setGameCompleted(true);
        gameCompletedRef.current = true;
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    } else {
      showError(colIndex);
    }
  }, [currentCol, NUM_COLS, getLetterScreenPosition, TARGET_ROW, ROW_HEIGHT, updateColumnDisplay, showError, generateLetterPool]);

  // 锁定列
  const lockColumn = useCallback((col: number) => {
    tryLock(col);
  }, [tryLock]);

  // 初始化和启动
  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (initialized && !gameCompleted) {
      startAnimation();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initialized, gameCompleted, startAnimation]);

  // 游戏完成处理
  useEffect(() => {
    if (gameCompleted) {
      setTimeout(() => {
        onSuccess();
      }, 500);
    }
  }, [gameCompleted, onSuccess]);

  // 键盘事件支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        tryLock(currentCol);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCol, tryLock]);

  if (!initialized) {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.title}>密码破解挑战</div>
        <div className={styles.instruction}>正在初始化...</div>
      </div>
    );
  }

  return (
    <div className={styles.gameContainer} ref={containerRef}>
      <div className={styles.title}>密码破解挑战</div>
      <div className={styles.instruction}>点击当前列或按空格键锁定正确的绿色字母！</div>
      
      <div className={styles.columns}>
        <div className={styles.validationRow} style={{
          top: `${TARGET_ROW * ROW_HEIGHT}px`,
          height: `${ROW_HEIGHT}px`
        }}></div>
        {Array.from({ length: NUM_COLS }, (_, colIndex) => (
          <div
            key={colIndex}
            className={`${styles.column} ${colIndex !== currentCol ? styles.inactive : ''}`}
            ref={(el) => {
              columnRefsRef.current[colIndex] = el;
            }}
            onClick={() => lockColumn(colIndex)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                lockColumn(colIndex);
              }
            }}
          >
            <div
              className={styles.errorOverlay}
              ref={(el) => {
                errorRefsRef.current[colIndex] = el;
              }}
              style={{
                top: `${TARGET_ROW * ROW_HEIGHT}px`,
                height: `${ROW_HEIGHT}px`
              }}
            />
          </div>
        ))}
      </div>
      
      <div className={styles.progress}>
        进度: {columnsRef.current.filter(c => c.locked).length} / {NUM_COLS}
      </div>
      
      {gameCompleted && (
        <div className={styles.successMessage}>
          🎉 密码破解成功！
        </div>
      )}
    </div>
  );
};

export default PasswordCrackingGame;
