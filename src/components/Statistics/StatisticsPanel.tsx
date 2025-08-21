import React from 'react';
import { Statistics, GameConfig } from '../../types';
import { 
  getItemStatistics, 
  getContainerStatistics, 
  formatTime,
  clearStatistics 
} from '../../utils/statistics';
import { QUALITY_COLORS } from '../../utils/gameLogic';
import styles from './StatisticsPanel.module.scss';

interface StatisticsPanelProps {
  statistics: Statistics;
  gameConfig: GameConfig;
  onStatisticsChange: (newStats: Statistics) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  statistics,
  gameConfig,
  onStatisticsChange,
  isVisible,
  onToggleVisibility
}) => {
  // 处理清除统计数据
  const handleClearStatistics = () => {
    if (window.confirm('确定要清除所有统计数据吗？此操作无法撤销！')) {
      const newStats = clearStatistics();
      onStatisticsChange(newStats);
    }
  };

  // 获取统计数据
  const itemStats = getItemStatistics(statistics, gameConfig.items);
  const containerStats = getContainerStatistics(statistics, gameConfig.containers);

  // 质量名称映射
  const qualityNames = {
    1: '白色',
    2: '绿色', 
    3: '蓝色',
    4: '紫色',
    5: '金色',
    6: '红色'
  };

  return (
    <>
      {/* 切换按钮 */}
      <button 
        className={styles.toggleButton}
        onClick={onToggleVisibility}
        title={isVisible ? '隐藏统计' : '显示统计'}
      >
        📊 统计
      </button>

      {/* 统计面板 */}
      {isVisible && (
        <div className={styles.overlay}>
          <div className={styles.panel}>
            <div className={styles.header}>
              <h2>开箱统计</h2>
              <button 
                className={styles.closeButton}
                onClick={onToggleVisibility}
              >
                ✕
              </button>
            </div>

            <div className={styles.content}>
              {/* 总览统计 */}
              <section className={styles.section}>
                <h3>总览</h3>
                <div className={styles.overviewStats}>
                  <div className={styles.statItem}>
                    <span className={styles.label}>总开启容器：</span>
                    <span className={styles.value}>{statistics.totalContainers}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.label}>总获得物品：</span>
                    <span className={styles.value}>{statistics.totalItems}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.label}>首次开启：</span>
                    <span className={styles.value}>{formatTime(statistics.firstOpenTime)}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.label}>最后开启：</span>
                    <span className={styles.value}>{formatTime(statistics.lastOpenTime)}</span>
                  </div>
                  {statistics.totalContainers > 0 && (
                    <div className={styles.statItem}>
                      <span className={styles.label}>平均每箱物品：</span>
                      <span className={styles.value}>
                        {(statistics.totalItems / statistics.totalContainers).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* 容器统计 */}
              {containerStats.length > 0 && (
                <section className={styles.section}>
                  <h3>容器开启记录</h3>
                  <div className={styles.statsList}>
                    {containerStats.map(container => (
                      <div key={container.containerId} className={styles.statsItem}>
                        <div className={styles.itemInfo}>
                          <span className={styles.name}>{container.containerName}</span>
                          <span className={styles.count}>×{container.count}</span>
                        </div>
                        <div className={styles.percentage}>
                          {container.percentage.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 物品统计 */}
              {itemStats.length > 0 && (
                <section className={styles.section}>
                  <h3>物品获得记录（按品质排序）</h3>
                  <div className={styles.itemsList}>
                    {itemStats.map(({ item, count, percentage }) => (
                      <div key={item.id} className={styles.itemStatsItem}>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemNameWrapper}>
                            <span className={styles.name}>{item.name}</span>
                            <span 
                              className={styles.quality}
                              style={{ color: QUALITY_COLORS[item.quality] }}
                            >
                              {qualityNames[item.quality] || '白色'}
                            </span>
                          </div>
                        </div>
                        <div className={styles.itemCounts}>
                          <span className={styles.count}>×{count}</span>
                          <span className={styles.percentage}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 空状态 */}
              {statistics.totalContainers === 0 && (
                <div className={styles.emptyState}>
                  <p>🎁</p>
                  <p>还没有开启任何容器</p>
                  <p>开始你的第一次开箱吧！</p>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className={styles.actions}>
              <button 
                className={styles.clearButton}
                onClick={handleClearStatistics}
                disabled={statistics.totalContainers === 0}
              >
                清除统计数据
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatisticsPanel;
