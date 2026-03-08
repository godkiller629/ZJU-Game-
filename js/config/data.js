// js/config/data.js
import { GAME_PARAMS } from './parameters.js';

const P = GAME_PARAMS;

// 学部数据
export const majorData = {
    'humanities': { name: '人文学部', credits: 155, icon: 'fas fa-book-reader', desc: '人文学部：学识+3，社交+2' },
    'social': { name: '社会科学学部', credits: 160, icon: 'fas fa-landmark', desc: '社会科学学部：社交+5' },
    'science': { name: '理学部', credits: 165, icon: 'fas fa-atom', desc: '理学部：学识+5' },
    'engineering': { name: '工学部', credits: 175, icon: 'fas fa-cogs', desc: '工学部：技能+5' },
    'information': { name: '信息学部', credits: 170, icon: 'fas fa-microchip', desc: '信息学部：技能+5' },
    'ag_life_env': { name: '农业生命环境学部', credits: 165, icon: 'fas fa-seedling', desc: '农业生命环境学部：健康+5' }
};

export const collegesData = {
    'humanities': ['哲学院', '历史学院', '文学院', '外国语学院', '传媒与国际学院', '艺术与考古学院'],
    'social': ['经济学院', '光华法学院', '教育学院', '管理学院', '公共管理学院', '社会学系', '马克思主义学院'],
    'science': ['数学科学学院', '物理学院', '化学系', '地球科学学院', '心理与行为科学系'],
    'engineering': ['机械工程学院', '材料科学与工程学院', '能源工程学院', '电气工程学院', '建筑工程学院', '化学工程与生物工程学院', '海洋学院', '航空航天学院'],
    'information': ['光电科学与工程学院', '信息与电子工程学院', '控制科学与工程学院', '计算机科学与技术学院', '软件学院', '生物医学工程与仪器科学学院', '集成电路学院'],
    'ag_life_env': ['生命科学学院', '生物系统工程与食品科学学院', '环境与资源学院', '农业与生物技术学院', '动物科学学院']
};

export const familyTypes = [
    { id: 'poor', name: '贫困', allowance: 1000, weight: 15, class: 'bad', desc: '勉强生活' },
    { id: 'ordinary', name: '普通', allowance: 1500, weight: 40, class: '', desc: '精打细算' },
    { id: 'well-off', name: '小康', allowance: 2500, weight: 30, class: 'good', desc: '生活宽裕' },
    { id: 'rich', name: '豪门', allowance: 8000, weight: 5, class: 'rare', desc: '不差钱' }
];

// 大一到大三 普通行动
export const actions = [
    { id: 'study', name: '学习', icon: 'fas fa-book', tag: 'both', cost: P.ACTION_MAJOR.COST, desc: '【主/次】学识+2，投入+20，健康-4' },
    { id: 'social', name: '社交', icon: 'fas fa-users', tag: 'both', cost: P.ACTION_MAJOR.COST_LOW, desc: '【主/次】社交+4，健康+4' },
    { id: 'part_time', name: '兼职', icon: 'fas fa-store', tag: 'both', cost: P.ACTION_MAJOR.COST_LOW, desc: '【主/次】社交+2，技能+2，金钱+1000' },
    { id: 'fitness', name: '健身', icon: 'fas fa-dumbbell', tag: 'both', cost: P.ACTION_MAJOR.COST_LOW, desc: '【主/次】健康+8' },
    { id: 'rest', name: '休息', icon: 'fas fa-bed', tag: 'both', cost: -P.ACTION_MAJOR.RECOVER, desc: '【主/次】精力+40，健康+4' }
];

// 假期行动
export const holidayActions = [
    { id: 'holiday_preview', name: '预习', icon: 'fas fa-book-open', tag: 'both', cost: P.HOLIDAY.PREVIEW_COST, desc: '【主/次】学识+2，下学期投入+20' },
    { id: 'holiday_practice', name: '社会实践', icon: 'fas fa-hands-helping', tag: 'both', cost: P.HOLIDAY.PRACTICE_COST, desc: '【主/次】学识+2，技能+2' },
    { id: 'holiday_travel', name: '结伴旅行', icon: 'fas fa-plane', tag: 'both', cost: P.HOLIDAY.TRAVEL_COST, desc: '【主/次】社交+4，健康+4' },
    { id: 'part_time', name: '兼职', icon: 'fas fa-store', tag: 'both', cost: P.ACTION_MAJOR.COST_LOW, desc: '【主/次】社交+2，技能+2，金钱+1000' },
    { id: 'holiday_rest', name: '好好休息', icon: 'fas fa-couch', tag: 'both', cost: -P.HOLIDAY.REST_RECOVER, desc: '【主/次】精力+50，健康+6' }
];

