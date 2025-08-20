const fs = require('fs');
const path = require('path');

// 读取layouts.json文件
const layoutsPath = path.join(__dirname, 'json', 'layouts.json');
const layouts = JSON.parse(fs.readFileSync(layoutsPath, 'utf8'));

console.log('🔄 开始更新布局权重...');

// 为每个布局添加权重字段（如果没有的话）
let updated = 0;
for (const [layoutId, layout] of Object.entries(layouts)) {
    if (layout.weight === undefined) {
        // 根据布局的复杂度设置不同的默认权重
        const positionCount = layout.positions ? layout.positions.length : 0;
        
        // 权重策略：
        // - 空布局: 权重 0.1 (很少被选中)
        // - 1-3个物品: 权重 3 (较高概率，适合小容器)
        // - 4-6个物品: 权重 5 (标准概率)
        // - 7-10个物品: 权重 4 (稍低概率)
        // - 11+个物品: 权重 2 (较低概率，复杂布局)
        
        let defaultWeight;
        if (positionCount === 0) {
            defaultWeight = 0.1;
        } else if (positionCount <= 3) {
            defaultWeight = 3;
        } else if (positionCount <= 6) {
            defaultWeight = 5;
        } else if (positionCount <= 10) {
            defaultWeight = 4;
        } else {
            defaultWeight = 2;
        }
        
        layout.weight = defaultWeight;
        updated++;
        
        console.log(`✅ ${layoutId} (${layout.name || '无名'}): 物品${positionCount}个 → 权重${defaultWeight}`);
    } else {
        console.log(`⏭️  ${layoutId} (${layout.name || '无名'}): 已有权重${layout.weight}`);
    }
}

// 保存更新后的文件
fs.writeFileSync(layoutsPath, JSON.stringify(layouts, null, 2), 'utf8');

console.log(`\n📊 更新完成！`);
console.log(`- 已更新: ${updated}个布局`);
console.log(`- 总计: ${Object.keys(layouts).length}个布局`);
console.log(`- 文件已保存: ${layoutsPath}`);
