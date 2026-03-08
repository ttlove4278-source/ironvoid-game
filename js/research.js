// ============================================
// 科技研发系统
// ============================================

const Research = {
    render: function(state) {
        let html = '';
        html += '<div class="panel-title">🔬 科技研发</div>';
        html += '<div class="panel-subtitle">"知识是万机之神赐予的最珍贵齿轮。" · 研究点数产出: +' + (state.resourceRates.research || 0) + '/回合</div>';

        // 当前研究
        if (state.research.current) {
            const tech = TECHNOLOGIES[state.research.current];
            const pct = Math.min(100, (state.research.progress / tech.cost) * 100);
            html += '<div class="panel-section">';
            html += '<div class="section-header"><span>🔬 当前研究</span></div>';
            html += '<div class="item-card" style="border-color:var(--warning);">';
            html += '<div class="item-header"><span class="item-name">' + tech.icon + ' ' + tech.name + '</span>';
            html += '<span class="item-count">' + Math.round(state.research.progress) + '/' + tech.cost + '</span></div>';
            html += '<div class="item-desc">' + tech.desc + '</div>';
            html += '<div class="progress-bar-sm"><div class="progress-fill-sm brass" style="width:' + pct + '%"></div></div>';
            html += '</div></div>';
        }

        // 科技树 - 按分支显示
        const branches = {
            industry: { name: '⚙️ 工业科技', techs: [] },
            military: { name: '⚔️ 军事科技', techs: [] },
            society: { name: '👥 社会科技', techs: [] },
            exploration: { name: '🔭 探索科技', techs: [] }
        };

        Object.keys(TECHNOLOGIES).forEach(tId => {
            const t = TECHNOLOGIES[tId];
            if (branches[t.branch]) {
                branches[t.branch].techs.push(t);
            }
        });

        html += '<div class="tech-tree-container">';
        Object.keys(branches).forEach(branchId => {
            const branch = branches[branchId];
            html += '<div class="tech-branch">';
            html += '<div class="tech-branch-title">' + branch.name + '</div>';

            // 按tier排序
            branch.techs.sort((a, b) => a.tier - b.tier);

            branch.techs.forEach(tech => {
                const isCompleted = state.research.completed.indexOf(tech.id) !== -1;
                const isResearching = state.research.current === tech.id;
                const isAvailable = this.isTechAvailable(tech, state);
                const isLocked = !isCompleted && !isResearching && !isAvailable;

                let className = 'tech-item';
                if (isCompleted) className += ' researched';
                else if (isResearching) className += ' researching';
                else if (isLocked) className += ' locked';

                html += '<div class="' + className + '"';
                if (isAvailable && !isCompleted && !isResearching) {
                    html += ' onclick="Research.startResearch(\'' + tech.id + '\')" style="cursor:pointer;"';
                }
                html += '>';
                html += '<div class="tech-name">' + tech.icon + ' ' + tech.name;
                if (isCompleted) html += ' ✅';
                if (isResearching) html += ' 🔄';
                html += '</div>';
                html += '<div class="tech-cost">🔬 ' + tech.cost + ' 研究点';
                if (tech.requires.length > 0) {
                    html += ' | 需要: ' + tech.requires.map(r => TECHNOLOGIES[r] ? TECHNOLOGIES[r].name : r).join(', ');
                }
                html += '</div>';

                // 效果
                if (tech.effects) {
                    html += '<div style="font-size:0.75em;color:var(--positive);margin-top:4px;">';
                    Object.keys(tech.effects).forEach(key => {
                        if (key === 'unlock') {
                            tech.effects.unlock.forEach(bId => {
                                if (BUILDINGS[bId]) html += '解锁: ' + BUILDINGS[bId].name + ' ';
                            });
                        } else {
                            const pct = Math.round(tech.effects[key] * 100);
                            if (pct > 0) html += Production.modLabel(key) + '+' + pct + '% ';
                            else html += Production.modLabel(key) + pct + '% ';
                        }
                    });
                    html += '</div>';
                }

                html += '</div>';
            });
            html += '</div>';
        });
        html += '</div>';

        return html;
    },

    // 检查科技是否可研究
    isTechAvailable: function(tech, state) {
        if (state.research.completed.indexOf(tech.id) !== -1) return false;
        if (tech.requires.length > 0) {
            for (let i = 0; i < tech.requires.length; i++) {
                if (state.research.completed.indexOf(tech.requires[i]) === -1) return false;
            }
        }
        return true;
    },

    // 开始研究
    startResearch: function(techId) {
        const state = GameEngine.state;
        const tech = TECHNOLOGIES[techId];
        if (!tech) return;
        if (!this.isTechAvailable(tech, state)) return;

        state.research.current = techId;
        state.research.progress = 0;
        GameEngine.addLog('开始研究: ' + tech.name);
        UI.refreshAll();
    },

    // 每回合处理
    processTurn: function(state) {
        if (!state.research.current) return;

        const researchOutput = state.resourceRates.research;
        state.research.progress += Math.max(0, researchOutput);

        const tech = TECHNOLOGIES[state.research.current];
        if (state.research.progress >= tech.cost) {
            // 研究完成
            state.research.completed.push(state.research.current);
            GameEngine.addLog('🔬 科技突破: ' + tech.name + ' 研究完成！', 'success');
            GameEngine.applyTechEffects(state.research.current);
            state.research.current = null;
            state.research.progress = 0;
            state.stats.techResearched++;
        }
    }
};
