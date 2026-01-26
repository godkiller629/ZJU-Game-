// js/features/endings.js
// 结局系统：独立文件，方便后续扩展解锁条件与评语

function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @param {import('../core/state.js').player} p
 * @returns {{ title: string, text: string }}
 */
export function getEndingResult(p) {
  const baoyan = !!p.baoyanQualified;
  const thesisDone = (p.thesis || 0) >= 100;
  const graduated = (p.totalCreditsEarned || 0) >= (p.targetCredits || 0) && thesisDone;

  // 规则：优先级（健康 > 社交 > 技能）
  const lowHealth = (p.health || 0) < 80;
  const veryLowHealth = (p.health || 0) < 70;
  const lowSocial = (p.social || 0) < 60;
  const lowSkill = (p.skill || 0) < 60;

  // --- 保研线 ---
  if (baoyan) {
    // 保研但未完成毕业论文：保研作废
    if (!thesisDone) {
      return {
        title: '结局 · 保研作废',
        text: pickOne([
          '很遗憾，你未能按时毕业，保研名额作废，真正的痛苦，不是我不能，而是我本可以。',
          '很遗憾，你未能按时毕业，保研名额作废，别为一时的成功而迷失。'
        ])
      };
    }

    // 保研且完成毕设：顺利毕业并升学
    if (graduated) {
      if (lowHealth) {
        return {
          title: '结局 · 升学',
          text: '恭喜你顺利毕业并升学，新的未来，记得照顾好自己。'
        };
      }
      if (lowSocial) {
        return {
          title: '结局 · 升学',
          text: '恭喜你顺利毕业并升学，未来请更勇敢地走出自我。'
        };
      }
      if (lowSkill) {
        return {
          title: '结局 · 升学',
          text: '恭喜你顺利毕业并升学，学习之路继续，可毕业之后的路又在何方。'
        };
      }
      return {
        title: '结局 · 升学',
        text: pickOne([
          '恭喜你顺利毕业并升学，愿求是创新陪伴你走好接下来的路，母校与你同在。',
          '恭喜你顺利毕业并升学，愿你保持来时的求学之心。'
        ])
      };
    }

    // 理论兜底：保研但未顺利毕业（目前毕业=学分+论文）
    return {
      title: '结局 · 未能毕业',
      text: '很遗憾，你未能按时毕业，保研名额作废。'
    };
  }

  // --- 非保研线 ---
  if (graduated) {
    // 同时满足：健康 > 社交 > 技能
    if (lowHealth) {
      return {
        title: '结局 · 毕业',
        text: '恭喜你顺利毕业，离开母校，也请一定记得照顾好自己。'
      };
    }
    if (lowSocial) {
      return {
        title: '结局 · 毕业',
        text: '恭喜你顺利毕业，走出母校的少年，希望你多一分拥抱世界的勇气。'
      };
    }
    if (lowSkill) {
      return {
        title: '结局 · 毕业',
        text: pickOne([
          '恭喜你成功毕业，未来的路或许依旧艰难，但母校永远以你为荣。',
          '恭喜你顺利毕业，希望大学这段时光给予你闯荡江湖的少年意气。'
        ])
      };
    }

    if ((p.skill || 0) >= 90) {
      return {
        title: '结局 · 英雄',
        text: pickOne([
          '恭喜你顺利毕业，从此天高海阔，问天下谁为英雄。',
          '恭喜你顺利毕业，莫愁前路无知己，天下谁人不识君。'
        ])
      };
    }

    return {
      title: '结局 · 毕业',
      text: pickOne([
        '恭喜你顺利毕业，未来的路还很长，愿这段旅程助你走得更远。',
        '恭喜你顺利毕业，在未来的旅途中，希望你能做自己的星辰，母校永远为你骄傲。',
        '但行前路，莫问孰为英雄。'
      ])
    };
  }

  // 未能毕业（未保研）
  if (veryLowHealth) {
    return {
      title: '结局 · 未能毕业',
      text: '很遗憾，你未能按时毕业，新的一年，照顾好学业，更照顾好自己。'
    };
  }

  const has90 = (p.knowledge || 0) >= 90 || (p.skill || 0) >= 90 || (p.social || 0) >= 90;
  if (has90) {
    return {
      title: '结局 · 未能毕业',
      text: '很遗憾，你未能按时毕业，不是所有鲜花都盛开在春天，属于你的花季终将到来。'
    };
  }

  return {
    title: '结局 · 未能毕业',
    text: '很遗憾，你未能按时毕业，未来一年，希望你重新振作，博观而约取，厚积而薄发。'
  };
}

