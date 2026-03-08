// ============================================
// 铁血星域 - 游戏配置与数据定义
// ============================================

const CONFIG = {
    VERSION: '0.1.0',
    GAME_TITLE: '铁血星域：帝国黎明',
    MAX_TURN: 999,
    BASE_YEAR: 41000,
    AUTOSAVE_INTERVAL: 10, // 每10回合自动存档

    // 难度修正
    DIFFICULTY: {
        easy:   { resourceMod: 1.3, enemyMod: 0.7, eventMod: 0.8 },
        normal: { resourceMod: 1.0, enemyMod: 1.0, eventMod: 1.0 },
        hard:   { resourceMod: 0.7, enemyMod: 1.3, eventMod: 1.2 },
        brutal: { resourceMod: 0.5, enemyMod: 1.6, eventMod: 1.5 }
    }
};

// ============ 资源定义 ============
const RESOURCES = {
    metal: {
        id: 'metal', name: '铸铁', icon: '⛏️',
        color: 'var(--res-metal)',
        desc: '帝国建设的基础材料。从矿脉中开采、在熔炉中锻造。'
    },
    fuel: {
        id: 'fuel', name: '蒸汽燃料', icon: '🛢️',
        color: 'var(--res-fuel)',
        desc: '驱动一切机械的以太浓缩燃料。没有它，帝国将陷入死寂。'
    },
    food: {
        id: 'food', name: '口粮', icon: '🌾',
        color: 'var(--res-food)',
        desc: '维持人口生存的合成食物。在水培农场和菌丝培养器中生产。'
    },
    crystal: {
        id: 'crystal', name: '以太水晶', icon: '💎',
        color: 'var(--res-crystal)',
        desc: '稀有的能量结晶体，用于高级科研和以太引擎。'
    },
    credits: {
        id: 'credits', name: '帝国信用', icon: '💰',
        color: 'var(--res-credits)',
        desc: '通用货币单位。维持经济运转和星际贸易的血液。'
    },
    faith: {
        id: 'faith', name: '信仰之力', icon: '✝️',
        color: 'var(--res-faith)',
        desc: '源自齿轮神教的精神力量。可以激励民众、驱除异端。'
    },
    manpower: {
        id: 'manpower', name: '可用人力', icon: '👤',
        color: 'var(--res-manpower)',
        desc: '可动员的劳动力和兵源。来自殖民地人口。'
    },
    research: {
        id: 'research', name: '研究点数', icon: '🔬',
        color: 'var(--info)',
        desc: '科研机构产出的知识积累。用于解锁新科技。'
    }
};

// ============ 起源背景 ============
const ORIGINS = [
    {
        id: 'forge_world',
        name: '锻造世界',
        icon: '⚙️',
        desc: '你来自一颗古老的工业星球，拥有丰富的机械制造传统。',
        bonuses: { metal: 20, fuel: 10 },
        penalties: { food: -5 },
        traits: ['工业效率+15%', '建造速度+10%'],
        startBuildings: ['iron_foundry', 'steam_generator']
    },
    {
        id: 'agri_world',
        name: '农业世界',
        icon: '🌾',
        desc: '一片肥沃的田园世界，人口众多但工业基础薄弱。',
        bonuses: { food: 25, manpower: 15 },
        penalties: { metal: -5 },
        traits: ['人口增长+20%', '口粮产量+15%'],
        startBuildings: ['hydro_farm', 'hab_block']
    },
    {
        id: 'void_born',
        name: '虚空之子',
        icon: '🚀',
        desc: '在巨型太空站中出生和成长，天生的航行者和探索者。',
        bonuses: { credits: 15, crystal: 5 },
        penalties: { manpower: -10 },
        traits: ['贸易收入+20%', '探索速度+25%'],
        startBuildings: ['trading_post', 'aether_scanner']
    },
    {
        id: 'shrine_world',
        name: '圣殿世界',
        icon: '✝️',
        desc: '一颗充满信仰狂热的世界，齿轮神教的力量深入骨髓。',
        bonuses: { faith: 20, manpower: 10 },
        penalties: { research: -5 },
        traits: ['忠诚度+25%', '信仰产出+30%'],
        startBuildings: ['chapel_of_gears', 'hab_block']
    },
    {
        id: 'research_outpost',
        name: '研究前哨',
        icon: '🔬',
        desc: '一座偏远的科研基地，拥有珍贵的古代科技残骸。',
        bonuses: { research: 15, crystal: 5 },
        penalties: { manpower: -10, food: -5 },
        traits: ['科研速度+25%', '解锁古科技概率+15%'],
        startBuildings: ['research_lab', 'aether_scanner']
    },
    {
        id: 'penal_colony',
        name: '流刑星',
        icon: '⛓️',
        desc: '帝国的监狱星球。人口充裕但桀骜不驯，需要铁腕统治。',
        bonuses: { manpower: 30 },
        penalties: { faith: -10, credits: -5 },
        traits: ['征兵速度+30%', '起始忠诚度-20'],
        startBuildings: ['hab_block', 'enforcer_station']
    }
];

