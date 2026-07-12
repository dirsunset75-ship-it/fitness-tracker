/* ================================================================
   7 天健身+饮食计划数据 & 通用工具函数
   ================================================================ */

const WEEKLY_PLAN = {
  1: {
    dayName: "周一",
    label: "胸部 + 肱三头肌",
    training: {
      type: "strength",
      location: "健身房",
      duration: "45 分钟",
      warmup: "动态热身 5 分钟 + 空杆卧推 15 次",
      exercises: [
        { name: "杠铃卧推", sets: 4, reps: "8-10", weight: 40 },
        { name: "上斜哑铃卧推", sets: 3, reps: "10-12", weight: 12 },
        { name: "绳索下压", sets: 3, reps: "12-15", weight: 15 },
        { name: "哑铃侧平举", sets: 3, reps: "15", weight: 6 },
      ],
      stretch: "拉伸胸部、肱三头肌",
    },
    diet: {
      mode: "训练日（力量）",
      breakfast: "全麦贝果 1 个 + 2 全蛋 2 蛋白 + 牛奶 250ml + 蔬果",
      lunch: "食堂（一拳主食 + 一掌蛋白质 + 两拳蔬菜，去油）",
      postWorkout: "蛋白粉 1 勺 + 200ml 水",
      dinner: "主食减半（半个红薯 / 半碗饭）+ 150g 鸡胸/牛肉 + 大量蔬菜",
    },
  },
  2: {
    dayName: "周二",
    label: "有氧日",
    training: {
      type: "cardio",
      location: "健身房或户外",
      duration: "40 分钟",
      warmup: "动态热身 5 分钟",
      exercises: [
        { name: "有氧（选一项：跑步机间歇 / 椭圆机 / 划船机 / 户外快走慢跑交替）", sets: 1, reps: "1", weight: 40 },
      ],
      stretch: "拉伸 5 分钟",
    },
    diet: {
      mode: "训练日（有氧）",
      breakfast: "全麦贝果 + 2 全蛋 2 蛋白 + 牛奶 + 蔬果",
      lunch: "食堂（一拳主食 + 一掌蛋白质 + 两拳蔬菜，去油）",
      postWorkout: "蛋白粉 1 勺 + 水（若强度较高则喝）",
      dinner: "主食减半（如喝了蛋白粉）；否则正常",
    },
  },
  3: {
    dayName: "周三",
    label: "背部 + 肱二头肌",
    training: {
      type: "strength",
      location: "健身房",
      duration: "45 分钟",
      warmup: "动态热身 + 肩胛激活（俯身 TYW）",
      exercises: [
        { name: "高位下拉", sets: 4, reps: "10-12", weight: 35 },
        { name: "坐姿划船", sets: 3, reps: "10-12", weight: 30 },
        { name: "上斜板哑铃划船", sets: 3, reps: "10-12", weight: 12 },
        { name: "哑铃弯举", sets: 3, reps: "10-12", weight: 8 },
      ],
      stretch: "拉伸背部、肱二头肌",
    },
    diet: {
      mode: "训练日（力量）",
      breakfast: "同周一",
      lunch: "食堂",
      postWorkout: "蛋白粉 1 勺 + 水",
      dinner: "主食减半 + 蛋白质 + 蔬菜",
    },
  },
  4: {
    dayName: "周四",
    label: "有氧日",
    training: {
      type: "cardio",
      location: "健身房或户外",
      duration: "40 分钟",
      warmup: "动态热身 5 分钟",
      exercises: [
        { name: "有氧（跑步机间歇 / 椭圆机 / 划船机 / 户外快走慢跑交替）", sets: 1, reps: "1", weight: 40 },
      ],
      stretch: "拉伸 5 分钟",
    },
    diet: {
      mode: "训练日（有氧）",
      breakfast: "同前",
      lunch: "食堂",
      postWorkout: "蛋白粉（可选）",
      dinner: "对应调整主食",
    },
  },
  5: {
    dayName: "周五",
    label: "腿部 + 肩部",
    training: {
      type: "strength",
      location: "健身房",
      duration: "45 分钟",
      warmup: "动态热身 + 空杆深蹲 15 次",
      exercises: [
        { name: "杠铃深蹲", sets: 4, reps: "8-10", weight: 50 },
        { name: "哑铃肩推", sets: 3, reps: "10-12", weight: 14 },
        { name: "反向蝴蝶机/俯身飞鸟", sets: 3, reps: "15", weight: 10 },
        { name: "箭步蹲（可选）", sets: 2, reps: "10", weight: 0 },
      ],
      stretch: "拉伸腿部、肩部",
    },
    diet: {
      mode: "训练日（力量）",
      breakfast: "同前",
      lunch: "食堂",
      postWorkout: "蛋白粉 1 勺 + 水",
      dinner: "主食减半 + 蛋白质 + 蔬菜",
    },
  },
  6: {
    dayName: "周六",
    label: "有氧 + 核心（家庭）",
    training: {
      type: "cardio",
      location: "家庭",
      duration: "40 分钟",
      warmup: "热身 5 分钟（踏步、开合跳、肩髋环绕）",
      exercises: [
        { name: "有氧循环（高抬腿、开合跳、登山者、简易波比、深蹲小跳）", sets: 3, reps: "1", weight: 15 },
        { name: "核心强化（平板支撑、仰卧交替抬腿、侧平板、死虫式、鸟狗式）", sets: 2, reps: "1", weight: 15 },
      ],
      stretch: "拉伸 5 分钟",
    },
    diet: {
      mode: "非训练日模式",
      breakfast: "不变",
      lunch: "食堂或自备，高蛋白蔬菜",
      postWorkout: "不喝蛋白粉（若未进行高强度训练）",
      dinner: "主食恢复全量（1 个红薯 / 1 碗饭）+ 蛋白质 + 蔬菜",
    },
  },
  7: {
    dayName: "周日",
    label: "稳态有氧 + 核心耐力",
    training: {
      type: "cardio",
      location: "家庭",
      duration: "40 分钟",
      warmup: "热身 5 分钟",
      exercises: [
        { name: "稳态有氧", sets: 1, reps: "1", weight: 20 },
        { name: "核心耐力", sets: 2, reps: "1", weight: 15 },
      ],
      stretch: "拉伸 5 分钟",
    },
    diet: {
      mode: "非训练日模式",
      breakfast: "不变",
      lunch: "干净饮食",
      postWorkout: "不喝蛋白粉",
      dinner: "主食全量 + 蛋白质 + 蔬菜",
    },
  },
};

