const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

/**
 * JSON to Excel转换器
 * 从API配置生成Excel文档
 */
class JsonToExcelConverter {
    constructor(apiBaseUrl = 'http://localhost:3001', outputPath = 'excel') {
        this.apiBaseUrl = apiBaseUrl;
        this.outputPath = outputPath;
        this.ensureOutputDirectory();
    }

    /**
     * 确保输出目录存在
     */
    ensureOutputDirectory() {
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath, { recursive: true });
        }
    }

    /**
     * 从API获取配置数据
     */
    async fetchConfigData() {
        try {
            console.log('📡 从API获取配置数据...');
            const response = await fetch(`${this.apiBaseUrl}/api/config`);
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                return result.data;
            } else if (result.items && result.containers && result.layouts) {
                return result;
            } else {
                throw new Error('API响应格式不正确');
            }
        } catch (error) {
            throw new Error(`获取配置数据失败: ${error.message}`);
        }
    }

    /**
     * 转换所有配置为Excel
     */
    async convertAll() {
        try {
            console.log('🔄 开始从API配置生成Excel文档...');
            
            const configData = await this.fetchConfigData();
            
            await this.convertItems(configData.items);
            await this.convertContainers(configData.containers);  
            await this.convertLayouts(configData.layouts);
            
            console.log('✅ Excel文档生成完成！');
            console.log(`📂 输出目录: ${path.resolve(this.outputPath)}`);
            
        } catch (error) {
            console.error('❌ 转换失败:', error.message);
            process.exit(1);
        }
    }

    /**
     * 转换物品配置为Excel
     */
    async convertItems(items) {
        console.log('📦 生成物品配置表...');
        
        // 准备表头
        const headers = [
            'id', 'name', 'desc', 'quality', 'category', 'size', 'icon', 'weight'
        ];
        
        // 准备数据行
        const rows = [headers];
        
        items.forEach(item => {
            const row = [
                item.id || '',
                item.name || '',
                item.desc || item.description || '',
                item.quality || 1,
                item.category || 1,
                item.size || '1x1',
                item.icon || '',
                item.weight || 1
            ];
            rows.push(row);
        });

        // 创建工作表
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        
        // 设置列宽
        const colWidths = [
            { wch: 8 },  // id
            { wch: 20 }, // name
            { wch: 30 }, // desc
            { wch: 10 }, // quality
            { wch: 10 }, // category
            { wch: 10 }, // size
            { wch: 25 }, // icon
            { wch: 10 }  // weight
        ];
        worksheet['!cols'] = colWidths;

        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');
        
        // 写入文件
        const filePath = path.join(this.outputPath, 'items.xlsx');
        XLSX.writeFile(workbook, filePath);
        console.log(`  ✅ 已生成: ${filePath} (${items.length} 个物品)`);
    }

    /**
     * 转换容器配置为Excel
     */
    async convertContainers(containers) {
        console.log('📦 生成容器配置表...');
        
        // 准备表头
        const headers = [
            'id', 'name', 'cost', 'rarity', 'width', 'height', 
            'layoutIds', 'itemPool', 'color', 'description'
        ];
        
        // 准备数据行
        const rows = [headers];
        
        Object.values(containers).forEach(container => {
            const row = [
                container.id || '',
                container.name || '',
                container.cost || 0,
                container.rarity || '',
                container.width || 4,
                container.height || 4,
                Array.isArray(container.layoutIds) ? container.layoutIds.join(',') : '',
                Array.isArray(container.itemPool) ? container.itemPool.join(',') : '',
                container.color || '',
                container.description || ''
            ];
            rows.push(row);
        });

        // 创建工作表
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        
        // 设置列宽
        const colWidths = [
            { wch: 8 },  // id
            { wch: 20 }, // name
            { wch: 10 }, // cost
            { wch: 12 }, // rarity
            { wch: 8 },  // width
            { wch: 8 },  // height
            { wch: 25 }, // layoutIds
            { wch: 25 }, // itemPool
            { wch: 12 }, // color
            { wch: 30 }  // description
        ];
        worksheet['!cols'] = colWidths;

        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Containers');
        
        // 写入文件
        const filePath = path.join(this.outputPath, 'containers.xlsx');
        XLSX.writeFile(workbook, filePath);
        console.log(`  ✅ 已生成: ${filePath} (${Object.keys(containers).length} 个容器)`);
    }

    /**
     * 转换布局配置为Excel
     */
    async convertLayouts(layouts) {
        console.log('📐 生成布局配置表...');
        
        // 准备表头
        const headers = [
            'id', 'name', 'positions'
        ];
        
        // 准备数据行
        const rows = [headers];
        
        Object.entries(layouts).forEach(([layoutId, layout]) => {
            // 将positions数组转换为JSON字符串
            const positionsJson = JSON.stringify(layout.positions || []);
            
            const row = [
                layoutId,
                layout.name || layoutId,
                positionsJson
            ];
            rows.push(row);
        });

        // 创建工作表
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        
        // 设置列宽
        const colWidths = [
            { wch: 15 }, // id
            { wch: 25 }, // name
            { wch: 100 } // positions (JSON)
        ];
        worksheet['!cols'] = colWidths;

        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Layouts');
        
        // 写入文件
        const filePath = path.join(this.outputPath, 'layouts.xlsx');
        XLSX.writeFile(workbook, filePath);
        console.log(`  ✅ 已生成: ${filePath} (${Object.keys(layouts).length} 个布局)`);
    }

    /**
     * 生成统一的配置文档
     */
    async generateUnifiedExcel() {
        try {
            console.log('📋 生成统一配置文档...');
            
            const configData = await this.fetchConfigData();
            const workbook = XLSX.utils.book_new();

            // 添加物品表
            const itemHeaders = ['id', 'name', 'desc', 'quality', 'category', 'size', 'icon', 'weight'];
            const itemRows = [itemHeaders];
            configData.items.forEach(item => {
                itemRows.push([
                    item.id || '', item.name || '', item.desc || item.description || '',
                    item.quality || 1, item.category || 1, item.size || '1x1',
                    item.icon || '', item.weight || 1
                ]);
            });
            const itemSheet = XLSX.utils.aoa_to_sheet(itemRows);
            itemSheet['!cols'] = [
                {wch:8}, {wch:20}, {wch:30}, {wch:10}, 
                {wch:10}, {wch:10}, {wch:25}, {wch:10}
            ];
            XLSX.utils.book_append_sheet(workbook, itemSheet, 'Items');

            // 添加容器表
            const containerHeaders = [
                'id', 'name', 'cost', 'rarity', 'width', 'height', 
                'layoutIds', 'itemPool', 'color', 'description'
            ];
            const containerRows = [containerHeaders];
            Object.values(configData.containers).forEach(container => {
                containerRows.push([
                    container.id || '', container.name || '', container.cost || 0,
                    container.rarity || '', container.width || 4, container.height || 4,
                    Array.isArray(container.layoutIds) ? container.layoutIds.join(',') : '',
                    Array.isArray(container.itemPool) ? container.itemPool.join(',') : '',
                    container.color || '', container.description || ''
                ]);
            });
            const containerSheet = XLSX.utils.aoa_to_sheet(containerRows);
            containerSheet['!cols'] = [
                {wch:8}, {wch:20}, {wch:10}, {wch:12}, {wch:8}, {wch:8},
                {wch:25}, {wch:25}, {wch:12}, {wch:30}
            ];
            XLSX.utils.book_append_sheet(workbook, containerSheet, 'Containers');

            // 添加布局表
            const layoutHeaders = ['id', 'name', 'positions'];
            const layoutRows = [layoutHeaders];
            Object.entries(configData.layouts).forEach(([layoutId, layout]) => {
                layoutRows.push([
                    layoutId,
                    layout.name || layoutId,
                    JSON.stringify(layout.positions || [])
                ]);
            });
            const layoutSheet = XLSX.utils.aoa_to_sheet(layoutRows);
            layoutSheet['!cols'] = [{wch:15}, {wch:25}, {wch:100}];
            XLSX.utils.book_append_sheet(workbook, layoutSheet, 'Layouts');

            // 写入统一文件
            const filePath = path.join(this.outputPath, 'delta-force-config.xlsx');
            XLSX.writeFile(workbook, filePath);
            console.log(`  ✅ 已生成统一配置文档: ${filePath}`);
            
            return filePath;
            
        } catch (error) {
            console.error('❌ 生成统一配置文档失败:', error.message);
            throw error;
        }
    }
}

// 命令行执行
if (require.main === module) {
    const converter = new JsonToExcelConverter();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--unified') || args.includes('-u')) {
        converter.generateUnifiedExcel();
    } else if (args.includes('--items') || args.includes('-i')) {
        converter.fetchConfigData().then(data => converter.convertItems(data.items));
    } else if (args.includes('--containers') || args.includes('-c')) {
        converter.fetchConfigData().then(data => converter.convertContainers(data.containers));
    } else if (args.includes('--layouts') || args.includes('-l')) {
        converter.fetchConfigData().then(data => converter.convertLayouts(data.layouts));
    } else {
        converter.convertAll();
    }
}

module.exports = JsonToExcelConverter;
