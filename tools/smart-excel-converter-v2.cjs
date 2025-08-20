const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * 智能Excel配置转换器
 * 支持类型转换：第1行键值，第2行类型，第3行注释，第4行开始数据
 */
class SmartExcelConverter {
  constructor(excelPath = path.join('..', 'excel'), jsonPath = path.join('..', 'json')) {
    this.excelPath = path.resolve(__dirname, excelPath);
    this.jsonPath = path.resolve(__dirname, jsonPath);
    
    // 字段映射规则
    this.fieldMappings = {
      id: ['id', 'ID', 'Id', '编号', '标识'],
      name: ['name', 'Name', 'NAME', '名称', '标题', 'title', 'Title'],
      desc: ['desc', 'description', 'Description', 'DESC', '描述', '说明'],
      quality: ['quality', 'Quality', 'QUALITY', 'rarity', 'Rarity', '品质', '稀有度', '等级'],
      category: ['category', 'Category', 'CATEGORY', 'type', 'Type', '类别', '类型', '分类'],
      size: ['size', 'Size', 'SIZE', '尺寸', '大小', '格子'],
      icon: ['icon', 'Icon', 'ICON', 'image', 'Image', '图标', '图片'],
      weight: ['weight', 'Weight', 'WEIGHT', 'probability', 'Probability', '权重', '概率'],
      layoutId: ['layoutId', 'LayoutId', 'layout_id', 'layout', 'Layout', '布局', '布局ID'],
      layoutIds: ['layoutIds', 'LayoutIds', 'layout_ids', 'layouts', 'Layouts', '布局列表', '布局IDs'],
      items: ['items', 'Items', 'ITEMS', 'itemList', 'itemPool', '物品列表', '物品'],
      itemPool: ['itemPool', 'ItemPool', 'item_pool', 'items', 'Items', '物品池', '物品列表'],
      positions: ['positions', 'Positions', 'POSITIONS', '位置', '坐标']
    };
  }

  /**
   * 分析Excel文件结构
   */
  analyzeExcelStructure(filePath) {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (allData.length < 1) {
      throw new Error('Excel文件为空或格式不正确');
    }

    const headers = allData[0];
    let typeRowIndex = -1;
    let commentRowIndex = -1;
    let dataStartIndex = 1;

    // 检测文件格式
    if (allData.length >= 3) {
      // 检查第二行是否为类型行
      const secondRow = allData[1];
      const hasTypes = secondRow && secondRow.some(cell => {
        if (!cell) return false;
        const cellStr = String(cell).toLowerCase();
        return ['string', 'number', 'array', 'json', 'boolean'].includes(cellStr);
      });

      if (hasTypes) {
        typeRowIndex = 1;
        
        // 检查第三行是否为注释行
        if (allData.length > 2) {
          const thirdRow = allData[2];
          const hasComments = thirdRow && thirdRow.some(cell => {
            if (!cell) return false;
            const cellStr = String(cell);
            return /[\u4e00-\u9fa5]/.test(cellStr) || 
                   /^(说明|备注|注释|comment|description|desc)/i.test(cellStr);
          });
          
          if (hasComments) {
            commentRowIndex = 2;
            dataStartIndex = 3;
          } else {
            dataStartIndex = 2;
          }
        }
      } else {
        // 原有逻辑：检查第二行是否为注释行
        const secondRow = allData[1];
        const hasComments = secondRow && secondRow.some(cell => {
          if (!cell) return false;
          const cellStr = String(cell);
          return /[\u4e00-\u9fa5]/.test(cellStr) || 
                 /^(说明|备注|注释|comment|description|desc)/i.test(cellStr);
        });
        
        if (hasComments) {
          commentRowIndex = 1;
          dataStartIndex = 2;
        }
      }
    }

    return {
      headers,
      typeRowIndex,
      types: typeRowIndex >= 0 ? allData[typeRowIndex] : null,
      commentRowIndex,
      dataStartIndex,
      totalRows: allData.length,
      rawData: allData
    };
  }

  /**
   * 智能字段映射
   */
  createFieldMapping(headers) {
    const mapping = {};
    
    for (const [standardField, possibleNames] of Object.entries(this.fieldMappings)) {
      for (const header of headers) {
        if (possibleNames.includes(header)) {
          mapping[standardField] = header;
          break;
        }
      }
    }

    return mapping;
  }

