// js/core/state.js
import { GAME_PARAMS } from '../config/parameters.js';

const P = GAME_PARAMS;

export const player = {
    // 基础信息
    year: 2021,
    month: 9,
    grade: 1,
    phase: 'major', // major -> minor -> done

    faculty: '',
    majorName: '',

    // 学业相关
    targetCredits: 160,
    credits: 0,
    totalCreditsEarned: 0,
    gpa: 0.0,
    totalWeightedPoints: 0,

    // GPA计算变量
    semesterStudyCount: 0, // 学习投入
    nextSemesterStudyBuff: 0, // 假期预习带来的下学期加成
    semesterTarget: 0,
    creditPlan: [],

    // --- 核心属性 ---
    knowledge: P.BASE_STATS.knowledge,
    skill: P.BASE_STATS.skill,
    social: P.BASE_STATS.social,
    health: P.BASE_STATS.health,

    // --- 资源 ---
    energy: 100,
    money: 2000,

    // 其他
    thesis: 0, // 论文进度
    internLock: 0,
    family: { type: 'ordinary', allowance: 1500, name: '普通' },
    unlockedSkills: [], // 暂存成就ID
    achievements: [],
    eventState: {
        triggeredEvents: [],
        lastTriggeredKey: ''
    },
    isGraduated: false, // 毕业标记（到达结算月份后锁定游戏）
    baoyanQualified: false // 是否获得保研资格（2024年9月判定）
};