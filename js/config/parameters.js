// js/config/parameters.js
export const GAME_PARAMS = {
    // --- 属性限制 ---
    MIN_STAT: 50,
    MAX_STAT: 100,

    // --- 开局数值 ---
    BASE_STATS: {
        knowledge: 60,
        skill: 60,
        social: 60,
        health: 90 // 特殊设定
    },
    RANDOM_POINTS: 10, // 开局随机分配点数

    // --- 学部加成 ---
    FACULTY_BUFFS: {
        'science': { knowledge: 5 },
        'social': { social: 5 },
        'humanities': { knowledge: 3, social: 2 },
        'engineering': { skill: 5 }, // 对应工学部
        'information': { skill: 5 },
        'ag_life_env': { health: 5 }
    },

    // --- 资源上限 ---
    MAX_ENERGY: 100,

    // --- 行动消耗与收益 ---
    // 主要行动
    ACTION_MAJOR: {
        COST: 30, // 学习/实习消耗
        COST_LOW: 20, // 兼职/社交/健身消耗
        RECOVER: 40, // 休息恢复
        GAIN_STAT: 2, // 学习加学识
        GAIN_SOCIAL: 4, // 社交加社交
        GAIN_HEALTH: 8, // 健身加健康
        EFFORT: 20,   // 学习投入
        HEALTH_COST: 4,
        MONEY: 1000
    },
    // 次要行动 (主要的一半)
    ACTION_MINOR: {
        COST_LOW: 10,
        COST_HIGH: 15,
        RECOVER: 20,
        GAIN_STAT: 1,
        GAIN_SOCIAL: 2,
        GAIN_HEALTH: 4,
        EFFORT: 10,
        HEALTH_COST: 2,
        MONEY: 500
    },
    // 实习 (特殊主要)
    INTERN: {
        COST: 30,
        GAIN_SKILL: 4,
        GAIN_SOCIAL: 2,
        MONEY: 1500,
        HEALTH_COST: 5,
        LOCK_MONTHS: 3
    },
    // 假期特殊
    HOLIDAY: {
        PREVIEW_COST: 30,
        PREVIEW_GAIN: 2,
        PREVIEW_EFFORT: 20,
        PRACTICE_COST: 30,
        PRACTICE_GAIN: 2, // 学识&技能
        REST_RECOVER: 50,
        REST_HEALTH: 6,
        TRAVEL_COST: 20,
        TRAVEL_SOCIAL: 4,
        TRAVEL_HEALTH: 4
    },
    // 大四特殊
    SENIOR: {
        THESIS_COST: 30,
        THESIS_PROGRESS: 30,
        JOB_COST: 20,
        JOB_GAIN: 2, // 社交&技能
        JOB_HEALTH: 4
    },

    // --- GPA 计算 ---
    GPA: {
        BASE: 2.4,
        MAX: 5.0,
        LOG_FACTOR: 1.3, // log前面的系数
        KNOWLEDGE_FACTOR: 0.01, // 学识影响系数
        HEALTH_PENALTY_80: 0.1,
        HEALTH_PENALTY_70: 0.1 // 累计
    },

    // --- 保研线 ---
    BAOYAN_SCORE: {
        'humanities': 4.5,
        'social': 4.4,
        'science': 4.4,
        'engineering': 4.2,
        'information': 4.3,
        'ag_life_env': 4.2
    },

    // --- 成就奖励 ---
    ACHIEVEMENT_REWARD: 1000
};