// ============ 星球类型 ============
const PLANET_TYPES = [
    {
        id: 'temperate',
        name: '温和星球',
        icon: '🌍',
        desc: '气候宜人，适合大规模殖民。资源分布均衡。',
        resourceMod: { metal: 1.0, fuel: 1.0, food: 1.2, crystal: 0.8 },
        maxBuildings: 30,
        traits: ['均衡发展', '建筑上限:30']
    },
    {
        id: 'volcanic',
        name: '火山星球',
        icon: '🌋',
        desc: '地表布满岩浆河与矿脉，矿产丰富但环境恶劣。',
        resourceMod: { metal: 1.5, fuel: 1.3, food: 0.5, crystal: 1.0 },
        maxBuildings: 25,
        traits: ['矿产丰富', '食物匮乏', '建筑上限:25']
    },
    {
        id: 'frozen',
        name: '冰封星球',
        icon: '❄️',
        desc: '极寒世界，冰层之下蕴藏着大量以太水晶。',
        resourceMod: { metal: 0.8, fuel: 1.2, food: 0.6, crystal: 1.8 },
        maxBuildings: 22,
        traits: ['水晶丰富', '食物稀缺', '建筑上限:22']
    },
    {
        id: 'desert',
        name: '荒漠星球',
        icon: '🏜️',
        desc: '干燥的沙漠世界，燃料矿藏丰富，但水源稀缺。',
        resourceMod: { metal: 1.0, fuel: 1.8, food: 0.4, crystal: 0.7 },
        maxBuildings: 24,
        traits: ['燃料丰富', '极度缺水', '建筑上限:24']
    },
    {
        id: 'death_world',
        name: '死亡世界',
        icon: '☠️',
        desc: '极端危险的星球，处处致命。但资源异常丰富，适合强者。',
        resourceMod: { metal: 1.4, fuel: 1.4, food: 0.3, crystal: 1.5 },
        maxBuildings: 20,
        traits: ['全资源丰富', '极端恶劣', '建筑上限:20', '随机灾害+50%']
    }
];

