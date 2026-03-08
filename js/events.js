// ============================================
// 事件系统
// ============================================

const Events = {
    pool: [
        {
            id: 'meteor_shower',
            title: '☄️ 陨石雨',
            text: '一场猛烈的陨石雨袭击了殖民地！部分设施受损，但陨石中似乎含有稀有矿物。',
            weight: 1, minTurn: 3,
            choices: [
                { text: '组织紧急修复，优先恢复生产', effect: '⛏️铸铁-15, ⚖️稳定-5', action: function(s) { s.resources.metal -= 15; s.colony.stability -= 5; } },
                { text: '派人收集陨石中的矿物', effect: '💎水晶+5, 👤人力-5', action: function(s) { s.resources.crystal += 5; s.resources.manpower -= 5; } },
                { text: '利用这个机会宣扬万机之神的警示', effect: '✝️信仰+10, ❤️忠诚+3', action: function(s) { s.resources.faith += 10; s.colony.loyalty += 3; } }
            ]
        },
        {
            id: 'plague_outbreak',
            title: '☠️ 锈肺疫病',
            text: '一种名为"锈肺症"的疾病在殖民地蔓延。患者的肺部逐渐被铁锈色的菌丝覆盖。已有数十人倒下。',
            weight: 1, minTurn: 5,
            choices: [
                { text: '隔离感染区，牺牲少数保大局', effect: '👥人口-30, ⚖️稳定+5', action: function(s) { s.population.total -= 30; s.colony.stability += 5; } },
                { text: '投入资源研发解药', effect: '🔬研究-10, 💰信用-30', action: function(s) { s.resources.research -= 10; s.resources.credits -= 30; s.population.happiness += 5; } },
                { text: '让齿轮神甫祈祷净化', effect: '✝️信仰-8, 随机结果', action: function(s) { s.resources.faith -= 8; if(Math.random()>0.5){s.population.total-=10;GameEngine.addLog('祈祷似乎起了作用，疫情缓解。');}else{s.population.total-=50;GameEngine.addLog('祈祷未能阻止疫病蔓延...');} } }
            ]
        },
        {
            id: 'trade_caravan',
            title: '🚢 星际商队',
            text: '一支星际贸易商队到达了殖民地轨道，提出了几项贸易提案。他们的货舱里似乎装满了珍贵物资。',
            weight: 2, minTurn: 2,
            choices: [
                { text: '以铸铁交换燃料', effect: '⛏️铸铁-25, 🛢️燃料+20', action: function(s) { s.resources.metal -= 25; s.resources.fuel += 20; } },
                { text: '用信用购买补给', effect: '💰信用-40, 🌾口粮+30, 🛢️燃料+10', action: function(s) { s.resources.credits -= 40; s.resources.food += 30; s.resources.fuel += 10; } },
                { text: '征收过境税', effect: '💰信用+20, 📈贸易声望-5', action: function(s) { s.resources.credits += 20; s.trade.reputation -= 5; } },
                { text: '热情款待，建立长期关系', effect: '💰信用-15, 📈贸易声望+8', action: function(s) { s.resources.credits -= 15; s.trade.reputation += 8; } }
            ]
        },
        {
            id: 'heresy_discovered',
            title: '🔥 异端发现',
            text: '执法者在殖民地下层发现了一个秘密聚会——一群人在膜拜一尊来路不明的异星雕像。齿轮神教的神甫要求立即清剿。',
            weight: 1, minTurn: 8,
            choices: [
                { text: '发动异端审判，公开处决首犯', effect: '✝️信仰+15, 😊幸福-10, ⚖️稳定+5', action: function(s) { s.resources.faith += 15; s.population.happiness -= 10; s.colony.stability += 5; } },
                { text: '秘密逮捕，低调处理', effect: '⚖️稳定-3, 💰信用-10', action: function(s) { s.colony.stability -= 3; s.resources.credits -= 10; } },
                { text: '调查这个异星雕像的来源', effect: '🔬研究+15, ✝️信仰-10', action: function(s) { s.resources.research += 15; s.resources.faith -= 10; } },
                { text: '容忍不同信仰，维护社会和谐', effect: '😊幸福+5, ✝️信仰-20, ❤️忠诚-5', action: function(s) { s.population.happiness += 5; s.resources.faith -= 20; s.colony.loyalty -= 5; } }
            ]
        },
        {
            id: 'worker_strike',
            title: '⚒️ 工人罢工',
            text: '铸铁熔炉的工人因工作条件恶劣而集体罢工。他们要求增加口粮配给和缩短工作时间。生产已经停滞。',
            weight: 1, minTurn: 6,
            choices: [
                { text: '满足工人要求', effect: '🌾口粮-15, 😊幸福+10, ⛏️铸铁产量临时下降', action: function(s) { s.resources.food -= 15; s.population.happiness += 10; } },
                { text: '武力镇压罢工', effect: '⚖️稳定-8, 😊幸福-15, 生产恢复', action: function(s) { s.colony.stability -= 8; s.population.happiness -= 15; s.population.unrest += 10; } },
                { text: '与工人代表谈判妥协', effect: '💰信用-20, 😊幸福+5, ⚖️稳定+3', action: function(s) { s.resources.credits -= 20; s.population.happiness += 5; s.colony.stability += 3; } }
            ]
        },
        {
            id: 'ancient_ruins',
            title: '🗿 古代遗迹',
            text: '探矿队在地表深处发现了一处古老的遗迹——可能是第一纪元人类文明的遗留物，也可能是更古老的异星建筑。',
            weight: 1, minTurn: 10,
            choices: [
                { text: '派科研团队仔细考察', effect: '🔬研究+25, 💰信用-20', action: function(s) { s.resources.research += 25; s.resources.credits -= 20; } },
                { text: '拆除遗迹，回收材料', effect: '⛏️铸铁+20, 💎水晶+5', action: function(s) { s.resources.metal += 20; s.resources.crystal += 5; } },
                { text: '让齿轮神甫鉴定其神圣性', effect: '✝️信仰+12, 🔬研究+8', action: function(s) { s.resources.faith += 12; s.resources.research += 8; } },
                { text: '封锁遗迹，禁止任何接触', effect: '⚖️稳定+5', action: function(s) { s.colony.stability += 5; } }
            ]
        },
        {
            id: 'pirate_raid',
            title: '☠️ 海盗袭击',
            text: '虚空海盗的劫掠舰出现在殖民地轨道上！他们要求你交出货物和信用，否则将进行轰炸。',
            weight: 1, minTurn: 7,
            choices: [
                { text: '启动防御系统，准备战斗', effect: '战斗结果取决于军事实力', action: function(s) {
                    if (s.military.totalStrength + s.military.defense > 40) {
                        GameEngine.addLog('⚔️ 海盗被击退！殖民地安然无恙。', 'success');
                        s.resources.credits += 30;
                        s.stats.battlesWon++;
                    } else {
                        GameEngine.addLog('⚔️ 防御失败，海盗掠夺了物资...', 'danger');
                        s.resources.metal -= 20; s.resources.credits -= 30;
                        s.colony.stability -= 10;
                        s.stats.battlesLost++;
                    }
                }},
                { text: '支付赎金打发他们', effect: '💰信用-50', action: function(s) { s.resources.credits -= 50; GameEngine.addLog('支付了赎金，海盗离去。'); } },
                { text: '尝试与海盗谈判，化敌为友', effect: '💰信用-20, 🤝海盗关系+10', action: function(s) { s.resources.credits -= 20; s.diplomacy.relations.void_pirates = Math.min(100, (s.diplomacy.relations.void_pirates||20) + 10); } }
            ]
        },
        {
            id: 'refugee_fleet',
            title: '🚀 难民舰队',
            text: '一支破旧的难民舰队请求在你的殖民地停靠。他们声称自己的家园被异星生物摧毁。接收他们将增加人口但也增加负担。',
            weight: 1, minTurn: 5,
            choices: [
                { text: '全部接收，彰显帝国仁慈', effect: '👥人口+80, 🌾口粮消耗增加, ❤️忠诚+5', action: function(s) { s.population.total += 80; s.population.classes.serfs += 50; s.population.classes.workers += 30; s.colony.loyalty += 5; } },
                { text: '选择性接收——只要技术人员', effect: '👥人口+20, 🔬研究+5', action: function(s) { s.population.total += 20; s.population.classes.scholars += 10; s.population.classes.workers += 10; s.resources.research += 5; } },
                { text: '给予补给后让他们离开', effect: '🌾口粮-20, 🛢️燃料-10', action: function(s) { s.resources.food -= 20; s.resources.fuel -= 10; } },
                { text: '驱逐他们，殖民地资源不够', effect: '😊幸福-5, 无资源消耗', action: function(s) { s.population.happiness -= 5; } }
            ]
        },
        {
            id: 'tech_discovery',
            title: '🔬 科技残骸',
            text: '工程团队在一次常规挖掘中发现了一块保存完好的古代数据核心。它的信息可能大幅推进我们的科研进展。',
            weight: 1, minTurn: 8,
            choices: [
                { text: '立即进行逆向工程', effect: '🔬研究+30', action: function(s) { s.resources.research += 30; } },
                { text: '小心提取后高价出售', effect: '💰信用+80', action: function(s) { s.resources.credits += 80; } },
                { text: '交给齿轮神教保管', effect: '✝️信仰+20, 🤝机械神教关系+10', action: function(s) { s.resources.faith += 20; s.diplomacy.relations.mechanicus = Math.min(100, (s.diplomacy.relations.mechanicus||50) + 10); } }
            ]
        },
        {
            id: 'solar_storm',
            title: '🌟 以太风暴',
            text: '一场猛烈的以太风暴席卷了星系。通讯暂时中断，但以太水晶的产量似乎受到了激发。',
            weight: 1, minTurn: 4,
            choices: [
                { text: '利用风暴收集额外的以太能量', effect: '💎水晶+8, 有10%概率设备损坏', action: function(s) { s.resources.crystal += 8; if(Math.random()<0.1){s.resources.metal-=10;GameEngine.addLog('设备在风暴中受损。');} } },
                { text: '关闭所有外部设施，等待风暴过去', effect: '本回合产量减半但确保安全', action: function(s) { s.colony.stability += 3; } },
                { text: '让神甫引导信众进行祈祷仪式', effect: '✝️信仰+8', action: function(s) { s.resources.faith += 8; } }
            ]
        }
    ],

    checkEvents: function(state) {
        // 每3回合有50%概率触发随机事件
        if (state.turn % 3 !== 0) return;
        if (Math.random() > 0.5) return;

        const available = this.pool.filter(e => state.turn >= e.minTurn);
        if (available.length === 0) return;

        // 加权随机选择
        const totalWeight = available.reduce((sum, e) => sum + e.weight, 0);
        let rand = Math.random() * totalWeight;
        let selected = available[0];
        for (let i = 0; i < available.length; i++) {
            rand -= available[i].weight;
            if (rand <= 0) { selected = available[i]; break; }
        }

        state.events.pending.push(selected);
    },

    showEvent: function(event) {
        const modal = document.getElementById('event-modal');
        document.getElementById('event-header').textContent = event.title;
        document.getElementById('event-body').textContent = event.text;

        const choicesEl = document.getElementById('event-choices');
        choicesEl.innerHTML = '';

        event.choices.forEach((choice, idx) => {
            const btn = document.createElement('button');
            btn.className = 'event-choice-btn';
            btn.innerHTML = choice.text + '<span class="choice-effect">' + choice.effect + '</span>';
            btn.addEventListener('click', function() {
                choice.action(GameEngine.state);
                GameEngine.state.stats.eventsHandled++;
                modal.classList.remove('active');
                UI.refreshAll();
            });
            choicesEl.appendChild(btn);
        });

        modal.classList.add('active');
    }
};
