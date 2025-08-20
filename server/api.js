/**
 * 三角洲行动开箱模拟器 API 服务器
 * 提供配置管理、容器编辑、布局管理等功能
 * 支持开发/生产环境权限控制
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

// =============================================================================
// 应用配置
// =============================================================================

const app = express();
const PORT = process.env.PORT || 3001;

// 环境配置
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const IS_DEVELOPMENT = NODE_ENV === 'development';

// 权限配置 - 基于环境的权限控制
const PERMISSIONS = {
  EDIT_CONTAINERS: !IS_PRODUCTION,    // 生产环境禁用容器编辑
  EDIT_LAYOUTS: !IS_PRODUCTION,       // 生产环境禁用布局编辑  
  CONFIG_MANAGEMENT: IS_DEVELOPMENT   // 仅开发环境可用配置管理
};

// 文件路径配置 - 模块化配置文件
const JSON_DIR = path.join(__dirname, '../json');
const ITEMS_FILE = path.join(JSON_DIR, 'items.json');
const CONTAINERS_FILE = path.join(JSON_DIR, 'containers.json'); 
const LAYOUTS_FILE = path.join(JSON_DIR, 'layouts.json');

console.log(`🌍 运行环境: ${NODE_ENV}`);
console.log(`🔐 权限设置:`, PERMISSIONS);
console.log(`📁 配置文件目录: ${JSON_DIR}`);

// =============================================================================
// 中间件配置
// =============================================================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 请求日志中间件（开发环境）
if (IS_DEVELOPMENT) {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });
}

// =============================================================================
// 工具函数
// =============================================================================

/**
 * 读取模块化配置文件
 * @param {string} filePath - 配置文件路径
 * @returns {Promise<Object>} 配置数据
 */
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ 读取配置文件失败: ${path.basename(filePath)}`, error.message);
    throw new Error(`无法读取配置文件: ${path.basename(filePath)}`);
  }
};

/**
 * 写入模块化配置文件
 * @param {string} filePath - 配置文件路径
 * @param {Object} data - 要写入的数据
 */
const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ 配置文件已保存: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ 写入配置文件失败: ${path.basename(filePath)}`, error.message);
    throw new Error(`无法写入配置文件: ${path.basename(filePath)}`);
  }
};

/**
 * 获取完整配置（整合所有模块）
 * @returns {Promise<Object>} 完整配置对象
 */
const getFullConfig = async () => {
  try {
    const [items, containers, layouts] = await Promise.all([
      readJsonFile(ITEMS_FILE),
      readJsonFile(CONTAINERS_FILE),
      readJsonFile(LAYOUTS_FILE)
    ]);
    
    // 将items从对象转换为数组格式以保持兼容性
    const itemsArray = Object.entries(items).map(([key, value]) => ({
      id: key,
      ...value
    }));
    
    return {
      items: itemsArray,
      containers,
      layouts
    };
  } catch (error) {
    console.error('❌ 获取完整配置失败:', error.message);
    throw error;
  }
};

/**
 * 权限检查中间件
 * @param {string} permission - 权限名称
 * @returns {Function} Express中间件函数
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!PERMISSIONS[permission]) {
      return res.status(403).json({ 
        success: false,
        error: '权限不足', 
        message: `当前环境 (${NODE_ENV}) 禁用了此功能`,
        permission: permission 
      });
    }
    next();
  };
};

/**
 * 错误处理包装器
 * @param {Function} fn - 异步处理函数
 * @returns {Function} 包装后的处理函数
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// =============================================================================
// API 路由 - 基础信息
// =============================================================================

/**
 * 获取系统信息和权限状态
 */
app.get('/api/system/info', (req, res) => {
  res.json({
    success: true,
    data: {
      environment: NODE_ENV,
      isProduction: IS_PRODUCTION,
      isDevelopment: IS_DEVELOPMENT,
      permissions: PERMISSIONS,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    }
  });
});

/**
 * 获取完整配置（主要API端点）
 */
app.get('/api/config', asyncHandler(async (req, res) => {
  const config = await getFullConfig();
  res.json({
    success: true,
    data: config
  });
}));

/**
 * 备份当前配置
 */
