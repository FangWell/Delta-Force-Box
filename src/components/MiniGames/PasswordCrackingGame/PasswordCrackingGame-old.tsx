import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PasswordCrackingGame.module.scss';

export interface PasswordCrackingGameProps {
  onSuccess: () => void;
  onFail: () => void;
}

interface Letter {
  elem: HTMLDivElement | null;
  char: string;
  color: 'green' | 'white';
  // 移除y坐标，改用索引和时间偏移
  index: number; // 在循环列表中的索引位置
  id: string;
}

interface Column {
  letters: Letter[];
  locked: boolean;
  targetLetter: Letter | null;
  lockedChar?: string; // 存储已锁定的字符
  // 新增：滚动相关属性
  scrollOffset: number; // 当前滚动偏移量 (0-1)
  letterPool: string[]; // 字符池，循环使用
  poolIndex: number; // 当前字符池索引
}

const PasswordCrackingGame: React.FC<PasswordCrackingGameProps> = ({ onSuccess }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false); // 使用ref来解决闭包问题
  const [currentCol, setCurrentCol] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const gameCompletedRef = useRef(false); // 使用ref来解决闭包问题
  const [initialized, setInitialized] = useState(false); // 防止重复初始化
  const [restartAnimationTrigger, setRestartAnimationTrigger] = useState(0); // 用于触发动画重启
  
  // 游戏常量
  const NUM_COLS = 5;
  const VISIBLE_LETTERS = 7; // 可见字符数量（包括部分可见的）
  const TARGET_ROW_INDEX = 2; // 目标行（从0开始，第3行为目标）
  
  // 动态获取字符高度，支持响应式设计  
  const getRowHeight = useCallback(() => {
    if (window.innerWidth <= 480) return 40; // 超小屏幕
    if (window.innerWidth <= 768) return 45; // 移动设备
    return 50; // 桌面端
  }, []);
  
  const [rowHeight, setRowHeight] = useState(getRowHeight());
  
  // 根据当前屏幕尺寸计算游戏常量
  const ROW_HEIGHT = rowHeight;
  const CONTAINER_HEIGHT = ROW_HEIGHT * 5; // 显示5行字符
  const SCROLL_SPEED = 0.5; // 每秒滚动0.5个字符位置
  const PAUSE_DURATION = 1000;
  
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

  const passwordRef = useRef<string[]>([]);
  const columnsRef = useRef<Column[]>([]);
  const columnRefsRef = useRef<(HTMLDivElement | null)[]>([]);
  const errorRefsRef = useRef<(HTMLDivElement | null)[]>([]);

  // 只在组件挂载时生成密码和初始化列，避免重复初始化
  useEffect(() => {
    if (initialized) return;

    // Generate password
    const newPassword = [];
    for (let i = 0; i < NUM_COLS; i++) {
      newPassword.push(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
    }
    passwordRef.current = newPassword;
    console.log('Password (for debug): ' + newPassword.join(' '));

    // Initialize columns
    columnsRef.current = Array.from({length: NUM_COLS}, () => ({
      letters: [],
      locked: false,
      targetLetter: null
    }));

    // Initialize column refs arrays
    columnRefsRef.current = new Array(NUM_COLS).fill(null);
    errorRefsRef.current = new Array(NUM_COLS).fill(null);
    
    setInitialized(true);
  }, []); // 空依赖数组，只在挂载时执行一次

  const getNext = useCallback((col: number): {char: string, color: 'green' | 'white'} => {
    const hasGreen = columnsRef.current[col].letters.some(l => l.color === 'green');
    const isCorrect = !hasGreen && Math.random() < PROB_CORRECT;
    if (isCorrect) {
      return {char: passwordRef.current[col], color: 'green'};
    } else {
      let ch;
      do {
        ch = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      } while (ch === passwordRef.current[col]);
      return {char: ch, color: 'white'};
    }
  }, []);

  const addLetter = useCallback((col: number, char: string, color: 'green' | 'white', y: number) => {
    if (!columnRefsRef.current[col] || columnsRef.current[col].locked) {
      return; // 如果列已锁定，不添加新字母
    }

    const elem = document.createElement('div');
    elem.textContent = char;
    elem.className = `${styles.letter} ${color === 'green' ? styles.greenText : ''}`;
    elem.style.top = (y - ROW_HEIGHT / 2) + 'px';
    
    columnRefsRef.current[col]!.appendChild(elem);

    const letter: Letter = {
      elem,
      char,
      color,
      y,
      id: Math.random().toString(36)
    };

    columnsRef.current[col].letters.unshift(letter);
  }, [ROW_HEIGHT]);

  const lockColumn = useCallback((col: number) => {
    const column = columnsRef.current[col];
    column.locked = true;
    
    // 存储已锁定的字符
    if (column.targetLetter) {
      column.lockedChar = column.targetLetter.char;
      column.targetLetter.elem?.classList.add(styles.locked);
    }
    
    column.targetLetter = null;

    // 清除该列的其他字母，只保留锁定的字母
    column.letters.forEach(letter => {
      if (letter.elem && !letter.elem.classList.contains(styles.locked)) {
        letter.elem.remove();
      }
    });
    column.letters = column.letters.filter(letter => 
      letter.elem?.classList.contains(styles.locked)
    );

    // Activate next column
    const nextCol = col + 1;
    if (nextCol < NUM_COLS) {
      setCurrentCol(nextCol);
      if (columnRefsRef.current[nextCol]) {
        columnRefsRef.current[nextCol]!.classList.remove(styles.inactive);
      }
    }
  }, []);

  const showError = useCallback((colIndex: number) => {
    // 立即暂停动画和冻结位置
    isPausedRef.current = true;
    
    // 立即取消任何pending的动画帧
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    // 立即冻结所有字母的位置 - 保持数据模型一致性，不从DOM读取
    columnsRef.current.forEach(col => {
      col.letters.forEach(letter => {
        if (letter.elem) {
          // 直接使用数据模型中的位置，确保间距一致性
          const exactTop = letter.y - ROW_HEIGHT / 2;
          
          // 强制设置精确位置并禁用过渡
          letter.elem.style.transition = 'none';
          letter.elem.style.top = exactTop + 'px';
        }
      });
      
      // 清除目标字母以防止任何对齐操作
      col.targetLetter = null;
    });
    
    // 视觉反馈
    if (errorRefsRef.current[colIndex]) {
      errorRefsRef.current[colIndex]!.style.backgroundColor = 'red';
    }
    
    setIsPaused(true);
    
    setTimeout(() => {
      setIsPaused(false);
      isPausedRef.current = false;
      
      if (errorRefsRef.current[colIndex]) {
        errorRefsRef.current[colIndex]!.style.backgroundColor = 'transparent';
      }
      
      // 确保所有targetLetter都被清除，防止恢复后的对齐移动
      for (let i = 0; i < NUM_COLS; i++) {
        if (columnsRef.current[i] && !columnsRef.current[i].locked) {
          columnsRef.current[i].targetLetter = null;
        }
      }
      
      // 重新启用过渡效果并确保位置同步
      columnsRef.current.forEach(col => {
        col.letters.forEach(letter => {
          if (letter.elem) {
            // 重新同步DOM位置到数据模型，确保间距一致性
            const exactTop = letter.y - ROW_HEIGHT / 2;
            letter.elem.style.top = exactTop + 'px';
            letter.elem.style.transition = '';
          }
        });
      });
      
      // 暂停结束后重新启动动画
      if (!gameCompletedRef.current) {
        lastTimeRef.current = performance.now(); // 重置时间基准
        setRestartAnimationTrigger(prev => prev + 1); // 触发动画重启
      }
    }, PAUSE_DURATION);
    
    // 忽略isPaused状态的使用，用于消除编译警告
    void isPaused;
  }, [PAUSE_DURATION, isPaused, ROW_HEIGHT]);

  const tryLock = useCallback((colIndex: number) => {
    const col = columnsRef.current[colIndex];
    if (col.locked || isPausedRef.current || colIndex !== currentCol || gameCompletedRef.current) return;

    // 先进行验证，不立即暂停动画
    // Find letters in or approaching the validation row
    const candidates = col.letters.filter(l => 
      l.y >= MIDDLE_TOP - ROW_HEIGHT / 2 && l.y <= MIDDLE_BOTTOM + ROW_HEIGHT / 2
    );

    let success = false;
    let target: Letter | null = null;
    for (const l of candidates) {
      if (l.color === 'green' && l.char === passwordRef.current[colIndex]) {
        success = true;
        target = l;
        break;
      }
    }

    if (success && target) {
      // 成功的情况：不暂停动画，直接处理锁定逻辑
      if (target.y <= MIDDLE_BOTTOM + ROW_HEIGHT / 2) {
        if (Math.abs(target.y - MIDDLE_CENTER) < 1) {
          lockColumn(colIndex);
        } else {
          col.targetLetter = target;
          if (target.y >= MIDDLE_CENTER) {
            // Snap to center
            const adjust = MIDDLE_CENTER - target.y;
            col.letters.forEach(l => {
              l.y += adjust;
              if (l.elem) {
                l.elem.style.top = (l.y - ROW_HEIGHT / 2) + 'px';
              }
            });
            lockColumn(colIndex);
          }
        }
      }
    } else {
      // 失败的情况：立即暂停动画，阻止任何进一步的动画更新
      isPausedRef.current = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      
      // 清除所有可能的targetLetter，防止任何后续对齐
      for (let i = 0; i < NUM_COLS; i++) {
        columnsRef.current[i].targetLetter = null;
      }
      
      // 立即"冻结"所有字母位置，撤销可能正在进行的移动
      for (let col = 0; col < NUM_COLS; col++) {
        const c = columnsRef.current[col];
        if (!c.locked) {
          c.letters.forEach(l => {
            if (l.elem) {
              // 重新设置位置，确保DOM和数据同步
              l.elem.style.top = (l.y - ROW_HEIGHT / 2) + 'px';
            }
          });
        }
      }
      
      // 调用showError来处理视觉反馈和定时恢复
      showError(colIndex);
    }
  }, [currentCol, MIDDLE_TOP, MIDDLE_BOTTOM, MIDDLE_CENTER, ROW_HEIGHT, lockColumn, showError]);

  const checkWin = useCallback(() => {
    if (columnsRef.current.every(c => c.locked) && !gameCompleted) {
      setGameCompleted(true);
      gameCompletedRef.current = true; // 同时更新ref
      setTimeout(() => {
        onSuccess();
      }, 500);
    }
  }, [gameCompleted, onSuccess]);

  const animate = useCallback((time: number) => {
    // 最优先检查：如果暂停或游戏完成，立即返回不执行任何操作
    if (isPausedRef.current || gameCompletedRef.current) {
      return;
    }
    
    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    // 再次检查暂停状态，防止在计算时间差期间状态发生变化
    if (isPausedRef.current || gameCompletedRef.current) {
      return;
    }
    
    // 只有确认未暂停后才安排下一帧
    animationRef.current = requestAnimationFrame(animate);

    for (let col = 0; col < NUM_COLS; col++) {
      const c = columnsRef.current[col];
      if (c.locked) continue; // 已锁定的列不参与动画
      
      // 在每列处理前都检查暂停状态
      if (isPausedRef.current || gameCompletedRef.current) {
        return;
      }

      const dy = SPEED_PX_PER_MS * dt;

      // 在移动字母前再次检查暂停状态
      if (isPausedRef.current || gameCompletedRef.current) {
        return;
      }

      // Move letters - 使用for循环以便可以中断
      for (let i = 0; i < c.letters.length; i++) {
        // 在每个字母更新前检查暂停状态，如果暂停立即退出
        if (isPausedRef.current || gameCompletedRef.current) {
          return;
        }
        const l = c.letters[i];
        l.y += dy;
        if (l.elem) {
          l.elem.style.top = (l.y - ROW_HEIGHT / 2) + 'px';
        }
      }

      // 在字母清理前检查暂停状态
      if (isPausedRef.current || gameCompletedRef.current) {
        return;
      }

      // 修复问题2：使用更大的缓冲区确保字符完全不可见
      // CSS中字符高度是50px，容器高度是250px
      // 添加50px的额外缓冲区，确保字符完全移出视线
      const CSS_CONTAINER_HEIGHT = 250;
      const CSS_LETTER_HEIGHT = 50;
      const EXTRA_BUFFER = 50; // 额外缓冲区
      const REMOVAL_THRESHOLD = CSS_CONTAINER_HEIGHT + EXTRA_BUFFER; // 300px
      
      c.letters = c.letters.filter((l) => {
        const letterBottom = l.y + CSS_LETTER_HEIGHT / 2;
        const shouldKeep = letterBottom <= REMOVAL_THRESHOLD;
        
        if (!shouldKeep && l.elem) {
          l.elem.remove();
        }
        return shouldKeep;
      });

      // 在添加新字母前检查暂停状态
      if (isPausedRef.current || gameCompletedRef.current) {
        return;
      }

      // 修复问题3：确保字符间距恒定
      // Add new top letters if needed - 修改逻辑确保间距恒定
      while (c.letters.length === 0 || c.letters[0].y > 0) {
        // 在循环内也检查暂停状态
        if (isPausedRef.current || gameCompletedRef.current) {
          return;
        }
        // 确保新字母的位置基于最顶部字母的位置
        let newY;
        if (c.letters.length === 0) {
          // 如果没有字母，从顶部开始
          newY = -ROW_HEIGHT / 2;
        } else {
          // 在最顶部字母上方添加新字母，保持固定间距
          newY = c.letters[0].y - ROW_HEIGHT;
        }
        const data = getNext(col);
        addLetter(col, data.char, data.color, newY);
      }

      // 在目标字母对齐前检查暂停状态
      if (isPausedRef.current || gameCompletedRef.current) {
        return;
      }

      // Check for target letter alignment - 只在未暂停时执行对齐逻辑
      if (c.targetLetter && !isPausedRef.current && !gameCompletedRef.current) {
        if (c.targetLetter.y >= MIDDLE_CENTER) {
          // Snap to center
          const adjust = MIDDLE_CENTER - c.targetLetter.y;
          c.letters.forEach(l => {
            l.y += adjust;
            if (l.elem) {
              l.elem.style.top = (l.y - ROW_HEIGHT / 2) + 'px';
            }
          });
          lockColumn(col);
        }
      }
    }

    // 最后再检查一次暂停状态
    if (isPausedRef.current || gameCompletedRef.current) {
      return;
    }

    checkWin();
  }, [NUM_COLS, SPEED_PX_PER_MS, GRID_HEIGHT, ROW_HEIGHT, MIDDLE_CENTER, getNext, addLetter, lockColumn, checkWin]); // 移除isPaused和gameCompleted，因为使用ref

  // 只有在初始化完成后才开始游戏
  useEffect(() => {
    if (!initialized || !containerRef.current || passwordRef.current.length === 0) return;

    // 清除之前可能存在的字母（但保留已锁定的）
    columnsRef.current.forEach((col) => {
      if (!col.locked) {
        col.letters.forEach(letter => {
          if (letter.elem) {
            letter.elem.remove();
          }
        });
        col.letters = [];
        col.targetLetter = null;
      }
    });

    // Initialize letters for unlocked columns only
    for (let col = 0; col < NUM_COLS; col++) {
      if (!columnsRef.current[col].locked) {
        let y = GRID_HEIGHT + ROW_HEIGHT / 2;
        for (let i = 0; i < 7; i++) {
          y -= ROW_HEIGHT;
          const data = getNext(col);
          addLetter(col, data.char, data.color, y);
        }
      }
    }

    // Start animation
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initialized]); // 只依赖initialized状态

  // 处理动画重启
  useEffect(() => {
    if (restartAnimationTrigger > 0 && !isPausedRef.current && !gameCompletedRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [restartAnimationTrigger, animate]);

  // Handle click events
  const handleColumnClick = (col: number) => {
    if (col === currentCol && !columnsRef.current[col].locked) {
      tryLock(col);
    }
  };

  // Handle keyboard events
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

  return (
    <div className={styles.gameContainer} ref={containerRef}>
      <div className={styles.title}>密码破解挑战</div>
      <div className={styles.instruction}>
        点击当前列或按空格键锁定绿色字母！
      </div>
      
      <div className={styles.columns}>
        <div className={styles.validationRow}></div>
        {Array.from({length: NUM_COLS}, (_, col) => (
          <div
            key={col}
            className={`${styles.column} ${col !== currentCol || columnsRef.current[col]?.locked ? styles.inactive : ''}`}
            ref={el => columnRefsRef.current[col] = el}
            onClick={() => handleColumnClick(col)}
          >
            <div
              className={styles.errorOverlay}
              ref={el => errorRefsRef.current[col] = el}
              style={{
                top: MIDDLE_TOP + 'px',
                height: ROW_HEIGHT + 'px'
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
          密码破解成功！
        </div>
      )}
    </div>
  );
};

export default PasswordCrackingGame;
