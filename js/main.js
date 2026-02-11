// js/main.js
import { player } from './core/state.js';
import { GAME_PARAMS } from './config/parameters.js';
import { majorData, familyTypes } from './config/data.js';
import { UI } from './ui/ui.js';
import { initThemeToggle } from './ui/theme.js';
import { nextMonth } from './core/gameloop.js';
import { handleAction, handleInternLoop } from './features/actions.js';
import { SaveSystem } from './systems/save.js';
import { EventSystem } from './systems/event.js';

window.handleAction = handleAction;
window.handleInternLoop = handleInternLoop;
window.UI = UI;
window.SaveSystem = SaveSystem;
window.EventSystem = EventSystem;

function generateCreditPlan(total) {
    let plan = [];
    let remaining = total;
    for(let i=0; i<5; i++) {
        let val = 25 + Math.floor(Math.random() * 5); // 均匀分配
        plan.push(val);
        remaining -= val;
    }
    plan.push(remaining);
    player.creditPlan = plan;
}

window.selectMajor = function(key) {
    const major = majorData[key];
    if(!major) return;

    player.faculty = key;
    player.majorName = major.name;
    player.targetCredits = major.credits;

    generateCreditPlan(player.targetCredits);

    document.getElementById('start-modal').style.display = 'none';
    rollAttributes();
};

window.confirmDiversion = function(collegeName) {
    UI.completeDiversion(collegeName);
};

function rollAttributes() {
    let rand = Math.random() * 100;
    let cumulative = 0;
    let selectedFamily = familyTypes[1];
    for (let f of familyTypes) {
        cumulative += f.weight;
        if (rand <= cumulative) { selectedFamily = f; break; }
    }
    player.family = { ...selectedFamily };

    // 1. 基础值
    player.knowledge = GAME_PARAMS.BASE_STATS.knowledge;
    player.skill = GAME_PARAMS.BASE_STATS.skill;
    player.social = GAME_PARAMS.BASE_STATS.social;
    player.health = GAME_PARAMS.BASE_STATS.health;

    // 2. 学部加成
    const buffs = GAME_PARAMS.FACULTY_BUFFS[player.faculty];
    if(buffs) {
        if(buffs.knowledge) player.knowledge += buffs.knowledge;
        if(buffs.skill) player.skill += buffs.skill;
        if(buffs.social) player.social += buffs.social;
        if(buffs.health) player.health += buffs.health;
    }

    // 3. 随机10点
    const statsKeys = ['knowledge', 'skill', 'social', 'health'];
    let pointsLeft = GAME_PARAMS.RANDOM_POINTS;
    for(let i=0; i < pointsLeft; i++) {
        const key = statsKeys[Math.floor(Math.random() * statsKeys.length)];
        player[key]++;
    }

    // 渲染卡片
    UI.renderRollCard('card-study', player.knowledge, "学识", "normal");
    UI.renderRollCard('card-social', player.social, "社交", "normal");
    UI.renderRollCard('card-health', player.health, "健康", "normal");
    UI.renderRollCard('card-skill', player.skill, "技能", "normal");

    // 渲染家庭背景信息
    const fName = document.getElementById('roll-family-name');
    const fDesc = document.getElementById('roll-family-desc');
    const fMoney = document.getElementById('roll-initial-money');
    
    if(fName) fName.textContent = player.family.name;
    if(fDesc) fDesc.textContent = player.family.desc;
    if(fMoney) fMoney.textContent = `¥${player.family.allowance * 2}`;

    document.getElementById('roll-modal').style.display = 'flex';
}

function startGame() {
    document.getElementById('admission-modal').style.display = 'none';
    player.money = player.family.allowance * 2;

    UI.updateAll();

    let semIndex = 0;
    player.semesterTarget = player.creditPlan[semIndex] || 20;
    UI.showNewSemesterModal(player.semesterTarget, player.targetCredits);
    
    // 再次刷新UI，确保学分显示更新
    UI.updateAll();

    UI.addLogEntry(`🎉 开启大学生活！你进入了【${player.majorName}】。`, "positive");
    SaveSystem.autoSave();
    
    // 事件检查移至新学期弹窗关闭后触发（在 ui.js 的 showNewSemesterModal 中处理）
}

document.addEventListener('DOMContentLoaded', () => {
    // 主题（深色模式）
    initThemeToggle();

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => UI.switchTab(e.currentTarget.dataset.tab));
    });
    // 初始化标签状态，确保移动端显隐逻辑与当前页面一致
    UI.switchTab('home');

    document.getElementById('next-month').addEventListener('click', () => {
    // 检查是否毕业，防止通过点击事件绕过
    if (player.isGraduated) {
        // 已经毕业，按钮实际上应该已经变成重新开始，这里做双重保障
        // 如果用户在毕业弹窗关闭后还想操作，点击这个按钮会触发重置
        location.reload();
        return;
    }
    nextMonth();
});
    document.getElementById('btn-confirm-roll').addEventListener('click', () => {
        document.getElementById('roll-modal').style.display = 'none';
        document.getElementById('admission-modal').style.display = 'flex';
    });
    document.getElementById('btn-start-game').addEventListener('click', startGame);
    document.getElementById('btn-msg-ok').addEventListener('click', UI.closeMessageModal);
    document.getElementById('btn-confirm-no').addEventListener('click', UI.closeConfirmModal);

    const majorContainer = document.getElementById('major-options');
    if(majorContainer) {
        majorContainer.innerHTML = '';
        for(let key in majorData) {
            let m = majorData[key];
            let card = document.createElement('div');
            card.className = 'major-card';
            card.onclick = () => window.selectMajor(key);
            card.innerHTML = `
                <div class="major-icon"><i class="${m.icon}"></i></div>
                <div class="major-title">${m.name}</div>
                <div class="major-desc">${m.desc}</div>
            `;
            majorContainer.appendChild(card);
        }
    }
});