app.post('/api/backup', asyncHandler(async (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(__dirname, `../backups/data-${timestamp}.json`);
  
  // 确保备份目录存在
  const backupDir = path.dirname(backupFile);
  await fs.mkdir(backupDir, { recursive: true });
  
  // 获取完整配置并备份
  const config = await getFullConfig();
  await fs.writeFile(backupFile, JSON.stringify(config, null, 2));
  
  console.log(`📦 配置已备份到: ${backupFile}`);
  res.json({ 
    success: true, 
    message: '配置已备份', 
    data: { backupFile }
  });
}));

// =============================================================================
// API 路由 - 布局管理
// =============================================================================

/**
 * 更新布局
 */
app.put('/api/layouts/:layoutId', 
  checkPermission('EDIT_LAYOUTS'), 
  asyncHandler(async (req, res) => {
    const { layoutId } = req.params;
    const updatedLayout = req.body;
    
    // 读取现有布局配置
    const layouts = await readJsonFile(LAYOUTS_FILE);
    
    // 更新布局
    layouts[layoutId] = updatedLayout;
    
    // 写回布局文件
    await writeJsonFile(LAYOUTS_FILE, layouts);
    
    console.log(`🔧 布局 ${layoutId} 已更新`);
    res.json({ 
      success: true, 
      message: `布局 ${layoutId} 已保存`,
      data: { layoutId, layout: updatedLayout }
    });
  })
);

/**
 * 创建新布局
 */
app.post('/api/layouts', 
  checkPermission('EDIT_LAYOUTS'), 
  asyncHandler(async (req, res) => {
    const { layoutId, layout } = req.body;
    
    if (!layoutId || !layout) {
      return res.status(400).json({ 
        success: false,
        error: '缺少必要参数',
        message: '需要提供 layoutId 和 layout 参数'
      });
    }
    
    // 读取现有布局配置
    const layouts = await readJsonFile(LAYOUTS_FILE);
    
    // 检查布局ID是否已存在
    if (layouts[layoutId]) {
      return res.status(400).json({ 
        success: false,
        error: '布局ID已存在',
        message: `布局 ${layoutId} 已存在，请使用不同的ID`
      });
    }
    
    // 添加新布局
    layouts[layoutId] = layout;
    
    // 写回布局文件
    await writeJsonFile(LAYOUTS_FILE, layouts);
    
    console.log(`✨ 新布局 ${layoutId} 已创建`);
    res.json({ 
      success: true, 
      message: `新布局 ${layoutId} 已创建`,
      data: { layoutId, layout }
    });
  })
);

/**
 * 删除布局
 */
app.delete('/api/layouts/:layoutId', 
  checkPermission('EDIT_LAYOUTS'), 
  asyncHandler(async (req, res) => {
    const { layoutId } = req.params;
    
    // 读取现有配置
    const [layouts, containers] = await Promise.all([
      readJsonFile(LAYOUTS_FILE),
      readJsonFile(CONTAINERS_FILE)
    ]);
    
    // 检查布局是否存在
    if (!layouts[layoutId]) {
      return res.status(404).json({ 
        success: false,
        error: '布局不存在',
        message: `布局 ${layoutId} 不存在`
      });
    }
    
    // 检查是否有容器在使用这个布局
    const containersUsingLayout = Object.entries(containers).filter(
      ([name, container]) => container.layoutIds && container.layoutIds.includes(layoutId)
    );
    
    if (containersUsingLayout.length > 0) {
      const containerNames = containersUsingLayout.map(([name]) => name);
      return res.status(400).json({ 
        success: false,
        error: '无法删除布局',
        message: `以下容器正在使用此布局: ${containerNames.join(', ')}`,
        data: { containerNames }
      });
    }
    
    // 删除布局
    delete layouts[layoutId];
    
    // 写回布局文件
    await writeJsonFile(LAYOUTS_FILE, layouts);
    
    console.log(`🗑️ 布局 ${layoutId} 已删除`);
    res.json({ 
      success: true, 
      message: `布局 ${layoutId} 已删除`,
      data: { layoutId }
    });
  })
);

// =============================================================================
// API 路由 - 容器管理
// =============================================================================