// 大四行动
export const seniorActions = [
    { id: 'thesis', name: '毕设', icon: 'fas fa-file-alt', tag: 'both', cost: P.SENIOR.THESIS_COST, desc: '【主/次】进度+30%' },
    { id: 'job_hunt', name: '求职', icon: 'fas fa-user-tie', tag: 'both', cost: P.SENIOR.JOB_COST, desc: '【主/次】社交+2，技能+2' },
    { id: 'social', name: '社交', icon: 'fas fa-users', tag: 'both', cost: P.ACTION_MAJOR.COST_LOW, desc: '【主/次】社交+4，健康+4' },
    { id: 'fitness', name: '健身', icon: 'fas fa-dumbbell', tag: 'both', cost: P.ACTION_MAJOR.COST_LOW, desc: '【主/次】健康+8' },
    { id: 'rest', name: '休息', icon: 'fas fa-bed', tag: 'both', cost: -P.ACTION_MAJOR.RECOVER, desc: '【主/次】精力+40，健康+4' }
];

// 成就 (无属性加成，只给钱)
export const achievementList = [
    { id: 'social_90', name: '社交达人', icon: 'fas fa-users', color: 'silver', desc: '社交达到90', cond: p => p.social >= 90 },
    { id: 'social_100', name: '人见人爱', icon: 'fas fa-crown', color: 'gold', desc: '社交达到100', cond: p => p.social >= 100 },
    { id: 'money_1w', name: '理财能手', icon: 'fas fa-coins', color: 'silver', desc: '金钱达到1万', cond: p => p.money >= 10000 },
    { id: 'money_2w', name: '财富之星', icon: 'fas fa-gem', color: 'gold', desc: '金钱达到2万', cond: p => p.money >= 20000 },
    { id: 'know_90', name: '学富五车', icon: 'fas fa-book', color: 'silver', desc: '学识达到90', cond: p => p.knowledge >= 90 },
    { id: 'know_100', name: '学海无涯', icon: 'fas fa-graduation-cap', color: 'gold', desc: '学识达到100', cond: p => p.knowledge >= 100 },
    { id: 'health_100', name: '健康生活', icon: 'fas fa-heartbeat', color: 'gold', desc: '健康达到100', cond: p => p.health >= 100 },
    { id: 'skill_90', name: '职场强者', icon: 'fas fa-briefcase', color: 'silver', desc: '技能达到90', cond: p => p.skill >= 90 },
    { id: 'skill_100', name: '职场王者', icon: 'fas fa-chess-king', color: 'gold', desc: '技能达到100', cond: p => p.skill >= 100 }
];

// 技能留空，因为需求只提到“成就”
export const skills = [];

export const randomEvents = [
    { message: "📚 沉迷图书馆", type: "positive", effect: (p) => { p.knowledge += 2; return "学识+2"; } },
    { message: "🤒 换季感冒", type: "negative", effect: (p) => { p.health -= 5; return "健康-5"; } },
    { message: "🤝 社团联谊", type: "positive", effect: (p) => { p.social += 3; return "社交+3"; } },
    { message: "💻 参加开源项目", type: "positive", effect: (p) => { p.skill += 3; return "技能+3"; } }
];

