// js/systems/event.js
// 随机事件系统

import { player } from '../core/state.js';
import { UI } from '../ui/ui.js';

// 可触发事件的月份（非假期学期内）
const SCHEDULE_MONTHS = [9, 10, 11, 12, 1, 3, 4, 5, 6];
// 假期月份
const HOLIDAY_MONTHS = [2, 7, 8];
// 事件类别
const EVENT_CATEGORIES = ['entertainment', 'academic', 'skill', 'social'];
// 默认年份范围（大一到大三：2021年9月 - 2024年6月）
const DEFAULT_YEAR_RANGE = [2021, 2024];
// 9月必定触发竞选班委，其他月份50%概率触发
const SEPTEMBER_LOCKED_EVENT = 'freshman_election';
const EVENT_TRIGGER_CHANCE = 0.5;

const EVENTS = [
    // ---------------- 大一 ----------------
    {
        id: 'freshman_election',
        name: '竞选班委',
        description: '新学期伊始，班级需要选举班委。你是否要参与竞选呢？',
        icon: 'fas fa-user-tie',
        category: 'social',
        months: [9],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: false,
        repeatable: true,
        options: [
            {
                id: 'participate',
                text: '参与竞选',
                cost: { energy: 10 },
                costDesc: '消耗10点精力',
                outcomes: [
                    {
                        weight: 50,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '集体建设优秀',
                                desc: '你成功当选班委，在你的带领下班级凝聚力大增！',
                                icon: 'fas fa-trophy',
                                effects: { social: 4, skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '集体建设不佳',
                                desc: '你当选了班委，但班级事务繁忙让你身心俱疲...',
                                icon: 'fas fa-tired',
                                effects: { social: -2, health: -4 },
                                logType: 'negative'
                            }
                        ]
                    },
                    {
                        weight: 50,
                        type: 'fail',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '遗憾落败',
                                desc: '虽然没有当选，但同学们记住了你真诚的态度。',
                                icon: 'fas fa-handshake',
                                effects: { social: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '大败而归',
                                desc: '竞选失利，你感到有些尴尬...',
                                icon: 'fas fa-frown',
                                effects: { social: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'skip',
                text: '不参与',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'neutral',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '旁观者清',
                                desc: '你选择专注于自己的学业，静静观察班级选举。',
                                icon: 'fas fa-book-reader',
                                effects: {},
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // ================ 大一到大三通用随机事件 ================
    {
        id: 'national_day_holiday',
        name: '国庆小长假',
        description: '国庆小长假来临，七天长假你打算怎么过？',
        icon: 'fas fa-flag',
        category: 'entertainment',
        months: [10],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: false,
        repeatable: true,
        options: [
            {
                id: 'travel_hard',
                text: '特种兵旅游',
                cost: { energy: 10, money: 1500 },
                costDesc: '消耗10点精力，1500元',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 60,
                                name: '玩得尽兴',
                                desc: '你玩得非常尽兴，虽然累但收获满满！',
                                icon: 'fas fa-smile-beam',
                                effects: { health: 2, social: 4 },
                                logType: 'positive'
                            },
                            {
                                weight: 40,
                                name: '累坏了',
                                desc: '到处都是人，累得不行...',
                                icon: 'fas fa-tired',
                                effects: { health: -2, social: 2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'travel_nearby',
                text: '杭州周边游',
                cost: { energy: 10, money: 500 },
                costDesc: '消耗10点精力，500元',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 40,
                                name: '身心放松',
                                desc: '放松身心，度过愉快的一周！',
                                icon: 'fas fa-spa',
                                effects: { health: 4 },
                                logType: 'positive'
                            },
                            {
                                weight: 60,
                                name: '人山人海',
                                desc: '全都是人，非常疲惫...',
                                icon: 'fas fa-users',
                                effects: { health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'study_library',
                text: '在图书馆卷',
                cost: { energy: 10 },
                costDesc: '消耗10点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '卷死他们',
                                desc: '卷死他们！学习效率爆棚！',
                                icon: 'fas fa-book',
                                effects: { knowledge: 4, social: -2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '学不进去',
                                desc: '完全学不进去，白白浪费假期...',
                                icon: 'fas fa-frown',
                                effects: { social: -2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'course_presentation',
        name: '课程Pre展示',
        description: '大学里的第一次全英文Presentation，小组里的其他人都看着你，等你来做这个Leader。',
        icon: 'fas fa-chalkboard-teacher',
        category: 'academic',
        months: [11],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: false,
        repeatable: true,
        options: [
            {
                id: 'make_ppt',
                text: '熬夜做精美PPT（卷王）',
                cost: { energy: 15 },
                costDesc: '消耗15点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 70,
                                name: '全场最佳',
                                desc: '全场最佳，老师印象深刻！',
                                icon: 'fas fa-trophy',
                                effects: { knowledge: 3, social: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 30,
                                name: '用力过猛',
                                desc: '被质疑形式大于内容，有点尴尬...',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { social: -2, energy: -5 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'buy_ppt',
                text: '花钱找淘宝美化',
                cost: { money: 500 },
                costDesc: '消耗500元',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '轻松混过',
                                desc: '视觉效果拉满，轻松混过！',
                                icon: 'fas fa-check-circle',
                                effects: { skill: 1, energy: 2 },
                                logType: 'positive'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'simple_ppt',
                text: '随便做个白底黑字（摆烂）',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'fail',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '场面尴尬',
                                desc: '场面尴尬，老师皱眉...',
                                icon: 'fas fa-frown',
                                effects: { social: -2, knowledge: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'cet_exam',
        name: '四六级考试',
        description: '四六级考试了，单词好像一点没背？',
        icon: 'fas fa-spell-check',
        category: 'academic',
        months: [12],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: false,
        repeatable: true,
        options: [
            {
                id: 'cram_study',
                text: '图书馆突击',
                cost: { energy: 15 },
                costDesc: '消耗15点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 70,
                                name: '临阵磨枪',
                                desc: '临阵磨枪，不快也光！',
                                icon: 'fas fa-graduation-cap',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 30,
                                name: '考试犯困',
                                desc: '熬夜复习导致考试犯困...',
                                icon: 'fas fa-bed',
                                effects: { health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'trust_luck',
                text: '车到山前必有路',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 40,
                                name: '运气很好',
                                desc: '运气很好，随便过！',
                                icon: 'fas fa-smile',
                                effects: { health: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 60,
                                name: '完全不会',
                                desc: '没有复习，完全不会...',
                                icon: 'fas fa-times-circle',
                                effects: { knowledge: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'flu_infection',
        name: '甲流来袭',
        description: '感冒肆虐，不幸感染甲流，怎么办？',
        icon: 'fas fa-virus',
        category: 'social',
        months: [1],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: false,
        repeatable: true,
        options: [
            {
                id: 'hospital',
                text: '去校医院打疫苗',
                cost: { money: 1000 },
                costDesc: '消耗1000元',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '很快痊愈',
                                desc: '积极治疗，很快痊愈！',
                                icon: 'fas fa-heart',
                                effects: {},
                                logType: 'positive'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'self_medicine',
                text: '自己购买药品',
                cost: { money: 200 },
                costDesc: '消耗200元',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 60,
                                name: '逐渐好转',
                                desc: '身体不错，逐渐好转。',
                                icon: 'fas fa-pills',
                                effects: { health: -1 },
                                logType: 'normal'
                            },
                            {
                                weight: 40,
                                name: '拖了很久',
                                desc: '拖了很久才好...',
                                icon: 'fas fa-frown',
                                effects: { health: -2, social: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'tough_it_out',
                text: '直接硬扛',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 40,
                                name: '逐渐好转',
                                desc: '身体不错，逐渐好转。',
                                icon: 'fas fa-dumbbell',
                                effects: { health: -1 },
                                logType: 'normal'
                            },
                            {
                                weight: 60,
                                name: '拖了很久',
                                desc: '拖了很久才好，太难受了...',
                                icon: 'fas fa-sad-tear',
                                effects: { health: -2, social: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // ================ 寒假随机事件 ================
    {
        id: 'highschool_reunion',
        name: '高中同学聚会',
        description: '班长组织了高中同学聚会，听说当年的班花/班草也会去？',
        icon: 'fas fa-users',
        category: 'social',
        months: [2],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: true,
        repeatable: true,
        options: [
            {
                id: 'dress_up',
                text: '精心打扮，全场焦点（装X）',
                cost: { money: 800 },
                costDesc: '消耗800元（置办行头/做发型）',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 80,
                                name: '气质折服',
                                desc: '大家都被你的气质（和名牌）折服！',
                                icon: 'fas fa-star',
                                effects: { social: 4 },
                                logType: 'positive'
                            },
                            {
                                weight: 20,
                                name: '用力过猛',
                                desc: '用力过猛，被认为是暴发户...',
                                icon: 'fas fa-money-bill-wave',
                                effects: { social: -2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'skip_reunion',
                text: '这种无效社交，不去也罢（清醒）',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '在家躺着真香',
                                desc: '省钱省心，在家躺着真香~',
                                icon: 'fas fa-couch',
                                effects: {},
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '被吐槽高冷',
                                desc: '被吐槽太高冷，人缘变差...',
                                icon: 'fas fa-snowflake',
                                effects: { social: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'low_key',
                text: '低调出席，默默吃瓜（观察）',
                cost: { money: 200 },
                costDesc: '消耗200元（AA餐费）',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '听到八卦',
                                desc: '听到了不少八卦，比如谁谁谁分手了~',
                                icon: 'fas fa-comments',
                                effects: { social: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '话不投机',
                                desc: '话不投机，白忙活一场...',
                                icon: 'fas fa-meh',
                                effects: { energy: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'relatives_interrogation',
        name: '七大姑八大姨的审问',
        description: '年夜饭桌上，亲戚们开始了灵魂拷问："有对象了吗？""绩点多少？""以后工资多少？"',
        icon: 'fas fa-question-circle',
        category: 'social',
        months: [2],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: true,
        repeatable: true,
        options: [
            {
                id: 'fight_back',
                text: '狠狠反击',
                cost: { knowledge: 2 },
                costDesc: '消耗2点学识',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 60,
                                name: '全场MVP',
                                desc: '用专业术语把亲戚绕晕，获得全场MVP！',
                                icon: 'fas fa-trophy',
                                effects: { health: 5, social: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 40,
                                name: '被识破嘲讽',
                                desc: '被亲戚识破并嘲讽...',
                                icon: 'fas fa-frown-open',
                                effects: { health: -5, social: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'red_envelope',
                text: '发红包堵嘴（破财）',
                cost: { money: 500 },
                costDesc: '消耗500元（给小辈发红包）',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '花钱消灾',
                                desc: '花钱消灾，耳根清净~',
                                icon: 'fas fa-gift',
                                effects: { social: 2 },
                                logType: 'positive'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'eat_silently',
                text: '埋头干饭，装聋作哑（忍耐）',
                cost: { health: 2 },
                costDesc: '消耗2点健康（吃撑了）',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '吃到红烧肉',
                                desc: '虽然憋屈，但吃到了好吃的红烧肉~',
                                icon: 'fas fa-drumstick-bite',
                                effects: { energy: 2 },
                                logType: 'positive'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'holiday_weight_gain',
        name: '每逢佳节胖三斤',
        description: '家里的伙食太好了，加上缺乏运动，你发现裤子有点紧。',
        icon: 'fas fa-weight',
        category: 'entertainment',
        months: [2],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: true,
        repeatable: true,
        options: [
            {
                id: 'gym',
                text: '办张寒假健身卡（自律）',
                cost: { money: 1000, energy: 10 },
                costDesc: '消耗1000元，10点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 60,
                                name: '练出线条',
                                desc: '不仅没胖，还练出了线条！',
                                icon: 'fas fa-dumbbell',
                                effects: { health: 4, social: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 40,
                                name: '洗澡卡',
                                desc: '去了两次就没去了，变成洗澡卡...',
                                icon: 'fas fa-shower',
                                effects: { money: -500 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'enjoy_food',
                text: '放飞自我，吃够本（享乐）',
                cost: { health: 4 },
                costDesc: '消耗4点健康',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '很开心',
                                desc: '虽然胖了5斤，但真的很开心啊！',
                                icon: 'fas fa-smile-beam',
                                effects: { health: 2, social: 1 },
                                logType: 'positive'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'housework',
                text: '帮忙做家务消耗热量',
                cost: { energy: 10 },
                costDesc: '消耗10点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '爸妈欣慰',
                                desc: '爸妈觉得你长大了，给了额外红包！',
                                icon: 'fas fa-home',
                                effects: { money: 500, social: 2 },
                                logType: 'positive'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'skiing_temptation',
        name: '滑雪场的诱惑',
        description: '朋友圈都在晒滑雪，你也心动了，想去体验一把"贴地飞行"。',
        icon: 'fas fa-skiing',
        category: 'entertainment',
        months: [2],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: true,
        repeatable: true,
        options: [
            {
                id: 'north_ski',
                text: '豪华北方滑雪游（高消）',
                cost: { money: 4000 },
                costDesc: '消耗4000元',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 40,
                                name: '学会换刃',
                                desc: '学会了单板换刃，酷毙了，怒发朋友圈！',
                                icon: 'fas fa-snowboarding',
                                effects: { skill: 4, health: 3, social: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 60,
                                name: '摔得七荤八素',
                                desc: '摔得七荤八素，在酒店躺了三天...',
                                icon: 'fas fa-user-injured',
                                effects: { health: -5, money: -2000 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'nearby_ski',
                text: '周边滑雪场一日游（体验）',
                cost: { money: 800 },
                costDesc: '消耗800元',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '玩得开心',
                                desc: '玩得也很开心！',
                                icon: 'fas fa-skiing',
                                effects: { skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '主要是拍照',
                                desc: '人很多，主要是去摔跤和拍照的~',
                                icon: 'fas fa-camera',
                                effects: { social: 2 },
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'game_ski',
                text: '玩滑雪大冒险手游（云滑雪）',
                cost: { energy: 2 },
                costDesc: '消耗2点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '云滑雪',
                                desc: '手指很灵活，钱包很安全~',
                                icon: 'fas fa-mobile-alt',
                                effects: {},
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // ================ 春季学期随机事件 ================
    {
        id: 'spring_sleepiness',
        name: '"春困"来袭',
        description: '杭州的三月阴雨绵绵，你每天早上都感觉被床封印了，上课总是眼皮打架。',
        icon: 'fas fa-cloud-rain',
        category: 'academic',
        months: [3],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: false,
        repeatable: true,
        options: [
            {
                id: 'coffee',
                text: '疯狂灌咖啡（氪金续命）',
                cost: { money: 500 },
                costDesc: '消耗500元',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 60,
                                name: '精神抖擞',
                                desc: '精神抖擞，听课效率提升！',
                                icon: 'fas fa-coffee',
                                effects: { energy: 5, knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 40,
                                name: '喝胖了',
                                desc: '不仅没效果，还把自己喝胖了...',
                                icon: 'fas fa-mug-hot',
                                effects: { health: -3 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'morning_run',
                text: '强行早起晨跑（自律）',
                cost: { energy: 10 },
                costDesc: '消耗10点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 60,
                                name: '身体唤醒',
                                desc: '虽然累，但身体被唤醒了！',
                                icon: 'fas fa-running',
                                effects: { health: 3, energy: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 40,
                                name: '跑完更困',
                                desc: '跑完更困了，上课睡觉...',
                                icon: 'fas fa-bed',
                                effects: { knowledge: -2, energy: -5 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'sleep_in',
                text: '顺从本能，睡到自然醒（摆烂）',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'fail',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '错过上课',
                                desc: '错过上课了...',
                                icon: 'fas fa-bed',
                                effects: { knowledge: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'tulip_exhibition',
        name: '太子湾郁金香展',
        description: '朋友圈被太子湾公园的郁金香刷屏了，室友提议周末一起去踏春拍照。',
        icon: 'fas fa-seedling',
        category: 'entertainment',
        months: [4],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: false,
        repeatable: true,
        options: [
            {
                id: 'photo_trip',
                text: '盛装出席，打卡拍照',
                cost: { money: 500, energy: 10 },
                costDesc: '消耗500元，10点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 30,
                                name: '获赞无数',
                                desc: '拍出了获赞无数的大片！',
                                icon: 'fas fa-camera-retro',
                                effects: { social: 5 },
                                logType: 'positive'
                            },
                            {
                                weight: 70,
                                name: '人比花多',
                                desc: '人比花多，只拍到了后脑勺...',
                                icon: 'fas fa-users',
                                effects: { energy: -5 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'relax_grass',
                text: '带上书本去草坪晒太阳',
                cost: { energy: 5 },
                costDesc: '消耗5点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '身心放松',
                                desc: '环境舒适，身心放松！',
                                icon: 'fas fa-sun',
                                effects: { health: 3, energy: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '小孩太吵',
                                desc: '草坪全是游客，小孩吵死了...',
                                icon: 'fas fa-volume-up',
                                effects: { health: -3, energy: -3 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'stay_dorm',
                text: '留在寝室打游戏（宅）',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '享受独处',
                                desc: '省钱省力，享受独处时光~',
                                icon: 'fas fa-gamepad',
                                effects: { social: -2 },
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'group_project_hell',
        name: '小组作业修罗场',
        description: '某门通识课的小组作业要结课了，组里有个"幽灵组员"全程失联，截止日期就在今晚。',
        icon: 'fas fa-user-slash',
        category: 'academic',
        months: [5],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: false,
        repeatable: true,
        options: [
            {
                id: 'kick_out',
                text: '踢掉他的名字',
                cost: { social: 2, energy: 5 },
                costDesc: '消耗2点社交，5点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 80,
                                name: '老师认可',
                                desc: '把他名字删掉，老师认可你的贡献！',
                                icon: 'fas fa-check',
                                effects: { knowledge: 3, skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 20,
                                name: '被指责不团结',
                                desc: '老师反而指责你不够团结...',
                                icon: 'fas fa-frown',
                                effects: { knowledge: -2, health: -3 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'carry_all',
                text: '自己默默扛下所有',
                cost: { energy: 15, health: 2 },
                costDesc: '消耗15点精力，2点健康',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '心里憋屈',
                                desc: '作业完成了，但心里很憋屈...',
                                icon: 'fas fa-tired',
                                effects: { knowledge: 2, social: 1 },
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'submit_anyway',
                text: '随便糊弄交上去',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'fail',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '全组低分',
                                desc: '全组低分飘过...',
                                icon: 'fas fa-frown',
                                effects: { knowledge: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'flea_market',
        name: '毕业跳蚤市场',
        description: '学长学姐们在文化广场摆摊卖旧书、旧电器，这不仅是交易，更是传承。',
        icon: 'fas fa-store',
        category: 'social',
        months: [6],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: false,
        repeatable: true,
        options: [
            {
                id: 'buy_notes',
                text: '淘一淘考研/专业笔记（捡漏）',
                cost: { money: 200 },
                costDesc: '消耗200元',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 80,
                                name: '学霸笔记',
                                desc: '买到了全是干货的学霸笔记！',
                                icon: 'fas fa-book',
                                effects: { knowledge: 4 },
                                logType: 'positive'
                            },
                            {
                                weight: 20,
                                name: '看不懂',
                                desc: '买回来发现看不懂...',
                                icon: 'fas fa-question',
                                effects: { money: -200 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'buy_equipment',
                text: '购买二手显示器/椅子（升级装备）',
                cost: { money: 500 },
                costDesc: '消耗500元',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '质量提升',
                                desc: '寝室生活质量直线提升！',
                                icon: 'fas fa-desktop',
                                effects: { energy: 2, health: 1 },
                                logType: 'positive'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'chat_seniors',
                text: '和学长学姐聊天',
                cost: { energy: 10 },
                costDesc: '消耗10点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '获得建议',
                                desc: '获得了宝贵的选课和就业建议！',
                                icon: 'fas fa-comments',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'final_exam_library',
        name: '期末周的图书馆',
        description: '考试周来了，图书馆早上7点门口就排起了长龙，空气中弥漫着焦虑的味道。',
        icon: 'fas fa-book-reader',
        category: 'academic',
        months: [6],
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1, 2, 3],
        isHoliday: false,
        repeatable: true,
        options: [
            {
                id: 'queue_library',
                text: '加入排队大军（卷）',
                cost: { energy: 10 },
                costDesc: '消耗10点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 70,
                                name: '效率Max',
                                desc: '抢到黄金座位，复习效率Max！',
                                icon: 'fas fa-bolt',
                                effects: { knowledge: 5, health: -1 },
                                logType: 'positive'
                            },
                            {
                                weight: 30,
                                name: '睡着了',
                                desc: '起太早，在座位上睡着了...',
                                icon: 'fas fa-bed',
                                effects: { energy: -5, knowledge: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'study_dorm',
                text: '在寝室复习（稳）',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 60,
                                name: '能看进去',
                                desc: '虽然有诱惑，但也能看进去书~',
                                icon: 'fas fa-book-open',
                                effects: { knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 40,
                                name: '被干扰',
                                desc: '被牛马室友打游戏声音干扰，心态崩了...',
                                icon: 'fas fa-gamepad',
                                effects: { knowledge: -2, social: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'all_night',
                text: '去通宵自习室刷夜（拼）',
                cost: { health: 5 },
                costDesc: '消耗5点健康',
                outcomes: [
                    {
                        weight: 100,
                        type: 'success',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '一晚复习一学期',
                                desc: '一晚上复习了一学期的内容！',
                                icon: 'fas fa-moon',
                                effects: { knowledge: 4, energy: -10 },
                                logType: 'positive'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'freshman_study_group',
        name: '学习小组',
        description: '同学们自发组建学习小组，你要不要加入一起冲刺？',
        icon: 'fas fa-people-group',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1],
        isHoliday: false,
        options: [
            {
                id: 'join',
                text: '加入小组',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '配合默契',
                                desc: '组内分工清晰，学习效率明显提升。',
                                icon: 'fas fa-check-circle',
                                effects: { knowledge: 3, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '节奏一般',
                                desc: '讨论不少，但效果略显一般。',
                                icon: 'fas fa-circle',
                                effects: { knowledge: 2, health: -1 },
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'solo',
                text: '自己学习',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '稳扎稳打',
                                desc: '你按照自己的节奏学习，收获稳定。',
                                icon: 'fas fa-book',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '效率偏低',
                                desc: '缺少交流让你走了些弯路。',
                                icon: 'fas fa-question-circle',
                                effects: { knowledge: 1 },
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'freshman_innovation_challenge',
        name: '创赛启蒙讲座',
        description: '学院邀请往届获奖团队分享创赛经验。',
        icon: 'fas fa-lightbulb',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1],
        isHoliday: false,
        majorNames: [
            '经济学院',
            '管理学院',
            '公共管理学院',
            '教育学院',
            '社会学系',
            '马克思主义学院',
            '光华法学院'
        ],
        options: [
            {
                id: 'attend_talk',
                text: '认真聆听',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '灵感迸发',
                                desc: '你开始有了自己的项目点子。',
                                icon: 'fas fa-bolt',
                                effects: { skill: 2, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '信息过载',
                                desc: '内容很多但有点消化不过来。',
                                icon: 'fas fa-brain',
                                effects: { knowledge: 1, health: -1 },
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'skip_talk',
                text: '暂不参加',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'neutral',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '观望为主',
                                desc: '你决定先熟悉课程节奏。',
                                icon: 'fas fa-eye',
                                effects: {},
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'freshman_science_competition',
        name: '学科竞赛体验营',
        description: '理学部组织竞赛体验营，鼓励新生参与。',
        icon: 'fas fa-atom',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1],
        isHoliday: false,
        majorNames: [
            '数学科学学院',
            '物理学院',
            '化学系',
            '地球科学学院',
            '心理与行为科学系'
        ],
        options: [
            {
                id: 'join_camp',
                text: '报名体验',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '基础打牢',
                                desc: '你对竞赛题型有了初步理解。',
                                icon: 'fas fa-chalkboard-teacher',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '难度偏高',
                                desc: '强度有点超出预期。',
                                icon: 'fas fa-tired',
                                effects: { knowledge: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'observe_camp',
                text: '先旁观',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '心里有数',
                                desc: '你对竞赛方向更清楚了。',
                                icon: 'fas fa-compass',
                                effects: { knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '收获有限',
                                desc: '没有深入参与，感受不强。',
                                icon: 'fas fa-minus-circle',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'freshman_club_fair',
        name: '社团招新',
        description: '社团招新季来了，校园里一片热闹。',
        icon: 'fas fa-users',
        category: 'social',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1],
        isHoliday: false,
        options: [
            {
                id: 'join_club',
                text: '加入社团',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '融入顺利',
                                desc: '你很快和社团伙伴熟络起来。',
                                icon: 'fas fa-smile',
                                effects: { social: 3, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '事务繁杂',
                                desc: '社团事务让你有些疲惫。',
                                icon: 'fas fa-meh',
                                effects: { social: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'skip_club',
                text: '暂不加入',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '专注学习',
                                desc: '你把时间放在课程上。',
                                icon: 'fas fa-book-open',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '错过热闹',
                                desc: '偶尔有点孤单。',
                                icon: 'fas fa-cloud',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'freshman_art_exhibit',
        name: '校园艺术展',
        description: '校内举办艺术展览，气氛轻松惬意。',
        icon: 'fas fa-palette',
        category: 'entertainment',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1],
        isHoliday: false,
        majorNames: [
            '文学院',
            '传媒与国际学院',
            '艺术与考古学院'
        ],
        options: [
            {
                id: 'visit',
                text: '去看看',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '心情舒畅',
                                desc: '艺术氛围让你放松不少。',
                                icon: 'fas fa-leaf',
                                effects: { health: 2, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '人太多',
                                desc: '人潮拥挤让你有点累。',
                                icon: 'fas fa-user-friends',
                                effects: { health: -1, energy: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'stay',
                text: '留在图书馆',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '学习高效',
                                desc: '安静的环境让你专注。',
                                icon: 'fas fa-book',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '略有遗憾',
                                desc: '错过了热闹的展览。',
                                icon: 'fas fa-eye-slash',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'freshman_hackathon',
        name: '新生编程马拉松',
        description: '信息相关学院联合举办编程挑战赛。',
        icon: 'fas fa-code',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1],
        isHoliday: false,
        majorNames: [
            '计算机科学与技术学院',
            '软件学院',
            '控制科学与工程学院',
            '信息与电子工程学院',
            '集成电路学院'
        ],
        options: [
            {
                id: 'join_hack',
                text: '报名参赛',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '拿到名次',
                                desc: '你的表现令人印象深刻。',
                                icon: 'fas fa-medal',
                                effects: { skill: 3, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '通宵疲惫',
                                desc: '经验有了，但体力吃不消。',
                                icon: 'fas fa-battery-quarter',
                                effects: { skill: 2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'watch_hack',
                text: '旁观学习',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '收获启发',
                                desc: '你从优秀作品中学到很多。',
                                icon: 'fas fa-lightbulb',
                                effects: { skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '兴致缺缺',
                                desc: '观赛体验一般。',
                                icon: 'fas fa-minus-circle',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'freshman_mcm_intro',
        name: '美赛宣讲',
        description: '信息学部介绍美国大学生数学建模竞赛。',
        icon: 'fas fa-chart-pie',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1],
        isHoliday: false,
        majorNames: [
            '信息与电子工程学院',
            '控制科学与工程学院',
            '计算机科学与技术学院',
            '软件学院',
            '光电科学与工程学院',
            '集成电路学院'
        ],
        options: [
            {
                id: 'join_mcm_intro',
                text: '报名宣讲',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '方向明确',
                                desc: '你明确了建模所需技能。',
                                icon: 'fas fa-bullseye',
                                effects: { skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '压力预警',
                                desc: '备赛强度让你有点紧张。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { social: -1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'skip_mcm_intro',
                text: '先观望',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'neutral',
                        subOutcomes: [
                            {
                                weight: 100,
                                name: '保留精力',
                                desc: '你把精力放在基础课程。',
                                icon: 'fas fa-book',
                                effects: {},
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'freshman_summer_practice',
        name: '暑期社会实践',
        description: '暑期实践队开始招募，体验不同的社会场景。',
        icon: 'fas fa-route',
        category: 'skill',
        months: HOLIDAY_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [1],
        isHoliday: true,
        options: [
            {
                id: 'practice',
                text: '参加实践',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '收获满满',
                                desc: '见识增长，朋友也多了。',
                                icon: 'fas fa-star',
                                effects: { skill: 2, social: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '奔波劳累',
                                desc: '四处奔走让你有点疲惫。',
                                icon: 'fas fa-shoe-prints',
                                effects: { skill: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'rest',
                text: '安心休息',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '好好充电',
                                desc: '休整之后状态回升。',
                                icon: 'fas fa-sun',
                                effects: { health: 2, energy: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '略显松懈',
                                desc: '节奏慢下来，有点懒散。',
                                icon: 'fas fa-cloud-sun',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    // ---------------- 大二 ----------------
    {
        id: 'sophomore_core_course',
        name: '核心课程挑战',
        description: '核心课程作业密集，你准备如何应对？',
        icon: 'fas fa-clipboard-list',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [2],
        isHoliday: false,
        options: [
            {
                id: 'sprint',
                text: '全力冲刺',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '成绩提升',
                                desc: '努力让你收获明显。',
                                icon: 'fas fa-chart-line',
                                effects: { knowledge: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '压力偏大',
                                desc: '高强度带来疲劳。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { knowledge: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'steady',
                text: '稳扎稳打',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '稳步推进',
                                desc: '你保持了稳定节奏。',
                                icon: 'fas fa-check',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '略感不足',
                                desc: '没有完全发挥潜力。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'sophomore_innovation_pitch',
        name: '创赛路演',
        description: '学院举办创赛路演，展示优秀项目。',
        icon: 'fas fa-podium',
        category: 'social',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [2],
        isHoliday: false,
        majorNames: [
            '经济学院',
            '管理学院',
            '公共管理学院',
            '社会学系',
            '教育学院',
            '马克思主义学院',
            '光华法学院'
        ],
        options: [
            {
                id: 'pitch_join',
                text: '上台路演',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '掌声认可',
                                desc: '你的表达打动了评委。',
                                icon: 'fas fa-thumbs-up',
                                effects: { social: 3, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '紧张失误',
                                desc: '上台紧张影响发挥。',
                                icon: 'fas fa-sweat',
                                effects: { social: -1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'pitch_watch',
                text: '观摩学习',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '思路打开',
                                desc: '你学到了项目呈现方法。',
                                icon: 'fas fa-lightbulb',
                                effects: { knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '节奏一般',
                                desc: '现场气氛有点平淡。',
                                icon: 'fas fa-meh',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'sophomore_lab_open_day',
        name: '实验室开放日',
        description: '学院举办实验室开放日，鼓励同学参与科研体验。',
        icon: 'fas fa-flask',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [2],
        isHoliday: false,
        majorNames: [
            '物理学院',
            '化学系',
            '生命科学学院',
            '生物系统工程与食品科学学院',
            '环境与资源学院'
        ],
        options: [
            {
                id: 'apply_lab',
                text: '申请助研',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '进入课题组',
                                desc: '你得到了初步科研机会。',
                                icon: 'fas fa-vial',
                                effects: { knowledge: 2, skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '方向不合',
                                desc: '尝试后发现不太适合。',
                                icon: 'fas fa-microscope',
                                effects: { knowledge: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'observe_lab',
                text: '先了解一下',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '了解方向',
                                desc: '你对科研有了更多认知。',
                                icon: 'fas fa-search',
                                effects: { knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '错过机会',
                                desc: '机会稍纵即逝。',
                                icon: 'fas fa-hourglass-end',
                                effects: { skill: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'sophomore_robotics_competition',
        name: '机器人挑战赛',
        description: '工程与信息学部联合举办机器人挑战赛。',
        icon: 'fas fa-robot',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [2],
        isHoliday: false,
        majorNames: [
            '机械工程学院',
            '电气工程学院',
            '航空航天学院',
            '信息与电子工程学院',
            '控制科学与工程学院',
            '计算机科学与技术学院',
            '软件学院',
            '集成电路学院'
        ],
        options: [
            {
                id: 'robot_join',
                text: '组队参赛',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '调试成功',
                                desc: '你们的机器人表现不错。',
                                icon: 'fas fa-cogs',
                                effects: { skill: 3, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '故障频发',
                                desc: '调试问题让你疲惫。',
                                icon: 'fas fa-wrench',
                                effects: { skill: 2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'robot_support',
                text: '支持队友',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '流程熟悉',
                                desc: '你熟悉了工程流程。',
                                icon: 'fas fa-project-diagram',
                                effects: { skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '参与感低',
                                desc: '你觉得不够投入。',
                                icon: 'fas fa-minus-circle',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'sophomore_exchange_game',
        name: '校际交流赛',
        description: '校际交流赛开赛，你愿意参与吗？',
        icon: 'fas fa-flag-checkered',
        category: 'social',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [2],
        isHoliday: false,
        options: [
            {
                id: 'join_game',
                text: '组队参赛',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '队伍默契',
                                desc: '配合顺畅，表现不错。',
                                icon: 'fas fa-users',
                                effects: { social: 3, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '节奏不合',
                                desc: '磨合期让你有些疲惫。',
                                icon: 'fas fa-tired',
                                effects: { social: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'watch_game',
                text: '旁观交流',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '收获思路',
                                desc: '比赛给你不少启发。',
                                icon: 'fas fa-lightbulb',
                                effects: { knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '存在感低',
                                desc: '你没能认识太多人。',
                                icon: 'fas fa-minus-circle',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'sophomore_music_festival',
        name: '校园音乐节',
        description: '校园音乐节来临，气氛热烈。',
        icon: 'fas fa-music',
        category: 'entertainment',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [2],
        isHoliday: false,
        options: [
            {
                id: 'attend',
                text: '去现场',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '尽兴放松',
                                desc: '情绪被音乐治愈。',
                                icon: 'fas fa-smile-beam',
                                effects: { health: 2, social: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '熬夜影响',
                                desc: '晚归有点累。',
                                icon: 'fas fa-moon',
                                effects: { health: -1, energy: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'library',
                text: '去图书馆',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '学习高效',
                                desc: '安静环境让你更专注。',
                                icon: 'fas fa-book',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '错过热闹',
                                desc: '有点可惜。',
                                icon: 'fas fa-eye-slash',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'sophomore_major_project',
        name: '专业项目实践',
        description: '学院安排项目实践，你将承担什么角色？',
        icon: 'fas fa-project-diagram',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [2],
        isHoliday: false,
        majorNames: [
            '机械工程学院',
            '电气工程学院',
            '计算机科学与技术学院',
            '软件学院',
            '信息与电子工程学院'
        ],
        options: [
            {
                id: 'lead_project',
                text: '承担核心模块',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '进展顺利',
                                desc: '你在项目中表现突出。',
                                icon: 'fas fa-award',
                                effects: { skill: 3, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '压力上升',
                                desc: '任务重让你有些疲惫。',
                                icon: 'fas fa-bolt',
                                effects: { skill: 2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'assist_project',
                text: '协助完成',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '稳步提升',
                                desc: '你稳步提升了技能。',
                                icon: 'fas fa-cog',
                                effects: { skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '贡献有限',
                                desc: '存在感不高。',
                                icon: 'fas fa-minus-circle',
                                effects: { skill: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'sophomore_field_observation',
        name: '田间观测实践',
        description: '农生环学部组织野外观测，记录生态数据。',
        icon: 'fas fa-leaf',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [2],
        isHoliday: false,
        majorNames: [
            '生命科学学院',
            '生物系统工程与食品科学学院',
            '环境与资源学院',
            '农业与生物技术学院',
            '动物科学学院'
        ],
        options: [
            {
                id: 'field_join',
                text: '参与观测',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '数据可靠',
                                desc: '你采集到高质量样本。',
                                icon: 'fas fa-check',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '条件艰苦',
                                desc: '户外工作让你有点疲惫。',
                                icon: 'fas fa-cloud-sun',
                                effects: { health: -2, knowledge: 1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'field_skip',
                text: '留在实验室',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '资料整理',
                                desc: '你整理了不少资料。',
                                icon: 'fas fa-folder-open',
                                effects: { knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '错过体验',
                                desc: '你错过了野外经历。',
                                icon: 'fas fa-minus-circle',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'sophomore_summer_intern',
        name: '暑期实习/科研',
        description: '暑期机会到来，你会如何选择？',
        icon: 'fas fa-briefcase',
        category: 'skill',
        months: HOLIDAY_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [2],
        isHoliday: true,
        options: [
            {
                id: 'short_intern',
                text: '参加短实习',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '经验+收入',
                                desc: '你收获了经验和零花钱。',
                                icon: 'fas fa-coins',
                                effects: { skill: 1, money: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '适应期',
                                desc: '适应新环境消耗不少精力。',
                                icon: 'fas fa-wind',
                                effects: { skill: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'self_study',
                text: '留校自学',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '知识积累',
                                desc: '你稳步夯实基础。',
                                icon: 'fas fa-book-open',
                                effects: { knowledge: 2, energy: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '效率一般',
                                desc: '没有达到预期节奏。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1 },
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    // ---------------- 大三 ----------------
    {
        id: 'junior_postgrad_prep',
        name: '保研/考研预热',
        description: '大三开始，需要提前规划升学路径。',
        icon: 'fas fa-graduation-cap',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        options: [
            {
                id: 'plan_now',
                text: '提前规划',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '计划清晰',
                                desc: '你的目标变得明确。',
                                icon: 'fas fa-map',
                                effects: { knowledge: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '压力增加',
                                desc: '计划带来一些焦虑。',
                                icon: 'fas fa-exclamation-circle',
                                effects: { knowledge: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'wait_more',
                text: '再观望一下',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '保持节奏',
                                desc: '你把精力投入到当前课程。',
                                icon: 'fas fa-running',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '略显被动',
                                desc: '机会准备得不够充分。',
                                icon: 'fas fa-hourglass-half',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'balanced_plan',
                text: '平衡规划',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '节奏稳定',
                                desc: '你保持学习与规划的平衡。',
                                icon: 'fas fa-balance-scale',
                                effects: { knowledge: 2, health: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '方向摇摆',
                                desc: '路线不够清晰，效率一般。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_humanities_archive',
        name: '人文档案整理',
        description: '学院安排馆藏档案整理，锻炼史料研读能力。',
        icon: 'fas fa-archive',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: [
            '哲学院',
            '历史学院',
            '文学院',
            '外国语学院',
            '传媒与国际学院',
            '艺术与考古学院'
        ],
        options: [
            {
                id: 'deep_reading',
                text: '深度阅读',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '思路清晰',
                                desc: '你对史料脉络理解更深。',
                                icon: 'fas fa-book',
                                effects: { knowledge: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '久坐疲惫',
                                desc: '长时间阅读让你有些疲劳。',
                                icon: 'fas fa-chair',
                                effects: { knowledge: 2, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'field_interview',
                text: '口述访谈',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '素材丰富',
                                desc: '你收集到一手资料。',
                                icon: 'fas fa-microphone',
                                effects: { social: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '协调困难',
                                desc: '沟通安排耗费精力。',
                                icon: 'fas fa-comments',
                                effects: { social: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'outline_plan',
                text: '论文提纲',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '结构清晰',
                                desc: '你的论文框架更加明朗。',
                                icon: 'fas fa-project-diagram',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '进度偏慢',
                                desc: '构思时间过长。',
                                icon: 'fas fa-hourglass-half',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_social_policy_lab',
        name: '社会政策实践',
        description: '社会科学学部组织政策实践课题。',
        icon: 'fas fa-landmark',
        category: 'social',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: [
            '经济学院',
            '光华法学院',
            '教育学院',
            '管理学院',
            '公共管理学院',
            '社会学系',
            '马克思主义学院'
        ],
        options: [
            {
                id: 'data_model',
                text: '数据建模',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '分析深入',
                                desc: '你对政策效果更有把握。',
                                icon: 'fas fa-chart-bar',
                                effects: { knowledge: 2, skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '强度过高',
                                desc: '高强度分析让你疲惫。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { knowledge: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'community_visit',
                text: '社区走访',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '反馈充实',
                                desc: '你收集到真实需求。',
                                icon: 'fas fa-users',
                                effects: { social: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '沟通耗时',
                                desc: '协调工作占用大量时间。',
                                icon: 'fas fa-clock',
                                effects: { social: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'seminar_focus',
                text: '政策研讨',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '观点清晰',
                                desc: '你形成了清晰的政策框架。',
                                icon: 'fas fa-lightbulb',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '讨论分散',
                                desc: '观点发散导致重点不够。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { social: -1, knowledge: 1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_science_research_project',
        name: '理学科研专项',
        description: '理学部开放科研专项，鼓励深入某一方向。',
        icon: 'fas fa-atom',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: [
            '数学科学学院',
            '物理学院',
            '化学系',
            '地球科学学院',
            '心理与行为科学系'
        ],
        options: [
            {
                id: 'lab_group',
                text: '进入实验组',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '成果稳定',
                                desc: '你掌握了实验流程。',
                                icon: 'fas fa-flask',
                                effects: { knowledge: 2, skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '反复失败',
                                desc: '实验反复让你心态波动。',
                                icon: 'fas fa-vial',
                                effects: { knowledge: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'theory_track',
                text: '理论推导',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '推导顺畅',
                                desc: '你的理论基础更扎实。',
                                icon: 'fas fa-infinity',
                                effects: { knowledge: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '思路受阻',
                                desc: '长时间推导效率不高。',
                                icon: 'fas fa-question-circle',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'competition_sprint',
                text: '竞赛冲刺',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '题感提升',
                                desc: '你对高难题更有把握。',
                                icon: 'fas fa-medal',
                                effects: { knowledge: 2, skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '过度消耗',
                                desc: '高强度让你有点疲惫。',
                                icon: 'fas fa-tired',
                                effects: { knowledge: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_engineering_capstone',
        name: '工程综合设计',
        description: '工学部进入综合设计阶段，任务细分多样。',
        icon: 'fas fa-cogs',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: [
            '机械工程学院',
            '材料科学与工程学院',
            '能源工程学院',
            '电气工程学院',
            '建筑工程学院',
            '化学工程与生物工程学院',
            '海洋学院',
            '航空航天学院'
        ],
        options: [
            {
                id: 'field_debug',
                text: '现场调试',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '进度领先',
                                desc: '你把关键节点推进了。',
                                icon: 'fas fa-wrench',
                                effects: { skill: 3, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '安全隐患',
                                desc: '高强度作业让你疲惫。',
                                icon: 'fas fa-hard-hat',
                                effects: { skill: 2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'design_model',
                text: '设计建模',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '模型完善',
                                desc: '你的设计更可靠。',
                                icon: 'fas fa-drafting-compass',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '反复修改',
                                desc: '来回修改影响效率。',
                                icon: 'fas fa-undo',
                                effects: { skill: 1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'quality_manage',
                text: '质量管理',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '流程顺畅',
                                desc: '你提升了团队协同。',
                                icon: 'fas fa-clipboard-check',
                                effects: { social: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '压力增加',
                                desc: '责任增加带来压力。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { social: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_information_security',
        name: '信息方向专项',
        description: '信息学部开放专项方向，你会选择哪条路线？',
        icon: 'fas fa-shield-alt',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: [
            '光电科学与工程学院',
            '信息与电子工程学院',
            '控制科学与工程学院',
            '计算机科学与技术学院',
            '软件学院',
            '生物医学工程与仪器科学学院',
            '集成电路学院'
        ],
        options: [
            {
                id: 'security_drill',
                text: '攻防演练',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '漏洞修复',
                                desc: '你提升了安全能力。',
                                icon: 'fas fa-bug',
                                effects: { skill: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '攻防消耗',
                                desc: '高强度演练影响状态。',
                                icon: 'fas fa-battery-quarter',
                                effects: { skill: 2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'algorithm_tune',
                text: '算法优化',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '性能提升',
                                desc: '系统效率明显提升。',
                                icon: 'fas fa-tachometer-alt',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '优化瓶颈',
                                desc: '难点卡住了进度。',
                                icon: 'fas fa-road',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'product_proto',
                text: '产品原型',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '需求明确',
                                desc: '你把需求落地成原型。',
                                icon: 'fas fa-object-group',
                                effects: { skill: 1, social: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '反复迭代',
                                desc: '修改频繁，精力消耗。',
                                icon: 'fas fa-sync',
                                effects: { skill: 1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_agri_innovation',
        name: '农生环创新实践',
        description: '农生环学部开放创新实践课题。',
        icon: 'fas fa-seedling',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: [
            '生命科学学院',
            '生物系统工程与食品科学学院',
            '环境与资源学院',
            '农业与生物技术学院',
            '动物科学学院'
        ],
        options: [
            {
                id: 'greenhouse_lab',
                text: '温室实验',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '指标稳定',
                                desc: '你掌握了实验控制要点。',
                                icon: 'fas fa-leaf',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '反复调整',
                                desc: '环境波动让你费心。',
                                icon: 'fas fa-cloud-sun',
                                effects: { knowledge: 1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'field_follow',
                text: '跟岗实践',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '手感提升',
                                desc: '你熟悉了生产流程。',
                                icon: 'fas fa-tractor',
                                effects: { skill: 2, health: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '节奏吃力',
                                desc: '体力消耗偏大。',
                                icon: 'fas fa-battery-quarter',
                                effects: { skill: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'data_archive',
                text: '数据建档',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '资料完备',
                                desc: '你整理了完整数据表。',
                                icon: 'fas fa-table',
                                effects: { knowledge: 1, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '重复繁琐',
                                desc: '整理工作有点枯燥。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_architecture_studio',
        name: '建筑设计工坊',
        description: '建筑工程学院举办设计工坊，强调方案落地。',
        icon: 'fas fa-drafting-compass',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['建筑工程学院'],
        options: [
            {
                id: 'site_survey',
                text: '场地调研',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '需求明晰',
                                desc: '你抓住了关键场地问题。',
                                icon: 'fas fa-map-marked-alt',
                                effects: { knowledge: 2, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '奔波疲惫',
                                desc: '实地走访让你有点累。',
                                icon: 'fas fa-walking',
                                effects: { knowledge: 1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'bim_model',
                text: 'BIM建模',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '模型精细',
                                desc: '你的方案更容易落地。',
                                icon: 'fas fa-cube',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '修改频繁',
                                desc: '细节调整占用时间。',
                                icon: 'fas fa-undo',
                                effects: { skill: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'concept_sketch',
                text: '概念草图',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '灵感成型',
                                desc: '你的设计表达更有说服力。',
                                icon: 'fas fa-pencil-ruler',
                                effects: { skill: 1, social: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '表达受限',
                                desc: '呈现效果不够理想。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { skill: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_ocean_expedition',
        name: '海洋科考任务',
        description: '海洋学院组织近海科考训练。',
        icon: 'fas fa-water',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['海洋学院'],
        options: [
            {
                id: 'sea_sampling',
                text: '海上取样',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '样本可靠',
                                desc: '你采集到高质量样本。',
                                icon: 'fas fa-vial',
                                effects: { knowledge: 2, skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '海况不佳',
                                desc: '恶劣天气影响进度。',
                                icon: 'fas fa-cloud-showers-heavy',
                                effects: { knowledge: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'lab_simulation',
                text: '室内模拟',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '模型成型',
                                desc: '你掌握了关键参数。',
                                icon: 'fas fa-project-diagram',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '结论偏弱',
                                desc: '数据量不足影响说服力。',
                                icon: 'fas fa-question-circle',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'data_processing',
                text: '数据处理',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '趋势清晰',
                                desc: '你梳理出关键规律。',
                                icon: 'fas fa-chart-line',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '噪声较多',
                                desc: '清洗数据耗费时间。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_materials_lab',
        name: '材料性能测试',
        description: '材料学院开展性能测试训练。',
        icon: 'fas fa-industry',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['材料科学与工程学院'],
        options: [
            {
                id: 'alloy_test',
                text: '合金测试',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '指标提升',
                                desc: '你掌握了关键性能指标。',
                                icon: 'fas fa-thermometer-half',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '样品失效',
                                desc: '测试失败需要重来。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { knowledge: 1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'micro_analysis',
                text: '微观分析',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '结构清晰',
                                desc: '你读懂了材料结构。',
                                icon: 'fas fa-search-plus',
                                effects: { knowledge: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '信号干扰',
                                desc: '图像分析有点费力。',
                                icon: 'fas fa-bug',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'paper_review',
                text: '文献综述',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '方向明确',
                                desc: '你更清楚研究方向。',
                                icon: 'fas fa-book',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '信息分散',
                                desc: '材料太多不易整合。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_optics_project',
        name: '光电系统联调',
        description: '光电学院组织系统联调项目。',
        icon: 'fas fa-lightbulb',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['光电科学与工程学院'],
        options: [
            {
                id: 'optics_experiment',
                text: '光学实验',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '对准成功',
                                desc: '你完成了关键调试。',
                                icon: 'fas fa-crosshairs',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '误差累积',
                                desc: '参数微调耗时较多。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { skill: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'signal_tuning',
                text: '信号优化',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '噪声降低',
                                desc: '你提升了系统稳定性。',
                                icon: 'fas fa-signal',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '瓶颈难解',
                                desc: '优化方向不够清晰。',
                                icon: 'fas fa-question-circle',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'spec_doc',
                text: '规范文档',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '标准清晰',
                                desc: '你把规范整理到位。',
                                icon: 'fas fa-file-alt',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '细节繁杂',
                                desc: '整理过程略显枯燥。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_biomed_device',
        name: '生医仪器开发',
        description: '生医学院推动仪器开发课题。',
        icon: 'fas fa-heartbeat',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['生物医学工程与仪器科学学院'],
        options: [
            {
                id: 'device_proto',
                text: '原型制作',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '原型成型',
                                desc: '你推进了仪器成型。',
                                icon: 'fas fa-tools',
                                effects: { skill: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '稳定性不足',
                                desc: '反复调试耗费精力。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { skill: 2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'signal_analysis',
                text: '信号分析',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '数据可靠',
                                desc: '你提升了数据质量。',
                                icon: 'fas fa-chart-area',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '算法受阻',
                                desc: '分析过程不够顺畅。',
                                icon: 'fas fa-road',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'clinical_reqs',
                text: '需求对接',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '需求明确',
                                desc: '你把临床需求梳理清楚。',
                                icon: 'fas fa-stethoscope',
                                effects: { social: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '沟通耗时',
                                desc: '对接过程有点费力。',
                                icon: 'fas fa-comments',
                                effects: { social: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_energy_systems',
        name: '能源系统优化',
        description: '能源工程学院开展系统优化任务。',
        icon: 'fas fa-bolt',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['能源工程学院'],
        options: [
            {
                id: 'grid_simulation',
                text: '系统仿真',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '参数稳定',
                                desc: '你掌握了关键参数。',
                                icon: 'fas fa-sliders-h',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '模型偏差',
                                desc: '参数校准耗时较多。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'field_inspection',
                text: '现场巡检',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '问题锁定',
                                desc: '你发现了关键隐患。',
                                icon: 'fas fa-search',
                                effects: { social: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '奔波劳累',
                                desc: '巡检路线让你有点疲惫。',
                                icon: 'fas fa-walking',
                                effects: { knowledge: 1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'efficiency_audit',
                text: '效率评估',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '指标清晰',
                                desc: '你整理出优化方向。',
                                icon: 'fas fa-chart-line',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '数据分散',
                                desc: '数据整理消耗精力。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_chem_bio_process',
        name: '化生工艺攻关',
        description: '化学工程与生物工程学院推进工艺优化。',
        icon: 'fas fa-flask',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['化学工程与生物工程学院'],
        options: [
            {
                id: 'reaction_optimization',
                text: '反应优化',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '效率提升',
                                desc: '转化率明显提高。',
                                icon: 'fas fa-arrow-up',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '条件苛刻',
                                desc: '实验条件过于敏感。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { knowledge: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'safety_review',
                text: '安全评估',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '流程规范',
                                desc: '你完善了安全流程。',
                                icon: 'fas fa-shield-alt',
                                effects: { knowledge: 1, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '细节繁琐',
                                desc: '评估过程较为枯燥。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'lab_scaleup',
                text: '放大试验',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '工艺可行',
                                desc: '你验证了放大路线。',
                                icon: 'fas fa-industry',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '波动明显',
                                desc: '放大带来新问题。',
                                icon: 'fas fa-wrench',
                                effects: { skill: 1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_aerospace_mission',
        name: '航天结构任务',
        description: '航空航天学院开展结构与控制任务。',
        icon: 'fas fa-rocket',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['航空航天学院'],
        options: [
            {
                id: 'wind_tunnel',
                text: '风洞试验',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '数据可靠',
                                desc: '你完成关键测试。',
                                icon: 'fas fa-fan',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '参数漂移',
                                desc: '试验需要反复校准。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'trajectory_sim',
                text: '轨迹仿真',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '模型收敛',
                                desc: '你完善了轨迹模型。',
                                icon: 'fas fa-project-diagram',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '误差偏大',
                                desc: '参数调整耗时较多。',
                                icon: 'fas fa-question-circle',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'structure_review',
                text: '结构复核',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '细节到位',
                                desc: '你梳理了关键风险。',
                                icon: 'fas fa-clipboard-check',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '反复检查',
                                desc: '检查流程略显枯燥。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_ic_tapeout',
        name: '集成电路流片',
        description: '集成电路学院进入流片准备阶段。',
        icon: 'fas fa-microchip',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['集成电路学院'],
        options: [
            {
                id: 'layout_design',
                text: '版图设计',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '版图优化',
                                desc: '你提升了电路性能。',
                                icon: 'fas fa-th',
                                effects: { skill: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '验证返工',
                                desc: '细节问题导致返工。',
                                icon: 'fas fa-undo',
                                effects: { skill: 2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'verification',
                text: '功能验证',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '问题清除',
                                desc: '你找出了关键缺陷。',
                                icon: 'fas fa-bug',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '边界复杂',
                                desc: '测试用例难度偏高。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'process_review',
                text: '工艺评审',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '风险可控',
                                desc: '你明确了关键工艺限制。',
                                icon: 'fas fa-clipboard-list',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '流程繁杂',
                                desc: '流程核对占用时间。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_software_release',
        name: '软件发布冲刺',
        description: '软件学院推进版本发布与稳定性改进。',
        icon: 'fas fa-code',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['软件学院'],
        options: [
            {
                id: 'architecture_refactor',
                text: '架构重构',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '结构清爽',
                                desc: '系统维护性显著提升。',
                                icon: 'fas fa-sitemap',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '风险暴露',
                                desc: '改动引入了新问题。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { skill: 1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'performance_tuning',
                text: '性能优化',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '速度提升',
                                desc: '响应时间明显下降。',
                                icon: 'fas fa-tachometer-alt',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '排查耗时',
                                desc: '性能瓶颈难定位。',
                                icon: 'fas fa-hourglass-half',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'release_coord',
                text: '发布协调',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '进度可控',
                                desc: '你把发布节奏梳理清楚。',
                                icon: 'fas fa-calendar-check',
                                effects: { social: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '沟通摩擦',
                                desc: '协调成本略高。',
                                icon: 'fas fa-comments',
                                effects: { social: 1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_social_research',
        name: '社会调研课题',
        description: '学院组织社会调研课题，走访社区收集资料。',
        icon: 'fas fa-clipboard-check',
        category: 'social',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: [
            '社会学系',
            '教育学院',
            '公共管理学院',
            '马克思主义学院',
            '文学院',
            '历史学院',
            '哲学院'
        ],
        options: [
            {
                id: 'research_lead',
                text: '带队调研',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '数据充分',
                                desc: '你们的调研结论扎实。',
                                icon: 'fas fa-chart-line',
                                effects: { social: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '协调困难',
                                desc: '沟通成本较高。',
                                icon: 'fas fa-comments',
                                effects: { social: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'research_assist',
                text: '参与协助',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '稳步推进',
                                desc: '你按计划完成任务。',
                                icon: 'fas fa-check-circle',
                                effects: { knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '参与感低',
                                desc: '你没有深入参与。',
                                icon: 'fas fa-minus-circle',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'research_data',
                text: '数据整理',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '结论清晰',
                                desc: '你把数据梳理得更清楚。',
                                icon: 'fas fa-chart-line',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '重复琐碎',
                                desc: '整理工作略显单调。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_enterprise_project',
        name: '企业合作项目',
        description: '学院与企业合作开展项目，你将承担何种角色？',
        icon: 'fas fa-handshake',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: [
            '机械工程学院',
            '材料科学与工程学院',
            '电气工程学院',
            '信息与电子工程学院',
            '计算机科学与技术学院',
            '软件学院'
        ],
        options: [
            {
                id: 'lead_enterprise',
                text: '担任负责人',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '能力提升',
                                desc: '你在实践中成长明显。',
                                icon: 'fas fa-rocket',
                                effects: { skill: 3, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '沟通成本',
                                desc: '协调沟通消耗不少精力。',
                                icon: 'fas fa-comments',
                                effects: { skill: 2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'member_enterprise',
                text: '团队成员',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '稳步积累',
                                desc: '经验一点点增加。',
                                icon: 'fas fa-cogs',
                                effects: { skill: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '参与度一般',
                                desc: '你没有太多发挥空间。',
                                icon: 'fas fa-minus-circle',
                                effects: { skill: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'process_optimizer',
                text: '流程优化',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '协作顺畅',
                                desc: '你优化了项目流程。',
                                icon: 'fas fa-sitemap',
                                effects: { social: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '细节缠身',
                                desc: '繁琐细节拖慢进度。',
                                icon: 'fas fa-bug',
                                effects: { social: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_mcm_competition',
        name: '美赛冲刺',
        description: '美赛进入备赛期，你是否参与冲刺？',
        icon: 'fas fa-calculator',
        category: 'skill',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: [
            '数学科学学院',
            '信息与电子工程学院',
            '控制科学与工程学院',
            '计算机科学与技术学院',
            '软件学院',
            '光电科学与工程学院',
            '集成电路学院'
        ],
        options: [
            {
                id: 'mcm_sprint',
                text: '全力备赛',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '模型完成',
                                desc: '你在建模与写作上提升明显。',
                                icon: 'fas fa-pen-nib',
                                effects: { skill: 3, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '熬夜透支',
                                desc: '高强度备赛影响了状态。',
                                icon: 'fas fa-moon',
                                effects: { skill: 2, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'mcm_watch',
                text: '协助队友',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '流程熟悉',
                                desc: '你熟悉了比赛节奏。',
                                icon: 'fas fa-stopwatch',
                                effects: { skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '参与不足',
                                desc: '你感到有些遗憾。',
                                icon: 'fas fa-minus-circle',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'mcm_data_support',
                text: '数据支持',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '报告扎实',
                                desc: '你把数据分析补齐了。',
                                icon: 'fas fa-chart-area',
                                effects: { skill: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '细节拖延',
                                desc: '分析过程进度偏慢。',
                                icon: 'fas fa-hourglass-half',
                                effects: { knowledge: 1, energy: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_alumni_meet',
        name: '校友交流会',
        description: '校友交流会举办，听听前辈经验？',
        icon: 'fas fa-user-friends',
        category: 'social',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        options: [
            {
                id: 'connect',
                text: '主动交流',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '人脉拓展',
                                desc: '你建立了新的联系。',
                                icon: 'fas fa-network-wired',
                                effects: { social: 3, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '疲于社交',
                                desc: '社交过度让你有点疲惫。',
                                icon: 'fas fa-user-clock',
                                effects: { social: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'brief',
                text: '点到为止',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '获得建议',
                                desc: '你学到一些经验。',
                                icon: 'fas fa-lightbulb',
                                effects: { knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '错过机会',
                                desc: '交流不够深入。',
                                icon: 'fas fa-minus-circle',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_photo_day',
        name: '毕业季摄影',
        description: '学院组织毕业季摄影活动，气氛热闹。',
        icon: 'fas fa-camera',
        category: 'entertainment',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        options: [
            {
                id: 'join_photo',
                text: '参加拍摄',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '记录美好',
                                desc: '留住了珍贵回忆。',
                                icon: 'fas fa-heart',
                                effects: { health: 2, social: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '奔波劳累',
                                desc: '活动较多让你有点累。',
                                icon: 'fas fa-walking',
                                effects: { health: -1, energy: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'skip_photo',
                text: '不参加',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '专注备战',
                                desc: '你把时间用在学习上。',
                                icon: 'fas fa-book',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '稍感遗憾',
                                desc: '缺少了校园氛围。',
                                icon: 'fas fa-cloud',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_direction_seminar',
        name: '方向选择研讨',
        description: '学院组织方向选择研讨会，帮助同学规划路线。',
        icon: 'fas fa-compass',
        category: 'academic',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: [
            '文学院',
            '外国语学院',
            '传媒与国际学院',
            '经济学院',
            '光华法学院',
            '管理学院'
        ],
        options: [
            {
                id: 'popular_track',
                text: '选择热门方向',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '资源集中',
                                desc: '你获得更多指导。',
                                icon: 'fas fa-bullseye',
                                effects: { knowledge: 2, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '竞争激烈',
                                desc: '压力显著增加。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { knowledge: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'interest_track',
                text: '坚持兴趣方向',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '动力更足',
                                desc: '兴趣提升了你的投入度。',
                                icon: 'fas fa-fire',
                                effects: { knowledge: 2, skill: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '路线模糊',
                                desc: '方向选择仍不够清晰。',
                                icon: 'fas fa-question',
                                effects: { knowledge: 1 },
                                logType: 'normal'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_moot_court',
        name: '模拟法庭',
        description: '法学院举办模拟法庭训练，锻炼论证能力。',
        icon: 'fas fa-gavel',
        category: 'social',
        months: SCHEDULE_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: false,
        majorNames: ['光华法学院'],
        options: [
            {
                id: 'moot_join',
                text: '担任辩手',
                cost: { energy: 6 },
                costDesc: '消耗6点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '论证有力',
                                desc: '你的表现获得认可。',
                                icon: 'fas fa-balance-scale',
                                effects: { social: 2, knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '准备不足',
                                desc: '准备不充分让你紧张。',
                                icon: 'fas fa-exclamation-triangle',
                                effects: { social: -1, health: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'moot_observe',
                text: '旁听学习',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '案例积累',
                                desc: '你积累了不少案例素材。',
                                icon: 'fas fa-book-open',
                                effects: { knowledge: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '参与感低',
                                desc: '你觉得有点可惜。',
                                icon: 'fas fa-minus-circle',
                                effects: { social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'moot_brief',
                text: '文书起草',
                cost: { energy: 4 },
                costDesc: '消耗4点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '逻辑清楚',
                                desc: '你的论证更有条理。',
                                icon: 'fas fa-file-alt',
                                effects: { knowledge: 2 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '细节繁琐',
                                desc: '写作过程略显枯燥。',
                                icon: 'fas fa-ellipsis-h',
                                effects: { knowledge: 1, social: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'junior_summer_push',
        name: '暑期冲刺',
        description: '暑期安排紧凑，你想怎么度过？',
        icon: 'fas fa-sun',
        category: 'skill',
        months: HOLIDAY_MONTHS,
        yearRange: DEFAULT_YEAR_RANGE,
        grades: [3],
        isHoliday: true,
        options: [
            {
                id: 'summer_sprint',
                text: '实习冲刺',
                cost: { energy: 8 },
                costDesc: '消耗8点精力',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '成果明显',
                                desc: '技能与经验双提升。',
                                icon: 'fas fa-briefcase',
                                effects: { skill: 1, money: 3 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '劳累透支',
                                desc: '强度过高影响状态。',
                                icon: 'fas fa-battery-quarter',
                                effects: { skill: 1, health: -2 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'summer_travel',
                text: '旅行放松',
                cost: null,
                costDesc: '无消耗',
                outcomes: [
                    {
                        weight: 100,
                        type: 'mix',
                        subOutcomes: [
                            {
                                weight: 50,
                                name: '身心恢复',
                                desc: '你重拾精力与好心情。',
                                icon: 'fas fa-umbrella-beach',
                                effects: { health: 3, social: 1 },
                                logType: 'positive'
                            },
                            {
                                weight: 50,
                                name: '节奏放缓',
                                desc: '学习进度稍慢。',
                                icon: 'fas fa-cloud-sun',
                                effects: { knowledge: -1 },
                                logType: 'negative'
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

const EVENT_INDEX = new Map();

function indexEvents() {
    EVENT_INDEX.clear();
    EVENTS.forEach(event => {
        EVENT_INDEX.set(event.id, event);
    });
}

indexEvents();

// 事件系统对象
function getEventState() {
    if (!player.eventState) {
        player.eventState = { triggeredEvents: [], lastTriggeredKey: '' };
    }
    if (!Array.isArray(player.eventState.triggeredEvents)) {
        player.eventState.triggeredEvents = [];
    }
    if (typeof player.eventState.lastTriggeredKey !== 'string') {
        player.eventState.lastTriggeredKey = '';
    }
    return player.eventState;
}

export const EventSystem = {
    // 检查并触发事件
    checkEvents() {
        if (player.grade > 3 || player.isGraduated) return false;

        const state = getEventState();
        const monthKey = `${player.year}-${player.month}`;
        if (state.lastTriggeredKey === monthKey) return false;

        const isHoliday = HOLIDAY_MONTHS.includes(player.month);
        
        // 9月必定触发竞选班委事件
        if (player.month === 9) {
            const electionEvent = EVENT_INDEX.get(SEPTEMBER_LOCKED_EVENT);
            if (electionEvent && this.isEligible(electionEvent, isHoliday)) {
                this.triggerEvent(electionEvent, monthKey);
                return true;
            }
        }
        
        // 其他月份50%概率触发
        if (Math.random() > EVENT_TRIGGER_CHANCE) return false;

        const pool = EVENTS.filter(event => this.isEligible(event, isHoliday));
        if (pool.length === 0) return false;

        const pickedCategory = this.pickCategory(pool);
        const categoryPool = pool.filter(event => event.category === pickedCategory);
        const finalPool = categoryPool.length > 0 ? categoryPool : pool;
        const event = finalPool[Math.floor(Math.random() * finalPool.length)];

        this.triggerEvent(event, monthKey);
        return true; // 每次只触发一个事件
    },

    // 判断事件是否应该触发
    isEligible(event, isHoliday) {
        const state = getEventState();
        const repeatable = event.repeatable === true;

        if (!repeatable && state.triggeredEvents.includes(event.id)) return false;
        if (event.months && !event.months.includes(player.month)) return false;
        if (event.grades && !event.grades.includes(player.grade)) return false;
        if (event.years && !event.years.includes(player.year)) return false;
        if (event.yearRange) {
            const [start, end] = event.yearRange;
            if (player.year < start || player.year > end) return false;
        }
        if (event.isHoliday === true && !isHoliday) return false;
        if (event.isHoliday !== true && isHoliday) return false;
        if (event.majorNames && event.majorNames.length > 0) {
            if (!player.majorName || !event.majorNames.includes(player.majorName)) return false;
        }
        return true;
    },

    // 触发事件
    triggerEvent(event, monthKey) {
        const state = getEventState();
        const repeatable = event.repeatable === true;
        if (!repeatable && !state.triggeredEvents.includes(event.id)) {
            state.triggeredEvents.push(event.id);
        }
        state.lastTriggeredKey = monthKey;

        // 显示事件弹窗
        this.showEventModal(event);
    },

    // 显示事件弹窗
    showEventModal(event) {
        const modal = document.getElementById('event-modal');
        if (!modal) {
            console.error('Event modal not found!');
            return;
        }

        const titleEl = document.getElementById('event-title');
        const iconEl = document.getElementById('event-icon');
        const descEl = document.getElementById('event-description');
        const optionsEl = document.getElementById('event-options');

        titleEl.textContent = event.name;
        iconEl.innerHTML = `<i class="${event.icon}"></i>`;
        descEl.textContent = event.description;

        // 渲染选项按钮
        optionsEl.innerHTML = event.options.map((option, index) => {
            const canAfford = this.canAffordOption(option);
            const disabledClass = canAfford ? '' : 'disabled';
            const costHtml = option.costDesc ? `<span class="event-option-cost">${option.costDesc}</span>` : '';
            
            return `
                <button class="event-option-btn ${disabledClass}" 
                        onclick="window.EventSystem.selectOption('${event.id}', ${index})"
                        ${canAfford ? '' : 'disabled'}>
                    <span class="event-option-text">${option.text}</span>
                    ${costHtml}
                </button>
            `;
        }).join('');

        modal.style.display = 'flex';
    },

    // 检查是否能承担选项消耗
    canAffordOption(option) {
        if (!option.cost) return true;
        for (let resource in option.cost) {
            if (player[resource] < option.cost[resource]) return false;
        }
        return true;
    },

    // 选择选项
    selectOption(eventId, optionIndex) {
        const event = this.getEventById(eventId);
        if (!event) return;

        const option = event.options[optionIndex];
        if (!option) return;

        // 扣除消耗
        if (option.cost) {
            for (let resource in option.cost) {
                player[resource] -= option.cost[resource];
            }
        }

        // 隐藏事件弹窗
        document.getElementById('event-modal').style.display = 'none';

        // 计算结果
        const outcome = this.rollOutcome(option.outcomes);
        const subOutcome = this.rollSubOutcome(outcome.subOutcomes);

        // 应用效果
        this.applyEffects(subOutcome.effects);

        // 显示结果弹窗
        this.showResultModal(event, option, outcome, subOutcome);
    },

    // 根据权重随机选择结果
    rollOutcome(outcomes) {
        const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let outcome of outcomes) {
            random -= outcome.weight;
            if (random <= 0) return outcome;
        }
        return outcomes[outcomes.length - 1];
    },

    // 根据权重随机选择子结果
    rollSubOutcome(subOutcomes) {
        const totalWeight = subOutcomes.reduce((sum, o) => sum + o.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let outcome of subOutcomes) {
            random -= outcome.weight;
            if (random <= 0) return outcome;
        }
        return subOutcomes[subOutcomes.length - 1];
    },

    // 应用属性效果
    applyEffects(effects) {
        if (!effects) return;
        for (let stat in effects) {
            if (player[stat] !== undefined) {
                player[stat] += effects[stat];
            }
        }
    },

    // 显示结果弹窗
    showResultModal(event, option, outcome, subOutcome) {
        const modal = document.getElementById('event-result-modal');
        if (!modal) {
            // 如果结果弹窗不存在，使用普通消息弹窗
            UI.showMessageModal(subOutcome.name, subOutcome.desc);
            return;
        }

        const titleEl = document.getElementById('event-result-title');
        const iconEl = document.getElementById('event-result-icon');
        const descEl = document.getElementById('event-result-desc');
        const effectsEl = document.getElementById('event-result-effects');

        titleEl.textContent = subOutcome.name;
        iconEl.innerHTML = `<i class="${subOutcome.icon}"></i>`;
        iconEl.className = `event-result-icon ${subOutcome.logType}`;
        descEl.textContent = subOutcome.desc;

        // 渲染效果变化
        let effectsHtml = '';
        if (subOutcome.effects && Object.keys(subOutcome.effects).length > 0) {
            const statNames = {
                knowledge: '学识',
                skill: '技能',
                social: '社交',
                health: '健康',
                energy: '精力',
                money: '金钱'
            };
            
            for (let stat in subOutcome.effects) {
                const value = subOutcome.effects[stat];
                const sign = value > 0 ? '+' : '';
                const colorClass = value > 0 ? 'positive' : 'negative';
                effectsHtml += `
                    <div class="event-effect-item ${colorClass}">
                        <span class="effect-stat">${statNames[stat] || stat}</span>
                        <span class="effect-value">${sign}${value}</span>
                    </div>
                `;
            }
        } else {
            effectsHtml = '<div class="event-effect-item neutral">无属性变化</div>';
        }
        effectsEl.innerHTML = effectsHtml;

        modal.style.display = 'flex';

        // 添加日志
        const effectText = Object.keys(subOutcome.effects || {}).map(stat => {
            const value = subOutcome.effects[stat];
            const sign = value > 0 ? '+' : '';
            const statNames = { knowledge: '学识', skill: '技能', social: '社交', health: '健康', energy: '精力', money: '金钱' };
            return `${statNames[stat] || stat}${sign}${value}`;
        }).join('，');

        UI.addLogEntry(`📌 ${event.name}：${subOutcome.name}${effectText ? '（' + effectText + '）' : ''}`, subOutcome.logType);

        // 更新UI
        UI.updateAll();
    },

    // 关闭结果弹窗
    closeResultModal() {
        const modal = document.getElementById('event-result-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // 计算模块权重
    getCategoryWeights() {
        const clamp01 = (val) => Math.max(0, Math.min(1, val));
        const normalize = (val, min = 50, max = 100) => clamp01((val - min) / (max - min));
        const knowledgeNorm = normalize(player.knowledge);
        const skillNorm = normalize(player.skill);
        const socialNorm = normalize(player.social);
        const healthNorm = normalize(player.health);
        const energyNorm = clamp01(player.energy / 100);
        const rawWeights = {
            academic: 1 + knowledgeNorm * 1.2,
            skill: 1 + skillNorm * 1.2,
            social: 1 + socialNorm * 1.2,
            entertainment: 1 + ((healthNorm + energyNorm) / 2) * 1.2
        };

        const total = Object.values(rawWeights).reduce((sum, value) => sum + value, 0);
        if (total <= 0) return rawWeights;

        return Object.fromEntries(
            Object.entries(rawWeights).map(([key, value]) => [key, value / total])
        );
    },

    // 按权重选择模块
    pickCategory(pool) {
        const weights = this.getCategoryWeights();
        const available = new Set(pool.map(event => event.category));
        const categoryWeights = EVENT_CATEGORIES.map(category => {
            if (!available.has(category)) return { category, weight: 0 };
            return { category, weight: weights[category] || 0 };
        });

        const totalWeight = categoryWeights.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight <= 0) return pool[0].category;

        let random = Math.random() * totalWeight;
        for (const item of categoryWeights) {
            random -= item.weight;
            if (random <= 0) return item.category;
        }
        return pool[0].category;
    },

    // 添加新事件（供外部扩展）
    addEvent(event) {
        EVENTS.push(event);
        EVENT_INDEX.set(event.id, event);
    },

    getEventById(eventId) {
        return EVENT_INDEX.get(eventId);
    },

    // 获取所有事件（调试用）
    getAllEvents() {
        return EVENTS;
    }
};

// 暴露到全局（用于 HTML onclick）
window.EventSystem = EventSystem;