/**
 * 更新容器（支持重命名和数字ID）
 */
app.put('/api/containers/:containerId', 
  checkPermission('EDIT_CONTAINERS'), 
  asyncHandler(async (req, res) => {
    const { containerId } = req.params;
    let { oldName, containerData } = req.body;
    
    // 如果没有containerData字段，直接使用请求体作为容器数据
    if (!containerData && req.body) {
      containerData = req.body;
    }
    
    console.log(`🔍 容器更新请求:`, {
      containerId,
      oldName,
      containerData: containerData ? Object.keys(containerData) : 'undefined',
      fullBody: req.body
    });
    
    // 读取现有容器配置
    const containers = await readJsonFile(CONTAINERS_FILE);
    console.log(`📄 当前容器数据:`, containers[containerId]);
    
    if (oldName && oldName !== containerId) {
      // 重命名操作（用于旧的字符串名称系统）
      if (!containers[oldName]) {
        return res.status(404).json({ 
          success: false,
          error: '原容器不存在',
          message: `容器 ${oldName} 不存在`
        });
      }
      
      if (containers[containerId]) {
        return res.status(400).json({ 
          success: false,
          error: '新容器名称已存在',
          message: `容器 ${containerId} 已存在`
        });
      }
      
      // 重命名容器
      containers[containerId] = containerData || containers[oldName];
      delete containers[oldName];
      
      console.log(`🔄 容器重命名: ${oldName} → ${containerId}`);
    } else {
      // 普通更新操作（支持数字ID）
      if (!containers[containerId]) {
        return res.status(404).json({ 
          success: false,
          error: '容器不存在',
          message: `容器 ${containerId} 不存在`
        });
      }
      
      // 合并更新数据
      containers[containerId] = { ...containers[containerId], ...containerData };
      console.log(`🔧 容器 ${containerId} 更新后数据:`, containers[containerId]);
    }
    
    // 写回容器文件
    await writeJsonFile(CONTAINERS_FILE, containers);
    
    res.json({ 
      success: true, 
      data: {
        container: containers[containerId],
        containerId
      },
      message: oldName && oldName !== containerId ? 
        `容器重命名成功: ${oldName} → ${containerId}` : 
        `容器 ${containerId} 已更新`
    });
  })
);

// =============================================================================
// API 路由 - 配置管理（开发环境）
// =============================================================================

/**
 * 获取配置统计信息
 */