  /**
   * 根据类型转换值
   */
  convertValueByType(value, type) {
    if (value === null || value === undefined || value === '') {
      return value;
    }

    const typeStr = String(type).toLowerCase();
    
    try {
      switch (typeStr) {
        case 'string':
          return String(value);
          
        case 'number':
          const num = Number(value);
          return isNaN(num) ? value : num;
          
        case 'boolean':
          if (typeof value === 'boolean') return value;
          const valStr = String(value).toLowerCase();
          return valStr === 'true' || valStr === '1' || valStr === 'yes';
          
        case 'array':
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') {
            // 尝试解析JSON数组
            if (value.startsWith('[') && value.endsWith(']')) {
              return JSON.parse(value);
            }
            // 按逗号分割字符串
            return value.split(',').map(item => item.trim()).filter(item => item);
          }
          return [value];
          
        case 'json':
          if (typeof value === 'object') return value;
          if (typeof value === 'string') {
            return JSON.parse(value);
          }
          return value;
          
        default:
          return value;
      }
    } catch (error) {
      console.warn(`⚠️  类型转换失败 (${type}): ${value}, 保持原值`);
      return value;
    }
  }

  /**
   * 转换数据行为对象
   */
  convertRowsToObjects(headers, types, dataRows) {
    return dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (row[index] !== undefined) {
          let value = row[index];
          
          // 根据类型信息转换值
          if (types && types[index]) {
            value = this.convertValueByType(value, types[index]);
          }
          
          obj[header] = value;
        }
      });
      return obj;
    }).filter(obj => {
      // 过滤空行（所有值都为空）
      return Object.values(obj).some(value => value !== undefined && value !== '');
    });
  }

  /**
   * 智能转换物品配置
   */
  convertItems() {
    try {
      console.log('📦 转换物品配置...');
      
      const excelFile = path.join(this.excelPath, 'items.xlsx');
      if (!fs.existsSync(excelFile)) {
        console.warn(`⚠️  物品配置文件不存在: ${excelFile}`);
        return;
      }

      const structure = this.analyzeExcelStructure(excelFile);
      const fieldMapping = this.createFieldMapping(structure.headers);
      
      console.log(`ℹ️  检测到表头: ${structure.headers.join(', ')}`);
      if (structure.typeRowIndex >= 0) {
        console.log(`ℹ️  检测到类型行: ${structure.types.join(', ')}`);
      }
      if (structure.commentRowIndex >= 0) {
        console.log(`ℹ️  检测到注释行，从第${structure.dataStartIndex + 1}行开始读取数据`);
      }

      const dataRows = structure.rawData.slice(structure.dataStartIndex);
      const rawObjects = this.convertRowsToObjects(structure.headers, structure.types, dataRows);

      const items = rawObjects.map((obj, index) => {
        try {
          const item = {};
          
          // 使用智能映射获取字段值
          const getValue = (field, defaultValue = '') => {
            const mappedField = fieldMapping[field];
            if (mappedField && obj[mappedField] !== undefined) {
              return obj[mappedField];
            }
            if (obj[field] !== undefined) {
              return obj[field];
            }
            return defaultValue;
          };

          // 构建物品对象
          item.id = String(getValue('id', `item_${index + 1}`));
          item.name = String(getValue('name', ''));
          item.desc = String(getValue('desc', ''));
          item.quality = this.mapQuality(getValue('quality', 'white'));
          item.category = this.mapCategory(getValue('category', 1));
          item.size = String(getValue('size', '1x1'));
          item.icon = String(getValue('icon', '/assets/default.png'));
          item.weight = Number(getValue('weight', 1));

          // 添加原始数据中的其他字段
          Object.keys(obj).forEach(key => {
            const standardField = Object.keys(fieldMapping).find(k => fieldMapping[k] === key);
            if (!standardField && obj[key] !== undefined) {
              item[key] = obj[key];
            }
          });

          return item;
        } catch (error) {
          console.error(`❌ 物品配置转换错误 (行 ${index + structure.dataStartIndex + 1}):`, error);
          return null;
        }
      }).filter(item => item !== null);

      this.writeJsonFile('items', items);
      console.log(`✅ 物品配置转换完成: ${items.length} 个物品`);
      
    } catch (error) {
      console.error('❌ 物品配置转换失败:', error);
    }
  }

  /**
   * 智能转换容器配置
   */
  convertContainers() {
    try {
      console.log('📦 转换容器配置...');
      
      const excelFile = path.join(this.excelPath, 'containers.xlsx');
      if (!fs.existsSync(excelFile)) {
        console.warn(`⚠️  容器配置文件不存在: ${excelFile}`);
        return;
      }

      const structure = this.analyzeExcelStructure(excelFile);
      const fieldMapping = this.createFieldMapping(structure.headers);
      
      console.log(`ℹ️  检测到表头: ${structure.headers.join(', ')}`);
      if (structure.typeRowIndex >= 0) {
        console.log(`ℹ️  检测到类型行: ${structure.types.join(', ')}`);
      }
      if (structure.commentRowIndex >= 0) {
        console.log(`ℹ️  检测到注释行，从第${structure.dataStartIndex + 1}行开始读取数据`);
      }

      const dataRows = structure.rawData.slice(structure.dataStartIndex);
      const rawObjects = this.convertRowsToObjects(structure.headers, structure.types, dataRows);

      const containers = {};
      
      rawObjects.forEach((obj, index) => {
        try {
          const getValue = (field, defaultValue = '') => {
            const mappedField = fieldMapping[field];
            if (mappedField && obj[mappedField] !== undefined) {
              return obj[mappedField];
            }
            if (obj[field] !== undefined) {
              return obj[field];
            }
            return defaultValue;
          };

          const id = String(getValue('id', `container_${index + 1}`));
          
          const container = {
            id: id,
            name: String(getValue('name', '')),
            desc: String(getValue('desc', '')),
            quality: this.mapQuality(getValue('quality', 'white')),
            layoutId: String(getValue('layoutId', 'slot_1')),
            layoutIds: this.ensureArray(getValue('layoutIds', [])),
            items: this.parseItems(getValue('items', '')),
            itemPool: this.ensureArray(getValue('itemPool', [])),
            icon: String(getValue('icon', '/assets/default.png'))
          };

          // 添加其他字段
          Object.keys(obj).forEach(key => {
            const standardField = Object.keys(fieldMapping).find(k => fieldMapping[k] === key);
            if (!standardField && obj[key] !== undefined && !container.hasOwnProperty(key)) {
              container[key] = obj[key];
            }
          });

          containers[id] = container;
        } catch (error) {
          console.error(`❌ 容器配置转换错误 (行 ${index + structure.dataStartIndex + 1}):`, error);
        }
      });

      this.writeJsonFile('containers', containers);
      console.log(`✅ 容器配置转换完成: ${Object.keys(containers).length} 个容器`);
      
    } catch (error) {
      console.error('❌ 容器配置转换失败:', error);
    }
  }

  /**
   * 智能转换布局配置
   */
  convertLayouts() {
    try {
      console.log('📐 转换布局配置...');
      
      const excelFile = path.join(this.excelPath, 'layouts.xlsx');
      if (!fs.existsSync(excelFile)) {
        console.warn(`⚠️  布局配置文件不存在: ${excelFile}`);
        return;
      }

      const structure = this.analyzeExcelStructure(excelFile);
      const fieldMapping = this.createFieldMapping(structure.headers);
      
      console.log(`ℹ️  检测到表头: ${structure.headers.join(', ')}`);
      if (structure.typeRowIndex >= 0) {
        console.log(`ℹ️  检测到类型行: ${structure.types.join(', ')}`);
      }
      if (structure.commentRowIndex >= 0) {
        console.log(`ℹ️  检测到注释行，从第${structure.dataStartIndex + 1}行开始读取数据`);
      }

      const dataRows = structure.rawData.slice(structure.dataStartIndex);
      const rawObjects = this.convertRowsToObjects(structure.headers, structure.types, dataRows);

      const layouts = {};
      
      rawObjects.forEach((obj, index) => {
        try {
          const getValue = (field, defaultValue = '') => {
            const mappedField = fieldMapping[field];
            if (mappedField && obj[mappedField] !== undefined) {
              return obj[mappedField];
            }
            if (obj[field] !== undefined) {
              return obj[field];
            }
            return defaultValue;
          };

          const id = String(getValue('id', `slot_${index + 1}`));
          
          const layout = {
            id: id,
            name: String(getValue('name', '')),
            positions: this.parsePositions(getValue('positions', ''))
          };

          // 添加其他字段
          Object.keys(obj).forEach(key => {
            const standardField = Object.keys(fieldMapping).find(k => fieldMapping[k] === key);
            if (!standardField && obj[key] !== undefined && !layout.hasOwnProperty(key)) {
              layout[key] = obj[key];
            }
          });

          layouts[id] = layout;
        } catch (error) {
          console.error(`❌ 布局配置转换错误 (行 ${index + structure.dataStartIndex + 1}):`, error);
        }
      });

      this.writeJsonFile('layouts', layouts);
      console.log(`✅ 布局配置转换完成: ${Object.keys(layouts).length} 个布局`);
      
    } catch (error) {
      console.error('❌ 布局配置转换失败:', error);
    }
  }

  // 辅助方法
  ensureArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(item => item);
    }
    return [value];
  }

  mapQuality(quality) {
    if (typeof quality === 'number') return quality;
    
    const qualityMap = {
      'white': 1, '白色': 1, '普通': 1, 'common': 1,
      'green': 2, '绿色': 2, '优秀': 2, 'uncommon': 2,
      'blue': 3, '蓝色': 3, '稀有': 3, 'rare': 3,
      'purple': 4, '紫色': 4, '史诗': 4, 'epic': 4,
      'orange': 5, '橙色': 5, '传说': 5, 'legendary': 5,
      'red': 6, '红色': 6, '神话': 6, 'mythical': 6
    };
    
    return qualityMap[String(quality).toLowerCase()] || 1;
  }

  mapCategory(category) {
    if (typeof category === 'number') return category;
    
    const categoryMap = {
      'weapon': 1, '武器': 1,
      'armor': 2, '装甲': 2, '护甲': 2,
      'accessory': 3, '配件': 3, '饰品': 3,
      'consumable': 4, '消耗品': 4,
      'material': 5, '材料': 5,
      'other': 6, '其他': 6
    };
    
    return categoryMap[String(category).toLowerCase()] || 1;
  }

  parseItems(itemsStr) {
    if (!itemsStr) return [];
    
    try {
      if (typeof itemsStr === 'string') {
        if (itemsStr.startsWith('[') && itemsStr.endsWith(']')) {
          return JSON.parse(itemsStr);
        }
        return itemsStr.split(',').map(id => id.trim()).filter(id => id);
      }
      
      return Array.isArray(itemsStr) ? itemsStr : [itemsStr];
    } catch {
      return [];
    }
  }

  parsePositions(positionsStr) {
    if (!positionsStr) return [];
    
    try {
      if (typeof positionsStr === 'string') {
        if (positionsStr.startsWith('[') && positionsStr.endsWith(']')) {
          return JSON.parse(positionsStr);
        }
      }
      
      return Array.isArray(positionsStr) ? positionsStr : [];
    } catch {
      return [];
    }
  }

  writeJsonFile(name, data) {
    const jsonFile = path.join(this.jsonPath, `${name}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2), 'utf8');
  }

  convertAll() {
    console.log('🔄 开始智能转换配置文件...');
    
    this.convertItems();
    this.convertContainers();
    this.convertLayouts();
    
    console.log('✅ 所有配置文件智能转换完成！');
  }
}

// 命令行支持
if (require.main === module) {
  const args = process.argv.slice(2);
  const converter = new SmartExcelConverter();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🎯 智能Excel配置转换器 v2.1 (支持类型转换)

用法:
  node smart-excel-converter.cjs [选项]

选项:
  --items, -i        只转换物品配置
  --containers, -c   只转换容器配置
  --layouts, -l      只转换布局配置
  --help, -h         显示帮助信息

支持的Excel格式:
  • 格式A: 表头 + 数据 (最简单)
  • 格式B: 表头 + 注释 + 数据 (传统格式)
  • 格式C: 表头 + 类型 + 注释 + 数据 (完整格式，推荐)

类型支持:
  • string: 字符串类型
  • number: 数字类型
  • array: 数组类型 (逗号分隔或JSON格式)
  • json: JSON对象
  • boolean: 布尔值

示例:
  node smart-excel-converter.cjs              # 转换所有配置
  node smart-excel-converter.cjs --containers # 转换容器配置 (修复layoutIds数组)
`);
    process.exit(0);
  }

  try {
    if (args.includes('--items') || args.includes('-i')) {
      converter.convertItems();
    } else if (args.includes('--containers') || args.includes('-c')) {
      converter.convertContainers();
    } else if (args.includes('--layouts') || args.includes('-l')) {
      converter.convertLayouts();
    } else {
      converter.convertAll();
    }
  } catch (error) {
    console.error('❌ 转换失败:', error);
    process.exit(1);
  }
}

module.exports = SmartExcelConverter;
