// ============================================
// 铁血星域 - 主入口
// ============================================

(function() {
    'use strict';

    // 屏幕管理
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-' + screenId).classList.add('active');
    }

    // ========== 主菜单 ==========
    document.getElementById('btn-new-game').addEventListener('click', function() {
        showScreen('creation');
        renderCreation();
    });

    document.getElementById('btn-load-game').addEventListener('click', function() {
        const state = SaveSystem.load() || SaveSystem.loadAuto();
        if (state) {
            GameEngine.state = state;
            showScreen('game');
            UI.init();
            UI.refreshAll();
            GameEngine.addLog('📜 存档已载入。');
        } else {
            alert('没有找到存档。');
        }
    });

    document.getElementById('btn-codex').addEventListener('click', function() {
        showScreen('codex');
    });

    document.getElementById('btn-codex-back').addEventListener('click', function() {
        showScreen('menu');
    });

    // 检查是否有存档
    if (!SaveSystem.hasSave()) {
        document.getElementById('btn-load-game').style.opacity = '0.4';
    }

    // ========== 角色创建 ==========
    let selectedOrigin = 'forge_world';
    let selectedPlanet = 'temperate';

    function renderCreation() {
        // 起源卡片
        const originContainer = document.getElementById('origin-cards');
        originContainer.innerHTML = '';
        ORIGINS.forEach(origin => {
            const card = document.createElement('div');
            card.className = 'selection-card' + (selectedOrigin === origin.id ? ' selected' : '');
            card.innerHTML = '<div class="card-icon">' + origin.icon + '</div>' +
                '<div class="card-title">' + origin.name + '</div>' +
                '<div class="card-desc">' + origin.desc + '</div>' +
                '<div class="card-bonus">' + origin.traits.join(' · ') + '</div>';
            card.addEventListener('click', function() {
                selectedOrigin = origin.id;
                renderCreation();
            });
            originContainer.appendChild(card);
        });

        // 星球卡片
        const planetContainer = document.getElementById('planet-cards');
        planetContainer.innerHTML = '';
        PLANET_TYPES.forEach(planet => {
            const card = document.createElement('div');
            card.className = 'selection-card' + (selectedPlanet === planet.id ? ' selected' : '');
            card.innerHTML = '<div class="card-icon">' + planet.icon + '</div>' +
                '<div class="card-title">' + planet.name + '</div>' +
                '<div class="card-desc">' + planet.desc + '</div>' +
                '<div class="card-bonus">' + planet.traits.join(' · ') + '</div>';
            card.addEventListener('click', function() {
                selectedPlanet = planet.id;
                renderCreation();
            });
            planetContainer.appendChild(card);
        });

        // 摘要
        const origin = ORIGINS.find(o => o.id === selectedOrigin);
        const planet = PLANET_TYPES.find(p => p.id === selectedPlanet);
        const summary = document.getElementById('creation-summary');
        summary.innerHTML = '<div style="color:var(--brass-light);margin-bottom:8px;">📋 总结</div>' +
            '<div style="font-size:0.85em;color:var(--text-dim);">' +
            '起源: <span style="color:var(--text-bright);">' + origin.name + '</span> · ' +
            '星球: <span style="color:var(--text-bright);">' + planet.name + '</span> · ' +
            '建筑上限: ' + planet.maxBuildings +
            '</div>';
    }

    document.getElementById('btn-start-game').addEventListener('click', function() {
        const name = document.getElementById('governor-name').value || 'Aurelius Vex';
        const colonyName = document.getElementById('colony-name').value || '铁砧座-VII';

        GameEngine.newGame(name, colonyName, selectedOrigin, selectedPlanet);
        showScreen('game');
        UI.init();
        UI.refreshAll();
    });

    // ========== 游戏内按钮 ==========
    document.getElementById('btn-next-turn').addEventListener('click', function() {
        GameEngine.nextTurn();
        UI.refreshAll();
    });

    document.getElementById('btn-save').addEventListener('click', function() {
        SaveSystem.save(GameEngine.state);
        UI.refreshAll();
    });

    document.getElementById('btn-menu').addEventListener('click', function() {
        if (confirm('返回主菜单？未保存的进度将丢失。')) {
            showScreen('menu');
        }
    });

    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (!document.getElementById('screen-game').classList.contains('active')) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            GameEngine.nextTurn();
            UI.refreshAll();
        }
    });

})();
