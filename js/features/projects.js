import { player } from '../core/state.js';
import { GAME_PARAMS } from '../config/parameters.js';
import { projectTemplates, mentorData } from '../config/data.js';

const P = GAME_PARAMS.PROJECTS;

function clampStat(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function currentDate() {
    return { year: player.year, month: player.month };
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

function getTemplate(templateId) {
    return projectTemplates[templateId] || null;
}

function getDateIndex(dateLike) {
    return dateLike.year * 12 + dateLike.month;
}

function makeMilestones(template) {
    return template.milestones.map((milestone, index) => ({
        id: `${template.id}_milestone_${index + 1}`,
        title: milestone.title,
        threshold: milestone.threshold,
        rewards: clone(milestone.rewards),
        completed: false,
        completedAt: null
    }));
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

function getHistoryByTemplate(templateId) {
    return player.projectHistory.filter((item) => item.templateId === templateId);
}

function getActiveProjectByKind(kind) {
    return player.projects.find((project) => project.kind === kind && project.status === 'active') || null;
}

function getProjectById(projectId) {
    return player.projects.find((project) => project.id === projectId) || null;
}

function syncActiveIds() {
    const activeMain = getActiveProjectByKind('main');
    const activeExperience = getActiveProjectByKind('experience');

    player.activeMainProjectId = activeMain ? activeMain.id : null;
    player.activeExperienceId = activeExperience ? activeExperience.id : null;

    if (player.selectedProjectId && !getProjectById(player.selectedProjectId)) {
        player.selectedProjectId = activeMain ? activeMain.id : activeExperience ? activeExperience.id : null;
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

function finalizeProject(project) {
    const template = getTemplate(project.templateId);
    if (!template) {
        return { ok: false, message: '项目模板不存在。' };
    }

    const status = project.progress >= template.completionThreshold ? 'completed' : 'failed';
    let rewardSummary = [];

    if (status === 'completed') {
        rewardSummary = applyEffects(template.rewards, 1);
        applyEffects(template.routeImpact, 1);
    } else {
        rewardSummary = applyEffects({ health: -2, social: -1 }, 1);
    }

    const archived = archiveProject(project, status);
    return { ok: true, status, archived, rewardSummary };
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

function computeRouteFocus() {
    const entries = Object.entries(player.routeScores);
    entries.sort((a, b) => b[1] - a[1]);
    const [topKey, topValue] = entries[0];
    player.routeFocus = topValue > 0 ? topKey : 'balanced';
    return player.routeFocus;
}

function calculateMentorReplyScore(mentor) {
    const summary = getProjectEndingSummary();
    let score = player.gpa * 18;
    score += player.routeScores.research * 2.5;
    score += player.social * 0.25;
    score += summary.completedResearchProjects * 8;

    if (mentor && mentor.focus === 'research') score += 8;
    if (mentor && mentor.focus === 'postgraduate') score += 6;

    return Math.round(clampStat(score, 0, 100));
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
    return Object.values(projectTemplates).map((template) => {
        const existingHistory = getHistoryByTemplate(template.id);
        const activeProject = player.projects.find((project) => project.templateId === template.id);
        const slotOccupied = template.kind === 'main' ? !!getActiveProjectByKind('main') : !!getActiveProjectByKind('experience');
        const unlocked = !!template.unlock(player);
        const alreadyDone = !template.repeatable && existingHistory.some((item) => item.status === 'completed');

        let blockedReason = '';
        if (!unlocked) blockedReason = template.lockReason;
        else if (alreadyDone) blockedReason = '该项目已完成，无需重复开启。';
        else if (activeProject) blockedReason = '该项目已经在进行中。';
        else if (slotOccupied) blockedReason = template.kind === 'main' ? '已有正在推进的主项目。' : '已有正在进行的短期经历。';

        return {
            ...template,
            unlocked,
            alreadyDone,
            active: !!activeProject,
            blockedReason,
            canStart: unlocked && !alreadyDone && !activeProject && !slotOccupied
        };
    });
}

export function createProjectInstance(templateId) {
    const template = getTemplate(templateId);
    if (!template) return null;

    const now = currentDate();
    const endIndex = getDateIndex(now) + template.duration - 1;
    const endAt = {
        year: Math.floor(endIndex / 12),
        month: endIndex % 12 || 12
    };
    if (endAt.month === 12 && endIndex % 12 === 0) endAt.year -= 1;

    return {
        id: `${template.id}_${Date.now()}`,
        kind: template.kind,
        templateId: template.id,
        category: template.category,
        name: template.name,
        icon: template.icon,
        status: 'active',
        phase: 'proposal',
        progress: 0,
        quality: 50,
        monthsRemaining: template.duration,
        duration: template.duration,
        startAt: now,
        endAt,
        season: template.season,
        milestones: makeMilestones(template),
        rewards: clone(template.rewards),
        routeImpact: clone(template.routeImpact)
    };
}

export function startProject(templateId) {
    ensureProjectState();
    const catalogItem = getProjectCatalog().find((item) => item.id === templateId);
    if (!catalogItem) return { ok: false, message: '项目模板不存在。' };
    if (!catalogItem.canStart) return { ok: false, message: catalogItem.blockedReason || '当前无法启动该项目。' };

    const instance = createProjectInstance(templateId);
    if (!instance) return { ok: false, message: '项目创建失败。' };

    player.projects.push(instance);
    player.selectedProjectId = instance.id;
    syncActiveIds();
    computeRouteFocus();

    return { ok: true, project: instance };
}

export function advanceProject(projectId) {
    ensureProjectState();
    const project = getProjectById(projectId);
    if (!project || project.status !== 'active') {
        return { ok: false, message: '当前项目不存在或不可推进。' };
    }

    const template = getTemplate(project.templateId);
    if (!template) return { ok: false, message: '项目模板不存在。' };

    const consumeResult = consumeActionSlot(project.kind, template.actionCost);
    if (!consumeResult.ok) return consumeResult;

    const progressGain = Math.ceil(template.progressGain * consumeResult.multiplier);
    const qualityGain = Math.ceil(template.qualityGain * consumeResult.multiplier);
    const immediateEffects = applyEffects(template.immediateEffects, consumeResult.multiplier);

    project.progress = clampStat(project.progress + progressGain, 0, 100);
    project.quality = clampStat(project.quality + qualityGain, 0, 100);

    if (project.progress >= 85) project.phase = 'sprint';
    else if (project.progress >= 40) project.phase = 'progress';

    const milestones = settleMilestones(project);
    let completion = null;
    if (project.progress >= 100) {
        completion = finalizeProject(project);
    }

    computeRouteFocus();

    return {
        ok: true,
        project,
        consumeResult,
        progressGain,
        qualityGain,
        immediateEffects,
        milestones,
        completion
    };
}

export function abandonProject(projectId) {
    ensureProjectState();
    const project = getProjectById(projectId);
    if (!project) return { ok: false, message: '项目不存在。' };

    applyEffects({ health: -3, social: -1 }, 1);
    const archived = archiveProject(project, 'abandoned');
    computeRouteFocus();
    return { ok: true, archived };
}

export function tickProjectsForNewMonth() {
    ensureProjectState();
    const logs = [];

    [...player.projects].forEach((project) => {
        if (project.status !== 'active') return;

        project.monthsRemaining -= 1;

        const template = getTemplate(project.templateId);
        if (!template) return;

        const monthlyEffects = {};
        if (template.category === 'practice') {
            monthlyEffects.skill = 1;
            monthlyEffects.money = project.kind === 'experience' ? 600 : 500;
            monthlyEffects.health = -1;
        }
        if (template.category === 'research') {
            monthlyEffects.knowledge = 1;
        }
        const applied = applyEffects(monthlyEffects, 1);
        if (applied.length > 0) {
            logs.push({ type: 'monthly', project, applied });
        }

        if (project.monthsRemaining <= 0) {
            const result = finalizeProject(project);
            logs.push({ type: 'final', project, result });
        }
    });

    computeRouteFocus();
    return logs;
}

export function getProjectEndingSummary() {
    ensureProjectState();
    const history = player.projectHistory || [];
    const completed = history.filter((item) => item.status === 'completed');

    return {
        researchScore: player.routeScores.research || 0,
        postgraduateScore: player.routeScores.postgraduate || 0,
        careerScore: player.routeScores.career || 0,
        completedResearchProjects: completed.filter((item) => item.category === 'research').length,
        completedPracticeProjects: completed.filter((item) => item.category === 'practice').length,
        completedCareerProjects: completed.filter((item) => item.category === 'career').length,
        hasCompletedSRTP: completed.some((item) => item.templateId === 'srtp'),
        hasCompletedKaoyan: completed.some((item) => item.templateId === 'kaoyan'),
        hasLongInternship: completed.some((item) => item.templateId === 'long_internship'),
        hasShortInternship: completed.some((item) => item.templateId === 'short_internship'),
        mentorAccepted: !!player.baoyanFlow?.accepted,
        routeFocus: computeRouteFocus()
    };
}

export function canQualifyBaoyan() {
    const summary = getProjectEndingSummary();
    return summary.researchScore >= P.BAOYAN_RESEARCH_THRESHOLD || summary.hasCompletedSRTP || summary.completedResearchProjects > 0;
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

export function contactMentor(mentorId) {
    ensureProjectState();
    if (!player.baoyanQualified) {
        return { ok: false, message: '尚未获得保研资格，暂时无法联系导师。' };
    }
    if (player.baoyanFlow.contactStatus !== 'available' && player.baoyanFlow.contactStatus !== 'replied') {
        return { ok: false, message: '当前联系导师流程暂不可用。' };
    }

    const mentor = getMentorCandidates().find((item) => item.id === mentorId);
    if (!mentor) return { ok: false, message: '导师不存在。' };

    const consumeResult = consumeActionSlot('main', P.MENTOR_CONTACT_COST);
    if (!consumeResult.ok) return consumeResult;

    player.baoyanFlow.targetMentorId = mentor.id;
    player.baoyanFlow.contactStatus = 'contacted';
    player.baoyanFlow.replyScore = calculateMentorReplyScore(mentor);

    return { ok: true, mentor, consumeResult, replyScore: player.baoyanFlow.replyScore };
}

export function followMentor() {
    ensureProjectState();
    if (!player.baoyanQualified) {
        return { ok: false, message: '尚未获得保研资格。' };
    }
    if (player.baoyanFlow.contactStatus !== 'contacted' && player.baoyanFlow.contactStatus !== 'replied') {
        return { ok: false, message: '当前没有可跟进的导师联系。' };
    }

    const consumeResult = consumeActionSlot('main', P.MENTOR_FOLLOW_COST);
    if (!consumeResult.ok) return consumeResult;

    const score = player.baoyanFlow.replyScore;
    let status = 'rejected';
    let accepted = false;

    if (score >= 85) {
        status = 'accepted';
        accepted = true;
    } else if (score >= 65 && player.baoyanFlow.contactStatus === 'contacted') {
        status = 'replied';
    } else if (score >= 70 && player.baoyanFlow.contactStatus === 'replied') {
        status = 'accepted';
        accepted = true;
    }

    player.baoyanFlow.contactStatus = status;
    player.baoyanFlow.accepted = accepted;
    return { ok: true, status, accepted, consumeResult, replyScore: score };
}

export function getProjectCenterState() {
    ensureProjectState();
    const catalog = getProjectCatalog();
    const mentors = getMentorCandidates();

    return {
        routeFocus: computeRouteFocus(),
        routeScores: clone(player.routeScores),
        activeMainProject: getActiveProjectByKind('main'),
        activeExperience: getActiveProjectByKind('experience'),
        selectedProjectId: player.selectedProjectId,
        mainCatalog: catalog.filter((item) => item.kind === 'main'),
        experienceCatalog: catalog.filter((item) => item.kind === 'experience'),
        history: clone(player.projectHistory).slice(0, 8),
        baoyanFlow: clone(player.baoyanFlow),
        mentorCandidates: clone(mentors)
    };
}