// js/features/attributes.js
import { player } from '../core/state.js';
import { UI } from '../ui/ui.js';
import { achievementList } from '../config/data.js';
import { GAME_PARAMS } from '../config/parameters.js';

const P = GAME_PARAMS;

export function checkHealth() {
    if (player.health < 50) {
        UI.showMessageModal("🚑 紧急住院", "健康值过低！强制住院。<br>花费：¥3000，健康恢复至60。");
        player.money -= 3000;
        player.health = 60;
        player.energy = 50;
        UI.updateStats();
        return true;
    }
    return false;
}

// 2.4 + 1.3 * log(投入) - 0.01 * (100 - 学识) - 健康惩罚
export function calculateSemesterGPA() {
    let effort = player.semesterStudyCount;
    // 避免 log(0)
    if (effort <= 0) effort = 1;

    let baseScore = P.GPA.BASE + P.GPA.LOG_FACTOR * Math.log10(effort);

    let knowledgePenalty = P.GPA.KNOWLEDGE_FACTOR * (100 - player.knowledge);

    let gpa = baseScore - knowledgePenalty;

    // 健康惩罚
    if (player.health < 80) gpa -= P.GPA.HEALTH_PENALTY_80;
    if (player.health < 70) gpa -= P.GPA.HEALTH_PENALTY_70; // 累计减去

    // 封顶封底
    gpa = Math.max(P.GPA.BASE, Math.min(P.GPA.MAX, gpa));

    return parseFloat(gpa.toFixed(2));
}

export function checkAchievements() {
    achievementList.forEach(a => {
        if (!player.achievements.includes(a.id) && a.cond(player)) {
            player.achievements.push(a.id);
            // 这里只负责弹窗，弹窗内部会调用 UI.renderSkills()
            UI.showAchievement(a);
            
            // 如果有奖励逻辑，也可以在这里处理，比如加钱
            // player.money += 1000; 
            
            // 关键：为了防止延迟，这里直接再次显式调用一次渲染，确保万无一失
            UI.renderSkills();
        }
    });
}

export function hasEnergy(cost) {
    if (player.energy < cost) {
        UI.showMessageModal("精力不足", "精力不足，请选择休息或进入下个月。");
        return false;
    }
    return true;
}