// ============ 建筑定义 ============
const BUILDINGS = {
    // --- 基础设施 ---
    hab_block: {
        id: 'hab_block', name: '居住模块', icon: '🏠', category: 'infrastructure',
        desc: '标准的蜂巢式居住单元，容纳帝国忠诚的子民。',
        cost: { metal: 30, credits: 20 },
        buildTime: 2,
        effects: { maxPopulation: 100, manpower: 3 },
        upkeep: { credits: 2, fuel: 1 },
        unlocked: true
    },
    iron_foundry: {
        id: 'iron_foundry', name: '铸铁熔炉', icon: '🏭', category: 'industry',
        desc: '基础冶炼设施，将粗矿石锻造为可用的铸铁。',
        cost: { metal: 20, credits: 15 },
        buildTime: 2,
        effects: { metalProduction: 8 },
        upkeep: { fuel: 2, manpower: 5 },
        unlocked: true
    },
    steam_generator: {
        id: 'steam_generator', name: '蒸汽发电机', icon: '⚡', category: 'industry',
        desc: '以太驱动的蒸汽涡轮，为殖民地提供动力。',
        cost: { metal: 25, credits: 20 },
        buildTime: 2,
        effects: { fuelProduction: 6 },
        upkeep: { manpower: 3 },
        unlocked: true
    },
    hydro_farm: {
        id: 'hydro_farm', name: '水培农场', icon: '🌱', category: 'infrastructure',
        desc: '全封闭水培种植系统，在恶劣环境中生产口粮。',
        cost: { metal: 20, credits: 10 },
        buildTime: 2,
        effects: { foodProduction: 10 },
        upkeep: { fuel: 1, manpower: 4 },
        unlocked: true
    },
    trading_post: {
        id: 'trading_post', name: '贸易站', icon: '🏪', category: 'commerce',
        desc: '与过往商船进行贸易的基础设施。',
        cost: { metal: 35, credits: 30 },
        buildTime: 3,
        effects: { creditsProduction: 8, tradeSlots: 1 },
        upkeep: { fuel: 1, manpower: 3 },
        unlocked: true
    },
    research_lab: {
        id: 'research_lab', name: '研究实验室', icon: '🔬', category: 'science',
        desc: '基础科研设施，由机械神甫主持。',
        cost: { metal: 40, credits: 30 },
        buildTime: 3,
        effects: { researchProduction: 5 },
        upkeep: { fuel: 2, credits: 3, manpower: 3 },
        unlocked: true
    },
    chapel_of_gears: {
        id: 'chapel_of_gears', name: '齿轮礼拜堂', icon: '⛪', category: 'faith',
        desc: '供奉万机之神的圣殿，传播齿轮神教的教义。',
        cost: { metal: 30, credits: 20 },
        buildTime: 2,
        effects: { faithProduction: 5, loyaltyBonus: 3 },
        upkeep: { credits: 2, manpower: 2 },
        unlocked: true
    },
    enforcer_station: {
        id: 'enforcer_station', name: '执法者哨站', icon: '🛡️', category: 'military',
        desc: '维持殖民地秩序的准军事力量驻地。',
        cost: { metal: 25, credits: 25 },
        buildTime: 2,
        effects: { stabilityBonus: 5, loyaltyBonus: 2 },
        upkeep: { credits: 3, manpower: 5 },
        unlocked: true
    },
    aether_scanner: {
        id: 'aether_scanner', name: '以太扫描仪', icon: '📡', category: 'science',
        desc: '探测周边星系的远程扫描设备。',
        cost: { metal: 45, crystal: 5, credits: 40 },
        buildTime: 4,
        effects: { scanRange: 1, researchProduction: 2 },
        upkeep: { fuel: 3, crystal: 1 },
        unlocked: true
    },
    // --- 进阶建筑 ---
    macro_foundry: {
        id: 'macro_foundry', name: '宏观铸造厂', icon: '🏗️', category: 'industry',
        desc: '大规模自动化冶炼设施，产量数倍于普通熔炉。',
        cost: { metal: 80, fuel: 30, credits: 60 },
        buildTime: 5,
        effects: { metalProduction: 25 },
        upkeep: { fuel: 8, manpower: 10 },
        requires: ['tech_advanced_metallurgy'],
        unlocked: false
    },
    plasma_reactor: {
        id: 'plasma_reactor', name: '等离子反应堆', icon: '☢️', category: 'industry',
        desc: '以太水晶驱动的高级能源设施，产能远超蒸汽发电。',
        cost: { metal: 100, crystal: 15, credits: 80 },
        buildTime: 6,
        effects: { fuelProduction: 30, maxPopulation: 50 },
        upkeep: { crystal: 2, manpower: 5 },
        requires: ['tech_plasma_containment'],
        unlocked: false
    },
    cathedral_mechanicus: {
        id: 'cathedral_mechanicus', name: '机械神殿', icon: '🏛️', category: 'faith',
        desc: '宏伟的齿轮神教大教堂，信仰的辐射中心。',
        cost: { metal: 120, crystal: 10, credits: 100 },
        buildTime: 8,
        effects: { faithProduction: 20, loyaltyBonus: 10, researchProduction: 3 },
        upkeep: { credits: 8, manpower: 8 },
        requires: ['tech_advanced_theology'],
        unlocked: false
    },
    orbital_dock: {
        id: 'orbital_dock', name: '轨道船坞', icon: '🚀', category: 'military',
        desc: '建造和维修星际舰船的轨道设施。',
        cost: { metal: 150, fuel: 50, crystal: 10, credits: 120 },
        buildTime: 8,
        effects: { shipBuildSpeed: 1, maxFleetSize: 3 },
        upkeep: { fuel: 5, credits: 10, manpower: 15 },
        requires: ['tech_void_construction'],
        unlocked: false
    },
    merchant_guild: {
        id: 'merchant_guild', name: '商会公馆', icon: '🏦', category: 'commerce',
        desc: '星际商人行会的分部，大幅提升贸易能力。',
        cost: { metal: 60, credits: 100 },
        buildTime: 5,
        effects: { creditsProduction: 20, tradeSlots: 3 },
        upkeep: { manpower: 5 },
        requires: ['tech_trade_networks'],
        unlocked: false
    },
    gene_lab: {
        id: 'gene_lab', name: '基因工坊', icon: '🧬', category: 'science',
        desc: '研究和改良人类基因的秘密实验室。',
        cost: { metal: 70, crystal: 20, credits: 80 },
        buildTime: 6,
        effects: { researchProduction: 12, populationGrowthBonus: 5 },
        upkeep: { crystal: 3, credits: 5, manpower: 4 },
        requires: ['tech_bio_augmentation'],
        unlocked: false
    },
    fortress_bastion: {
        id: 'fortress_bastion', name: '星堡壁垒', icon: '🏰', category: 'military',
        desc: '坚不可摧的行星防御工事，令入侵者望而却步。',
        cost: { metal: 200, fuel: 40, credits: 100 },
        buildTime: 10,
        effects: { defenseBonus: 50, stabilityBonus: 10 },
        upkeep: { fuel: 5, credits: 8, manpower: 20 },
        requires: ['tech_fortification'],
        unlocked: false
    },
    xeno_vault: {
        id: 'xeno_vault', name: '异种遗物库', icon: '👽', category: 'science',
        desc: '存储和研究异星文明遗物的高度机密设施。',
        cost: { metal: 80, crystal: 30, credits: 120 },
        buildTime: 7,
        effects: { researchProduction: 20, crystalProduction: 3 },
        upkeep: { crystal: 2, credits: 10, manpower: 6 },
        requires: ['tech_xenoarchaeology'],
        unlocked: false
    }
};

