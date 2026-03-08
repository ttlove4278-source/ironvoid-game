// ============================================
// 铁血星域 - 核心游戏引擎
// ============================================

const GameEngine = {
    state: null,

    // 初始化新游戏
    newGame: function(playerName, colonyName, originId, planetId) {
        const origin = ORIGINS.find(o => o.id === originId);
        const planet = PLANET_TYPES.find(p => p.id === planetId);

        this.state = {
            version: CONFIG.VERSION,
            turn: 1,
            date: CONFIG.BASE_YEAR + 0.001,
            difficulty: 'normal',

            player: {
                name: playerName,
                origin: originId,
                title: '锻造总督'
            },

            colony: {
                name: colonyName,
                planetType: planetId,
                maxBuildings: planet.maxBuildings,
                buildings: {},
                buildQueue: [],
                stability: 70,
                loyalty: origin.id === 'penal_colony' ? 30 : 50
            },

            resources: {
                metal: 50 + (origin.bonuses.metal || 0),
                fuel: 30 + (origin.bonuses.fuel || 0),
                food: 40 + (origin.bonuses.food || 0),
                crystal: 5 + (origin.bonuses.crystal || 0),
                credits: 100 + (origin.bonuses.credits || 0),
                faith: 10 + (origin.bonuses.faith || 0),
                manpower: 20 + (origin.bonuses.manpower || 0),
                research: 0 + (origin.bonuses.research || 0)
            },

            resourceRates: {
                metal: 0, fuel: 0, food: 0, crystal: 0,
                credits: 0, faith: 0, manpower: 0, research: 0
            },

            population: {
                total: 500,
                max: 500,
                growth: 0,
                classes: {
                    workers: 300,
                    soldiers: 50,
                    priests: 30,
                    scholars: 20,
                    merchants: 50,
                    nobles: 10,
                    serfs: 40
                },
                happiness: 50,
                unrest: 0
            },

            research: {
                completed: [],
                current: null,
                progress: 0
            },

            military: {
                army: {
                    infantry: 50,
                    heavyInfantry: 0,
                    artillery: 0
                },
                fleet: [],
                shipBuildQueue: [],
                defense: 10,
                totalStrength: 50
            },

            trade: {
                routes: [],
                prices: {},
                reputation: 50
            },

            diplomacy: {
                relations: {},
                treaties: [],
                reputation: 50
            },

            galaxy: {
                systems: [],
                connections: [],
                explored: [],
                owned: []
            },

            events: {
                history: [],
                pending: [],
                flags: {}
            },

            stats: {
                turnsPlayed: 0,
                buildingsBuilt: 0,
                techResearched: 0,
                battlesWon: 0,
                battlesLost: 0,
                tradeDeals: 0,
                eventsHandled: 0,
                totalCreditsEarned: 0
            },

            modifiers: {
                metalProductionMod: 0,
                fuelProductionMod: 0,
                foodProductionMod: 0,
                crystalProductionMod: 0,
                creditsProductionMod: 0,
                faithProductionMod: 0,
                researchProductionMod: 0,
                manpowerUpkeepMod: 0,
                fuelUpkeepMod: 0,
                buildSpeedMod: 0,
                armyStrengthMod: 0,
                fleetStrengthMod: 0,
                loyaltyGrowthMod: 0,
                populationGrowthMod: 0
            },

            log: []
        };

        // 应用起源的起始建筑
        if (origin.startBuildings) {
            origin.startBuildings.forEach(bId => {
                this.addBuilding(bId);
            });
        }

        // 生成星系地图
        Galaxy.generateGalaxy(this.state);

        // 初始化贸易价格
        Trade.initPrices(this.state);

        // 初始化外交关系
        Diplomacy.initRelations(this.state);

        // 首次计算资源
        this.calculateResourceRates();

        // 添加开场日志
        this.addLog('帝国纪事开始记录。锻造总督 ' + playerName + ' 就任 ' + colonyName + ' 殖民地。');
        this.addLog('起源: ' + origin.name + ' | 星球类型: ' + planet.name);

        return this.state;
    },

    // 添加建筑
    addBuilding: function(buildingId) {
        if (!this.state.colony.buildings[buildingId]) {
            this.state.colony.buildings[buildingId] = 0;
        }
        this.state.colony.buildings[buildingId]++;
    },

    // 获取建筑总数
    getTotalBuildings: function() {
        let total = 0;
        Object.values(this.state.colony.buildings).forEach(count => { total += count; });
        return total;
    },

    // 检查是否可以建造
    canBuild: function(buildingId) {
        const b = BUILDINGS[buildingId];
        if (!b) return false;
        if (this.getTotalBuildings() >= this.state.colony.maxBuildings) return false;

        // 检查科技需求
        if (b.requires) {
            for (let i = 0; i < b.requires.length; i++) {
                if (this.state.research.completed.indexOf(b.requires[i]) === -1) return false;
            }
        }

        // 检查资源
        if (b.cost) {
            const keys = Object.keys(b.cost);
            for (let i = 0; i < keys.length; i++) {
                if ((this.state.resources[keys[i]] || 0) < b.cost[keys[i]]) return false;
            }
        }
        return true;
    },

    // 开始建造
    startBuilding: function(buildingId) {
        if (!this.canBuild(buildingId)) return false;
        const b = BUILDINGS[buildingId];

        // 扣除资源
        Object.keys(b.cost).forEach(res => {
            this.state.resources[res] -= b.cost[res];
        });

        // 计算建造时间（含修正）
        let time = b.buildTime;
        time = Math.max(1, Math.round(time * (1 - this.state.modifiers.buildSpeedMod)));

        this.state.colony.buildQueue.push({
            buildingId: buildingId,
            turnsLeft: time,
            totalTurns: time
        });

        this.state.stats.buildingsBuilt++;
        this.addLog('开始建造: ' + b.name + ' (预计' + time + '回合)');
        return true;
    },

    // 计算资源产出
    calculateResourceRates: function() {
        const rates = { metal: 0, fuel: 0, food: 0, crystal: 0, credits: 0, faith: 0, manpower: 0, research: 0 };
        const upkeep = { metal: 0, fuel: 0, food: 0, crystal: 0, credits: 0, faith: 0, manpower: 0, research: 0 };
        const state = this.state;
        const planet = PLANET_TYPES.find(p => p.id === state.colony.planetType);

        // 建筑产出
        Object.keys(state.colony.buildings).forEach(bId => {
            const count = state.colony.buildings[bId];
            const b = BUILDINGS[bId];
            if (!b || count <= 0) return;

            // 产出
            if (b.effects) {
                if (b.effects.metalProduction) rates.metal += b.effects.metalProduction * count;
                if (b.effects.fuelProduction) rates.fuel += b.effects.fuelProduction * count;
                if (b.effects.foodProduction) rates.food += b.effects.foodProduction * count;
                if (b.effects.crystalProduction) rates.crystal += b.effects.crystalProduction * count;
                if (b.effects.creditsProduction) rates.credits += b.effects.creditsProduction * count;
                if (b.effects.faithProduction) rates.faith += b.effects.faithProduction * count;
                if (b.effects.researchProduction) rates.research += b.effects.researchProduction * count;
                if (b.effects.manpower) rates.manpower += b.effects.manpower * count;
            }

            // 维护
            if (b.upkeep) {
                Object.keys(b.upkeep).forEach(res => {
                    upkeep[res] += b.upkeep[res] * count;
                });
            }
        });

        // 星球修正
        if (planet && planet.resourceMod) {
            if (planet.resourceMod.metal) rates.metal *= planet.resourceMod.metal;
            if (planet.resourceMod.fuel) rates.fuel *= planet.resourceMod.fuel;
            if (planet.resourceMod.food) rates.food *= planet.resourceMod.food;
            if (planet.resourceMod.crystal) rates.crystal *= planet.resourceMod.crystal;
        }

        // 科技修正
        const mods = state.modifiers;
        rates.metal *= (1 + mods.metalProductionMod);
        rates.fuel *= (1 + mods.fuelProductionMod);
        rates.food *= (1 + mods.foodProductionMod);
        rates.crystal *= (1 + mods.crystalProductionMod);
        rates.credits *= (1 + mods.creditsProductionMod);
        rates.faith *= (1 + mods.faithProductionMod);
        rates.research *= (1 + mods.researchProductionMod);

        // 维护修正
        upkeep.fuel *= (1 + mods.fuelUpkeepMod);
        upkeep.manpower *= (1 + mods.manpowerUpkeepMod);

        // 人口消耗食物
        upkeep.food += Math.ceil(state.population.total / 50);

        // 净收入
        Object.keys(rates).forEach(res => {
            rates[res] = Math.round(rates[res] - upkeep[res]);
        });

        state.resourceRates = rates;
        return rates;
    },

    // 推进回合
    nextTurn: function() {
        const state = this.state;
        state.turn++;
        state.date = CONFIG.BASE_YEAR + (state.turn * 0.001);
        state.stats.turnsPlayed++;

        // 1. 计算资源产出
        this.calculateResourceRates();

        // 2. 应用资源变化
        Object.keys(state.resourceRates).forEach(res => {
            state.resources[res] += state.resourceRates[res];
            if (state.resources[res] < 0) state.resources[res] = 0;
        });

        // 3. 处理建筑队列
        for (let i = state.colony.buildQueue.length - 1; i >= 0; i--) {
            state.colony.buildQueue[i].turnsLeft--;
            if (state.colony.buildQueue[i].turnsLeft <= 0) {
                const bId = state.colony.buildQueue[i].buildingId;
                this.addBuilding(bId);
                this.addLog('建造完成: ' + BUILDINGS[bId].name);
                state.colony.buildQueue.splice(i, 1);
            }
        }

        // 4. 处理科技研发
        Research.processTurn(state);

        // 5. 处理人口
        Population.processTurn(state);

        // 6. 处理军事
        Military.processTurn(state);

        // 7. 处理贸易
        Trade.processTurn(state);

        // 8. 处理外交
        Diplomacy.processTurn(state);

        // 9. 触发事件
        Events.checkEvents(state);

        // 10. 检查胜利/失败条件
        this.checkGameState();

        // 11. 重算资源（为下回合显示）
        this.calculateResourceRates();

        // 12. 自动存档
        if (state.turn % CONFIG.AUTOSAVE_INTERVAL === 0) {
            SaveSystem.autoSave(state);
        }

        return state;
    },

    // 检查游戏状态
    checkGameState: function() {
        const state = this.state;

        // 失败条件
        if (state.population.total <= 0) {
            this.addLog('⚠️ 殖民地人口降至零！帝国的光辉在此熄灭...');
            state.gameOver = 'defeat_population';
        }
        if (state.colony.stability <= 0) {
            this.addLog('⚠️ 殖民地陷入彻底混乱！你的统治已经崩溃。');
            state.gameOver = 'defeat_stability';
        }
        if (state.colony.loyalty <= 0 && state.population.unrest > 80) {
            this.addLog('⚠️ 全面叛乱！殖民地的人民推翻了你的统治。');
            state.gameOver = 'defeat_rebellion';
        }
    },

    // 添加日志
    addLog: function(message, type) {
        if (!this.state) return;
        type = type || 'info';
        this.state.log.push({
            turn: this.state.turn,
            message: message,
            type: type
        });
        // 限制日志长度
        if (this.state.log.length > 500) {
            this.state.log = this.state.log.slice(-400);
        }
    },

    // 应用科技效果
    applyTechEffects: function(techId) {
        const tech = TECHNOLOGIES[techId];
        if (!tech || !tech.effects) return;

        const effects = tech.effects;
        const mods = this.state.modifiers;

        Object.keys(effects).forEach(key => {
            if (key === 'unlock') {
                // 解锁建筑
                effects.unlock.forEach(bId => {
                    if (BUILDINGS[bId]) BUILDINGS[bId].unlocked = true;
                });
            } else if (mods[key] !== undefined) {
                mods[key] += effects[key];
            } else if (key === 'defenseBonus') {
                this.state.military.defense += effects[key];
            } else if (key === 'scanRangeBonus') {
                // 增加扫描范围 - 稍后处理
            }
        });
    }
};
