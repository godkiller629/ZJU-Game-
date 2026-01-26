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
    { id: 'intern', name: '实习', icon: 'fas fa-briefcase', tag: 'major', cost: P.INTERN.COST, desc: '【主要】锁定3个月，技能+4，社交+2，金钱+1500' },

    { id: 'social', name: '社交', icon: 'fas fa-users', tag: 'both', cost: P.ACTION_MAJOR.COST_LOW, desc: '【主/次】社交+4，健康+4' },
    { id: 'part_time', name: '兼职', icon: 'fas fa-store', tag: 'both', cost: P.ACTION_MAJOR.COST_LOW, desc: '【主/次】社交+2，技能+2，金钱+1000' },
    { id: 'fitness', name: '健身', icon: 'fas fa-dumbbell', tag: 'both', cost: P.ACTION_MAJOR.COST_LOW, desc: '【主/次】健康+8' },
    { id: 'rest', name: '休息', icon: 'fas fa-bed', tag: 'both', cost: -P.ACTION_MAJOR.RECOVER, desc: '【主/次】精力+40，健康+4' }
];

// 假期行动
export const holidayActions = [
    { id: 'holiday_preview', name: '预习', icon: 'fas fa-book-open', tag: 'both', cost: P.HOLIDAY.PREVIEW_COST, desc: '【主/次】学识+2，下学期投入+20' },
    { id: 'holiday_intern', name: '实习', icon: 'fas fa-briefcase', tag: 'major', cost: P.INTERN.COST, desc: '【主要】锁定3个月，高收益' },
    { id: 'holiday_practice', name: '社会实践', icon: 'fas fa-hands-helping', tag: 'both', cost: P.HOLIDAY.PRACTICE_COST, desc: '【主/次】学识+2，技能+2' },
    { id: 'holiday_travel', name: '结伴旅行', icon: 'fas fa-plane', tag: 'both', cost: P.HOLIDAY.TRAVEL_COST, desc: '【主/次】社交+4，健康+4' },
    { id: 'part_time', name: '兼职', icon: 'fas fa-store', tag: 'both', cost: P.ACTION_MAJOR.COST_LOW, desc: '【主/次】社交+2，技能+2，金钱+1000' },
    { id: 'holiday_rest', name: '好好休息', icon: 'fas fa-couch', tag: 'both', cost: -P.HOLIDAY.REST_RECOVER, desc: '【主/次】精力+50，健康+6' }
];

// 大四行动
export const seniorActions = [
    { id: 'thesis', name: '毕设', icon: 'fas fa-file-alt', tag: 'both', cost: P.SENIOR.THESIS_COST, desc: '【主/次】进度+30%' },
    { id: 'intern', name: '实习', icon: 'fas fa-briefcase', tag: 'major', cost: P.INTERN.COST, desc: '【主要】锁定3个月，技能+4，社交+2，金钱+1500' },
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