// ============ 科技定义 ============
const TECHNOLOGIES = {
    // --- 工业科技线 ---
    tech_improved_smelting: {
        id: 'tech_improved_smelting', name: '改良冶炼术', branch: 'industry',
        icon: '🔥', tier: 1, cost: 30,
        desc: '改进熔炉的温度控制系统，提高冶炼效率。',
        effects: { metalProductionMod: 0.15 },
        requires: [],
        unlocked: true
    },
    tech_steam_optimization: {
        id: 'tech_steam_optimization', name: '蒸汽优化', branch: 'industry',
        icon: '♨️', tier: 1, cost: 25,
        desc: '更高效的蒸汽循环系统，减少燃料消耗。',
        effects: { fuelUpkeepMod: -0.10 },
        requires: [],
        unlocked: true
    },
    tech_advanced_metallurgy: {
        id: 'tech_advanced_metallurgy', name: '高级冶金学', branch: 'industry',
        icon: '⚒️', tier: 2, cost: 60,
        desc: '解锁合金锻造技术和宏观铸造厂。',
        effects: { metalProductionMod: 0.20, unlock: ['macro_foundry'] },
        requires: ['tech_improved_smelting'],
        unlocked: false
    },
    tech_plasma_containment: {
        id: 'tech_plasma_containment', name: '等离子约束', branch: 'industry',
        icon: '⚡', tier: 3, cost: 100,
        desc: '掌握高温等离子体的约束技术，解锁等离子反应堆。',
        effects: { fuelProductionMod: 0.25, unlock: ['plasma_reactor'] },
        requires: ['tech_steam_optimization', 'tech_advanced_metallurgy'],
        unlocked: false
    },
    tech_automated_production: {
        id: 'tech_automated_production', name: '自动化生产', branch: 'industry',
        icon: '🤖', tier: 3, cost: 90,
        desc: '引入机械仆从辅助生产线，减少人力需求。',
        effects: { manpowerUpkeepMod: -0.20 },
        requires: ['tech_advanced_metallurgy'],
        unlocked: false
    },

    // --- 军事科技线 ---
    tech_militia_training: {
        id: 'tech_militia_training', name: '民兵训练', branch: 'military',
        icon: '🎯', tier: 1, cost: 25,
        desc: '对殖民地居民进行基础军事训练。',
        effects: { defenseBonus: 10 },
        requires: [],
        unlocked: true
    },
    tech_iron_discipline: {
        id: 'tech_iron_discipline', name: '铁血纪律', branch: 'military',
        icon: '⚔️', tier: 1, cost: 30,
        desc: '严格的军事纪律体系，提高部队战斗力。',
        effects: { armyStrengthMod: 0.15 },
        requires: [],
        unlocked: true
    },
    tech_void_construction: {
        id: 'tech_void_construction', name: '虚空造船术', branch: 'military',
        icon: '🚀', tier: 2, cost: 80,
        desc: '掌握星际舰船的建造技术，解锁轨道船坞。',
        effects: { unlock: ['orbital_dock'] },
        requires: ['tech_iron_discipline'],
        unlocked: false
    },
    tech_fortification: {
        id: 'tech_fortification', name: '要塞工程学', branch: 'military',
        icon: '🏰', tier: 2, cost: 65,
        desc: '先进的防御工事设计，解锁星堡壁垒。',
        effects: { defenseBonus: 20, unlock: ['fortress_bastion'] },
        requires: ['tech_militia_training'],
        unlocked: false
    },
    tech_heavy_armaments: {
        id: 'tech_heavy_armaments', name: '重型武装', branch: 'military',
        icon: '💣', tier: 3, cost: 120,
        desc: '为舰队装备重型火炮和装甲。',
        effects: { fleetStrengthMod: 0.25 },
        requires: ['tech_void_construction'],
        unlocked: false
    },

    // --- 社会科技线 ---
    tech_efficient_farming: {
        id: 'tech_efficient_farming', name: '高效农业', branch: 'society',
        icon: '🌾', tier: 1, cost: 20,
        desc: '改良水培技术，提高食物产量。',
        effects: { foodProductionMod: 0.20 },
        requires: [],
        unlocked: true
    },
    tech_trade_networks: {
        id: 'tech_trade_networks', name: '贸易网络', branch: 'society',
        icon: '💰', tier: 1, cost: 30,
        desc: '建立更广泛的星际贸易联系。解锁商会公馆。',
        effects: { creditsProductionMod: 0.15, unlock: ['merchant_guild'] },
        requires: [],
        unlocked: true
    },
    tech_propaganda: {
        id: 'tech_propaganda', name: '帝国宣传术', branch: 'society',
        icon: '📢', tier: 2, cost: 45,
        desc: '系统化的宣传体系，提高民众忠诚度。',
        effects: { loyaltyGrowthMod: 0.25 },
        requires: ['tech_trade_networks'],
        unlocked: false
    },
    tech_bio_augmentation: {
        id: 'tech_bio_augmentation', name: '生体强化', branch: 'society',
        icon: '🧬', tier: 3, cost: 110,
        desc: '通过基因改造增强人类体能和适应性。解锁基因工坊。',
        effects: { populationGrowthMod: 0.15, unlock: ['gene_lab'] },
        requires: ['tech_efficient_farming', 'tech_propaganda'],
        unlocked: false
    },

    // --- 探索科技线 ---
    tech_deep_scanning: {
        id: 'tech_deep_scanning', name: '深空扫描', branch: 'exploration',
        icon: '📡', tier: 1, cost: 30,
        desc: '增强以太扫描仪的探测距离。',
        effects: { scanRangeBonus: 1 },
        requires: [],
        unlocked: true
    },
    tech_advanced_theology: {
        id: 'tech_advanced_theology', name: '高等神学', branch: 'exploration',
        icon: '📖', tier: 1, cost: 35,
        desc: '深入研究齿轮神教的奥义。解锁机械神殿。',
        effects: { faithProductionMod: 0.20, unlock: ['cathedral_mechanicus'] },
        requires: [],
        unlocked: true
    },
    tech_xenoarchaeology: {
        id: 'tech_xenoarchaeology', name: '异星考古学', branch: 'exploration',
        icon: '🗿', tier: 2, cost: 75,
        desc: '研究异星文明遗迹的科学方法。解锁异种遗物库。',
        effects: { unlock: ['xeno_vault'] },
        requires: ['tech_deep_scanning'],
        unlocked: false
    },
    tech_warp_theory: {
        id: 'tech_warp_theory', name: '裂隙跃迁理论', branch: 'exploration',
        icon: '🌀', tier: 3, cost: 150,
        desc: '理解以太裂隙的理论基础，大幅提升星际航行能力。',
        effects: { travelSpeedMod: 0.50 },
        requires: ['tech_xenoarchaeology', 'tech_advanced_theology'],
        unlocked: false
    }
};

