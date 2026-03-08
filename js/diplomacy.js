// ============================================
// 外交系统
// ============================================

const Diplomacy = {
    initRelations: function(state) {
        state.diplomacy.relations = {};
        Object.keys(FACTIONS).forEach(fId => {
            state.diplomacy.relations[fId] = FACTIONS[fId].attitude;
        });
    },

    render: function(state) {
        let html = '';
        html += '<div class="panel-title">🌐 外交关系</div>';
        html += '<div class="panel-subtitle">"在星海中，没有永远的盟友，只有永恒的利益。"</div>';

        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>🤝 已知势力</span></div>';
        html += '<div class="item-grid">';

        Object.keys(FACTIONS).forEach(fId => {
            const faction = FACTIONS[fId];
            const relation = state.diplomacy.relations[fId] || 50;
            let status, statusColor;

            if (relation >= 80) { status = '盟友'; statusColor = 'var(--positive)'; }
            else if (relation >= 60) { status = '友好'; statusColor = '#4a8'; }
            else if (relation >= 40) { status = '中立'; statusColor = 'var(--text-dim)'; }
            else if (relation >= 20) { status = '冷淡'; statusColor = 'var(--warning)'; }
            else { status = '敌对'; statusColor = 'var(--negative)'; }

            html += '<div class="item-card">';
            html += '<div class="item-header">';
            html += '<span class="item-name" style="color:' + faction.color + ';">' + faction.icon + ' ' + faction.name + '</span>';
            html += '<span style="color:' + statusColor + ';font-size:0.85em;">' + status + ' (' + relation + ')</span>';
            html += '</div>';
            html += '<div class="item-desc">' + faction.desc + '</div>';
            html += '<div class="progress-bar-sm"><div class="progress-fill-sm ' + (relation > 50 ? 'green' : 'red') + '" style="width:' + relation + '%"></div></div>';

            // 外交选项
            html += '<div style="display:flex;gap:6px;margin-top:8px;">';
            if (relation >= 30) {
                html += '<button class="build-btn" style="flex:1;padding:4px;" onclick="Diplomacy.gift(\'' + fId + '\')">💰 赠礼</button>';
            }
            if (relation >= 50) {
                html += '<button class="build-btn" style="flex:1;padding:4px;" onclick="Diplomacy.tradeAgreement(\'' + fId + '\')">📦 贸易协议</button>';
            }
            if (relation < 30) {
                html += '<button class="build-btn" style="flex:1;padding:4px;" onclick="Diplomacy.threaten(\'' + fId + '\')">⚔️ 威胁</button>';
            }
            html += '</div>';
            html += '</div>';
        });
        html += '</div></div>';

        return html;
    },

    gift: function(factionId) {
        const state = GameEngine.state;
        if (state.resources.credits < 50) {
            GameEngine.addLog('信用不足，无法赠礼。');
            return;
        }
        state.resources.credits -= 50;
        state.diplomacy.relations[factionId] = Math.min(100, (state.diplomacy.relations[factionId] || 50) + 8);
        GameEngine.addLog('向 ' + FACTIONS[factionId].name + ' 赠送礼物，关系 +8');
        UI.refreshAll();
    },

    tradeAgreement: function(factionId) {
        const state = GameEngine.state;
        state.diplomacy.relations[factionId] = Math.min(100, (state.diplomacy.relations[factionId] || 50) + 3);
        state.resources.credits += 30;
        GameEngine.addLog('与 ' + FACTIONS[factionId].name + ' 达成贸易协议，获得 30 信用');
        UI.refreshAll();
    },

    threaten: function(factionId) {
        const state = GameEngine.state;
        const strength = state.military.totalStrength;
        if (strength > 50) {
            state.diplomacy.relations[factionId] = Math.min(100, (state.diplomacy.relations[factionId] || 50) + 5);
            GameEngine.addLog('以武力威慑 ' + FACTIONS[factionId].name + '，对方态度软化 +5');
        } else {
            state.diplomacy.relations[factionId] = Math.max(0, (state.diplomacy.relations[factionId] || 50) - 10);
            GameEngine.addLog(FACTIONS[factionId].name + ' 嘲笑了你的威胁，关系 -10');
        }
        UI.refreshAll();
    },

    processTurn: function(state) {
        // 关系自然漂移
        Object.keys(state.diplomacy.relations).forEach(fId => {
            const faction = FACTIONS[fId];
            const current = state.diplomacy.relations[fId];
            const target = faction.attitude;
            if (current > target) state.diplomacy.relations[fId] -= 0.5;
            else if (current < target) state.diplomacy.relations[fId] += 0.3;

            // 海盗的随机敌意
            if (fId === 'void_pirates' && Math.random() < 0.1) {
                state.diplomacy.relations[fId] = Math.max(0, state.diplomacy.relations[fId] - 5);
            }
        });
    }
};