export const projectTemplates = {
    srtp: {
        id: 'srtp',
        kind: 'main',
        category: 'research',
        name: 'SRTP',
        icon: 'fas fa-flask',
        description: '围绕科研或工程问题进行一学期左右的系统训练，适合科研发展与保研准备。',
        duration: 5,
        season: 'term',
        repeatable: false,
        unlock: (p) => p.year > 2022 || (p.year === 2022 && p.month >= 2),
        lockReason: '需要完成专业分流后才能申报。',
        progressGain: 26,
        qualityGain: 10,
        actionCost: P.ACTION_MAJOR.COST,
        completionThreshold: 85,
        immediateEffects: { knowledge: 1, skill: 1, health: -1 },
        rewards: { knowledge: 8, skill: 6, social: 2, money: 1500 },
        routeImpact: { research: 12, postgraduate: 6, career: 0 },
        milestones: [
            { threshold: 25, title: '完成立项', rewards: { knowledge: 2 } },
            { threshold: 55, title: '中期检查通过', rewards: { skill: 2, research: 3 } },
            { threshold: 100, title: '顺利结题', rewards: { knowledge: 3, postgraduate: 2 } }
        ]
    },
    kaoyan: {
        id: 'kaoyan',
        kind: 'main',
        category: 'postgraduate',
        name: '考研准备',
        icon: 'fas fa-book-reader',
        description: '系统安排复习节奏、院校选择与模拟冲刺，是典型的长期升学项目。',
        duration: 8,
        season: 'term',
        repeatable: false,
        unlock: (p) => p.year > 2023 || (p.year === 2023 && p.month >= 9),
        lockReason: '建议从大三秋季开始系统准备考研。',
        progressGain: 24,
        qualityGain: 8,
        actionCost: P.ACTION_MAJOR.COST,
        completionThreshold: 85,
        immediateEffects: { knowledge: 2, health: -2 },
        rewards: { knowledge: 10, skill: 2, social: 1 },
        routeImpact: { research: 2, postgraduate: 16, career: 0 },
        milestones: [
            { threshold: 30, title: '完成院校与科目规划', rewards: { postgraduate: 4 } },
            { threshold: 65, title: '一轮复习成型', rewards: { knowledge: 3 } },
            { threshold: 100, title: '冲刺状态稳定', rewards: { postgraduate: 4, knowledge: 2 } }
        ]
    },
    long_internship: {
        id: 'long_internship',
        kind: 'main',
        category: 'practice',
        name: '长期实习',
        icon: 'fas fa-laptop-code',
        description: '持续数月参与企业或团队的稳定实习，适合明确走就业路线的玩家。',
        duration: 4,
        season: 'any',
        repeatable: false,
        unlock: (p) => p.year > 2023 || (p.year === 2023 && p.month >= 3),
        lockReason: '建议从大二下或更高年级开始长期实习。',
        progressGain: 28,
        qualityGain: 8,
        actionCost: P.ACTION_MAJOR.COST_LOW,
        completionThreshold: 80,
        immediateEffects: { skill: 2, social: 1, money: 800, health: -2 },
        rewards: { skill: 8, social: 5, money: 3000 },
        routeImpact: { research: 0, postgraduate: 0, career: 15 },
        milestones: [
            { threshold: 35, title: '顺利融入团队', rewards: { social: 2 } },
            { threshold: 70, title: '独立承担工作', rewards: { skill: 3, career: 4 } },
            { threshold: 100, title: '完成阶段实习', rewards: { career: 5, money: 1200 } }
        ]
    },
    job_prep: {
        id: 'job_prep',
        kind: 'main',
        category: 'career',
        name: '就业准备',
        icon: 'fas fa-user-tie',
        description: '围绕简历、投递、笔面试和选择 offer 展开的系统准备。',
        duration: 4,
        season: 'term',
        repeatable: false,
        unlock: (p) => p.grade >= 4 || p.year >= 2024,
        lockReason: '建议在大四阶段集中投入求职准备。',
        progressGain: 28,
        qualityGain: 8,
        actionCost: P.SENIOR.JOB_COST,
        completionThreshold: 80,
        immediateEffects: { social: 2, skill: 1, health: -1 },
        rewards: { skill: 5, social: 7, money: 2000 },
        routeImpact: { research: 0, postgraduate: 0, career: 18 },
        milestones: [
            { threshold: 30, title: '完成简历与投递', rewards: { career: 4 } },
            { threshold: 65, title: '通过笔面试筛选', rewards: { social: 2, skill: 2 } },
            { threshold: 100, title: '拿到满意 offer', rewards: { career: 6, money: 1500 } }
        ]
    },
    short_internship: {
        id: 'short_internship',
        kind: 'experience',
        category: 'practice',
        name: '短期实习',
        icon: 'fas fa-briefcase',
        description: '在寒暑假进行 1-2 个月的短期实习，为履历和就业做补充。',
        duration: 2,
        season: 'holiday',
        repeatable: true,
        unlock: (p) => [2, 7, 8].includes(p.month) && (p.year > 2022 || (p.year === 2022 && p.month >= 7)),
        lockReason: '短期实习通常在寒暑假开启，且至少从大一下暑假开始。',
        progressGain: 55,
        qualityGain: 10,
        actionCost: P.ACTION_MAJOR.COST_LOW,
        completionThreshold: 75,
        immediateEffects: { skill: 2, social: 1, money: 1200, health: -2 },
        rewards: { skill: 4, social: 2, money: 1800 },
        routeImpact: { research: 0, postgraduate: 0, career: 8 },
        milestones: [
            { threshold: 50, title: '完成岗位适应', rewards: { career: 2 } },
            { threshold: 100, title: '获得实习评价', rewards: { skill: 2, career: 3 } }
        ]
    },
    summer_research: {
        id: 'summer_research',
        kind: 'experience',
        category: 'research',
        name: '暑期科研',
        icon: 'fas fa-microscope',
        description: '利用暑假进入实验室或课题组，体验科研训练与成果积累。',
        duration: 2,
        season: 'summer',
        repeatable: false,
        unlock: (p) => [7, 8].includes(p.month) && (p.year > 2022 || (p.year === 2022 && p.month >= 7)),
        lockReason: '暑期科研通常在暑假阶段开放。',
        progressGain: 50,
        qualityGain: 10,
        actionCost: P.ACTION_MAJOR.COST,
        completionThreshold: 75,
        immediateEffects: { knowledge: 2, skill: 1, health: -1 },
        rewards: { knowledge: 5, skill: 3 },
        routeImpact: { research: 8, postgraduate: 4, career: 0 },
        milestones: [
            { threshold: 50, title: '完成基础训练', rewards: { research: 2 } },
            { threshold: 100, title: '提交暑期成果', rewards: { knowledge: 2, postgraduate: 2 } }
        ]
    },
    enterprise_visit: {
        id: 'enterprise_visit',
        kind: 'experience',
        category: 'career',
        name: '企业体验',
        icon: 'fas fa-building',
        description: '短期进入企业观察工作环境与业务流程，是轻量化的职业探索经历。',
        duration: 1,
        season: 'any',
        repeatable: true,
        unlock: (p) => p.year > 2022 || (p.year === 2022 && p.month >= 2),
        lockReason: '分流后才能有针对性地参与企业体验。',
        progressGain: 100,
        qualityGain: 6,
        actionCost: P.ACTION_MAJOR.COST_LOW,
        completionThreshold: 70,
        immediateEffects: { social: 1, skill: 1, money: 300 },
        rewards: { social: 3, skill: 2 },
        routeImpact: { research: 0, postgraduate: 0, career: 4 },
        milestones: [
            { threshold: 100, title: '完成职业体验', rewards: { career: 2 } }
        ]
    }
};