// ============ 舰船定义 ============
const SHIP_TYPES = {
    patrol_craft: {
                id: 'patrol_craft', name: '巡逻艇', icon: '🔹',
        desc: '轻型护卫舰艇，适合侦察和反海盗巡逻。',
        cost: { metal: 40, fuel: 15, credits: 30 },
        buildTime: 3,
        upkeep: { fuel: 2, credits: 3 },
        stats: { attack: 8, defense: 5, speed: 12, hull: 30 },
        requires: ['tech_void_construction']
    },
    frigate: {
        id: 'frigate', name: '铁甲护卫舰', icon: '🔷',
        desc: '标准战斗舰艇，帝国舰队的中坚力量。',
        cost: { metal: 80, fuel: 30, credits: 60 },
        buildTime: 5,
        upkeep: { fuel: 4, credits: 5 },
        stats: { attack: 18, defense: 15, speed: 8, hull: 80 },
        requires: ['tech_void_construction']
    },
    cruiser: {
        id: 'cruiser', name: '蒸汽巡洋舰', icon: '🔶',
        desc: '重型战舰，装备大口径蒸汽炮和厚重装甲。',
        cost: { metal: 160, fuel: 60, crystal: 10, credits: 120 },
        buildTime: 8,
        upkeep: { fuel: 8, credits: 10 },
        stats: { attack: 35, defense: 30, speed: 5, hull: 180 },
        requires: ['tech_heavy_armaments']
    },
    battleship: {
        id: 'battleship', name: '无畏战列舰', icon: '💠',
        desc: '帝国海军的终极力量，移动的钢铁堡垒。',
        cost: { metal: 300, fuel: 100, crystal: 25, credits: 250 },
        buildTime: 12,
        upkeep: { fuel: 15, credits: 20 },
        stats: { attack: 70, defense: 60, speed: 3, hull: 400 },
        requires: ['tech_heavy_armaments']
    },
    transport: {
        id: 'transport', name: '运输驳船', icon: '📦',
        desc: '大型货运船只，用于星际贸易和部队运输。',
        cost: { metal: 50, fuel: 20, credits: 40 },
        buildTime: 4,
        upkeep: { fuel: 3, credits: 2 },
        stats: { attack: 2, defense: 8, speed: 6, hull: 60, cargo: 100 },
        requires: ['tech_void_construction']
    },
    colony_ship: {
        id: 'colony_ship', name: '殖民方舟', icon: '🏛️',
        desc: '搭载殖民者和基础设施的巨型船只，可建立新殖民地。',
        cost: { metal: 200, fuel: 80, food: 100, crystal: 15, credits: 200 },
        buildTime: 10,
        upkeep: { fuel: 10, food: 5, credits: 8 },
        stats: { attack: 0, defense: 15, speed: 3, hull: 120, colonize: true },
        requires: ['tech_void_construction']
    }
};