app.get('/api/config/stats', 
  checkPermission('CONFIG_MANAGEMENT'), 
  asyncHandler(async (req, res) => {
    const config = await getFullConfig();
    
    const stats = {
      containers: {
        total: Object.keys(config.containers).length,
        byRarity: {}
      },
      layouts: {
        total: Object.keys(config.layouts).length,
        bySize: {}
      },
      items: {
        total: config.items.length,
        byRarity: {},
        byType: {}
      }
    };

    // 统计容器稀有度分布
    Object.values(config.containers).forEach(container => {
      const rarity = container.rarity || 'unknown';
      stats.containers.byRarity[rarity] = (stats.containers.byRarity[rarity] || 0) + 1;
    });

    // 统计布局尺寸分布
    Object.values(config.layouts).forEach(layout => {
      const size = `${layout.width}x${layout.height}`;
      stats.layouts.bySize[size] = (stats.layouts.bySize[size] || 0) + 1;
    });

    // 统计物品稀有度和类型分布
    config.items.forEach(item => {
      const rarity = item.rarity || 'unknown';
      const type = item.type || 'unknown';
      
      stats.items.byRarity[rarity] = (stats.items.byRarity[rarity] || 0) + 1;
      stats.items.byType[type] = (stats.items.byType[type] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * 批量更新物品
 */
app.put('/api/items', 
  checkPermission('CONFIG_MANAGEMENT'), 
  asyncHandler(async (req, res) => {
    const { items } = req.body;
    
    if (!items || typeof items !== 'object') {
      return res.status(400).json({ 
        success: false,
        error: '无效的物品数据',
        message: 'items 参数必须是一个对象'
      });
    }
    
    const currentItems = await readJsonFile(ITEMS_FILE);
    
    // 更新物品
    const updatedItems = { ...currentItems, ...items };
    
    await writeJsonFile(ITEMS_FILE, updatedItems);
    
    const updatedCount = Object.keys(items).length;
    console.log(`📦 批量更新了 ${updatedCount} 个物品`);
    
    res.json({ 
      success: true, 
      message: `成功更新 ${updatedCount} 个物品`,
      data: {
        updatedCount,
        updatedItems: Object.keys(items)
      }
    });
  })
);

/**
 * 批量更新容器
 */
app.put('/api/containers', 
  checkPermission('CONFIG_MANAGEMENT'), 
  asyncHandler(async (req, res) => {
    const { containers } = req.body;
    
    if (!containers || typeof containers !== 'object') {
      return res.status(400).json({ 
        success: false,
        error: '无效的容器数据',
        message: 'containers 参数必须是一个对象'
      });
    }
    
    const [currentContainers, layouts] = await Promise.all([
      readJsonFile(CONTAINERS_FILE),
      readJsonFile(LAYOUTS_FILE)
    ]);
    
    // 验证布局ID是否存在
    for (const [containerName, containerData] of Object.entries(containers)) {
      if (containerData.layoutIds) {
        const invalidLayouts = containerData.layoutIds.filter(id => !layouts[id]);
        if (invalidLayouts.length > 0) {
          return res.status(400).json({ 
            success: false,
            error: '引用了不存在的布局',
            message: `容器 ${containerName} 引用了不存在的布局: ${invalidLayouts.join(', ')}`,
            data: { containerName, invalidLayouts }
          });
        }
      }
    }
    
    // 更新容器
    const updatedContainers = { ...currentContainers, ...containers };
    
    await writeJsonFile(CONTAINERS_FILE, updatedContainers);
    
    const updatedCount = Object.keys(containers).length;
    console.log(`📦 批量更新了 ${updatedCount} 个容器`);
    
    res.json({ 
      success: true, 
      message: `成功更新 ${updatedCount} 个容器`,
      data: {
        updatedCount,
        updatedContainers: Object.keys(containers)
      }
    });
  })
);

/**
 * 重置配置到默认值
 */
app.post('/api/config/reset', 
  checkPermission('CONFIG_MANAGEMENT'), 
  asyncHandler(async (req, res) => {
    const { section } = req.body; // 'items', 'containers', 'layouts', 'all'
    
    if (!['items', 'containers', 'layouts', 'all'].includes(section)) {
      return res.status(400).json({ 
        success: false,
        error: '无效的配置节',
        message: '支持的配置节: items, containers, layouts, all'
      });
    }
    
    // 备份当前配置
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(__dirname, `../backups/reset-backup-${timestamp}.json`);
    const backupDir = path.dirname(backupFile);
    await fs.mkdir(backupDir, { recursive: true });
    
    // 获取当前配置进行备份
    const currentConfig = await getFullConfig();
    await fs.writeFile(backupFile, JSON.stringify(currentConfig, null, 2));
    
    // 默认配置
    const defaults = {
      items: {},
      containers: {},
      layouts: {}
    };
    
    if (section === 'all') {
      // 重置所有配置文件
      await Promise.all([
        writeJsonFile(ITEMS_FILE, defaults.items),
        writeJsonFile(CONTAINERS_FILE, defaults.containers),
        writeJsonFile(LAYOUTS_FILE, defaults.layouts)
      ]);
    } else if (section === 'items') {
      await writeJsonFile(ITEMS_FILE, defaults.items);
    } else if (section === 'containers') {
      await writeJsonFile(CONTAINERS_FILE, defaults.containers);
    } else if (section === 'layouts') {
      await writeJsonFile(LAYOUTS_FILE, defaults.layouts);
    }
    
    console.log(`🔄 配置重置完成: ${section}`);
    res.json({ 
      success: true, 
      message: `配置 ${section} 已重置`,
      data: { 
        section,
        backupFile: path.basename(backupFile)
      }
    });
  })
);

/**
 * 验证配置完整性
 */
app.get('/api/config/validate', 
  checkPermission('CONFIG_MANAGEMENT'), 
  asyncHandler(async (req, res) => {
    const config = await getFullConfig();
    
    const errors = [];
    const warnings = [];
    
    // 验证容器引用的布局是否存在
    Object.entries(config.containers).forEach(([containerName, container]) => {
      if (container.layoutIds) {
        const invalidLayouts = container.layoutIds.filter(id => !config.layouts[id]);
        if (invalidLayouts.length > 0) {
          errors.push(`容器 ${containerName} 引用了不存在的布局: ${invalidLayouts.join(', ')}`);
        }
      }
    });
    
    // 验证容器引用的物品是否存在
    Object.entries(config.containers).forEach(([containerName, container]) => {
      if (container.itemPool) {
        const invalidItems = container.itemPool.filter(itemId => 
          !config.items.find(item => item.id === itemId)
        );
        if (invalidItems.length > 0) {
          warnings.push(`容器 ${containerName} 引用了不存在的物品: ${invalidItems.join(', ')}`);
        }
      }
    });
    
    // 检查孤立的布局
    const usedLayouts = new Set();
    Object.values(config.containers).forEach(container => {
      if (container.layoutIds) {
        container.layoutIds.forEach(id => usedLayouts.add(id));
      }
    });
    
    const unusedLayouts = Object.keys(config.layouts).filter(id => !usedLayouts.has(id));
    if (unusedLayouts.length > 0) {
      warnings.push(`未使用的布局: ${unusedLayouts.join(', ')}`);
    }
    
    const isValid = errors.length === 0;
    const summary = {
      valid: isValid,
      errors: errors,
      warnings: warnings,
      stats: {
        containers: Object.keys(config.containers).length,
        layouts: Object.keys(config.layouts).length,
        items: config.items.length,
        unusedLayouts: unusedLayouts.length
      }
    };
    
    res.json({
      success: true,
      data: summary
    });
  })
);

// =============================================================================
// 错误处理中间件
// =============================================================================

/**
 * 404 处理
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    message: `接口 ${req.method} ${req.originalUrl} 不存在`,
    availableEndpoints: [
      'GET /api/system/info',
      'GET /api/config',
      'POST /api/backup',
      'PUT /api/layouts/:layoutId',
      'POST /api/layouts',
      'DELETE /api/layouts/:layoutId',
      'PUT /api/containers/:containerId',
      'GET /api/config/stats',
      'PUT /api/items',
      'PUT /api/containers',
      'POST /api/config/reset',
      'GET /api/config/validate'
    ]
  });
});

/**
 * 全局错误处理
 */
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err);
  
  res.status(500).json({
    success: false,
    error: '内部服务器错误',
    message: IS_DEVELOPMENT ? err.message : '服务器内部错误，请稍后重试',
    ...(IS_DEVELOPMENT && { stack: err.stack })
  });
});

// =============================================================================
// 服务器启动
// =============================================================================

/**
 * 启动服务器
 */
app.listen(PORT, () => {
  console.log('🚀'.repeat(50));
  console.log(`🎯 三角洲行动开箱模拟器 API 服务器已启动`);
  console.log(`🌐 服务地址: http://localhost:${PORT}`);
  console.log(`🌍 运行环境: ${NODE_ENV}`);
  console.log(`📁 配置目录: ${JSON_DIR}`);
  console.log(`  📄 Items: ${path.basename(ITEMS_FILE)}`);
  console.log(`  📄 Containers: ${path.basename(CONTAINERS_FILE)}`);
  console.log(`  📄 Layouts: ${path.basename(LAYOUTS_FILE)}`);
  console.log('🚀'.repeat(50));
  
  // 服务器健康检查
  if (IS_DEVELOPMENT) {
    console.log(`🔧 开发模式功能已启用:`);
    console.log(`  - 配置管理 API`);
    console.log(`  - 容器编辑功能`);
    console.log(`  - 布局编辑功能`);
    console.log(`  - 详细错误信息`);
  }
});

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('🛑 收到 SIGTERM 信号，正在优雅关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 收到 SIGINT 信号，正在优雅关闭服务器...');
  process.exit(0);
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('💥 未捕获异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

module.exports = app;
