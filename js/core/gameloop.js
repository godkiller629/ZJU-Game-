// js/core/gameloop.js
import { player } from './state.js';
import { UI } from '../ui/ui.js';
import { GAME_PARAMS } from '../config/parameters.js';
import { calculateSemesterGPA, checkHealth, checkAchievements } from '../features/attributes.js';
import { SaveSystem } from '../systems/save.js';
import { handleInternLoop } from '../features/actions.js';
import { getEndingResult } from '../features/endings.js';
import { EventSystem } from '../systems/event.js';
import { canQualifyBaoyan, ensureProjectState, syncBaoyanFlow, tickProjectsForNewMonth } from '../features/projects.js';

const P = GAME_PARAMS;

export function nextMonth() {
    // 如果已经毕业，不再执行后续逻辑
    if (player.isGraduated) return;

    ensureProjectState();

    if (checkHealth()) return;
    SaveSystem.autoSave();

    // 结算
    if (player.month === 1 || player.month === 6) endSemester();

    player.month++;
    if (player.month > 12) { player.month = 1; player.year++; }

    const projectLogs = tickProjectsForNewMonth();
    logProjectUpdates(projectLogs);

    // 毕业判定
    if (player.year === 2025 && player.month === 7) {
        player.isGraduated = true; // 标记毕业状态
        // 强制刷新UI，防止时间继续变动
        UI.updateAll();
        showEnding();
        return;
    }

    // 分流
    if (player.year === 2022 && player.month === 1) UI.showDiversionModal();

    // 大四保研 (2024年9月)
    if (player.year === 2024 && player.month === 9) checkBaoyan();

    // 年级变更
    if (player.month === 9) player.grade++;

    // 行动重置
    if (player.internLock > 0) {
        player.internLock--;
        handleInternLoop(); // 自动执行实习
    } else {
        player.phase = 'major';
    }

    // 修正数值
    sanitizeStats();

    // 选课（开学月份会显示新学期弹窗，事件在弹窗关闭后触发）
    const isNewSemester = (player.month === 9 || player.month === 3) && player.year <= 2024;
    if (isNewSemester) {
        startSemester();
        // 事件检查在新学期弹窗关闭后触发（ui.js 中处理）
    }

    syncBaoyanFlow();

    UI.updateAll();
    checkAchievements();
    
    // 非开学月份：直接检查随机事件
    if (!isNewSemester) {
        EventSystem.checkEvents();
    }
}

function checkBaoyan() {
    const threshold = P.BAOYAN_SCORE[player.faculty] || 4.5;
    const researchReady = canQualifyBaoyan();
    if (player.gpa >= threshold && researchReady) {
        player.baoyanQualified = true;
        UI.showMessageModal("🎓 保研结果", `恭喜你！<br>你的GPA (${player.gpa.toFixed(2)}) 达到了本专业保研线 (${threshold})。<br><b>获得了保研资格！</b>`);
    } else if (player.gpa >= threshold && !researchReady) {
        player.baoyanQualified = false;
        UI.showMessageModal("🎓 保研结果", `你的GPA (${player.gpa.toFixed(2)}) 已达到本专业保研线 (${threshold})，但科研与项目积累不足。<br>想走保研路线，还需要更扎实的科研经历。`);
    } else {
        player.baoyanQualified = false;
        UI.showMessageModal("🎓 保研结果", `很遗憾。<br>你的GPA (${player.gpa.toFixed(2)}) 未达到本专业保研线 (${threshold})。<br>你没有获得保研资格。`);
    }

    syncBaoyanFlow();
}

function logProjectUpdates(logs) {
    logs.forEach((entry) => {
        if (entry.type === 'monthly' && entry.applied?.length) {
            const text = entry.applied.map((item) => formatProjectEffect(item.key, item.value)).join('，');
            UI.addLogEntry(`📌 ${entry.project.name} 月度积累：${text}`);
        }

        if (entry.type === 'final' && entry.result?.ok) {
            const text = entry.result.rewardSummary?.map((item) => formatProjectEffect(item.key, item.value)).join('，') || '无额外收益';
            const verb = entry.result.status === 'completed' ? '顺利完成' : '未能完成';
            const type = entry.result.status === 'completed' ? 'positive' : 'negative';
            UI.addLogEntry(`🏁 ${entry.project.name}${verb}：${text}`, type);
        }
    });
}

function formatProjectEffect(key, value) {
    const names = {
        knowledge: '学识',
        skill: '技能',
        social: '社交',
        health: '健康',
        money: '金钱',
        research: '科研分',
        postgraduate: '升学分',
        career: '就业分'
    };
    const sign = value > 0 ? '+' : '';
    return `${names[key] || key}${sign}${value}`;
}

function sanitizeStats() {
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    player.knowledge = clamp(player.knowledge, P.MIN_STAT, P.MAX_STAT);
    player.skill = clamp(player.skill, P.MIN_STAT, P.MAX_STAT);
    player.social = clamp(player.social, P.MIN_STAT, P.MAX_STAT);
    player.health = clamp(player.health, P.MIN_STAT, P.MAX_STAT);
    player.energy = clamp(player.energy, 0, P.MAX_ENERGY);
    player.money = Math.floor(player.money);
}

function startSemester() {
    // 继承假期的预习投入
    player.semesterStudyCount = player.nextSemesterStudyBuff;
    player.nextSemesterStudyBuff = 0;

    let semIndex = (player.grade - 1) * 2 + (player.month === 9 ? 0 : 1);
    if (semIndex < 6) { // 大四不选课
        player.semesterTarget = player.creditPlan[semIndex] || 20;
        if (player.semesterStudyCount > 0) {
            UI.addLogEntry(`📚 假期预习生效，初始学习投入 +${player.semesterStudyCount}`);
        }
        UI.showNewSemesterModal(player.semesterTarget, player.targetCredits);
        // 强制刷新UI，确保学分立即显示
        UI.updateAll();
    }
}

function endSemester() {
    // 大四不结算GPA
    if (player.grade >= 4) return;

    let gpa = calculateSemesterGPA();
    let credits = player.semesterTarget;

    if (player.totalCreditsEarned + credits > 0) {
        player.gpa = (player.gpa * player.totalCreditsEarned + gpa * credits) / (player.totalCreditsEarned + credits);
    } else {
        player.gpa = gpa;
    }
    player.totalCreditsEarned += credits;
    
    // 学期结束，清空当前目标
    player.semesterTarget = 0;

    UI.showSemesterReport(gpa, credits, gpa >= 4.0 ? "优秀" : "良好", player.gpa);
}

function showEnding() {
    const ending = getEndingResult(player);
    UI.showEndingModal(ending.title, ending.text);
}