// ============ 贸易商品 ============
const TRADE_GOODS = {
    raw_ore: {
        id: 'raw_ore', name: '粗矿石', icon: '🪨',
        basePrice: 5, volatility: 0.2,
        desc: '未经加工的矿石，最基础的贸易商品。'
    },
    refined_metal: {
        id: 'refined_metal', name: '精炼金属', icon: '🔩',
        basePrice: 12, volatility: 0.15,
        desc: '经过冶炼的高品质金属，工业需求量大。'
    },
    aether_fuel: {
        id: 'aether_fuel', name: '以太浓缩液', icon: '⚗️',
        basePrice: 15, volatility: 0.25,
        desc: '高纯度蒸汽燃料，星际航行的必需品。'
    },
    synth_food: {
        id: 'synth_food', name: '合成口粮', icon: '🥫',
        basePrice: 8, volatility: 0.3,
        desc: '标准化合成食物，长期保存不变质。'
    },
    aether_crystals: {
        id: 'aether_crystals', name: '以太碎晶', icon: '✨',
        basePrice: 40, volatility: 0.35,
        desc: '小块以太水晶，科研和高端制造的关键材料。'
    },
    holy_relics: {
        id: 'holy_relics', name: '圣齿轮遗物', icon: '⚙️',
        basePrice: 60, volatility: 0.4,
        desc: '齿轮神教的圣物，信仰的有价证明。'
    },
    weapons: {
        id: 'weapons', name: '军用武器', icon: '🔫',
        basePrice: 25, volatility: 0.3,
        desc: '标准制式武器装备。'
    },
    luxury_goods: {
        id: 'luxury_goods', name: '奢侈品', icon: '💎',
        basePrice: 50, volatility: 0.45,
        desc: '稀有的奢侈消费品，提升上层阶级满意度。'
    },
    xeno_artifacts: {
        id: 'xeno_artifacts', name: '异星遗物', icon: '👽',
        basePrice: 100, volatility: 0.5,
        desc: '来源不明的异星文明制品，价值极高但交易有风险。'
    }
};

