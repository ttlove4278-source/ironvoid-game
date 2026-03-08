// ============================================
// 界面渲染系统
// ============================================

const UI = {
    currentPanel: 'colony',

    init: function() {
        // 导航按钮
        document.querySelectorAll('.nav-btn[data-panel]').forEach(btn => {
            btn.addEventListener('click', function() {
                UI.switchPanel(this.dataset.panel);
            });
        });

        // 日志折叠
        document.getElementById('log-toggle').addEventListener('click', function() {
            document.getElementById('log-bar').classList.toggle('collapsed');
        });
    },

    switchPanel: function(panelId) {
        this.currentPanel = panelId;

        // 更新导航高亮
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.panel === panelId);
        });

        this.renderPanel();
    },

    renderPanel: function() {
        const state = GameEngine.state;
        const panel = document.getElementById('main-panel');
        let html = '';

        switch (this.currentPanel) {
            case 'colony': html = Colony.render(state); break;
            case 'production': html = Production.render(state); break;
            case 'research': html = Research.render(state); break;
            case 'military': html = Military.render(state); break;
            case 'trade': html = Trade.render(state); break;
            case 'population': html = Population.render(state); break;
            case 'diplomacy': html = Diplomacy.render(state); break;
            case 'galaxy': html = Galaxy.render(state); break;
            case 'codex': html = this.renderCodex(); break;
            default: html = Colony.render(state);
        }

        panel.innerHTML = html;
        panel.classList.add('fade-in');
        setTimeout(() => panel.classList.remove('fade-in'), 300);
    },

    refreshAll: function() {
        const state = GameEngine.state;
        if (!state) return;

        // 资源栏
        this.renderResourceBar(state);

        // 回合显示
        document.getElementById('turn-display').textContent = '回合 ' + state.turn;
        document.getElementById('date-display').textContent = state.date.toFixed(3);

        // 主面板
        this.renderPanel();

        // 信息栏
        this.renderInfoPanel(state);

        // 日志
        this.renderLog(state);

        // 检查待处理事件
        if (state.events.pending.length > 0) {
            const event = state.events.pending.shift();
            Events.showEvent(event);
        }
    },

    renderResourceBar: function(state) {
        const bar = document.getElementById('resource-bar');
        let html = '';

        ['metal', 'fuel', 'food', 'crystal', 'credits', 'faith', 'manpower', 'research'].forEach(resId => {
            const res = RESOURCES[resId];
            const value = Math.round(state.resources[resId] || 0);
            const rate = state.resourceRates[resId] || 0;
            const rateClass = rate > 0 ? 'positive' : rate < 0 ? 'negative' : '';
            const rateSign = rate > 0 ? '+' : '';

            html += '<div class="resource-item">';
            html += '<span class="resource-icon">' + res.icon + '</span>';
            html += '<span class="resource-value">' + value + '</span>';
            if (rate !== 0) {
                html += '<span class="resource-change ' + rateClass + '">(' + rateSign + rate + ')</span>';
            }
            html += '</div>';
        });

        bar.innerHTML = html;
    },

    renderInfoPanel: function(state) {
        const content = document.getElementById('info-content');
        let html = '';

        html += '<div style="font-size:0.82em;line-height:1.8;">';
        html += '<div style="color:var(--brass-light);margin-bottom:8px;">👤 ' + state.player.name + '</div>';
        html += '<div style="color:var(--text-dim);">称号: ' + state.player.title + '</div>';
        html += '<div style="color:var(--text-dim);">起源: ' + ORIGINS.find(o => o.id === state.player.origin).name + '</div>';
        html += '<hr style="border-color:rgba(184,134,11,0.15);margin:10px 0;">';

        html += '<div style="color:var(--brass-light);margin-bottom:4px;">📊 统计</div>';
        html += '<div>建造: ' + state.stats.buildingsBuilt + '</div>';
        html += '<div>科技: ' + state.stats.techResearched + '</div>';
        html += '<div>战斗: ' + state.stats.battlesWon + '胜/' + state.stats.battlesLost + '负</div>';
        html += '<div>贸易: ' + state.stats.tradeDeals + '次</div>';
        html += '<div>事件: ' + state.stats.eventsHandled + '次</div>';

        html += '<hr style="border-color:rgba(184,134,11,0.15);margin:10px 0;">';
        html += '<div style="color:var(--brass-light);margin-bottom:4px;">🏗️ 建造中</div>';
        if (state.colony.buildQueue.length === 0) {
            html += '<div style="color:var(--text-dim);">无</div>';
        } else {
            state.colony.buildQueue.forEach(item => {
                html += '<div>' + BUILDINGS[item.buildingId].icon + ' ' + BUILDINGS[item.buildingId].name + ' (' + item.turnsLeft + '回合)</div>';
            });
        }

        html += '<hr style="border-color:rgba(184,134,11,0.15);margin:10px 0;">';
        html += '<div style="color:var(--brass-light);margin-bottom:4px;">🔬 研究中</div>';
        if (state.research.current) {
            const tech = TECHNOLOGIES[state.research.current];
            html += '<div>' + tech.icon + ' ' + tech.name + '</div>';
            html += '<div style="color:var(--text-dim);">' + Math.round(state.research.progress) + '/' + tech.cost + '</div>';
        } else {
            html += '<div style="color:var(--text-dim);">无 - 请选择研究项目</div>';
        }

        html += '</div>';
        content.innerHTML = html;
    },

    renderLog: function(state) {
        const content = document.getElementById('log-content');
        const count = document.getElementById('log-count');

        let html = '';
        const logs = state.log.slice(-50).reverse();
        logs.forEach(entry => {
            html += '<div class="log-entry">';
            html += '<span class="log-turn">[' + entry.turn + ']</span>';
            html += '<span>' + entry.message + '</span>';
            html += '</div>';
        });

        content.innerHTML = html;
        count.textContent = '(' + state.log.length + ')';
    },

    renderCodex: function() {
        let html = '<div class="panel-title">📖 帝国典籍</div>';
        html += '<div class="panel-subtitle">关于这个宇宙的一切知识</div>';

        html += '<div class="codex-section"><h2>🌌 世界观</h2>';
        html += '<p>第三纪元。人类文明的黄金时代早已终结。</p>';
        html += '<p>在那个遥远的过去，人类凭借"以太裂隙引擎"——一种以蒸汽驱动的亚光速引擎——殖民了银河系的一角。城市如钢铁森林般矗立在无数星球之上，齿轮与管道构成了文明的脉络。</p>';
        html += '<p>然而，古老的星际通讯网络在一场被称为"大断裂"的灾难中崩溃。各殖民星沦为孤岛，科技退化、秩序崩塌。在黑暗与混乱中，齿轮神教崛起——他们崇拜"万机之神"，将维护和修复古代机械视为最神圣的使命。</p>';
        html += '<p>你是一位新任命的"锻造总督"，被派往帝国边缘的一颗荒芜星球。你的使命：建立殖民地、重建工业、恢复秩序——最终，重建人类文明的荣光。</p>';
        html += '</div>';

        html += '<div class="codex-section"><h2>⚙️ 齿轮神教</h2>';
        html += '<p>齿轮神教是第三纪元人类社会的主导宗教。他们相信宇宙本身就是一台巨大的机器，而"万机之神"就是这台机器的造物主和维护者。</p>';
        html += '<p>神教的教义认为，一切机械都拥有"机魂"——一种准灵性的存在。维护机械就是侍奉神灵，破坏机械就是亵渎。他们掌握着大量古代科技的知识碎片。</p>';
        html += '</div>';

        html += '<div class="codex-section"><h2>🎮 操作指南</h2>';
        html += '<p><strong>回合制：</strong>点击"推进齿轮"按钮来推进一个回合。每回合会产出资源、推进建造和研究、可能触发随机事件。</p>';
        html += '<p><strong>建设：</strong>在"殖民地"面板中建造各种设施来产出资源和提供效果。</p>';
        html += '<p><strong>科技：</strong>在"科技"面板中选择研究项目。科技可以解锁新建筑和提供各种加成。</p>';
        html += '<p><strong>军事：</strong>征募地面部队和建造舰船来保卫殖民地并征服新星系。</p>';
        html += '<p><strong>贸易：</strong>在市场上买卖商品，利用价格波动赚取利润。</p>';
        html += '<p><strong>外交：</strong>与其他势力互动——结盟、贸易或开战。</p>';
        html += '<p><strong>星图：</strong>探索周边星系，发现资源、遗迹和其他文明。</p>';
        html += '</div>';

        return html;
    }
};