export const mentorData = {
    humanities: [
        { id: 'hum_1', name: '林老师', focus: 'research', title: '文史方向导师', note: '重视写作与阅读训练。' },
        { id: 'hum_2', name: '周老师', focus: 'postgraduate', title: '比较文学导师', note: '偏好稳定的科研投入记录。' }
    ],
    social: [
        { id: 'soc_1', name: '陈老师', focus: 'research', title: '经管方向导师', note: '偏好有研究项目和数据能力的学生。' },
        { id: 'soc_2', name: '吴老师', focus: 'postgraduate', title: '法学方向导师', note: '看重成绩与沟通表达。' }
    ],
    science: [
        { id: 'sci_1', name: '许老师', focus: 'research', title: '基础科学导师', note: '更青睐有实验室经历的学生。' },
        { id: 'sci_2', name: '赵老师', focus: 'postgraduate', title: '理学方向导师', note: '看重连续科研投入。' }
    ],
    engineering: [
        { id: 'eng_1', name: '沈老师', focus: 'research', title: '工学科研导师', note: '喜欢项目经验扎实的学生。' },
        { id: 'eng_2', name: '韩老师', focus: 'career', title: '工程实践导师', note: '关注工程能力和实践经历。' }
    ],
    information: [
        { id: 'info_1', name: '何老师', focus: 'research', title: '信息方向导师', note: '更看重算法与项目经历。' },
        { id: 'info_2', name: '李老师', focus: 'postgraduate', title: '计算方向导师', note: '偏好高 GPA 和科研分的学生。' }
    ],
    ag_life_env: [
        { id: 'ag_1', name: '郑老师', focus: 'research', title: '生命环境导师', note: '重视实验记录和科研耐心。' },
        { id: 'ag_2', name: '蒋老师', focus: 'postgraduate', title: '农生方向导师', note: '看重长期稳定投入。' }
    ]
};