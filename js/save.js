// ============================================
// 存档系统
// ============================================

const SaveSystem = {
    SAVE_KEY: 'ironvoid_save',
    AUTO_KEY: 'ironvoid_autosave',

    save: function(state) {
        try {
            const data = JSON.stringify(state);
            localStorage.setItem(this.SAVE_KEY, data);
            GameEngine.addLog('💾 游戏已保存。');
            return true;
        } catch (e) {
            GameEngine.addLog('⚠️ 保存失败: ' + e.message);
            return false;
        }
    },

    load: function() {
        try {
            const data = localStorage.getItem(this.SAVE_KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    },

    autoSave: function(state) {
        try {
            localStorage.setItem(this.AUTO_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Autosave failed:', e);
        }
    },

    loadAuto: function() {
        try {
            const data = localStorage.getItem(this.AUTO_KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    },

    hasSave: function() {
        return localStorage.getItem(this.SAVE_KEY) !== null ||
               localStorage.getItem(this.AUTO_KEY) !== null;
    },

    deleteSave: function() {
        localStorage.removeItem(this.SAVE_KEY);
        localStorage.removeItem(this.AUTO_KEY);
    }
};
