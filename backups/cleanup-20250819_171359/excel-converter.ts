import * as XLSX from 'xlsx';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Excel配置转换器
 * 将Excel配置文件转换为JSON格式
 */
export class ExcelToJsonConverter {
  private readonly excelPath: string;
  private readonly jsonPath: string;

  constructor(excelPath: string = 'excel', jsonPath: string = 'json') {
    this.excelPath = excelPath;
    this.jsonPath = jsonPath;
  }

  /**
   * 转换所有配置文件
   */
  public convertAll(): void {
    console.log('🔄 开始转换配置文件...');
    
    this.convertItems();
    this.convertContainers();
    this.convertLayouts();
    
    console.log('✅ 所有配置文件转换完成！');
  }

  /**
   * 转换物品配置
   */
  public convertItems(): void {
    try {
      console.log('📦 转换物品配置...');
      
      const excelFile = join(this.excelPath, 'items.xlsx');
      if (!existsSync(excelFile)) {
        console.warn(`⚠️  物品配置文件不存在: ${excelFile}`);
        return;
      }

      const workbook = XLSX.readFile(excelFile);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      const items = rawData.map((row: any, index: number) => {
        try {
          return {
            id: String(row['ID'] || row['id'] || `item_${index + 1}`),
            name: String(row['Name'] || row['名称'] || ''),
            description: String(row['Description'] || row['描述'] || row['desc'] || ''),
            quality: this.mapQuality(row['Quality'] || row['品质'] || row['quality'] || 'white'),
            size: String(row['Size'] || row['尺寸'] || row['size'] || '1x1'),
            icon: String(row['Icon'] || row['图标'] || row['icon'] || '/assets/default.png'),
            weight: Number(row['Weight'] || row['权重'] || row['weight'] || 1),
            type: String(row['Type'] || row['类型'] || row['type'] || 'unknown')
          };
        } catch (error) {
          console.error(`❌ 物品配置转换错误 (行 ${index + 1}):`, error);
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
   * 转换容器配置
   */
  public convertContainers(): void {
    try {
      console.log('📦 转换容器配置...');
      
      const excelFile = join(this.excelPath, 'containers.xlsx');
      if (!existsSync(excelFile)) {
        console.warn(`⚠️  容器配置文件不存在: ${excelFile}`);
        return;
      }

      const workbook = XLSX.readFile(excelFile);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      const containers: Record<string, any> = {};
      
      rawData.forEach((row: any, index: number) => {
        try {
          const key = String(row['Key'] || row['键'] || row['key'] || `container_${index + 1}`);
          containers[key] = {
            cost: Number(row['Cost'] || row['费用'] || row['cost'] || 100),
            rarity: this.mapRarity(row['Rarity'] || row['稀有度'] || row['rarity'] || 'common'),
            layoutIds: this.parseArray(row['LayoutIds'] || row['布局ID'] || row['layoutIds'] || ''),
            color: String(row['Color'] || row['颜色'] || row['color'] || '#4CAF50'),
            description: String(row['Description'] || row['描述'] || row['description'] || '')
          };
        } catch (error) {
          console.error(`❌ 容器配置转换错误 (行 ${index + 1}):`, error);
        }
      });

      this.writeJsonFile('containers', containers);
      console.log(`✅ 容器配置转换完成: ${Object.keys(containers).length} 个容器`);
      
    } catch (error) {
      console.error('❌ 容器配置转换失败:', error);
    }
  }

  /**
   * 转换布局配置
   */
  public convertLayouts(): void {
    try {
      console.log('📦 转换布局配置...');
      
      const excelFile = join(this.excelPath, 'layouts.xlsx');
      if (!existsSync(excelFile)) {
        console.warn(`⚠️  布局配置文件不存在: ${excelFile}`);
        return;
      }

      const workbook = XLSX.readFile(excelFile);
      
      // 处理多个工作表（每个布局一个工作表）
      const layouts: Record<string, any> = {};
      
      workbook.SheetNames.forEach(sheetName => {
        try {
          const worksheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(worksheet);
          
          if (rawData.length === 0) return;
          
          // 第一行包含布局信息
          const layoutInfo = rawData[0] as any;
          const positions = rawData.slice(1).map((row: any) => ({
            x: Number(row['X'] || row['x'] || 0),
            y: Number(row['Y'] || row['y'] || 0),
            size: String(row['Size'] || row['尺寸'] || row['size'] || '1x1'),
            isSlot: Boolean(row['IsSlot'] || row['是否占位'] || row['isSlot'] || true),
            slotId: String(row['SlotId'] || row['占位ID'] || row['slotId'] || ''),
            weight: Number(row['Weight'] || row['权重'] || row['weight'] || 100)
          }));

          layouts[sheetName] = {
            name: String(layoutInfo['Name'] || layoutInfo['名称'] || layoutInfo['name'] || sheetName),
            description: String(layoutInfo['Description'] || layoutInfo['描述'] || layoutInfo['description'] || ''),
            width: Number(layoutInfo['Width'] || layoutInfo['宽度'] || layoutInfo['width'] || 4),
            height: Number(layoutInfo['Height'] || layoutInfo['高度'] || layoutInfo['height'] || 4),
            positions: positions
          };
        } catch (error) {
          console.error(`❌ 布局配置转换错误 (${sheetName}):`, error);
        }
      });

      this.writeJsonFile('layouts', layouts);
      console.log(`✅ 布局配置转换完成: ${Object.keys(layouts).length} 个布局`);
      
    } catch (error) {
      console.error('❌ 布局配置转换失败:', error);
    }
  }

  /**
   * 创建Excel模板文件
   */
  public createTemplates(): void {
    console.log('📝 创建Excel模板文件...');
    
    this.createItemsTemplate();
    this.createContainersTemplate();
    this.createLayoutsTemplate();
    
    console.log('✅ Excel模板文件创建完成！');
  }

  /**
   * 创建物品模板
   */
  private createItemsTemplate(): void {
    const template = [
      {
        'ID': 'item_001',
        'Name': 'Example Item',
        'Description': 'This is an example item',
        'Quality': 'white',
        'Size': '1x1',
        'Icon': '/assets/example.png',
        'Weight': 10,
        'Type': 'weapon'
      },
      {
        'ID': 'item_002',
        'Name': 'Another Item',
        'Description': 'This is another example',
        'Quality': 'blue',
        'Size': '2x1',
        'Icon': '/assets/another.png',
        'Weight': 5,
        'Type': 'armor'
      }
    ];

    this.writeExcelFile('items', template);
    console.log('📝 物品模板已创建');
  }

  /**
   * 创建容器模板
   */
  private createContainersTemplate(): void {
    const template = [
      {
        'Key': 'basic_crate',
        'Cost': 100,
        'Rarity': 'common',
        'LayoutIds': 'layout_1,layout_2',
        'Color': '#4CAF50',
        'Description': 'Basic loot crate'
      },
      {
        'Key': 'premium_crate',
        'Cost': 500,
        'Rarity': 'epic',
        'LayoutIds': 'layout_3,layout_4',
        'Color': '#9C27B0',
        'Description': 'Premium loot crate'
      }
    ];

    this.writeExcelFile('containers', template);
    console.log('📝 容器模板已创建');
  }

  /**
   * 创建布局模板
   */
  private createLayoutsTemplate(): void {
    // 创建多个工作表的模板
    const workbook = XLSX.utils.book_new();
    
    // 布局1
    const layout1 = [
      { 'Name': 'Basic Layout', 'Description': 'A basic 4x4 layout', 'Width': 4, 'Height': 4 },
      { 'X': 0, 'Y': 0, 'Size': '1x1', 'IsSlot': true, 'SlotId': 'slot_001', 'Weight': 100 },
      { 'X': 1, 'Y': 0, 'Size': '2x1', 'IsSlot': true, 'SlotId': 'slot_002', 'Weight': 100 },
      { 'X': 0, 'Y': 1, 'Size': '1x2', 'IsSlot': true, 'SlotId': 'slot_003', 'Weight': 100 }
    ];
    
    const ws1 = XLSX.utils.json_to_sheet(layout1);
    XLSX.utils.book_append_sheet(workbook, ws1, 'layout_1');
    
    // 布局2
    const layout2 = [
      { 'Name': 'Advanced Layout', 'Description': 'An advanced layout', 'Width': 4, 'Height': 4 },
      { 'X': 0, 'Y': 0, 'Size': '2x2', 'IsSlot': true, 'SlotId': 'slot_004', 'Weight': 100 },
      { 'X': 2, 'Y': 0, 'Size': '1x1', 'IsSlot': true, 'SlotId': 'slot_005', 'Weight': 100 }
    ];
    
    const ws2 = XLSX.utils.json_to_sheet(layout2);
    XLSX.utils.book_append_sheet(workbook, ws2, 'layout_2');
    
    // 确保目录存在
    if (!existsSync(this.excelPath)) {
      mkdirSync(this.excelPath, { recursive: true });
    }
    
    XLSX.writeFile(workbook, join(this.excelPath, 'layouts.xlsx'));
    console.log('📝 布局模板已创建');
  }

  /**
   * 写入JSON文件
   */
  private writeJsonFile(name: string, data: any): void {
    const filePath = join(this.jsonPath, `${name}.json`);
    
    // 确保目录存在
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * 写入Excel文件
   */
  private writeExcelFile(name: string, data: any[]): void {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // 确保目录存在
    if (!existsSync(this.excelPath)) {
      mkdirSync(this.excelPath, { recursive: true });
    }
    
    XLSX.writeFile(workbook, join(this.excelPath, `${name}.xlsx`));
  }

  /**
   * 映射品质
   */
  private mapQuality(quality: string): string {
    const qualityMap: Record<string, string> = {
      '白': 'white',
      '绿': 'green', 
      '蓝': 'blue',
      '紫': 'purple',
      '金': 'gold',
      '红': 'red',
      'white': 'white',
      'green': 'green',
      'blue': 'blue',
      'purple': 'purple',
      'gold': 'gold',
      'red': 'red'
    };
    
    return qualityMap[quality] || 'white';
  }

  /**
   * 映射稀有度
   */
  private mapRarity(rarity: string): string {
    const rarityMap: Record<string, string> = {
      '常见': 'common',
      '稀有': 'rare',
      '史诗': 'epic',
      '传奇': 'legendary',
      '至尊': 'mythic',
      'common': 'common',
      'rare': 'rare',
      'epic': 'epic',
      'legendary': 'legendary',
      'mythic': 'mythic'
    };
    
    return rarityMap[rarity] || 'common';
  }

  /**
   * 解析数组字符串
   */
  private parseArray(value: string | any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const converter = new ExcelToJsonConverter();
  
  if (args.includes('--template') || args.includes('-t')) {
    converter.createTemplates();
  } else if (args.includes('--items') || args.includes('-i')) {
    converter.convertItems();
  } else if (args.includes('--containers') || args.includes('-c')) {
    converter.convertContainers();
  } else if (args.includes('--layouts') || args.includes('-l')) {
    converter.convertLayouts();
  } else {
    converter.convertAll();
  }
}
