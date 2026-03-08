// ============================================
// 商业贸易系统
// ============================================

const Trade = {
    initPrices: function(state) {
        state.trade.prices = {};
        Object.keys(TRADE_GOODS).forEach(gId => {
            const good = TRADE_GOODS[gId];
            state.trade.prices[gId] = good.basePrice;
        });
    },

    render: function(state) {
        let html = '';
        html += '<div class="panel-title">💰 星际贸易</div>';
        html += '<div class="panel-subtitle">"利润是帝国的第二种燃料。" · 帝国信用: ' + Math.round(state.resources.credits) + '</div>';

        // 市场行情
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>📈 市场行情</span><span>价格每回合波动</span></div>';
        html += '<table class="data-table">';
        html += '<tr><th>商品</th><th>当前价</th><th>基准价</th><th>波动</th><th>操作</th></tr>';

        Object.keys(TRADE_GOODS).forEach(gId => {
            const good = TRADE_GOODS[gId];
            const price = Math.round(state.trade.prices[gId] || good.basePrice);
            const diff = price - good.basePrice;
            const diffColor = diff > 0 ? 'var(--positive)' : diff < 0 ? 'var(--negative)' : 'var(--text-dim)';
            const diffSign = diff > 0 ? '+' : '';

            html += '<tr>';
            html += '<td>' + good.icon + ' ' + good.name + '</td>';
            html += '<td style="color:var(--text-bright);font-family:var(--font-mono);">' + price + '💰</td>';
            html += '<td style="color:var(--text-dim);">' + good.basePrice + '</td>';
            html += '<td style="color:' + diffColor + ';">' + diffSign + diff + '</td>';
            html += '<td>';
            html += '<button class="build-btn" style="padding:3px 8px;margin:0 2px;" onclick="Trade.buy(\'' + gId + '\')">买入</button>';
            html += '<button class="build-btn" style="padding:3px 8px;margin:0 2px;" onclick="Trade.sell(\'' + gId + '\')">卖出</button>';
            html += '</td>';
            html += '</tr>';
        });
        html += '</table></div>';

        // 贸易声望
        html += '<div class="panel-section">';
        html += '<div class="section-header"><span>🏆 贸易声望</span></div>';
        html += Colony.renderStat('声望', state.trade.reputation, 100, state.trade.reputation > 50 ? 'brass' : 'red');
        html += '<div style="padding:8px;font-size:0.82em;color:var(--text-dim);">声望越高，交易价格越优惠。</div>';
        html += '</div>';

        return html;
    },

    buy: function(goodId) {
        const state = GameEngine.state;
        const price = Math.round(state.trade.prices[goodId] || TRADE_GOODS[goodId].basePrice);

        if (state.resources.credits < price) {
            GameEngine.addLog('信用不足，无法购买 ' + TRADE_GOODS[goodId].name);
            return;
        }

        state.resources.credits -= price;

        // 转化为对应资源
        const conversion = { raw_ore: 'metal', refined_metal: 'metal', aether_fuel: 'fuel', synth_food: 'food', aether_crystals: 'crystal' };
        const convAmount = { raw_ore: 5, refined_metal: 10, aether_fuel: 8, synth_food: 12, aether_crystals: 3 };

        if (conversion[goodId]) {
            const res = conversion[goodId];
            const amount = convAmount[goodId] || 5;
            state.resources[res] += amount;
            GameEngine.addLog('购入 ' + TRADE_GOODS[goodId].name + ' → +' + amount + ' ' + RESOURCES[res].name);
        } else {
            // 特殊商品
            if (goodId === 'holy_relics') { state.resources.faith += 10; GameEngine.addLog('购入圣齿轮遗物 → +10 信仰'); }
            else if (goodId === 'weapons') { state.military.army.infantry += 2; GameEngine.addLog('购入武器 → +2 步兵'); }
            else if (goodId === 'luxury_goods') { state.population.happiness += 5; GameEngine.addLog('购入奢侈品 → +5 幸福度'); }
            else if (goodId === 'xeno_artifacts') { state.resources.research += 20; GameEngine.addLog('购入异星遗物 → +20 研究点数'); }
        }

        state.stats.tradeDeals++;
        UI.refreshAll();
    },

    sell: function(goodId) {
        const state = GameEngine.state;
        const price = Math.round(state.trade.prices[goodId] || TRADE_GOODS[goodId].basePrice);

        const conversion = { raw_ore: 'metal', refined_metal: 'metal', aether_fuel: 'fuel', synth_food: 'food', aether_crystals: 'crystal' };
        const convAmount = { raw_ore: 5, refined_metal: 10, aether_fuel: 8, synth_food: 12, aether_crystals: 3 };

        if (conversion[goodId]) {
            const res = conversion[goodId];
            const amount = convAmount[goodId] || 5;
            if (state.resources[res] < amount) {
                GameEngine.addLog('资源不足，无法卖出 ' + TRADE_GOODS[goodId].name);
                return;
            }
            state.resources[res] -= amount;
            state.resources.credits += price;
            GameEngine.addLog('卖出 ' + TRADE_GOODS[goodId].name + ' → +' + price + ' 信用');
        }

        state.stats.tradeDeals++;
        state.stats.totalCreditsEarned += price;
        UI.refreshAll();
    },

    processTurn: function(state) {
        // 价格波动
        Object.keys(TRADE_GOODS).forEach(gId => {
            const good = TRADE_GOODS[gId];
            const volatility = good.volatility;
            const change = (Math.random() - 0.5) * 2 * volatility * good.basePrice;
            state.trade.prices[gId] = Math.max(
                good.basePrice * 0.3,
                Math.min(good.basePrice * 2.5, (state.trade.prices[gId] || good.basePrice) + change)
            );
        });
    }
};
