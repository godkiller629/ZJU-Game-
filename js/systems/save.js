import { player } from '../core/state.js';
import { UI } from '../ui/ui.js';

const SAVE_KEY_PREFIX = 'ZJU_SIM_SAVE_';

export const SaveSystem = {
    // 保存游戏
    save(slot) {
        try {
            const data = {
                player: player,
                meta: {
                    timestamp: Date.now(),
                    dateString: new Date().toLocaleString(),
                    summary: `${player.year}年${player.month}月 - ${player.majorName || '未分流'}`
                }
            };
            localStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(data));
            UI.addLogEntry(`💾 存档成功 (槽位 ${slot})`, 'positive');
            this.refreshUI();
            UI.showMessageModal("保存成功", `游戏进度已保存至槽位 ${slot}。`);
        } catch (e) {
            console.error("Save failed:", e);
            UI.showMessageModal("保存失败", "存储空间不足或发生错误。");
        }
    },

    // 读取游戏
    load(slot) {
        const json = localStorage.getItem(SAVE_KEY_PREFIX + slot);
        if (!json) {
            UI.showMessageModal("提示", "该槽位没有存档。");
            return;
        }

        UI.showConfirmModal(`确定要读取槽位 ${slot} 的存档吗？<br>当前未保存的进度将丢失。`, () => {
            try {
                const data = JSON.parse(json);
                // 恢复玩家状态
                Object.assign(player, data.player);

                // 兼容性处理
                if (!player.idle) player.idle = { study: 0, social: 0 };

                UI.updateAll();
                UI.addLogEntry(`📂 读取存档成功 (槽位 ${slot})`, 'positive');

                // 切换回首页
                document.querySelector('.tab-btn[data-tab="home"]').click();
            } catch (e) {
                console.error("Load failed:", e);
                UI.showMessageModal("坏档警告", "存档数据损坏，无法读取。");
            }
        });
    },

    // 删除存档
    delete(slot) {
        UI.showConfirmModal(`确定要清空槽位 ${slot} 吗？`, () => {
            localStorage.removeItem(SAVE_KEY_PREFIX + slot);
            this.refreshUI();
            UI.addLogEntry(`🗑️ 已清空槽位 ${slot}`, 'normal');
        });
    },

    // 自动保存
    autoSave() {
        const data = {
            player: player,
            meta: {
                timestamp: Date.now(),
                dateString: new Date().toLocaleString(),
                summary: `[自动] ${player.year}年${player.month}月`
            }
        };
        localStorage.setItem(SAVE_KEY_PREFIX + 'AUTO', JSON.stringify(data));
    },

    // 获取存档信息
    getSlotInfo(slot) {
        const json = localStorage.getItem(SAVE_KEY_PREFIX + slot);
        if (!json) return null;
        try {
            return JSON.parse(json).meta;
        } catch { return null; }
    },

    refreshUI() {
        UI.renderSaveSlots();
    }
};