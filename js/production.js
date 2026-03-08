// ============================================
// 工业生产系统
// ============================================

const Production = {
    render: function(state) {
        let html = '';
        html += '<div class="panel-title">⚙️ 工业产出总览</div>';
        html += '<div class="panel-subtitle">"齿轮不停转动，帝国永不止步。"</div>';

        // 资源产出表
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>📊 资源收支报表</span><span>每回合</span></div>';
        html += '<table class="data-table">';
        html += '<tr><th>资源</th><th>产出</th><th>消耗</th><th>净收入</th><th>库存</th></tr>';

        Object.keys(RESOURCES).forEach(resId => {
            const res = RESOURCES[resId];
            const rate = state.resourceRates[resId] || 0;
            const stock = Math.round(state.resources[resId] || 0);

            const production = this.getGrossProduction(resId, state);
            const consumption = production - rate;

            const rateColor = rate > 0 ? 'var(--positive)' : rate < 0 ? 'var(--negative)' : 'var(--text-dim)';
            const rateSign = rate > 0 ? '+' : '';

            html += '<tr>';
            html += '<td>' + res.icon + ' ' + res.name + '</td>';
            html += '<td style="color:var(--positive);">+' + Math.round(production) + '</td>';
            html += '<td style="color:var(--negative);">-' + Math.round(consumption) + '</td>';
            html += '<td style="color:' + rateColor + ';font-weight:bold;">' + rateSign + rate + '</td>';
            html += '<td>' + stock + '</td>';
            html += '</tr>';
        });
        html += '</table></div>';

        // 产出来源明细
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>🏭 产出来源明细</span></div>';

        Object.keys(state.colony.buildings).forEach(bId => {
            const count = state.colony.buildings[bId];
            if (count <= 0) return;
            const b = BUILDINGS[bId];

            html += '<div class="item-card">';
            html += '<div class="item-header"><span class="item-name">' + b.icon + ' ' + b.name + ' ×' + count + '</span></div>';
            html += '<div class="item-stats">';

            if (b.effects) {
                Object.keys(b.effects).forEach(key => {
                    if (key.endsWith('Production') || key === 'manpower') {
                        const val = b.effects[key] * count;
                        const label = Colony.effectLabel(key);
                        if (label) html += '<span class="stat-tag positive">+' + val + ' ' + label + '</span>';
                    }
                });
            }
            if (b.upkeep) {
                Object.keys(b.upkeep).forEach(res => {
                    const val = b.upkeep[res] * count;
                    html += '<span class="stat-tag negative">-' + val + ' ' + RESOURCES[res].icon + RESOURCES[res].name + '</span>';
                });
            }
            html += '</div></div>';
        });
        html += '</div>';

        // 活跃修正
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>🔧 活跃修正</span></div>';
        const mods = state.modifiers;
        let hasMods = false;
        Object.keys(mods).forEach(key => {
            if (mods[key] !== 0) {
                hasMods = true;
                const pct = Math.round(mods[key] * 100);
                const sign = pct > 0 ? '+' : '';
                const color = pct > 0 ? 'var(--positive)' : 'var(--negative)';
                html += '<div style="padding:4px 12px;font-size:0.85em;">';
                html += '<span style="color:var(--text-dim);">' + this.modLabel(key) + ':</span> ';
                html += '<span style="color:' + color + ';">' + sign + pct + '%</span>';
                html += '</div>';
            }
        });
        if (!hasMods) {
            html += '<div style="padding:12px;color:var(--text-dim);font-size:0.85em;">暂无活跃修正</div>';
        }
        html += '</div>';

        return html;
    },

    // 获取毛产出（不含消耗）
    getGrossProduction: function(resId, state) {
        let total = 0;
        const planet = PLANET_TYPES.find(p => p.id === state.colony.planetType);

        Object.keys(state.colony.buildings).forEach(bId => {
            const count = state.colony.buildings[bId];
            const b = BUILDINGS[bId];
            if (!b || count <= 0) return;

            const prodKey = resId + 'Production';
            if (b.effects && b.effects[prodKey]) {
                total += b.effects[prodKey] * count;
            }
            if (resId === 'manpower' && b.effects && b.effects.manpower) {
                total += b.effects.manpower * count;
            }
        });

        // 星球修正
        if (planet && planet.resourceMod && planet.resourceMod[resId]) {
            total *= planet.resourceMod[resId];
        }

        // 科技修正
        const modKey = resId + 'ProductionMod';
        if (state.modifiers[modKey]) {
            total *= (1 + state.modifiers[modKey]);
        }

        return Math.round(total);
    },

    modLabel: function(key) {
        const labels = {
            metalProductionMod: '铸铁产量',
            fuelProductionMod: '燃料产量',
            foodProductionMod: '口粮产量',
            crystalProductionMod: '水晶产量',
            creditsProductionMod: '信用收入',
            faithProductionMod: '信仰产出',
            researchProductionMod: '研究速度',
            manpowerUpkeepMod: '人力消耗',
            fuelUpkeepMod: '燃料消耗',
            buildSpeedMod: '建造速度',
            armyStrengthMod: '陆军战力',
            fleetStrengthMod: '舰队战力',
            loyaltyGrowthMod: '忠诚增长',
            populationGrowthMod: '人口增长'
        };
        return labels[key] || key;
    }
};
