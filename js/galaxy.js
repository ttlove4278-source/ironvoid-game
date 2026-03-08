// ============================================
// 星系地图
// ============================================

const Galaxy = {
    generateGalaxy: function(state) {
        const cfg = GALAXY_CONFIG;
        const systems = [];

        // 玩家起始星系
        systems.push({
            id: 0,
            name: state.colony.name,
            x: cfg.mapWidth / 2,
            y: cfg.mapHeight / 2,
            type: 'inhabited',
            owner: 'player',
            explored: true,
            resources: { metal: 3, fuel: 2, food: 2, crystal: 1 }
        });

        // 随机生成星系
        for (let i = 1; i < cfg.systemCount; i++) {
            let x, y, valid;
            let attempts = 0;
            do {
                x = 30 + Math.random() * (cfg.mapWidth - 60);
                y = 30 + Math.random() * (cfg.mapHeight - 60);
                valid = true;
                for (let j = 0; j < systems.length; j++) {
                    const dx = x - systems[j].x;
                    const dy = y - systems[j].y;
                    if (Math.sqrt(dx*dx + dy*dy) < cfg.minDistance) { valid = false; break; }
                }
                attempts++;
            } while (!valid && attempts < 100);

            const typeRoll = Math.random();
            let type;
            if (typeRoll < 0.2) type = 'inhabited';
            else if (typeRoll < 0.45) type = 'resource';
            else if (typeRoll < 0.65) type = 'empty';
            else if (typeRoll < 0.8) type = 'hostile';
            else if (typeRoll < 0.9) type = 'ruins';
            else type = 'anomaly';

            const nameIdx = i % cfg.namePool.length;
            const suffix = cfg.suffixes[Math.floor(Math.random() * cfg.suffixes.length)];

            systems.push({
                id: i,
                name: cfg.namePool[nameIdx] + suffix,
                x: Math.round(x),
                y: Math.round(y),
                type: type,
                owner: type === 'hostile' ? 'enemy' : 'none',
                explored: false,
                resources: {
                    metal: Math.floor(Math.random() * 5),
                    fuel: Math.floor(Math.random() * 4),
                    food: Math.floor(Math.random() * 3),
                    crystal: Math.floor(Math.random() * 2)
                }
            });
        }

        // 生成连接
        const connections = [];
        for (let i = 0; i < systems.length; i++) {
            for (let j = i + 1; j < systems.length; j++) {
                const dx = systems[i].x - systems[j].x;
                const dy = systems[i].y - systems[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < cfg.connectionDistance) {
                    connections.push([i, j]);
                }
            }
        }

        state.galaxy.systems = systems;
        state.galaxy.connections = connections;
        state.galaxy.explored = [0];
        state.galaxy.owned = [0];
    },

    render: function(state) {
        let html = '';
        html += '<div class="panel-title">🗺️ 星系图</div>';
        html += '<div class="panel-subtitle">"向虚空进发，以铁血开拓。" · 已探索: ' + state.galaxy.explored.length + '/' + state.galaxy.systems.length + '</div>';

        // 星图
        html += '<div class="galaxy-map" id="galaxy-map">';

        // 连接线 (SVG)
        html += '<svg style="position:absolute;width:100%;height:100%;top:0;left:0;pointer-events:none;">';
        state.galaxy.connections.forEach(conn => {
            const a = state.galaxy.systems[conn[0]];
            const b = state.galaxy.systems[conn[1]];
            const explored = state.galaxy.explored.indexOf(conn[0]) !== -1 && state.galaxy.explored.indexOf(conn[1]) !== -1;
            const color = explored ? 'rgba(184,134,11,0.3)' : 'rgba(100,100,100,0.1)';
            html += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="' + color + '" stroke-width="1"/>';
        });
        html += '</svg>';

        // 星系节点
        state.galaxy.systems.forEach(sys => {
            const isExplored = state.galaxy.explored.indexOf(sys.id) !== -1;
            const isOwned = state.galaxy.owned.indexOf(sys.id) !== -1;

            let className = 'star-system';
            if (isOwned) className += ' owned';
            else if (sys.owner === 'enemy') className += ' hostile';
            else if (isExplored) className += ' neutral';
            else className += ' unexplored';

            html += '<div class="' + className + '" style="left:' + (sys.x - 6) + 'px;top:' + (sys.y - 6) + 'px;"';
            html += ' onclick="Galaxy.selectSystem(' + sys.id + ')">';
            html += '<div class="star-dot"></div>';
            if (isExplored) {
                html += '<div class="star-label">' + sys.name + '</div>';
            }
            html += '</div>';
        });

        html += '</div>';

        // 选中星系信息
        html += '<div id="system-info" style="margin-top:15px;"></div>';

        return html;
    },

    selectSystem: function(systemId) {
        const state = GameEngine.state;
        const sys = state.galaxy.systems[systemId];
        const isExplored = state.galaxy.explored.indexOf(systemId) !== -1;

        let html = '<div class="item-card" style="border-color:var(--brass);">';
        html += '<div class="item-header"><span class="item-name">🌟 ' + (isExplored ? sys.name : '未知星系') + '</span>';
        html += '<span class="item-count">' + sys.type + '</span></div>';

        if (isExplored) {
            html += '<div class="item-desc">类型: ' + sys.type + ' | 所有者: ' + (sys.owner === 'player' ? '你' : sys.owner) + '</div>';
            html += '<div class="item-stats">';
            html += '<span class="stat-tag neutral">⛏️' + sys.resources.metal + '</span>';
            html += '<span class="stat-tag neutral">🛢️' + sys.resources.fuel + '</span>';
            html += '<span class="stat-tag neutral">🌾' + sys.resources.food + '</span>';
            html += '<span class="stat-tag neutral">💎' + sys.resources.crystal + '</span>';
            html += '</div>';

            if (sys.owner !== 'player' && sys.owner !== 'enemy') {
                html += '<button class="build-btn" onclick="Galaxy.explore(' + systemId + ')">🔭 探索</button>';
            }
        } else {
            html += '<div class="item-desc">未探索的星系。需要以太扫描仪或舰队来进行探索。</div>';
            const isAdjacent = this.isAdjacent(systemId, state);
            if (isAdjacent) {
                html += '<button class="build-btn" onclick="Galaxy.explore(' + systemId + ')">🔭 探索此星系</button>';
            }
        }
        html += '</div>';

        document.getElementById('system-info').innerHTML = html;
    },

    isAdjacent: function(systemId, state) {
        for (let i = 0; i < state.galaxy.connections.length; i++) {
            const conn = state.galaxy.connections[i];
            if (conn[0] === systemId && state.galaxy.explored.indexOf(conn[1]) !== -1) return true;
            if (conn[1] === systemId && state.galaxy.explored.indexOf(conn[0]) !== -1) return true;
        }
        return false;
    },

    explore: function(systemId) {
        const state = GameEngine.state;
        if (state.galaxy.explored.indexOf(systemId) === -1) {
            state.galaxy.explored.push(systemId);
            const sys = state.galaxy.systems[systemId];
            GameEngine.addLog('🔭 探索了新星系: ' + sys.name + ' (' + sys.type + ')');
            UI.refreshAll();
            UI.switchPanel('galaxy');
        }
    }
};
