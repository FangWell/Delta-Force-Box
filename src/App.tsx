import { useState, useEffect } from 'react';
import ContainerOpening from './components/ContainerOpening/ContainerOpening';
import StatisticsPanel from './components/Statistics/StatisticsPanel';
import GridDebug from './components/GridDebug';
import { GameConfig, Statistics } from './types';
import { loadGameConfig } from './utils/dataLoader';
import { generateContainerItems } from './utils/gameLogic';
import { loadStatistics } from './utils/statistics';
import styles from './App.module.scss';

function App() {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<string>('2');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 统计相关状态
  const [statistics, setStatistics] = useState<Statistics>(() => loadStatistics());
  const [showStatistics, setShowStatistics] = useState(false);

  // 更新统计数据
  const handleStatisticsUpdate = () => {
    setStatistics(loadStatistics());
  };

  // 加载游戏配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const config = await loadGameConfig();
        setGameConfig(config);
        
        // 设置默认选中第一个容器
        const firstContainer = Object.keys(config.containers)[0];
        if (firstContainer) {
          setSelectedContainer(firstContainer);
        }
      } catch (err) {
        setError('Failed to load game configuration');
        console.error('Config loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // 测试函数：模拟开启10次并记录结果
  const runSimulationTest = () => {
    console.log('=== 开启模拟测试 ===');
    if (!gameConfig) return;
    
    const results: Record<string, number> = {};
    const qualityStats: Record<string, number> = {};
    
    // 运行10次模拟
    for (let i = 0; i < 10; i++) {
      const container = gameConfig.containers[selectedContainer];
      if (!container) continue;
      
      console.log(`第${i + 1}次开启 ${container.name}:`);
      
      // 使用新的动态生成系统
      const assignedItems = generateContainerItems(container, gameConfig.items);
      
      // 统计结果
      assignedItems.forEach(assignedItem => {
        const item = assignedItem.item;
        results[item.name] = (results[item.name] || 0) + 1;
        qualityStats[item.quality] = (qualityStats[item.quality] || 0) + 1;
        
        console.log(`  - ${item.name} (${item.quality}) at [${assignedItem.pos[0]}, ${assignedItem.pos[1]}]`);
      });
    }
    
    console.log('\n=== 统计结果 ===');
    console.log('物品出现次数:', results);
    console.log('品质分布:', qualityStats);
    
    // 计算概率
    const total = Object.values(results).reduce((sum, count) => sum + count, 0);
    console.log('\n=== 概率分析 ===');
    Object.entries(results).forEach(([item, count]) => {
      console.log(`${item}: ${((count / total) * 100).toFixed(1)}%`);
    });
  };

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>加载配置中...</p>
        </div>
      </div>
    );
  }

  if (error || !gameConfig) {
    return (
      <div className={styles.app}>
        <div className={styles.error}>
          <h2>加载失败</h2>
          <p>{error || '无法加载游戏配置'}</p>
          <button onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const containerOptions = Object.values(gameConfig.containers);

  return (
    <div className={styles.app}>
      <div className={styles.containerSelector}>
        <label htmlFor="container-select">选择容器类型：</label>
        <select 
          id="container-select"
          value={selectedContainer}
          onChange={(e) => setSelectedContainer(e.target.value)}
          className={styles.select}
          disabled={isAnimating}
          title={isAnimating ? "动画进行中，无法切换容器" : ""}
        >
          {containerOptions.map(container => (
            <option key={container.id} value={container.id}>
              {container.name}
            </option>
          ))}
        </select>
        
        {/* 只在开发环境中显示测试按钮 */}
        {import.meta.env.DEV && (
          <button 
            className={styles.testButton}
            onClick={runSimulationTest}
            title="在控制台查看测试结果"
            disabled={isAnimating}
          >
            运行测试
          </button>
        )}
      </div>

      <ContainerOpening 
        gameConfig={gameConfig}
        containerName={selectedContainer}
        onAnimationStateChange={setIsAnimating}
        onStatisticsUpdate={handleStatisticsUpdate}
      />
      
      <div className={styles.footer}>
        <p>三角洲行动容器开启模拟器 v1.0</p>
      </div>

      {/* 统计面板 */}
      <StatisticsPanel 
        statistics={statistics}
        gameConfig={gameConfig}
        onStatisticsChange={setStatistics}
        isVisible={showStatistics}
        onToggleVisibility={() => setShowStatistics(!showStatistics)}
      />
      
      {/* 临时调试组件 */}
      {process.env.NODE_ENV === 'development' && <GridDebug />}
    </div>
  );
}

export default App;
