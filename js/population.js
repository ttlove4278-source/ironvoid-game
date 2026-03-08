// ============================================
// 人口管理系统
// ============================================

const Population = {
    render: function(state) {
        let html = '';
        html += '<div class="panel-title">👥 人口管理</div>';
        html += '<div class="panel-subtitle">"子民是帝国最宝贵的齿轮。" · 总人口: ' + state.population.total + '/' + state.population.max + '</div>';

        // 人口概况
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>📊 人口概况</span></div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
        html += Colony.renderStat('总人口', state.population.total, state.population.max, 'blue');
        html += Colony.renderStat('幸福度', state.population.happiness, 100, state.population.happiness > 40 ? 'green' : 'red');
        html += Colony.renderStat('忠诚度', state.colony.loyalty, 100, state.colony.loyalty > 40 ? 'brass' : 'red');
        html += Colony.renderStat('不满度', state.population.unrest, 100, state.population.unrest < 40 ? 'green' : 'red');
        html += '</div></div>';

        // 阶级分布
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>🏛️ 阶级分布</span></div>';

        const classInfo = {
            nobles: { name: '贵族', icon: '👑', desc: '统治阶层，提供管理加成' },
            priests: { name: '神甫', icon: '✝️', desc: '齿轮神教成员，产出信仰' },
            scholars: { name: '学者', icon: '📚', desc: '科研人员，产出研究点数' },
            merchants: { name: '商人', icon: '💰', desc: '商业阶层，产出信用' },
            workers: { name: '工人', icon: '⚒️', desc: '产业工人，维持生产运转' },
            soldiers: { name: '士兵', icon: '⚔️', desc: '职业军人，提供军事力量' },
            serfs: { name: '底层民', icon: '👤', desc: '最底层人口，提供基础劳动力' }
        };

        html += '<div class="item-grid">';
        Object.keys(classInfo).forEach(cId => {
            const info = classInfo[cId];
            const count = state.population.classes[cId] || 0;
            const pct = state.population.total > 0 ? Math.round((count / state.population.total) * 100) : 0;

            html += '<div class="item-card">';
            html += '<div class="item-header"><span class="item-name">' + info.icon + ' ' + info.name + '</span>';
            html += '<span class="item-count">' + count + ' (' + pct + '%)</span></div>';
            html += '<div class="item-desc">' + info.desc + '</div>';
            html += '<div class="progress-bar-sm"><div class="progress-fill-sm brass" style="width:' + pct + '%"></div></div>';
            html += '</div>';
        });
        html += '</div></div>';

        // 政策（简化版）
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>📜 总督令</span></div>';
        html += '<div class="item-grid">';

        const edicts = [
            { id: 'ration_increase', name: '增加配给', icon: '🍞', desc: '额外发放口粮，提升幸福度。', effect: '幸福+10, 口粮消耗+20%', cost: 'food' },
            { id: 'martial_law', name: '戒严令', icon: '⚔️', desc: '实施军事管制，降低不满但损害幸福。', effect: '不满-15, 幸福-10', cost: 'manpower' },
            { id: 'religious_festival', name: '信仰庆典', icon: '✝️', desc: '举办齿轮神教庆典，提升忠诚和信仰。', effect: '忠诚+8, 信仰+15', cost: 'credits' },
            { id: 'tax_cut', name: '减免税赋', icon: '💰', desc: '减免一回合税收，大幅提升幸福。', effect: '幸福+15, 信用收入-50%本回合', cost: 'credits' }
        ];

        edicts.forEach(edict => {
            html += '<div class="item-card buildable" onclick="Population.enact(\'' + edict.id + '\')">';
            html += '<div class="item-header"><span class="item-name">' + edict.icon + ' ' + edict.name + '</span></div>';
            html += '<div class="item-desc">' + edict.desc + '</div>';
            html += '<div class="item-stats"><span class="stat-tag positive">' + edict.effect + '</span></div>';
            html += '<button class="build-btn">颁布</button>';
            html += '</div>';
        });
        html += '</div></div>';

        return html;
    },

    enact: function(edictId) {
        const state = GameEngine.state;

        switch (edictId) {
            case 'ration_increase':
                if (state.resources.food < 20) { GameEngine.addLog('口粮不足，无法执行'); return; }
                state.resources.food -= 20;
                state.population.happiness = Math.min(100, state.population.happiness + 10);
                GameEngine.addLog('📜 颁布总督令: 增加配给');
                break;
            case 'martial_law':
                state.population.unrest = Math.max(0, state.population.unrest - 15);
                state.population.happiness = Math.max(0, state.population.happiness - 10);
                GameEngine.addLog('📜 颁布总督令: 戒严令');
                break;
            case 'religious_festival':
                if (state.resources.credits < 30) { GameEngine.addLog('信用不足'); return; }
                state.resources.credits -= 30;
                state.colony.loyalty = Math.min(100, state.colony.loyalty + 8);
                state.resources.faith += 15;
                GameEngine.addLog('📜 颁布总督令: 信仰庆典');
                break;
            case 'tax_cut':
                if (state.resources.credits < 50) { GameEngine.addLog('信用不足'); return; }
                state.resources.credits -= 50;
                state.population.happiness = Math.min(100, state.population.happiness + 15);
                GameEngine.addLog('📜 颁布总督令: 减免税赋');
                break;
        }

        UI.refreshAll();
    },

    processTurn: function(state) {
        // 人口增长
        const foodBalance = state.resourceRates.food;
        let growthRate = 0.02 * (1 + state.modifiers.populationGrowthMod);

        if (foodBalance < 0) {
            growthRate = -0.03; // 饥荒
            state.population.happiness = Math.max(0, state.population.happiness - 5);
            if (state.turn % 3 === 0) GameEngine.addLog('⚠️ 口粮短缺！人口在减少...', 'warning');
        } else if (foodBalance > 10) {
            growthRate += 0.01;
        }

        if (state.population.total < state.population.max) {
            const growth = Math.round(state.population.total * growthRate);
            state.population.total = Math.max(0, Math.min(state.population.max, state.population.total + growth));
            state.population.growth = growth;

            // 简单的阶级分配
            if (growth > 0) {
                state.population.classes.workers += Math.round(growth * 0.4);
                state.population.classes.serfs += Math.round(growth * 0.3);
                state.population.classes.soldiers += Math.round(growth * 0.1);
                state.population.classes.merchants += Math.round(growth * 0.1);
                state.population.classes.priests += Math.round(growth * 0.05);
                state.population.classes.scholars += Math.round(growth * 0.03);
                state.population.classes.nobles += Math.round(growth * 0.02);
            }
        }

        // 人口上限来自建筑
        let maxPop = 200; // 基础
        Object.keys(state.colony.buildings).forEach(bId => {
            const b = BUILDINGS[bId];
            if (b && b.effects && b.effects.maxPopulation) {
                maxPop += b.effects.maxPopulation * state.colony.buildings[bId];
            }
        });
        state.population.max = maxPop;

        // 幸福和忠诚衰减
        if (state.population.happiness > 50) state.population.happiness -= 0.5;
        if (state.population.happiness < 50) state.population.happiness += 0.3;

        // 不满度与忠诚度联动
        if (state.colony.loyalty < 30) state.population.unrest = Math.min(100, state.population.unrest + 2);
        if (state.colony.loyalty > 70) state.population.unrest = Math.max(0, state.population.unrest - 1);
        if (state.population.happiness < 25) state.population.unrest = Math.min(100, state.population.unrest + 3);

        // 稳定性
        state.colony.stability = Math.round(50 + (state.colony.loyalty - 50) * 0.3 + (state.population.happiness - 50) * 0.3 - state.population.unrest * 0.4);
        state.colony.stability = Math.max(0, Math.min(100, state.colony.stability));

        // 忠诚度自然变化
        const loyaltyChange = (state.resources.faith > 0 ? 0.5 : -0.5) * (1 + state.modifiers.loyaltyGrowthMod);
        state.colony.loyalty = Math.max(0, Math.min(100, state.colony.loyalty + loyaltyChange));

        // 人力更新
        state.resources.manpower = Math.round(state.population.total * 0.04);
    }
};
