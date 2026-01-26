export function getGrade(val) {
    if(val >= 90) return 'S';
    if(val >= 80) return 'A';
    if(val >= 70) return 'B';
    if(val >= 60) return 'C';
    return 'D';
}

export function getClass(val) {
    if(val >= 90) return 'rare';
    if(val >= 80) return 'good';
    if(val < 60) return 'bad';
    return '';
}

export function getDesc(type, val) {
    const descs = {
        study: { high: '过目不忘', mid: '勤能补拙', low: '学海无涯' },
        social: { high: '社牛', mid: '相处融洽', low: '社恐' },
        health: { high: '铁人', mid: '身体健康', low: '体弱' },
        looks: { high: '校花/校草', mid: '五官端正', low: '路人' }
    };
    let level = val >= 80 ? 'high' : (val >= 60 ? 'mid' : 'low');
    return descs[type][level];
}