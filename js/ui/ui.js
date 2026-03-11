// js/ui/ui.js
import { player } from '../core/state.js';
import { holidayActions, actions, seniorActions, collegesData, achievementList } from '../config/data.js';
import { SaveSystem } from '../systems/save.js';
import { GAME_PARAMS } from '../config/parameters.js';
import { getProjectCenterState } from '../features/projects.js';

export const UI = {
    updateAll() {
        this.updateTime();
        this.updateStats();
        this.renderSkills();
        this.updateActions();
        this.updatePhaseIndicator();
        if (document.body.dataset.activeTab === 'project') {
            this.renderProjectCenter();
        }
    },

    switchTab(tabId) {
        // 更新所有tab按钮状态（桌面顶部 + 移动端底部）
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.dataset.tab === tabId) btn.classList.add('active');
        });
        // 切换 tab-pane（stats/log 是移动端虚拟标签，没有对应 pane）
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        if (tabId !== 'stats' && tabId !== 'log') {
            const targetPane = document.getElementById(`tab-${tabId}`);
            if (targetPane) targetPane.classList.add('active');
        }
        // 记录当前标签页，供移动端 CSS 做页面级显隐
        document.body.dataset.activeTab = tabId;
        if (tabId === 'system') SaveSystem.refreshUI();
        if (tabId === 'project') this.renderProjectCenter();
    },

    renderProjectCenter() {
        const pane = document.getElementById('tab-project');
        if (!pane) return;

        const state = getProjectCenterState();
        pane.innerHTML = `
            <div class="project-center project-center-simple">
                <div class="project-header-block">
                    <h2 class="section-title project-title"><i class="fas fa-project-diagram"></i> 项目中心</h2>
                    <div class="project-subtitle">当前版本仅保留考研项目与实习记录。</div>
                </div>
                <div class="project-simple-grid">
                    ${this.renderProjectKaoyanPanel(state)}
                    ${this.renderInternshipRecordPanel(state)}
                </div>
                ${this.renderProjectHistory(state.history)}
            </div>
        `;
    },

    renderProjectKaoyanPanel(state) {
        const kaoyan = state.kaoyan || {};
        const active = kaoyan.activeProject;

        if (!active) {
            return `
                <div class="project-slot-card">
                    <div class="project-slot-title"><i class="fas fa-book-reader"></i> 考研项目</div>
                    <div class="project-empty-card">${kaoyan.blockedReason || '满足条件后可开启考研项目。'}</div>
                    <div class="project-action-row project-compact-actions">
                        <button class="project-action-btn" ${kaoyan.canStart ? `onclick="window.startProjectTemplate('kaoyan')"` : 'disabled'}>${kaoyan.canStart ? '启动考研项目' : '暂不可启动'}</button>
                    </div>
                    <div class="project-meta-text project-record-note">考研项目在每年 12 月统一结算。</div>
                </div>
            `;
        }

        const milestoneHtml = (active.milestones || []).map((milestone) => `
            <div class="project-milestone ${milestone.completed ? 'completed' : ''}">
                <span>${milestone.title}</span>
                <span>${milestone.completed ? '已完成' : `${milestone.threshold}%`}</span>
            </div>
        `).join('');

        const settleText = active.monthsToSettle > 0
            ? `距离 12 月结算还有 ${active.monthsToSettle} 个月`
            : '本月进入考研项目结算';

        return `
            <div class="project-slot-card">
                <div class="project-slot-title"><i class="fas fa-book-reader"></i> 考研项目</div>
                <div class="project-card project-active-card">
                    <div class="project-card-top">
                        <div>
                            <div class="project-card-title">${active.name}</div>
                            <div class="project-meta-text">${settleText}</div>
                        </div>
                        <span class="project-badge primary">进行中</span>
                    </div>
                    <div class="project-progress-bar"><div style="width:${Math.min(active.progress, 100)}%"></div></div>
                    <div class="project-progress-text">进度 ${Math.round(active.progress)}% · 质量 ${Math.round(active.quality)}</div>
                    <div class="project-milestone-list">${milestoneHtml}</div>
                    <div class="project-action-row project-compact-actions">
                        <button class="project-action-btn" onclick="window.advanceProjectEntry('${active.id}')">投入复习</button>
                        <button class="project-action-btn ghost" onclick="window.abandonProjectEntry('${active.id}')">放弃项目</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderInternshipRecordPanel(state) {
        const active = state.internshipActive;
        const list = (state.internshipHistory || []).map((item) => {
            const start = item.startAt ? `${item.startAt.year}年${item.startAt.month}月` : '未知';
            const end = item.finishedAt ? `${item.finishedAt.year}年${item.finishedAt.month}月` : '进行中';
            const sessions = item.sessions || 0;
            return `
                <div class="project-history-item">
                    <div>
                        <div class="project-card-title small">${start} - ${end}</div>
                        <div class="project-meta-text">实习次数 ${sessions} · 金钱+${item.moneyGained || 0}</div>
                    </div>
                    <span class="project-badge muted">实习</span>
                </div>
            `;
        }).join('');

        const activeHtml = active ? `
            <div class="project-card project-active-card">
                <div class="project-card-top">
                    <div>
                        <div class="project-card-title">当前实习进行中</div>
                        <div class="project-meta-text">剩余锁定月数 ${active.cyclesRemaining || 0} · 累计次数 ${active.sessions || 0}</div>
                    </div>
                    <span class="project-badge secondary">记录中</span>
                </div>
                <div class="project-progress-bar"><div style="width:${Math.min(active.progress || 0, 100)}%"></div></div>
                <div class="project-progress-text">累计金钱 +${active.moneyGained || 0} · 技能 +${active.skillGained || 0} · 社交 +${active.socialGained || 0}</div>
            </div>
        ` : '<div class="project-empty-card">暂无进行中的实习。请在首页行动面板选择“实习”，系统会自动记录。</div>';

        return `
            <div class="project-slot-card">
                <div class="project-slot-title"><i class="fas fa-briefcase"></i> 实习记录</div>
                ${activeHtml}
                <div class="project-subsection-title">最近实习归档</div>
                <div class="project-history-list">${list || '<div class="project-empty-card">目前还没有实习归档记录。</div>'}</div>
            </div>
        `;
    },

    renderProjectHistory(history) {
        const statusMap = {
            completed: '已完成',
            failed: '失败',
            abandoned: '已放弃'
        };

        const historyHtml = history.length > 0 ? history.map((item) => {
            const label = item.templateId === 'kaoyan'
                ? '考研项目'
                : item.templateId === 'internship_action'
                    ? '实习记录'
                    : (item.name || '项目记录');

            return `
            <div class="project-history-item">
                <div>
                    <div class="project-card-title small">${label}</div>
                    <div class="project-meta-text">${item.finishedAt ? `${item.finishedAt.year}年${item.finishedAt.month}月` : '已归档'} · ${item.name || ''}</div>
                </div>
                <span class="project-badge ${item.status === 'completed' ? 'success' : item.status === 'failed' ? 'danger' : 'muted'}">${statusMap[item.status] || item.status}</span>
            </div>
        `;
        }).join('') : '<div class="project-empty-card">还没有项目归档记录。</div>';

        return `
            <div class="project-history-card">
                <div class="project-slot-title"><i class="fas fa-box-archive"></i> 项目归档</div>
                <div class="project-history-list">${historyHtml}</div>
            </div>
        `;
    },

    renderSaveSlots() {
        const container = document.getElementById('save-slots-container');
        if (!container) return;
        let html = '';
        for (let i = 1; i <= 3; i++) {
            const info = SaveSystem.getSlotInfo(i);
            const isEmpty = !info;
            html += `
              <div class="save-slot-card ${isEmpty?'empty':''}">
                <div class="slot-header">
                  <span class="slot-title">存档 ${i}</span>
                  <span>${isEmpty ? '空' : info.dateString}</span>
                </div>
                ${isEmpty ? '' : `<div class="save-summary">${info.summary || ''}</div>`}
                <div class="slot-actions">
                  <button class="slot-btn save" onclick="SaveSystem.save(${i})">存档</button>
                  <button class="slot-btn load" onclick="SaveSystem.load(${i})">读取</button>
                  ${isEmpty ? '' : `<button class="slot-btn delete" onclick="SaveSystem.delete(${i})" title="删除">×</button>`}
                </div>
              </div>
            `;
        }
        container.innerHTML = html;
    },

    // 左侧状态栏 (进度条)
    updateStats() {
        const statsGrid = document.getElementById("stats");
        const majorBadge = document.getElementById('major-badge');
        if(majorBadge) majorBadge.textContent = player.majorName || "未分流";

        // 健康颜色逻辑
        // 需求: 正常蓝色，<80黄色，<70橙色
        // 深色模式下主色会在 CSS 里提亮，这里统一用 var(--primary-color)
        let hColor = 'var(--primary-color)';
        if (player.health < 80) hColor = '#f5a623'; // Yellow/Orange
        if (player.health < 70) hColor = '#ff5722'; // Deep Orange

        const items = [
            { key: 'knowledge', name: '学识', color: 'var(--primary-color)', icon: 'fas fa-book' },
            { key: 'skill', name: '技能', color: 'var(--primary-color)', icon: 'fas fa-tools' },
            { key: 'social', name: '社交', color: 'var(--primary-color)', icon: 'fas fa-users' },
            { key: 'health', name: '健康', color: hColor, icon: 'fas fa-heart' },
            { key: 'energy', name: '精力', color: 'var(--primary-color)', icon: 'fas fa-bolt' },
            { key: 'money', name: '金钱', color: 'var(--primary-color)', icon: 'fas fa-coins' }
        ];

        let html = '';

        // 学分/毕设显示逻辑
        if (player.grade === 4) {
            // 大四：显示毕设进度
            let thesisStatus = "";
            let color = "var(--primary-color)";
            if (player.thesis >= 150) { thesisStatus = "优秀"; color = "#ffd700"; }
            else if (player.thesis >= 120) { thesisStatus = "良好"; color = "#5cb85c"; }
            else if (player.thesis >= 100) { thesisStatus = "完成"; color = "#5cb85c"; }
            else { thesisStatus = `${player.thesis}%`; }

            html += `
            <div class="stat-item" style="border-left: 3px solid var(--border-0); margin-bottom:8px; padding:10px;">
                <div style="font-size:13px; color:var(--text-0); font-weight:bold; margin-bottom:5px;"><i class="fas fa-file-alt"></i> 毕设进度</div>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-1); margin-bottom:2px;">
                    <span>当前状态</span>
                    <span style="color:${color}; font-weight:bold;">${thesisStatus}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-1);">
                    <span>当前GPA</span>
                    <span style="color:var(--primary-color); font-weight:bold;">${player.gpa.toFixed(2)}</span>
                </div>
                <div class="stat-progress" style="background:var(--border-1); height:6px; border-radius:3px; overflow:hidden; margin-top:5px;">
                    <div style="width:${Math.min(player.thesis, 100)}%; background:${color}; height:100%;"></div>
                </div>
            </div>
            `;
        } else {
            // 非大四：显示学分进度
            html += `
            <div class="stat-item" style="border-left: 3px solid var(--border-0); margin-bottom:8px; padding:10px;">
                <div style="font-size:13px; color:var(--text-0); font-weight:bold; margin-bottom:5px;"><i class="fas fa-chart-pie"></i> 学分进度</div>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-1); margin-bottom:2px;">
                    <span>本学期目标</span>
                    <span style="color:var(--primary-color); font-weight:bold;">${player.semesterTarget > 0 ? player.semesterTarget : '假期'}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-1);">
                    <span>已修 / 总需</span>
                    <span style="color:var(--primary-color); font-weight:bold;">${player.totalCreditsEarned} / ${player.targetCredits}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-1); margin-top:2px;">
                    <span>当前GPA</span>
                    <span style="color:var(--primary-color); font-weight:bold;">${player.gpa.toFixed(2)}</span>
                </div>
            </div>
            `;
        }

        items.forEach(item => {
            const val = item.key === 'money' ? `¥${player.money}` : player[item.key];
            const max = item.key === 'energy' ? GAME_PARAMS.MAX_ENERGY : GAME_PARAMS.MAX_STAT;
            const pct = item.key === 'money' ? 0 : (player[item.key] / max) * 100;
            html += `
            <div class="stat-item" style="border-left-color: ${item.color}; margin-bottom: 8px; padding: 10px;">
                <div class="stat-header" style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <div class="stat-name"><i class="${item.icon}" style="width:20px;"></i> ${item.name}</div>
                    <div class="stat-value" style="color:${item.color}; font-weight:bold;">${val}</div>
                </div>
                ${item.key === 'money' ? '' : `
                <div class="stat-progress" style="background:#eee; height:6px; border-radius:3px; overflow:hidden;">
                    <div style="width:${pct}%; background:${item.color}; height:100%;"></div>
                </div>
                `}
            </div>`;
        });
        statsGrid.innerHTML = html;
    },

    updateActions() {
        const actionsGrid = document.querySelector(".actions-grid");
        const monthTitle = document.getElementById("action-month-type");
        const isHoliday = [2, 7, 8].includes(player.month);
        const multiplier = player.phase === 'minor' ? 0.5 : 1;

        let currentActions;
        if (player.grade === 4) {
            if (isHoliday) {
                // 大四假期：将“预习”替换为“毕设”
                currentActions = holidayActions.map(a => {
                    if (a.id === 'holiday_preview') {
                         return { id: 'thesis', name: '毕设', icon: 'fas fa-file-alt', tag: 'both', cost: GAME_PARAMS.SENIOR.THESIS_COST, desc: '【主/次】进度+30%' };
                    }
                    return a;
                });
            } else {
                currentActions = seniorActions;
            }
        } else {
            currentActions = isHoliday ? holidayActions : actions;
        }

        monthTitle.textContent = isHoliday ? "假期安排" : (player.grade === 4 ? "大四冲刺" : "本月行动");

        // 构建动态提示文案（按当前阶段主/次倍数）
        const tooltipFor = (id) => {
            const m = multiplier;
            const AM = GAME_PARAMS.ACTION_MAJOR;
            switch(id) {
                case 'study':
                    return `学识+${Math.ceil(AM.GAIN_STAT*m)}，投入+${Math.ceil(AM.EFFORT*m)}，健康-${Math.ceil(AM.HEALTH_COST*m)}`;
                case 'part_time':
                    return `社交+${Math.ceil(AM.GAIN_STAT*m)}，技能+${Math.ceil(AM.GAIN_STAT*m)}，金钱+${Math.ceil(AM.MONEY*m)}`;
                case 'social':
                    return `社交+${Math.ceil(AM.GAIN_SOCIAL*m)}，健康+${Math.ceil(AM.GAIN_HEALTH*m)}`;
                case 'fitness':
                    return `健康+${Math.ceil(AM.GAIN_HEALTH*m)}`;
                case 'rest':
                    return `精力+${Math.ceil(Math.abs(AM.RECOVER)*m)}，健康+${Math.ceil(AM.GAIN_HEALTH*m)}`;
                case 'holiday_preview':
                    return `学识+${Math.ceil(GAME_PARAMS.HOLIDAY.PREVIEW_GAIN*m)}，下学期投入+${Math.ceil(GAME_PARAMS.HOLIDAY.PREVIEW_EFFORT*m)}`;
                case 'holiday_practice':
                    return `学识+${Math.ceil(GAME_PARAMS.HOLIDAY.PRACTICE_GAIN*m)}，技能+${Math.ceil(GAME_PARAMS.HOLIDAY.PRACTICE_GAIN*m)}`;
                case 'holiday_travel':
                    return `社交+${Math.ceil(GAME_PARAMS.HOLIDAY.TRAVEL_SOCIAL*m)}，健康+${Math.ceil(GAME_PARAMS.HOLIDAY.TRAVEL_HEALTH*m)}`;
                case 'holiday_rest':
                    return `精力+${Math.ceil(Math.abs(GAME_PARAMS.HOLIDAY.REST_RECOVER)*m)}，健康+${Math.ceil(GAME_PARAMS.HOLIDAY.REST_HEALTH*m)}`;
                case 'thesis':
                    return `毕设进度+${Math.ceil(GAME_PARAMS.SENIOR.THESIS_PROGRESS*m)}%`;
                case 'job_hunt':
                    return `社交+${Math.ceil(GAME_PARAMS.SENIOR.JOB_GAIN*m)}，技能+${Math.ceil(GAME_PARAMS.SENIOR.JOB_GAIN*m)}，健康-${Math.ceil(GAME_PARAMS.SENIOR.JOB_HEALTH*m)}`;
                case 'intern':
                case 'holiday_intern':
                    return `技能+${GAME_PARAMS.INTERN.GAIN_SKILL}，社交+${GAME_PARAMS.INTERN.GAIN_SOCIAL}，金钱+${GAME_PARAMS.INTERN.MONEY}`;
                default:
                    return '';
            }
        };

        if (player.internLock > 0 && player.phase === 'major') {
            // 保持高度一致，用空的action-btn或透明元素占位，或者让提示信息占满同样的高度
            // 这里我们使用一个占满整个 grid 的提示框，并强制设置高度
            actionsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; grid-row: 1 / -1; display: flex; align-items: center; justify-content: center; height: 100%; min-height: 220px; border: 2px dashed var(--border-0); border-radius: 12px; background: var(--surface-1); color: var(--text-1); font-weight: bold;">
                    <div style="text-align: center;">
                        <i class="fas fa-briefcase" style="font-size: 32px; margin-bottom: 10px; color: var(--text-1);"></i>
                        <div>正在进行大厂实习...</div>
                        <div style="font-size: 12px; margin-top: 5px;">(本月主要行动已锁定)</div>
                    </div>
                </div>
            `;
        } else {
            actionsGrid.innerHTML = currentActions.map(action => {
                let isDisabled = false;
                if (player.phase === 'major' && action.tag === 'minor') isDisabled = true;
                if (player.phase === 'minor' && action.tag === 'major') isDisabled = true;
                if (player.phase === 'done') isDisabled = true;

                let displayCost = action.cost;
                let isRecover = action.cost < 0;
                if(isRecover) displayCost = "+" + Math.abs(displayCost);
                // 次要行动减半逻辑在 handleAction 计算，但显示上这里可以提示
                if (player.phase === 'minor' && action.tag === 'both') {
                    displayCost = Math.ceil(Math.abs(action.cost) * 0.5);
                    if(isRecover) displayCost = "+" + displayCost;
                }

                let tagClass = (action.tag === 'major' || player.phase === 'major') ? '' : 'minor';
                let tagName = action.tag === 'major' ? '主要' : (action.tag === 'minor' ? '次要' : (player.phase === 'major'?'主要':'次要'));

                return `
                <button class="action-btn tooltip ${isDisabled ? 'disabled' : ''}" onclick="window.handleAction('${action.id}')">
                    <span class="action-tag ${tagClass}">${tagName}</span>
                    <i class="${action.icon}"></i>
                    <span>${action.name}</span>
                    <div class="action-cost">${isRecover ? '恢复' : '消耗'}: ${displayCost}</div>
                    <span class="tooltip-text">${tooltipFor(action.id) || action.desc}</span>
                </button>
                `}).join('');
        }
        this.updatePhaseIndicator();
    },

    updatePhaseIndicator() {
        const pBar = document.getElementById('phase-bar');
        if(!pBar) return;
        // 移除 internLock 的隐藏逻辑，保持进度条始终显示，维持高度一致
        pBar.style.display = 'flex';
        
        const pMajor = document.getElementById('phase-major');
        const pMinor = document.getElementById('phase-minor');
        const pDone = document.getElementById('phase-done');

        pMajor.className = 'phase-step';
        pMinor.className = 'phase-step';
        pDone.className = 'phase-step';

        if (player.internLock > 0) {
            pMajor.textContent = "实习中";
            pMajor.classList.add('active'); 
        } else {
             pMajor.innerHTML = '<i class="fas fa-star"></i> 主要行动'; 
        }

        if (player.phase === 'major') pMajor.classList.add('active');
        else if (player.phase === 'minor') { pMajor.classList.add('completed'); pMinor.classList.add('active'); }
        else { pMajor.classList.add('completed'); pMinor.classList.add('completed'); pDone.classList.add('active'); }
    },

    // 渲染成就/技能列表
    renderSkills() {
        const container = document.getElementById('skills');
        if (!container) return;
        
        if (player.achievements.length === 0) {
            container.innerHTML = '<div style="color:var(--text-1); font-size:12px; text-align:center; padding:10px;">暂无成就</div>';
            return;
        }

        // 筛选已解锁的成就
        const unlocked = achievementList.filter(a => player.achievements.includes(a.id));
        
        container.innerHTML = unlocked.map(a => {
            // 定义颜色映射
            const colors = {
                'gold': { bg: '#fff9c4', iconBg: '#fff176', iconColor: '#f57f17', border: '#fbc02d' },
                'silver': { bg: '#f5f5f5', iconBg: '#e0e0e0', iconColor: '#757575', border: '#bdbdbd' },
                'bronze': { bg: '#fbe9e7', iconBg: '#ffccbc', iconColor: '#d84315', border: '#ffab91' }
            };
            // 默认银色
            const theme = colors[a.color] || colors['silver'];

            return `
            <div class="skill-item" style="display:flex; align-items:center; margin-bottom:8px; padding:8px; background:${theme.bg}; border:1px solid ${theme.border}; border-radius:8px;">
                <div class="skill-icon" style="width:32px; height:32px; background:${theme.iconBg}; color:${theme.iconColor}; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:10px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    <i class="${a.icon}" style="font-size:16px;"></i>
                </div>
                <div class="skill-info">
                    <div class="skill-name" style="font-weight:bold; font-size:13px; color:var(--text-0);">${a.name}</div>
                    <div class="skill-desc" style="font-size:11px; color:var(--text-1);">${a.desc}</div>
                </div>
            </div>
            `;
        }).join('');
    },

    // 显示成就解锁弹窗
    showAchievement(a) {
        const colors = {
            'gold': '#FFD700',
            'silver': '#C0C0C0'
        };
        const color = colors[a.color] || '#C0C0C0';
        
        // 使用普通弹窗提示
        this.showMessageModal(
            `🏆 解锁成就：${a.name}`, 
            `<div style="text-align:center;">
                <div style="font-size:48px; color:${color}; margin-bottom:15px; text-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="${a.icon}"></i></div>
                <p style="font-weight:bold; font-size:16px; margin-bottom:5px;">${a.desc}</p>
                <p style="color:var(--text-1); font-size:12px;">(已收录至右侧成就栏)</p>
             </div>`
        );
        
        // 同时更新列表
        this.renderSkills();
    },

    updateTime() {
        const gradeMap = { 1: "大一", 2: "大二", 3: "大三", 4: "大四" };
        const gradeName = gradeMap[player.grade] || "已毕业";
        document.getElementById("time").textContent = `${player.year}年${player.month}月 ${gradeName}`;
    },

    renderRollCard(id, value, desc, cls) {
        const el = document.getElementById(id);
        if(!el) return;
        el.className = `roll-card ${cls}`;
        el.querySelector('.roll-value').textContent = value;
        el.querySelector('.roll-desc').textContent = desc;
    },

    showDiversionModal() {
        const modal = document.getElementById('diversion-modal');
        const container = document.getElementById('diversion-options');
        const colleges = collegesData[player.faculty];
        if(!colleges) return;
        container.innerHTML = colleges.map(c => `
            <div class="major-card" onclick="window.confirmDiversion('${c}')">
                <div class="major-icon"><i class="fas fa-university"></i></div>
                <div class="major-title" style="font-size:16px;">${c}</div>
                <div class="major-desc" style="margin-top:5px; font-size:12px; color:var(--text-1);">点击确认选择</div>
            </div>
        `).join('');
        modal.style.display = 'flex';
    },

    completeDiversion(c) {
        player.majorName = c;
        document.getElementById('diversion-modal').style.display = 'none';
        this.updateStats();
        this.addLogEntry(`🚩 进入专业：${c}`);
    },

    showSemesterReport(semGPA, credits, desc, total) {
        this.showMessageModal("成绩单", `学期GPA: ${semGPA}<br>获得学分: ${credits}<br>总GPA: ${total.toFixed(2)}`);
    },

    addLogEntry(text, type = 'normal') {
        const logContainer = document.getElementById('log');
        if (!logContainer) return;
        
        // 限制日志条数，防止无限增长
        if (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.lastChild);
        }

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;

        entry.innerHTML = `
            <div class="log-time">${player.year}年${player.month}月 [${timeStr}]</div>
            <div class="log-content">${text}</div>
        `;
        
        // 插入到最前面
        logContainer.prepend(entry);
        // 关键修复：每次插入新日志后，强制滚动到顶部，确保第一条（最新的）可见
        logContainer.scrollTop = 0;
    },

    showEndingModal(t, c) { 
        const modal = document.getElementById('ending-modal');
        const resultEl = document.getElementById('ending-result');
        const statsEl = document.getElementById('ending-stats');
        if (!modal || !resultEl || !statsEl) {
            // 兜底：如果结局弹窗节点不存在，则使用普通提示
            this.showMessageModal(t, c);
            return;
        }

        // 标题与正文（蓝底白字的样式在 CSS 中定义）
        resultEl.innerHTML = `
            <div class="ending-title">${t}</div>
            <div class="ending-text">${c}</div>
        `;

        // 简要结算面板（保留现有信息，不影响你后续丰富）
        const baoyanTxt = player.baoyanQualified ? '是' : '否';
        const thesisTxt = (player.thesis >= 100) ? '完成' : `${player.thesis || 0}%`;
        statsEl.innerHTML = `
            <div class="ending-stat"><span>最终GPA</span><b>${player.gpa.toFixed(2)}</b></div>
            <div class="ending-stat"><span>学分</span><b>${player.totalCreditsEarned} / ${player.targetCredits}</b></div>
            <div class="ending-stat"><span>毕设</span><b>${thesisTxt}</b></div>
            <div class="ending-stat"><span>保研</span><b>${baoyanTxt}</b></div>
        `;

        modal.style.display = 'flex';

        // 修改“进入下个月”按钮为重新开始（双重保障）
        const btn = document.getElementById('next-month');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-redo"></i> 重新开始游戏';
            const newBtn = btn.cloneNode(true);
            newBtn.onclick = () => location.reload();
            btn.parentNode.replaceChild(newBtn, btn);
        }
    },
    showNewSemesterModal(targetCredits, totalCredits) {
        const modal = document.getElementById('semester-modal');
        if (!modal) return;
        
        document.getElementById('sem-target-credits').textContent = targetCredits;
        document.getElementById('sem-total-credits').textContent = totalCredits;
        
        modal.style.display = 'flex';
        
        const btn = document.getElementById('btn-semester-start');
        btn.onclick = () => {
            modal.style.display = 'none';
            // 新学期弹窗关闭后，检查并触发随机事件
            setTimeout(() => {
                if (window.EventSystem) {
                    window.EventSystem.checkEvents();
                }
            }, 300);
        };
    },
    showMessageModal(title, content) {
        document.getElementById('msg-title').textContent = title;
        document.getElementById('msg-content').innerHTML = content;
        document.getElementById('message-modal').style.display = 'flex';
    },
    closeMessageModal() { document.getElementById('message-modal').style.display = 'none'; },
    closeConfirmModal() { document.getElementById('confirm-modal').style.display = 'none'; },
    showConfirmModal(content, confirmCallback) {
        document.getElementById('confirm-content').innerHTML = content;
        document.getElementById('confirm-modal').style.display = 'flex';
        
        // 绑定确认按钮事件
        const yesBtn = document.getElementById('btn-confirm-yes');
        yesBtn.onclick = () => {
            confirmCallback();
            this.closeConfirmModal();
        };
    }
};