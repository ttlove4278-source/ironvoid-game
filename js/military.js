// ============================================
// 军事系统
// ============================================

const Military = {
    render: function(state) {
        let html = '';
        html += '<div class="panel-title">⚔️ 军事力量</div>';
        html += '<div class="panel-subtitle">"以铁与火捍卫帝国的荣耀。" · 总战力: ' + state.military.totalStrength + '</div>';

        // 防御概况
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>🛡️ 殖民地防御</span></div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">';
        html += this.renderMilitaryStat('行星防御', state.military.defense, '🛡️');
        html += this.renderMilitaryStat('总战力', state.military.totalStrength, '⚔️');
        html += this.renderMilitaryStat('可用人力', Math.round(state.resources.manpower), '👤');
        html += '</div></div>';

        // 地面部队
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>🎖️ 地面部队</span></div>';
        html += '<div class="item-grid">';

        const armyUnits = [
            { id: 'infantry', name: '步兵连', icon: '🔫', strength: 1, cost: { credits: 10, manpower: 10 }, desc: '标准步兵单位，帝国军队的基础。' },
            { id: 'heavyInfantry', name: '重装甲兵', icon: '🛡️', strength: 3, cost: { metal: 15, credits: 20, manpower: 8 }, desc: '穿戴蒸汽动力甲的精锐战士。' },
            { id: 'artillery', name: '蒸汽炮兵', icon: '💣', strength: 5, cost: { metal: 30, fuel: 10, credits: 25, manpower: 5 }, desc: '操纵巨型蒸汽火炮的炮兵部队。' }
        ];

        armyUnits.forEach(unit => {
            const count = state.military.army[unit.id] || 0;
            const canRecruit = this.canRecruit(unit, state);

            html += '<div class="item-card ' + (canRecruit ? 'buildable' : '') + '">';
            html += '<div class="item-header"><span class="item-name">' + unit.icon + ' ' + unit.name + '</span>';
            html += '<span class="item-count">×' + count + '</span></div>';
            html += '<div class="item-desc">' + unit.desc + '</div>';
            html += '<div class="item-stats">';
            html += '<span class="stat-tag positive">战力 ' + unit.strength + '</span>';
            html += '</div>';
            html += '<div class="item-cost">征募: ';
            Object.keys(unit.cost).forEach(res => {
                const has = state.resources[res] || 0;
                const need = unit.cost[res];
                const color = has >= need ? 'var(--positive)' : 'var(--negative)';
                html += '<span style="color:' + color + '">' + RESOURCES[res].icon + need + '</span> ';
            });
            html += '</div>';
            if (canRecruit) {
                html += '<button class="build-btn" onclick="Military.recruit(\'' + unit.id + '\')">征募</button>';
            }
            html += '</div>';
        });
        html += '</div></div>';

        // 舰队
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>🚀 星际舰队</span></div>';

        if (state.research.completed.indexOf('tech_void_construction') === -1) {
            html += '<div style="padding:20px;text-align:center;color:var(--text-dim);">';
            html += '🔒 需要研究「虚空造船术」来解锁舰队建造';
            html += '</div>';
        } else {
            // 舰船建造队列
            if (state.military.shipBuildQueue.length > 0) {
                html += '<div style="margin-bottom:12px;">';
                state.military.shipBuildQueue.forEach(item => {
                    const ship = SHIP_TYPES[item.shipId];
                    const pct = ((item.totalTurns - item.turnsLeft) / item.totalTurns) * 100;
                    html += '<div class="item-card">';
                    html += '<div class="item-header"><span class="item-name">' + ship.icon + ' ' + ship.name + ' (建造中)</span>';
                    html += '<span class="item-count">剩余 ' + item.turnsLeft + ' 回合</span></div>';
                    html += '<div class="progress-bar-sm"><div class="progress-fill-sm brass" style="width:' + pct + '%"></div></div>';
                    html += '</div>';
                });
                html += '</div>';
            }

            // 现有舰船
            if (state.military.fleet.length > 0) {
                html += '<table class="data-table"><tr><th>舰船</th><th>攻击</th><th>防御</th><th>速度</th><th>船体</th></tr>';
                state.military.fleet.forEach(ship => {
                    const type = SHIP_TYPES[ship.typeId];
                    html += '<tr>';
                    html += '<td>' + type.icon + ' ' + type.name + '</td>';
                    html += '<td>' + type.stats.attack + '</td>';
                    html += '<td>' + type.stats.defense + '</td>';
                    html += '<td>' + type.stats.speed + '</td>';
                    html += '<td>' + ship.hull + '/' + type.stats.hull + '</td>';
                    html += '</tr>';
                });
                html += '</table>';
            } else {
                html += '<div style="padding:12px;color:var(--text-dim);font-size:0.85em;">暂无舰船</div>';
            }

            // 可建造舰船
            html += '<div style="margin-top:12px;"><div class="item-grid">';
            Object.keys(SHIP_TYPES).forEach(sId => {
                const ship = SHIP_TYPES[sId];
                if (ship.requires) {
                    for (let i = 0; i < ship.requires.length; i++) {
                        if (state.research.completed.indexOf(ship.requires[i]) === -1) return;
                    }
                }

                const canBuild = this.canBuildShip(sId, state);
                html += '<div class="item-card ' + (canBuild ? 'buildable' : 'disabled') + '">';
                html += '<div class="item-header"><span class="item-name">' + ship.icon + ' ' + ship.name + '</span></div>';
                html += '<div class="item-desc">' + ship.desc + '</div>';
                html += '<div class="item-stats">';
                html += '<span class="stat-tag neutral">攻' + ship.stats.attack + '</span>';
                html += '<span class="stat-tag neutral">防' + ship.stats.defense + '</span>';
                html += '<span class="stat-tag neutral">速' + ship.stats.speed + '</span>';
                html += '<span class="stat-tag neutral">体' + ship.stats.hull + '</span>';
                html += '</div>';
                html += '<div class="item-cost">费用: ';
                Object.keys(ship.cost).forEach(res => {
                    const has = state.resources[res] || 0;
                    const need = ship.cost[res];
                    const color = has >= need ? 'var(--positive)' : 'var(--negative)';
                    html += '<span style="color:' + color + '">' + RESOURCES[res].icon + need + '</span> ';
                });
                html += ' | ⏱' + ship.buildTime + '回合</div>';
                if (canBuild) {
                    html += '<button class="build-btn" onclick="Military.buildShip(\'' + sId + '\')">建造</button>';
                }
                html += '</div>';
            });
            html += '</div></div>';
        }
        html += '</div>';

        return html;
    },

    renderMilitaryStat: function(label, value, icon) {
        let html = '<div style="background:var(--bg-card);padding:12px;border:var(--border-light);text-align:center;">';
        html += '<div style="font-size:1.5em;">' + icon + '</div>';
        html += '<div style="color:var(--text-bright);font-size:1.2em;font-family:var(--font-mono);">' + value + '</div>';
        html += '<div style="color:var(--text-dim);font-size:0.8em;">' + label + '</div>';
        html += '</div>';
        return html;
    },

    canRecruit: function(unit, state) {
        const keys = Object.keys(unit.cost);
        for (let i = 0; i < keys.length; i++) {
            if ((state.resources[keys[i]] || 0) < unit.cost[keys[i]]) return false;
        }
        return true;
    },

    recruit: function(unitId) {
        const state = GameEngine.state;
        const units = {
            infantry: { cost: { credits: 10, manpower: 10 }, strength: 1 },
            heavyInfantry: { cost: { metal: 15, credits: 20, manpower: 8 }, strength: 3 },
            artillery: { cost: { metal: 30, fuel: 10, credits: 25, manpower: 5 }, strength: 5 }
        };
        const unit = units[unitId];
        if (!unit) return;

        // 检查并扣除资源
        const keys = Object.keys(unit.cost);
        for (let i = 0; i < keys.length; i++) {
            if ((state.resources[keys[i]] || 0) < unit.cost[keys[i]]) return;
        }
        keys.forEach(res => { state.resources[res] -= unit.cost[res]; });

        state.military.army[unitId] = (state.military.army[unitId] || 0) + 1;
        this.recalcStrength(state);
        GameEngine.addLog('征募了 1 单位 ' + unitId);
        UI.refreshAll();
    },

    canBuildShip: function(shipId, state) {
        const ship = SHIP_TYPES[shipId];
        if (!ship) return false;
        const keys = Object.keys(ship.cost);
        for (let i = 0; i < keys.length; i++) {
            if ((state.resources[keys[i]] || 0) < ship.cost[keys[i]]) return false;
        }
        return true;
    },

    buildShip: function(shipId) {
        const state = GameEngine.state;
        const ship = SHIP_TYPES[shipId];
        if (!ship || !this.canBuildShip(shipId, state)) return;

        Object.keys(ship.cost).forEach(res => { state.resources[res] -= ship.cost[res]; });

        state.military.shipBuildQueue.push({
            shipId: shipId,
            turnsLeft: ship.buildTime,
            totalTurns: ship.buildTime
        });

        GameEngine.addLog('开始建造舰船: ' + ship.name);
        UI.refreshAll();
    },

    recalcStrength: function(state) {
        let total = 0;
        total += (state.military.army.infantry || 0) * 1;
        total += (state.military.army.heavyInfantry || 0) * 3;
        total += (state.military.army.artillery || 0) * 5;
        total += state.military.fleet.length * 10;
        total = Math.round(total * (1 + state.modifiers.armyStrengthMod));
        state.military.totalStrength = total;
    },

    processTurn: function(state) {
        // 处理舰船建造
        for (let i = state.military.shipBuildQueue.length - 1; i >= 0; i--) {
            state.military.shipBuildQueue[i].turnsLeft--;
            if (state.military.shipBuildQueue[i].turnsLeft <= 0) {
                const shipId = state.military.shipBuildQueue[i].shipId;
                const type = SHIP_TYPES[shipId];
                state.military.fleet.push({
                    typeId: shipId,
                    hull: type.stats.hull,
                    name: type.name + '-' + (state.military.fleet.length + 1)
                });
                GameEngine.addLog('🚀 舰船建造完成: ' + type.name);
                state.military.shipBuildQueue.splice(i, 1);
            }
        }

        this.recalcStrength(state);
    }
};
