import { player } from '../core/state.js';
import { GAME_PARAMS } from '../config/parameters.js';
import { projectTemplates, mentorData } from '../config/data.js';

const P = GAME_PARAMS.PROJECTS;
const INTERN = GAME_PARAMS.INTERN;

const KAOYAN_TEMPLATE_ID = 'kaoyan';
const INTERNSHIP_RECORD_TEMPLATE_ID = 'internship_action';

function clampStat(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function currentDate() {
    return { year: player.year, month: player.month };
}

function getTemplate(templateId) {
    return projectTemplates[templateId] || null;
}

function getKaoyanTemplate() {
    return getTemplate(KAOYAN_TEMPLATE_ID);
}

function getPhaseMultiplier(kind) {
    if (player.phase === 'done') return 0;
    if (player.phase === 'major') return 1;
    return kind === 'experience' ? P.EXPERIENCE_MINOR_FACTOR : P.MAIN_MINOR_FACTOR;
}

function consumeActionSlot(kind, cost) {
    const multiplier = getPhaseMultiplier(kind);
    if (multiplier <= 0) {
        return { ok: false, message: '本月行动已经结束，请进入下个月。' };
    }

    const finalCost = Math.ceil(cost * multiplier);
    if (player.energy < finalCost) {
        return { ok: false, message: '精力不足，无法投入当前项目。' };
    }

    player.energy = Math.max(0, player.energy - finalCost);
    player.phase = player.phase === 'major' ? 'minor' : 'done';
    return { ok: true, multiplier, finalCost };
}

function applyEffects(effects = {}, multiplier = 1) {
    const summary = [];

    Object.entries(effects).forEach(([key, value]) => {
        const delta = Math.ceil(value * multiplier);
        if (delta === 0) return;

        if (key in player.routeScores) {
            player.routeScores[key] = Math.max(0, player.routeScores[key] + delta);
        } else if (key === 'money') {
            player.money = Math.max(0, Math.floor(player.money + delta));
        } else if (key in player) {
            if (['knowledge', 'skill', 'social', 'health'].includes(key)) {
                player[key] = clampStat(player[key] + delta, GAME_PARAMS.MIN_STAT, GAME_PARAMS.MAX_STAT);
            } else if (key === 'energy') {
                player.energy = clampStat(player.energy + delta, 0, GAME_PARAMS.MAX_ENERGY);
            } else {
                player[key] += delta;
            }
        }

        summary.push({ key, value: delta });
    });

    return summary;
}

function computeRouteFocus() {
    const entries = Object.entries(player.routeScores || { research: 0, postgraduate: 0, career: 0 });
    entries.sort((a, b) => b[1] - a[1]);
    const [topKey, topValue] = entries[0];
    player.routeFocus = topValue > 0 ? topKey : 'balanced';
    return player.routeFocus;
}

function getProjectById(projectId) {
    return player.projects.find((project) => project.id === projectId) || null;
}

function getActiveKaoyanProject() {
    return player.projects.find((project) => project.templateId === KAOYAN_TEMPLATE_ID && project.status === 'active') || null;
}

function getActiveInternshipRecord() {
    return player.projects.find((project) => project.templateId === INTERNSHIP_RECORD_TEMPLATE_ID && project.status === 'active') || null;
}

function syncActiveIds() {
    const activeKaoyan = getActiveKaoyanProject();
    const activeIntern = getActiveInternshipRecord();

    player.activeMainProjectId = activeKaoyan ? activeKaoyan.id : null;
    player.activeExperienceId = activeIntern ? activeIntern.id : null;

    if (player.selectedProjectId && !getProjectById(player.selectedProjectId)) {
        player.selectedProjectId = activeKaoyan ? activeKaoyan.id : activeIntern ? activeIntern.id : null;
    }
}

function archiveProject(project, status) {
    const archived = clone(project);
    archived.status = status;
    archived.finishedAt = currentDate();
    player.projectHistory.unshift(archived);
    player.projects = player.projects.filter((item) => item.id !== project.id);
    syncActiveIds();
    return archived;
}

function getMonthsToDecember() {
    return Math.max(0, 12 - player.month);
}

function getKaoyanAvailability() {
    const template = getKaoyanTemplate();
    if (!template) {
        return { canStart: false, blockedReason: '考研模板缺失。' };
    }

    const active = getActiveKaoyanProject();
    const completed = player.projectHistory.some((item) => item.templateId === KAOYAN_TEMPLATE_ID && item.status === 'completed');

    let blockedReason = '';
    const unlocked = !!template.unlock(player);

    if (!unlocked) blockedReason = template.lockReason;
    else if (active) blockedReason = '当前已有进行中的考研项目。';
    else if (completed && !template.repeatable) blockedReason = '本局已完成考研项目。';

    return {
        canStart: unlocked && !active && !(completed && !template.repeatable),
        blockedReason
    };
}

function makeKaoyanMilestones(template) {
    return (template.milestones || []).map((milestone, index) => ({
        id: `${template.id}_milestone_${index + 1}`,
        title: milestone.title,
        threshold: milestone.threshold,
        rewards: clone(milestone.rewards),
        completed: false,
        completedAt: null
    }));
}

function settleMilestones(project) {
    const completed = [];
    project.milestones.forEach((milestone) => {
        if (!milestone.completed && project.progress >= milestone.threshold) {
            milestone.completed = true;
            milestone.completedAt = currentDate();
            const rewards = applyEffects(milestone.rewards, 1);
            completed.push({ ...milestone, rewardsApplied: rewards });
        }
    });
    return completed;
}

function finalizeKaoyan(project) {
    const template = getKaoyanTemplate();
    if (!template) {
        return { ok: false, message: '考研模板不存在。' };
    }

    const status = project.progress >= template.completionThreshold ? 'completed' : 'failed';
    let rewardSummary = [];

    if (status === 'completed') {
        rewardSummary = applyEffects(template.rewards, 1);
        applyEffects(template.routeImpact, 1);
    } else {
        rewardSummary = applyEffects({ health: -2 }, 1);
    }

    const archived = archiveProject(project, status);
    return { ok: true, status, archived, rewardSummary };
}

function finalizeInternshipRecord(record) {
    const archived = archiveProject(record, 'completed');
    return {
        ok: true,
        status: 'completed',
        archived,
        rewardSummary: [
            { key: 'money', value: record.moneyGained || 0 },
            { key: 'skill', value: record.skillGained || 0 },
            { key: 'social', value: record.socialGained || 0 },
            { key: 'health', value: -(record.healthCost || 0) }
        ].filter((item) => item.value !== 0)
    };
}

export function ensureProjectState() {
    if (!Array.isArray(player.projects)) player.projects = [];
    if (!Array.isArray(player.projectHistory)) player.projectHistory = [];
    if (player.activeMainProjectId === undefined) player.activeMainProjectId = null;
    if (player.activeExperienceId === undefined) player.activeExperienceId = null;
    if (player.selectedProjectId === undefined) player.selectedProjectId = null;

    player.routeScores = {
        research: 0,
        postgraduate: 0,
        career: 0,
        ...(player.routeScores || {})
    };

    player.baoyanFlow = {
        qualified: false,
        unlockedAt: null,
        targetMentorId: null,
        contactStatus: 'locked',
        replyScore: 0,
        accepted: false,
        ...(player.baoyanFlow || {})
    };

    computeRouteFocus();
    syncActiveIds();
}

export function getProjectCatalog() {
    ensureProjectState();

    const template = getKaoyanTemplate();
    if (!template) return [];

    const availability = getKaoyanAvailability();
    const active = !!getActiveKaoyanProject();

    return [{
        ...template,
        active,
        canStart: availability.canStart,
        blockedReason: availability.blockedReason
    }];
}

export function createProjectInstance(templateId) {
    const template = getTemplate(templateId);
    if (!template || templateId !== KAOYAN_TEMPLATE_ID) return null;

    return {
        id: `${template.id}_${Date.now()}`,
        kind: template.kind,
        templateId: template.id,
        category: template.category,
        name: template.name,
        icon: template.icon,
        status: 'active',
        phase: 'progress',
        progress: 0,
        quality: 50,
        startAt: currentDate(),
        settleMonth: template.settleMonth || 12,
        monthsToSettle: getMonthsToDecember(),
        milestones: makeKaoyanMilestones(template),
        rewards: clone(template.rewards),
        routeImpact: clone(template.routeImpact)
    };
}

export function startProject(templateId) {
    ensureProjectState();

    if (templateId !== KAOYAN_TEMPLATE_ID) {
        return { ok: false, message: '当前版本项目中心仅保留考研项目。' };
    }

    const availability = getKaoyanAvailability();
    if (!availability.canStart) {
        return { ok: false, message: availability.blockedReason || '当前无法开启考研项目。' };
    }

    const project = createProjectInstance(templateId);
    if (!project) return { ok: false, message: '考研项目创建失败。' };

    player.projects.push(project);
    player.selectedProjectId = project.id;
    syncActiveIds();

    return { ok: true, project };
}

export function advanceProject(projectId) {
    ensureProjectState();

    const project = getProjectById(projectId);
    if (!project || project.status !== 'active' || project.templateId !== KAOYAN_TEMPLATE_ID) {
        return { ok: false, message: '当前项目不存在或不可推进。' };
    }

    if (player.month === (project.settleMonth || 12)) {
        return { ok: false, message: '本月是考研结算月，无法继续推进。' };
    }

    const template = getKaoyanTemplate();
    const consumeResult = consumeActionSlot('main', template.actionCost || P.MAIN_ACTION_COST);
    if (!consumeResult.ok) return consumeResult;

    const progressGain = Math.ceil((template.progressGain || 24) * consumeResult.multiplier);
    const qualityGain = Math.ceil((template.qualityGain || 8) * consumeResult.multiplier);
    const immediateEffects = applyEffects(template.immediateEffects || { knowledge: 2, health: -2 }, consumeResult.multiplier);

    project.progress = clampStat(project.progress + progressGain, 0, 120);
    project.quality = clampStat(project.quality + qualityGain, 0, 100);
    project.monthsToSettle = getMonthsToDecember();

    if (project.progress >= 85) project.phase = 'sprint';
    else if (project.progress >= 40) project.phase = 'progress';

    const milestones = settleMilestones(project);
    computeRouteFocus();

    return {
        ok: true,
        project,
        consumeResult,
        progressGain,
        qualityGain,
        immediateEffects,
        milestones,
        completion: null
    };
}

export function abandonProject(projectId) {
    ensureProjectState();

    const project = getProjectById(projectId);
    if (!project || project.templateId !== KAOYAN_TEMPLATE_ID) {
        return { ok: false, message: '项目不存在。' };
    }

    applyEffects({ health: -2, social: -1 }, 1);
    const archived = archiveProject(project, 'abandoned');
    computeRouteFocus();

    return { ok: true, archived };
}

export function startInternshipRecord() {
    ensureProjectState();

    const active = getActiveInternshipRecord();
    if (active) return active;

    const record = {
        id: `${INTERNSHIP_RECORD_TEMPLATE_ID}_${Date.now()}`,
        kind: 'record',
        templateId: INTERNSHIP_RECORD_TEMPLATE_ID,
        category: 'practice',
        name: '实习记录',
        icon: 'fas fa-briefcase',
        status: 'active',
        progress: 0,
        quality: 0,
        sessions: 0,
        cyclesRemaining: Math.max(1, player.internLock + 1),
        moneyGained: 0,
        skillGained: 0,
        socialGained: 0,
        healthCost: 0,
        startAt: currentDate()
    };

    player.projects.push(record);
    syncActiveIds();

    return record;
}

export function onInternshipActionTick() {
    ensureProjectState();

    let record = getActiveInternshipRecord();
    if (!record) {
        record = startInternshipRecord();
    }

    record.sessions += 1;
    record.progress = clampStat(record.progress + 34, 0, 100);
    record.quality = clampStat(record.quality + 30, 0, 100);
    record.cyclesRemaining = Math.max(0, (record.cyclesRemaining || 0) - 1);

    record.moneyGained += INTERN.MONEY;
    record.skillGained += INTERN.GAIN_SKILL;
    record.socialGained += INTERN.GAIN_SOCIAL;
    record.healthCost += INTERN.HEALTH_COST;

    let completion = null;
    if (record.cyclesRemaining <= 0) {
        completion = finalizeInternshipRecord(record);
    }

    syncActiveIds();
    return { record: completion ? null : record, completion };
}

export function tickProjectsForNewMonth() {
    ensureProjectState();
    const logs = [];

    // 兜底：如果因精力不足导致实习行动未执行，也要在锁定结束后归档记录。
    const internshipRecord = getActiveInternshipRecord();
    if (internshipRecord && player.internLock === 0) {
        internshipRecord.cyclesRemaining = 0;
        const result = finalizeInternshipRecord(internshipRecord);
        logs.push({ type: 'final', project: internshipRecord, result });
    }

    const kaoyanProject = getActiveKaoyanProject();
    if (kaoyanProject) {
        kaoyanProject.monthsToSettle = getMonthsToDecember();
        if (player.month === (kaoyanProject.settleMonth || 12)) {
            const result = finalizeKaoyan(kaoyanProject);
            logs.push({ type: 'final', project: kaoyanProject, result });
        }
    }

    computeRouteFocus();
    return logs;
}

export function getProjectEndingSummary() {
    ensureProjectState();

    const history = player.projectHistory || [];
    const completed = history.filter((item) => item.status === 'completed');
    const internshipCompleted = completed.filter((item) => item.templateId === INTERNSHIP_RECORD_TEMPLATE_ID).length;

    return {
        researchScore: player.routeScores.research || 0,
        postgraduateScore: player.routeScores.postgraduate || 0,
        careerScore: player.routeScores.career || 0,
        completedResearchProjects: 0,
        completedPracticeProjects: internshipCompleted,
        completedCareerProjects: internshipCompleted,
        hasCompletedKaoyan: completed.some((item) => item.templateId === KAOYAN_TEMPLATE_ID),
        mentorAccepted: !!player.baoyanFlow?.accepted,
        routeFocus: computeRouteFocus()
    };
}

export function canQualifyBaoyan() {
    const summary = getProjectEndingSummary();
    return summary.researchScore >= P.BAOYAN_RESEARCH_THRESHOLD || player.knowledge >= 88;
}

export function syncBaoyanFlow() {
    ensureProjectState();

    if (player.baoyanQualified) {
        player.baoyanFlow.qualified = true;
        if (!player.baoyanFlow.unlockedAt) {
            player.baoyanFlow.unlockedAt = currentDate();
        }
        if (player.baoyanFlow.contactStatus === 'locked') {
            player.baoyanFlow.contactStatus = 'available';
        }
    } else if (!player.baoyanFlow.unlockedAt) {
        player.baoyanFlow.qualified = false;
        player.baoyanFlow.contactStatus = 'locked';
    }
}

export function getMentorCandidates() {
    ensureProjectState();
    return mentorData[player.faculty] || [];
}

export function contactMentor() {
    return { ok: false, message: '当前版本已关闭导师联系流程。' };
}

export function followMentor() {
    return { ok: false, message: '当前版本已关闭导师联系流程。' };
}

export function getProjectCenterState() {
    ensureProjectState();

    const kaoyanAvailability = getKaoyanAvailability();
    const activeKaoyan = getActiveKaoyanProject();
    const activeInternship = getActiveInternshipRecord();

    const internshipHistory = player.projectHistory.filter((item) => item.templateId === INTERNSHIP_RECORD_TEMPLATE_ID);

    return {
        kaoyan: {
            activeProject: activeKaoyan ? clone(activeKaoyan) : null,
            canStart: kaoyanAvailability.canStart,
            blockedReason: kaoyanAvailability.blockedReason,
            settleMonth: getKaoyanTemplate()?.settleMonth || 12
        },
        internshipActive: activeInternship ? clone(activeInternship) : null,
        internshipHistory: clone(internshipHistory).slice(0, 6),
        history: clone(player.projectHistory).slice(0, 10)
    };
}