const DAILY_GOALS = {
  water: "2.5-3 L",
};

const KEY_TIPS = [
  {
    title: "无氧递增规则",
    body: "当某个动作最后一组也能轻松完成次数范围上限时（如 4 组都做到 10 次），下次训练加重。杠铃加 2.5kg，哑铃每边加 1-2kg，固定器械加一小格。加重后次数会下降，再慢慢提升，循环往复。",
  },
  {
    title: "饮水",
    body: "每天 2.5-3 升，晨起、餐前、训练中都要喝。",
  },
  {
    title: "称重与调整",
    body: "每周一早上空腹称重。若两周体重下降 >0.5kg/周，周末也可喝蛋白粉（不减少主食）；若下降 <0.3kg/周，检查油脂和碳水是否超标，晚餐主食可再微减。",
  },
  {
    title: "食堂秘诀",
    body: "优选：蒸、煮、卤、炖、凉拌。避雷：油炸、糖醋、勾芡、肥肉、肉汤。太油的菜用汤或水涮一下。",
  },
  {
    title: "周末灵活性",
    body: "家庭有氧可穿插跳绳、健身操等，保持 40 分钟以上活动量即可。核心训练务必感受肌肉发力，不借力。",
  },
];

/* ====== 工具函数 ====== */

function toChineseDay(jsDay) {
  return jsDay === 0 ? 7 : jsDay;
}

function getTodayKey() {
  return toChineseDay(new Date().getDay());
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fmtDateCN(date) {
  return date.getMonth() + 1 + "月" + date.getDate() + "日";
}

function planKey(dayKey) {
  return ((dayKey - 1) % 7) + 1;
}

function getDateForDayKey(dayKey) {
  const monday = getMondayOfWeek(new Date());
  const target = new Date(monday);
  target.setDate(monday.getDate() + dayKey - 1);
  return fmtDate(target);
}

function fmtDayKeyLabel(dayKey) {
  const date = new Date(getDateForDayKey(dayKey) + "T00:00:00");
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const plan = WEEKLY_PLAN[planKey(dayKey)];
  const planLabel = plan ? `${plan.dayName} · ${plan.label}` : "";
  const weekOffset = Math.floor((dayKey - 1) / 7);
  let prefix = "";
  if (weekOffset === 0) prefix = "本周";
  else if (weekOffset === 1) prefix = "下周";
  else prefix = `${weekOffset + 1}周后`;
  return `${prefix} ${m}/${d} ${planLabel}`.trim();
}

function calcTotalWeight(records) {
  if (!records || !records.length) return 0;
  return records.reduce((sum, r) => {
    const sets = parseInt(r.sets) || 0;
    const reps = parseInt(r.reps) || 0;
    const weight = parseFloat(r.weight) || 0;
    return sum + sets * reps * weight;
  }, 0);
}

function fmtWeight(total) {
  if (total >= 1000) {
    return (total / 1000).toFixed(1) + "t";
  }
  return Math.round(total) + "kg";
}

function getProteinTarget(entries) {
  const withWeight = entries
    .filter((e) => e.weight && parseFloat(e.weight) > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!withWeight.length) return null;
  const latestWeight = parseFloat(withWeight[0].weight);
  return Math.round(latestWeight * 1.4);
}

module.exports = {
  WEEKLY_PLAN,
  DAILY_GOALS,
  KEY_TIPS,
  toChineseDay,
  getTodayKey,
  getMondayOfWeek,
  fmtDate,
  fmtDateCN,
  planKey,
  getDateForDayKey,
  fmtDayKeyLabel,
  calcTotalWeight,
  fmtWeight,
  getProteinTarget,
};
