// js/features/actions.js
import { player } from '../core/state.js';
import { UI } from '../ui/ui.js';
import { checkHealth, hasEnergy, checkAchievements } from './attributes.js';
import { GAME_PARAMS } from '../config/parameters.js';
import { actions, holidayActions, seniorActions } from '../config/data.js';

const P = GAME_PARAMS;

function safeAdd(stat, val, isResource = false) {
    player[stat] = Math.floor(player[stat] + val);
    if (isResource) {
        if(stat === 'energy') player.energy = Math.max(0, Math.min(P.MAX_ENERGY, player.energy));
    } else {
        if(stat !== 'money') player[stat] = Math.max(P.MIN_STAT, Math.min(P.MAX_STAT, player[stat]));
    }
}

export function handleAction(actionId) {
    if (player.phase === 'done') return;
    if (checkHealth()) return;

    if (actionId === 'intern' || actionId === 'holiday_intern') {
        UI.showMessageModal('项目中心', '实习已整合进项目中心。<br>请前往“项目”页开启长期实习或短期实习经历。');
        return;
    }

    // 1. 确定当前可用的动作列表
    const isHoliday = [2, 7, 8].includes(player.month);
    let actionList;
    
    if (player.grade === 4) {
        if (isHoliday) {
            // 大四假期：将“预习”替换为“毕设”
            actionList = holidayActions.map(a => {
                if (a.id === 'holiday_preview') {
                    // 替换为毕设，属性复用 P.SENIOR.THESIS_COST，但 tag 设为 both
                    return { id: 'thesis', name: '毕设', icon: 'fas fa-file-alt', tag: 'both', cost: P.SENIOR.THESIS_COST, desc: '【主/次】进度+30%' };
                }
                return a;
            });
        } else {
            actionList = seniorActions;
        }
    } else {
        actionList = isHoliday ? holidayActions : actions;
    }

    const action = actionList.find(a => a.id === actionId);
    if (!action) return;

    // 2. 检查阶段 (tag: major, minor, both)
    const currentPhase = player.phase; // 'major' or 'minor'

    // 如果是主要阶段，可以做 major 或 both。不能做 minor。
    if (currentPhase === 'major' && action.tag === 'minor') {
        UI.showMessageModal("提示", "当前是【主要行动】阶段，请先选择一项主要行动。");
        return;
    }
    // 如果是次要阶段，可以做 minor 或 both。不能做 major。
    if (currentPhase === 'minor' && action.tag === 'major') {
        UI.showMessageModal("提示", "当前是【次要行动】阶段，无法进行主要行动。");
        return;
    }

    // 3. 计算数值变化 (根据阶段减半)
    let isMinorPhase = (currentPhase === 'minor');
    let multiplier = isMinorPhase ? 0.5 : 1.0;
    
    // --- 特殊拦截：毕设达到优秀后的确认 ---
    if (actionId === 'thesis' && player.thesis >= 150) {
        UI.showConfirmModal("毕业论文已经达到优秀，确定还要再写吗？", () => {
            // 用户确认后执行逻辑
            executeAction(actionId, multiplier);
        });
        return; // 暂停后续逻辑，等待用户确认
    }

    // 正常执行
    executeAction(actionId, multiplier);
}