// ============ 派系定义 ============
const FACTIONS = {
    mechanicus: {
        id: 'mechanicus', name: '齿轮神教', icon: '⚙️',
        color: '#d4a843',
        desc: '崇拜万机之神的宗教技术组织。掌握着古老的科技知识。',
        attitude: 50, // 0-100
        traits: ['科技狂热', '排斥异端'],
        tradeGoods: ['refined_metal', 'aether_crystals'],
        likes: ['research', 'faith'],
        hates: ['xeno_artifacts']
    },
    rogue_traders: {
        id: 'rogue_traders', name: '星际浪商', icon: '🚢',
        color: '#d4883a',
        desc: '持有帝国特许状的自由贸易商团。追逐利润，穿梭于文明边缘。',
        attitude: 60,
        traits: ['唯利是图', '信息灵通'],
        tradeGoods: ['luxury_goods', 'weapons', 'xeno_artifacts'],
        likes: ['credits', 'trade'],
        hates: ['isolation']
    },
    imperial_navy: {
        id: 'imperial_navy', name: '帝国海军残部', icon: '⚓',
        color: '#708090',
        desc: '古老帝国海军的幸存舰队，维持着最后的秩序。',
        attitude: 40,
        traits: ['纪律严明', '傲慢'],
        tradeGoods: ['weapons', 'refined_metal'],
        likes: ['military', 'order'],
        hates: ['heresy', 'piracy']
    },
    void_pirates: {
        id: 'void_pirates', name: '虚空海盗', icon: '☠️',
        color: '#c41e3a',
        desc: '活跃在星际航道上的海盗和劫掠者。危险但可以交易。',
        attitude: 20,
        traits: ['残暴', '贪婪', '不可信'],
        tradeGoods: ['weapons', 'luxury_goods'],
        likes: ['bribes', 'chaos'],
        hates: ['navy', 'order']
    },
    xeno_enclave: {
        id: 'xeno_enclave', name: '异星飞地', icon: '👽',
        color: '#88aaff',
        desc: '一支神秘的异星种族在附近建立了殖民地。意图不明。',
        attitude: 30,
        traits: ['神秘', '科技先进', '不可预测'],
        tradeGoods: ['xeno_artifacts', 'aether_crystals'],
        likes: ['diplomacy', 'research'],
        hates: ['aggression']
    },
    rebel_cells: {
        id: 'rebel_cells', name: '反叛军', icon: '🔥',
        color: '#cc4444',
        desc: '不满帝国统治的叛军组织。在暗处蔓延。',
        attitude: 10,
        traits: ['游击战', '煽动'],
        tradeGoods: [],
        likes: ['chaos', 'low_loyalty'],
        hates: ['order', 'faith']
    }
};

// ============ 星系地图数据生成配置 ============
const GALAXY_CONFIG = {
    systemCount: 20,
    minDistance: 60,
    mapWidth: 700,
    mapHeight: 450,
    connectionDistance: 180,
    namePool: [
        '铁砧座', '熔炉星', '灰烬港', '黄铜门', '锈蚀湾',
        '齿轮座', '蒸汽原', '铬钢堡', '暗金域', '焦油渊',
        '钢脊峰', '炉心座', '铁幕星', '锻魂台', '赤铁原',
        '虚空锚', '以太源', '圣齿轮', '裂隙门', '深渊眼',
        '冷铸座', '铜焰港', '碎铁湾', '黑烟岭', '铸魂星',
        '机魂座', '血锈原', '铁冠堡', '暮锻台', '焰心域'
    ],
    suffixes: ['-I', '-II', '-III', '-IV', '-V', '-VI', '-VII', '-VIII', '-IX', '-X', '-XI', '-XII'],
    systemTypes: ['inhabited', 'resource', 'empty', 'hostile', 'ruins', 'anomaly']
};
