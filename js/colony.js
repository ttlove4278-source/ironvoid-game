// ============================================
// 殖民建设系统
// ============================================

const Colony = {
    // 渲染殖民地面板
    render: function(state) {
        let html = '';
        html += '<div class="panel-title">🏗️ ' + state.colony.name + '</div>';
        html += '<div class="panel-subtitle">';
        html += PLANET_TYPES.find(p => p.id === state.colony.planetType).name;
        html += ' · 建筑 ' + GameEngine.getTotalBuildings() + '/' + state.colony.maxBuildings;
        html += '</div>';

        // 殖民地概况
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>📊 殖民地状况</span></div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
        html += this.renderStat('稳定度', state.colony.stability, 100, state.colony.stability > 50 ? 'green' : 'red');
        html += this.renderStat('忠诚度', state.colony.loyalty, 100, state.colony.loyalty > 40 ? 'brass' : 'red');
        html += this.renderStat('人口', state.population.total, state.population.max, 'blue');
        html += this.renderStat('幸福度', state.population.happiness, 100, state.population.happiness > 40 ? 'green' : 'red');
        html += '</div></div>';

        // 建造队列
        if (state.colony.buildQueue.length > 0) {
            html += '<div class="panel-section">';
            html += '<div class="section-header"><span>🔨 建造中</span></div>';
            state.colony.buildQueue.forEach(item => {
                const b = BUILDINGS[item.buildingId];
                const pct = ((item.totalTurns - item.turnsLeft) / item.totalTurns) * 100;
                html += '<div class="item-card">';
                html += '<div class="item-header"><span class="item-name">' + b.icon + ' ' + b.name + '</span>';
                html += '<span class="item-count">剩余 ' + item.turnsLeft + ' 回合</span></div>';
                html += '<div class="progress-bar-sm"><div class="progress-fill-sm brass" style="width:' + pct + '%"></div></div>';
                html += '</div>';
            });
            html += '</div>';
        }

        // 已有建筑
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>🏛️ 已建成设施</span></div>';
        html += '<div class="item-grid">';
        Object.keys(state.colony.buildings).forEach(bId => {
            const count = state.colony.buildings[bId];
            if (count <= 0) return;
            const b = BUILDINGS[bId];
            html += '<div class="item-card">';
            html += '<div class="item-header"><span class="item-name">' + b.icon + ' ' + b.name + '</span>';
            html += '<span class="item-count">×' + count + '</span></div>';
            html += '<div class="item-desc">' + b.desc + '</div>';
            html += '<div class="item-stats">';
            if (b.effects) {
                Object.keys(b.effects).forEach(key => {
                    const val = b.effects[key] * count;
                    const label = this.effectLabel(key);
                    if (label) {
                        html += '<span class="stat-tag positive">+' + val + ' ' + label + '</span>';
                    }
                });
            }
            html += '</div></div>';
        });
        html += '</div></div>';

        // 可建造建筑
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>📋 可建造设施</span></div>';
        html += '<div class="item-grid">';
        Object.keys(BUILDINGS).forEach(bId => {
            const b = BUILDINGS[bId];
            if (!this.isBuildingAvailable(b, state)) return;
            const canBuild = GameEngine.canBuild(bId);

            html += '<div class="item-card ' + (canBuild ? 'buildable' : 'disabled') + '">';
            html += '<div class="item-header"><span class="item-name">' + b.icon + ' ' + b.name + '</span></div>';
            html += '<div class="item-desc">' + b.desc + '</div>';

            // 效果
            html += '<div class="item-stats">';
            if (b.effects) {
                Object.keys(b.effects).forEach(key => {
                    const label = this.effectLabel(key);
                    if (label) {
                        html += '<span class="stat-tag positive">+' + b.effects[key] + ' ' + label + '</span>';
                    }
                });
            }
            html += '</div>';

            // 费用
            html += '<div class="item-cost">费用: ';
            Object.keys(b.cost).forEach(res => {
                const has = state.resources[res] || 0;
                const need = b.cost[res];
                const color = has >= need ? 'var(--positive)' : 'var(--negative)';
                html += '<span style="color:' + color + '">' + RESOURCES[res].icon + need + '</span> ';
            });
            html += ' | ⏱' + b.buildTime + '回合</div>';

            if (canBuild) {
                html += '<button class="build-btn" onclick="Colony.build(\'' + bId + '\')">建造</button>';
            }
            html += '</div>';
        });
        html += '</div></div>';

        return html;
    },

    // 检查建筑是否可见
    isBuildingAvailable: function(b, state) {
        if (b.unlocked) return true;
        if (b.requires) {
            for (let i = 0; i < b.requires.length; i++) {
                if (state.research.completed.indexOf(b.requires[i]) !== -1) return true;
            }
        }
        return false;
    },

    // 建造
    build: function(buildingId) {
        if (GameEngine.startBuilding(buildingId)) {
            UI.refreshAll();
        }
    },

    // 渲染状态条
    renderStat: function(label, value, max, color) {
        const pct = Math.min(100, (value / max) * 100);
        let html = '<div style="background:var(--bg-card);padding:10px;border:var(--border-light);">';
        html += '<div style="display:flex;justify-content:space-between;font-size:0.82em;margin-bottom:4px;">';
        html += '<span style="color:var(--text-dim);">' + label + '</span>';
        html += '<span style="color:var(--text-bright);">' + Math.round(value) + '/' + max + '</span>';
        html += '</div>';
        html += '<div class="progress-bar-sm"><div class="progress-fill-sm ' + color + '" style="width:' + pct + '%"></div></div>';
        html += '</div>';
        return html;
    },

    // 效果标签映射
    effectLabel: function(key) {
        const labels = {
            metalProduction: '⛏️铸铁',
            fuelProduction: '🛢️燃料',
            foodProduction: '🌾口粮',
            crystalProduction: '💎水晶',
            creditsProduction: '💰信用',
            faithProduction: '✝️信仰',
            researchProduction: '🔬研究',
            manpower: '👤人力',
            maxPopulation: '🏠人口上限',
            tradeSlots: '📦贸易位',
            defenseBonus: '🛡️防御',
            stabilityBonus: '⚖️稳定',
            loyaltyBonus: '❤️忠诚',
            shipBuildSpeed: '🚀造船',
            maxFleetSize: '⚓舰队',
            scanRange: '📡扫描',
            populationGrowthBonus: '📈增长'
        };
        return labels[key] || null;
    }
};