function executeAction(actionId, multiplier) {
    // 基础数值 (默认按主要行动配置)
    // 需要重新查找 action 对象，或者把 action 传进来。为了简单，这里通过 id 重新获取不太方便，
    // 建议把 handleAction 的后半部分提取出来。
    
    // 重新获取 action 对象 (简化版，假设 id 唯一且不仅依赖外部变量)
    let action = [...actions, ...holidayActions, ...seniorActions].find(a => a.id === actionId);
    // 注意：holidayActions 在大四会被替换，所以这里可能找不到正确的 thesis action。
    // 但 thesis 的 cost 是固定的 P.SENIOR.THESIS_COST
    
    let cost = action ? action.cost : 0;
    if (actionId === 'thesis') cost = P.SENIOR.THESIS_COST;

    // ... (原有逻辑)
    let finalCost = Math.ceil(cost * multiplier);

    // 检查精力是否足够（如果是消耗）
    if (finalCost > 0 && !hasEnergy(finalCost)) return;

    // --- 执行数值变更 ---
    // 扣除或恢复精力
    if (finalCost > 0) safeAdd('energy', -finalCost, true);
    else safeAdd('energy', Math.abs(finalCost), true);

    // 通用效果 (根据ID)
    let AM = P.ACTION_MAJOR;
    // 辅助函数：应用收益
    const apply = (stat, val, isMoney=false) => {
        let change = Math.ceil(val * multiplier);
        safeAdd(stat, change, isMoney);
        return change; // 返回实际变化值用于日志
    };

    switch(actionId) {
        case 'study':
            apply('knowledge', AM.GAIN_STAT);
            apply('health', -AM.HEALTH_COST);
            player.semesterStudyCount += Math.ceil(AM.EFFORT * multiplier);
            UI.addLogEntry(`📖 学习：学识+${Math.ceil(AM.GAIN_STAT*multiplier)}，投入+${Math.ceil(AM.EFFORT*multiplier)}`);
            break;
        case 'part_time':
            apply('social', AM.GAIN_STAT);
            apply('skill', AM.GAIN_STAT);
            apply('money', AM.MONEY, true);
            apply('health', -AM.HEALTH_COST);
            UI.addLogEntry(`💰 兼职：金钱+${Math.ceil(AM.MONEY*multiplier)}`);
            break;
        case 'social':
            apply('social', AM.GAIN_SOCIAL);
            apply('health', AM.GAIN_HEALTH);
            UI.addLogEntry(`🤝 社交：社交+${Math.ceil(AM.GAIN_SOCIAL*multiplier)}`);
            break;
        case 'fitness':
            apply('health', AM.GAIN_HEALTH);
            UI.addLogEntry(`🏋️ 健身：健康+${Math.ceil(AM.GAIN_HEALTH*multiplier)}`);
            break;
        case 'rest':
            apply('health', AM.GAIN_HEALTH);
            UI.addLogEntry(`😴 休息：恢复精力，健康+${Math.ceil(AM.GAIN_HEALTH*multiplier)}`);
            break;

        // --- 假期 ---
        case 'holiday_preview':
            apply('knowledge', P.HOLIDAY.PREVIEW_GAIN);
            apply('health', -AM.HEALTH_COST);
            player.nextSemesterStudyBuff += Math.ceil(P.HOLIDAY.PREVIEW_EFFORT * multiplier);
            UI.addLogEntry(`📚 预习：下学期投入储备+${Math.ceil(P.HOLIDAY.PREVIEW_EFFORT * multiplier)}`);
            break;
        case 'holiday_practice':
            apply('knowledge', P.HOLIDAY.PRACTICE_GAIN);
            apply('skill', P.HOLIDAY.PRACTICE_GAIN);
            apply('health', -AM.HEALTH_COST);
            UI.addLogEntry("🚩 社会实践：增长见识");
            break;
        case 'holiday_rest':
            apply('health', P.HOLIDAY.REST_HEALTH);
            UI.addLogEntry("🏖️ 假期休息：状态回满");
            break;
        case 'holiday_travel':
            apply('social', P.HOLIDAY.TRAVEL_SOCIAL);
            apply('health', P.HOLIDAY.TRAVEL_HEALTH);
            UI.addLogEntry("✈️ 旅行：身心愉悦");
            break;

        // --- 大四 ---
        case 'thesis':
            let progress = Math.ceil(P.SENIOR.THESIS_PROGRESS * multiplier);
            player.thesis += progress;
            UI.addLogEntry(`📝 毕设进度 +${progress}%`);
            checkThesis();
            break;
        case 'job_hunt':
            apply('social', P.SENIOR.JOB_GAIN);
            apply('skill', P.SENIOR.JOB_GAIN);
            apply('health', -P.SENIOR.JOB_HEALTH);
            UI.addLogEntry("👔 求职面试");
            break;
    }

    // 阶段流转
    if (player.phase === 'major') player.phase = 'minor';
    else if (player.phase === 'minor') player.phase = 'done';

    UI.updateAll();
    checkAchievements();
}

export function handleInternLoop() {
    if(!hasEnergy(P.INTERN.COST)) return;
    safeAdd('energy', -P.INTERN.COST, true);
    safeAdd('skill', P.INTERN.GAIN_SKILL);
    safeAdd('social', P.INTERN.GAIN_SOCIAL);
    safeAdd('money', P.INTERN.MONEY, true);
    safeAdd('health', -P.INTERN.HEALTH_COST);

    // 实习锁定主要行动，直接进入次要阶段
    player.phase = 'minor';

    UI.updateAll();
    UI.addLogEntry(`💼 实习中：技能+${P.INTERN.GAIN_SKILL}，社交+${P.INTERN.GAIN_SOCIAL}，金钱+${P.INTERN.MONEY}`);
}

function doThesis(multiplier) {
    // 兼容旧代码，防止调用报错，虽然逻辑已移至 executeAction
}

function checkThesis() {
    if (player.thesis >= 100 && player.thesis < 120) UI.showMessageModal("毕设", "论文初稿完成！");
    if (player.thesis >= 120 && player.thesis < 150) UI.showMessageModal("毕设", "论文达到【良好】标准！");
    if (player.thesis >= 150) UI.showMessageModal("毕设", "论文达到【优秀】标准！");
}