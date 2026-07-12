/* ================================================================
   健身饮食追踪助手 — 核心逻辑
   纯前端 · localStorage 持久化 · 零依赖
   ================================================================ */

// ---------- 常量 ----------
const STORAGE_KEY = "fitness-tracker-entries";
const CUSTOM_DIET_KEY = "fitness-custom-diets";

function loadCustomDiets() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_DIET_KEY) || "{}"); }
  catch { return {}; }
}
function saveCustomDiets(diets) {
  localStorage.setItem(CUSTOM_DIET_KEY, JSON.stringify(diets));
}
let customDiets = loadCustomDiets();

// ---------- 7 天健身+饮食计划 ----------
// key: 1=周一 … 7=周日
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
      breakfast: "同周一：全麦贝果 + 2 全蛋 2 蛋白 + 牛奶 + 蔬果",
      lunch: "食堂，原则同上（一拳主食 + 一掌蛋白质 + 两拳蔬菜，去油）",
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

// 通用每日目标
const DAILY_GOALS = {
  water: "2.5-3 L",
};

/** 根据最新体重计算蛋白质目标（增肌：1.4g/kg） */
function getProteinTarget() {
  const withWeight = entries
    .filter((e) => e.weight && parseFloat(e.weight) > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!withWeight.length) return null;
  const latestWeight = parseFloat(withWeight[0].weight);
  return Math.round(latestWeight * 1.4);
}

/** 更新蛋白质输入框的 placeholder */
function updateProteinPlaceholder() {
  const target = getProteinTarget();
  if (target) {
    protein.placeholder = `目标 ${target}g（${(target / 1.4).toFixed(1)}kg × 1.4g/kg）`;
  } else {
    protein.placeholder = "请先记录体重";
  }
}

// 执行要点
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

// ---------- 工具函数 ----------

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
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

/** 将任意 dayKey 映射到 1-7 的周计划 */
function planKey(dayKey) {
  return ((dayKey - 1) % 7) + 1;
}

/** 根据 dayKey(≥1) 计算对应日期（可跨周） */
function getDateForDayKey(dayKey) {
  const monday = getMondayOfWeek(new Date());
  const target = new Date(monday);
  target.setDate(monday.getDate() + dayKey - 1);
  return fmtDate(target);
}

/** 返回 dayKey 对应日期的中文描述 */
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
  else if (weekOffset > 1) prefix = `${weekOffset + 1}周后`;
  return `${prefix} ${m}/${d} ${planLabel}`.trim();
}

/** 计算训练记录的总重量（组数 × 次数 × 重量 的总和） */
function calcTotalWeight(records) {
  if (!records || !records.length) return 0;
  return records.reduce((sum, r) => {
    const sets = parseInt(r.sets) || 0;
    const reps = parseInt(r.reps) || 0;
    const weight = parseFloat(r.weight) || 0;
    return sum + sets * reps * weight;
  }, 0);
}

/** 格式化总重量显示 */
function fmtWeight(total) {
  if (total >= 1000) {
    return (total / 1000).toFixed(1) + "t";
  }
  return Math.round(total) + "kg";
}

// ---------- 数据读写 ----------

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ---------- 全局状态 ----------

let entries = loadEntries();
let currentPlanDay = getTodayKey();

// ---------- DOM 引用 ----------

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// 计划面板
const planDayLabel = $("#planDayLabel");
const planPrevBtn = $("#planPrevBtn");
const planNextBtn = $("#planNextBtn");
const planTrainingCard = $("#planTrainingCard");
const planDietCard = $("#planDietCard");
const planGoalsCard = $("#planGoalsCard");
const todayPill = $("#todayDate");

// 统计面板
const statsPanel = $("#statsPanel");
const statTrainRate = $("#statTrainRate");
const statDietRate = $("#statDietRate");
const statAvgProtein = $("#statAvgProtein");
const statAvgWater = $("#statAvgWater");
const statWeightTrend = $("#statWeightTrend");
const statGuitar = $("#statGuitar");
const statVsLastWeek = $("#statVsLastWeek");

// 月度日历
const calendarGrid = $("#calendarGrid");
const calendarTitle = $("#calendarTitle");
const calendarPrevBtn = $("#calendarPrevBtn");
const calendarNextBtn = $("#calendarNextBtn");

// 表单
const form = $("#dailyForm");
const recordDate = $("#recordDate");
const weight = $("#weight");
const protein = $("#protein");
const water = $("#water");
const workoutDone = $("#workoutDone");
const dietDone = $("#dietDone");
const proteinShake = $("#proteinShake");
const kegelDone = $("#kegelDone");
const guitarPractice = $("#guitarPractice");
const note = $("#note");
const trainingTableBody = $("#trainingTableBody");

// 可编辑表头
const thSets = $("#thSets");
const thReps = $("#thReps");
const thLast = $("#thLast");

// 历史
const historyList = $("#historyList");

// 执行要点
const tipsToggle = $("#tipsToggle");
const tipsBody = $("#tipsBody");

// 日历状态
let calendarYear, calendarMonth;

// ---------- 训练表格 ----------

/** 根据 dayKey 填充训练表格（用计划默认值） */
function populateTrainingTable(dayKey) {
  const plan = WEEKLY_PLAN[dayKey];
  if (!plan) return;

  const isCardio = plan.training.type === "cardio";
  const lastColLabel = isCardio ? "时间 (分钟)" : "重量 (kg)";

  const exercises = plan.training.exercises;
  trainingTableBody.innerHTML = exercises
    .map(
      (ex, i) => `
    <tr>
      <td><input type="text" class="tr-name" value="${ex.name.replace(/"/g, "&quot;")}" data-idx="${i}"></td>
      <td><input type="number" class="tr-sets" value="${ex.sets}" min="0" step="1" data-idx="${i}"></td>
      <td><input type="number" class="tr-reps" value="${parseInt(ex.reps) || ex.reps}" min="0" step="1" data-idx="${i}"></td>
      <td><input type="number" class="tr-weight" value="${ex.weight}" min="0" step="${isCardio ? "1" : "0.5"}" data-idx="${i}"></td>
    </tr>`
    )
    .join("");

  // 设置表头默认值（用户可自行修改）
  thSets.value = "组数";
  thReps.value = "次数";
  thLast.value = lastColLabel;
}

/** 读取当前表头标签 */
function getHeaderLabels() {
  return {
    sets: thSets.value,
    reps: thReps.value,
    last: thLast.value,
  };
}

/** 恢复表头标签 */
function setHeaderLabels(labels) {
  if (!labels) return;
  if (labels.sets) thSets.value = labels.sets;
  if (labels.reps) thReps.value = labels.reps;
  if (labels.last) thLast.value = labels.last;
}

/** 从表格读取当前训练记录 */
function getTrainingRecords() {
  const rows = trainingTableBody.querySelectorAll("tr");
  const records = [];
  rows.forEach((row) => {
    const name = row.querySelector(".tr-name")?.value || "";
    const sets = row.querySelector(".tr-sets")?.value || "0";
    const reps = row.querySelector(".tr-reps")?.value || "0";
    const w = row.querySelector(".tr-weight")?.value || "0";
    records.push({ name, sets, reps, weight: parseFloat(w) });
  });
  return records;
}

/** 用已有数据填充训练表格 */
function setTrainingRecords(records) {
  if (!records || !records.length) return;
  const rows = trainingTableBody.querySelectorAll("tr");
  rows.forEach((row, i) => {
    if (i < records.length) {
      const r = records[i];
      const nameEl = row.querySelector(".tr-name");
      const setsEl = row.querySelector(".tr-sets");
      const repsEl = row.querySelector(".tr-reps");
      const weightEl = row.querySelector(".tr-weight");
      if (nameEl) nameEl.value = r.name;
      if (setsEl) setsEl.value = r.sets;
      if (repsEl) repsEl.value = r.reps;
      if (weightEl) weightEl.value = r.weight;
    }
  });
}

// ---------- 渲染：计划面板 ----------

function renderPlan(dayKey) {
  const pk = planKey(dayKey);
  const plan = WEEKLY_PLAN[pk];
  if (!plan) return;

  const todayStr = fmtDate(new Date());
  const dateForThis = getDateForDayKey(dayKey);
  const isToday = dateForThis === todayStr;
  planDayLabel.textContent = `${fmtDayKeyLabel(dayKey)}${isToday ? " （今天）" : ""}`;
  planPrevBtn.classList.toggle("dimmed", dayKey === 1);
  planNextBtn.classList.toggle("dimmed", false); // 不再限制上限

  // 训练卡片
  const t = plan.training;
  planTrainingCard.innerHTML = `
    <h3>🏋️ 训练计划 <span class="badge">${t.location}</span> <span class="badge">${t.duration}</span></h3>
    <p class="plan-detail"><strong>热身：</strong>${t.warmup}</p>
    <ul class="exercise-list">
      ${t.exercises
        .map((e) => {
          const detail = t.type === "cardio"
            ? `${e.weight} 分钟`
            : `${e.sets} 组 × ${e.reps} 次 · ${e.weight > 0 ? e.weight + "kg" : "自重"}`;
          return `<li><span class="ex-name">${e.name}</span><span class="ex-detail">${detail}</span></li>`;
        }).join("")}
    </ul>
    <p class="plan-detail"><strong>整理：</strong>${t.stretch}</p>
  `;

  // 饮食卡片（可编辑，自动保存——按计划天存储，跨周共享）
  const d = plan.diet;
  const cd = customDiets[pk] || {};
  const meals = [
    { icon: "🌅", label: "早餐", key: "breakfast", val: cd.breakfast || d.breakfast },
    { icon: "🌞", label: "午餐", key: "lunch", val: cd.lunch || d.lunch },
    { icon: "💪", label: "练后", key: "postWorkout", val: cd.postWorkout || d.postWorkout },
    { icon: "🌙", label: "晚餐", key: "dinner", val: cd.dinner || d.dinner },
  ];
  planDietCard.innerHTML = `
    <h3>🥗 饮食安排 <span class="badge mode">${d.mode}</span></h3>
    <ul class="diet-list">
      ${meals.map((m) => `
        <li><strong>${m.icon} ${m.label}</strong><span contenteditable="true" class="diet-val" data-day="${pk}" data-meal="${m.key}">${m.val}</span></li>
      `).join("")}
    </ul>
    <p style="font-size:0.75rem;color:var(--muted);margin-top:6px;">💡 点击文字可直接编辑，失焦自动保存</p>
  `;

  // 绑定失焦保存事件
  planDietCard.querySelectorAll(".diet-val").forEach((span) => {
    span.addEventListener("blur", () => {
      const day = span.dataset.day;
      const meal = span.dataset.meal;
      const text = span.textContent.trim();
      if (!customDiets[day]) customDiets[day] = {};
      if (text) {
        customDiets[day][meal] = text;
      } else {
        delete customDiets[day][meal];
        if (!Object.keys(customDiets[day]).length) delete customDiets[day];
      }
      saveCustomDiets(customDiets);
    });
  });

  // 通用目标卡片
  const proteinTarget = getProteinTarget();
  const proteinDisplay = proteinTarget ? `${proteinTarget}g` : "请先记录体重";
  const proteinSub = proteinTarget ? `${(proteinTarget / 1.4).toFixed(1)}kg × 1.4` : "";
  planGoalsCard.innerHTML = `
    <h3>🎯 每日目标</h3>
    <div class="goals-row">
      <div class="goal-item">
        <span class="goal-val">${proteinDisplay}</span>
        ${proteinSub ? `<span class="goal-sub">${proteinSub}</span>` : ""}
        <span class="goal-label">蛋白质</span>
      </div>
      <div class="goal-item"><span class="goal-val">${DAILY_GOALS.water}</span><span class="goal-label">饮水</span></div>
    </div>
  `;
}

function switchPlanDay(delta) {
  const newDay = currentPlanDay + delta;
  if (newDay < 1) return; // 不早于本周一
  currentPlanDay = newDay;
  renderPlan(currentPlanDay);
  // 同步更新训练表格和表单日期
  const dateForDay = getDateForDayKey(currentPlanDay);
  recordDate.value = dateForDay;
  const existing = entries.find((e) => e.date === dateForDay);
  if (existing) {
    fillForm(existing);
  } else {
    resetFormFields();
    populateTrainingTable(planKey(currentPlanDay));
    updateProteinPlaceholder();
  }
}

// ---------- 渲染：每周统计 ----------

function calcWeeklyStats() {
  const now = new Date();
  const thisMonday = getMondayOfWeek(now);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(lastMonday.getDate() - 7);

  const thisSun = new Date(thisMonday);
  thisSun.setDate(thisSun.getDate() + 6);
  const lastSun = new Date(lastMonday);
  lastSun.setDate(lastSun.getDate() + 6);

  const mondayStr = fmtDate(thisMonday);
  const sundayStr = fmtDate(thisSun);
  const lastMondayStr = fmtDate(lastMonday);
  const lastSundayStr = fmtDate(lastSun);

  const thisWeek = entries.filter((e) => e.date >= mondayStr && e.date <= sundayStr);
  const lastWeek = entries.filter((e) => e.date >= lastMondayStr && e.date <= lastSundayStr);

  const totalDays = 7;
  const trainDone = thisWeek.filter((e) => e.workoutDone).length;
  const dietOk = thisWeek.filter((e) => e.dietDone).length;

  const avg = (arr, key) => {
    const vals = arr.map((e) => parseFloat(e[key])).filter((v) => !isNaN(v) && v > 0);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  const avgProtein = avg(thisWeek, "protein");
  const avgWater = avg(thisWeek, "water");

  // 吉他练习统计
  const guitarTotal = thisWeek.reduce((sum, e) => sum + (parseInt(e.guitarPractice) || 0), 0);
  const avgGuitar = avg(thisWeek, "guitarPractice");

  const thisMonEntry = thisWeek.find((e) => e.date === mondayStr);
  const lastMonEntry = lastWeek.find((e) => e.date === lastMondayStr);
  let weightTrend = null;
  if (thisMonEntry && thisMonEntry.weight && lastMonEntry && lastMonEntry.weight) {
    weightTrend = parseFloat(thisMonEntry.weight) - parseFloat(lastMonEntry.weight);
  }

  const lastAvgProtein = avg(lastWeek, "protein");
  const lastTrainDone = lastWeek.filter((e) => e.workoutDone).length;

  const compare = (cur, prev) => {
    if (cur === null || prev === null) return "—";
    if (cur > prev) return "↑";
    if (cur < prev) return "↓";
    return "→";
  };

  return {
    trainDone, trainTotal: totalDays,
    dietOk, dietTotal: totalDays,
    avgProtein, avgWater, weightTrend,
    guitarTotal, avgGuitar,
    lastAvgProtein, lastTrainDone,
    trendProtein: compare(avgProtein, lastAvgProtein),
    trendTrain: compare(trainDone, lastTrainDone),
  };
}

function renderStats() {
  const s = calcWeeklyStats();
  statTrainRate.textContent = `${s.trainDone}/${s.trainTotal}`;
  statDietRate.textContent = `${s.dietOk}/${s.dietTotal}`;
  statAvgProtein.textContent = s.avgProtein !== null ? `${s.avgProtein} g` : "—";
  statAvgWater.textContent = s.avgWater !== null ? `${s.avgWater} L` : "—";

  if (s.weightTrend !== null) {
    const sign = s.weightTrend > 0 ? "+" : "";
    const arrow = s.weightTrend < 0 ? "📉" : s.weightTrend > 0 ? "📈" : "➡️";
    statWeightTrend.textContent = `${arrow} ${sign}${s.weightTrend.toFixed(1)} kg`;
  } else {
    statWeightTrend.textContent = "需周一称重";
  }

  if (s.guitarTotal > 0) {
    statGuitar.textContent = `${s.guitarTotal} min`;
  } else {
    statGuitar.textContent = "—";
  }

  statVsLastWeek.innerHTML = `
    <span>训练 ${s.trendTrain}</span>
    <span>蛋白质 ${s.trendProtein}</span>
  `;

  statsPanel.style.display = "block";
}

// ---------- 渲染：月度日历 ----------

function renderCalendar(year, month) {
  calendarYear = year;
  calendarMonth = month;

  const monthNames = ["1 月","2 月","3 月","4 月","5 月","6 月","7 月","8 月","9 月","10 月","11 月","12 月"];
  calendarTitle.textContent = `${year} 年 ${monthNames[month]}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const totalDays = lastDay.getDate();

  const recordMap = {};
  entries.forEach((e) => {
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      recordMap[e.date] = e;
    }
  });

  const todayStr = fmtDate(new Date());
  let html = "";

  ["一","二","三","四","五","六","日"].forEach((d) => {
    html += `<div class="cal-cell cal-header">${d}</div>`;
  });

  for (let i = 0; i < startOffset; i++) {
    html += `<div class="cal-cell cal-empty"></div>`;
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const rec = recordMap[dateStr];
    const isToday = dateStr === todayStr;

    let cls = "cal-cell cal-day";
    if (isToday) cls += " cal-today";
    if (rec) cls += rec.workoutDone ? " cal-done" : " cal-has-record";

    // 计算总重量和蛋白质
    const totalW = rec ? calcTotalWeight(rec.trainingRecords) : 0;
    const proteinVal = rec && rec.protein ? parseFloat(rec.protein) : 0;
    const guitarVal = rec && rec.guitarPractice ? parseInt(rec.guitarPractice) : 0;

    const weightDisplay = totalW > 0 ? `<span class="cal-sub">${fmtWeight(totalW)}</span>` : "";
    const proteinDisplay = proteinVal > 0 ? `<span class="cal-sub cal-protein">${Math.round(proteinVal)}g</span>` : "";
    const guitarDisplay = guitarVal > 0 ? `<span class="cal-sub cal-guitar">🎸${guitarVal}分</span>` : "";

    html += `<div class="${cls}" data-date="${dateStr}" title="${dateStr}${totalW > 0 ? ' · 总重量 ' + fmtWeight(totalW) : ''}${proteinVal > 0 ? ' · 蛋白质 ' + Math.round(proteinVal) + 'g' : ''}${guitarVal > 0 ? ' · 吉他 ' + guitarVal + '分钟' : ''}">
      <span class="cal-num">${day}</span>
      ${weightDisplay}
      ${proteinDisplay}
      ${guitarDisplay}
    </div>`;
  }

  calendarGrid.innerHTML = html;

  calendarGrid.querySelectorAll(".cal-day").forEach((cell) => {
    cell.addEventListener("click", () => {
      const date = cell.dataset.date;
      const entry = entries.find((e) => e.date === date);
      if (entry) {
        fillForm(entry);
      } else {
        form.reset();
        recordDate.value = date;
        const d = new Date(date);
        populateTrainingTable(toChineseDay(d.getDay()));
        resetFormFields();
      }
      form.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function switchCalendar(delta) {
  let m = calendarMonth + delta;
  let y = calendarYear;
  if (m < 0) { m = 11; y--; }
  if (m > 11) { m = 0; y++; }
  renderCalendar(y, m);
}

// ---------- 表单 ----------

function resetFormFields() {
  workoutDone.checked = false;
  dietDone.checked = false;
  proteinShake.checked = false;
  kegelDone.value = 0;
  guitarPractice.value = "";
  weight.value = "";
  protein.value = "";
  water.value = "";
  note.value = "";
}

function fillForm(item) {
  recordDate.value = item.date;
  weight.value = item.weight || "";
  protein.value = item.protein || "";
  // 饮水：存储为 L，显示为 ml
  if (item.water) {
    water.value = Math.round(parseFloat(item.water) * 1000);
  } else {
    water.value = "";
  }
  workoutDone.checked = Boolean(item.workoutDone);
  dietDone.checked = Boolean(item.dietDone);
  proteinShake.checked = Boolean(item.proteinShake);
  // 兼容旧数据（布尔值 true → 3，数字直接取）
  const kv = item.kegelDone;
  kegelDone.value = (typeof kv === "boolean") ? (kv ? 3 : 0) : (parseInt(kv) || 0);
  guitarPractice.value = item.guitarPractice || "";
  note.value = item.note || "";

  // 训练表格
  const d = new Date(item.date);
  populateTrainingTable(toChineseDay(d.getDay()));
  // 恢复自定义表头（如果有）
  if (item.headerLabels) setHeaderLabels(item.headerLabels);
  if (item.trainingRecords && item.trainingRecords.length) {
    setTrainingRecords(item.trainingRecords);
  }
}

function resetFormForToday() {
  form.reset();
  recordDate.value = fmtDate(new Date());
  populateTrainingTable(getTodayKey());
  updateProteinPlaceholder();
}

// 日期变更时
recordDate.addEventListener("change", () => {
  const date = recordDate.value;
  if (!date) return;
  const existing = entries.find((e) => e.date === date);
  if (existing) {
    fillForm(existing);
  } else {
    resetFormFields();
    const d = new Date(date);
    populateTrainingTable(toChineseDay(d.getDay()));
    updateProteinPlaceholder();
  }
});

// 表单提交
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const waterL = water.value ? (parseFloat(water.value) / 1000).toFixed(2) : "";

  const item = {
    date: recordDate.value,
    weight: weight.value,
    protein: protein.value,
    water: waterL,
    workoutDone: workoutDone.checked,
    dietDone: dietDone.checked,
    proteinShake: proteinShake.checked,
    kegelDone: parseInt(kegelDone.value) || 0,
    guitarPractice: guitarPractice.value,
    headerLabels: getHeaderLabels(),
    trainingRecords: getTrainingRecords(),
    note: note.value,
  };

  const index = entries.findIndex((entry) => entry.date === item.date);
  if (index >= 0) {
    entries[index] = item;
  } else {
    entries.push(item);
  }

  saveEntries(entries);
  renderPlan(currentPlanDay); // 刷新蛋白质目标
  renderHistory();
  renderStats();
  renderCalendar(calendarYear, calendarMonth);
  resetFormForToday();
  showToast("✅ 数据已保存");
});

// ---------- 历史记录 ----------

function renderHistory() {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  if (!sorted.length) {
    historyList.innerHTML = '<div class="empty">还没有记录，先填写一条今天的数据吧 ✍️</div>';
    return;
  }

  historyList.innerHTML = sorted
    .map((item) => {
      const badges = [];
      if (item.workoutDone) badges.push('<span class="tag tag-green">训练完成</span>');
      else badges.push('<span class="tag tag-gray">训练未完成</span>');
      if (item.dietDone) badges.push('<span class="tag tag-green">饮食达标</span>');
      if (item.proteinShake) badges.push('<span class="tag tag-blue">蛋白粉</span>');
      const kegelCount = (typeof item.kegelDone === "boolean") ? (item.kegelDone ? 3 : 0) : (parseInt(item.kegelDone) || 0);
      if (kegelCount > 0) badges.push(`<span class="tag tag-purple">凯格尔 ${kegelCount}/3</span>`);

      const dayKey = toChineseDay(new Date(item.date).getDay());
      const plan = WEEKLY_PLAN[dayKey];
      const dayLabel = plan ? `${item.date} · ${plan.dayName} ${plan.label}` : item.date;

      const totalW = calcTotalWeight(item.trainingRecords);
      const weightInfo = totalW > 0 ? `<span>训练总量：${fmtWeight(totalW)}</span>` : "";
      const guitarInfo = item.guitarPractice ? `<span>🎸 吉他：${item.guitarPractice} min</span>` : "";

      // 训练表格摘要（使用保存的自定义表头）
      let trainingSummary = "";
      if (item.trainingRecords && item.trainingRecords.length) {
        const hasData = item.trainingRecords.some((r) => (parseInt(r.sets) || 0) > 0);
        if (hasData) {
          const hl = item.headerLabels || {};
          const setsLabel = hl.sets || "组数";
          const repsLabel = hl.reps || "次数";
          const lastLabel = hl.last || "重量";
          trainingSummary = `
            <details class="training-detail">
              <summary>📋 训练记录</summary>
              <table class="mini-table">
                <thead><tr><th>动作</th><th>${setsLabel}</th><th>${repsLabel}</th><th>${lastLabel}</th></tr></thead>
                <tbody>
                  ${item.trainingRecords.map((r) => `<tr>
                    <td>${r.name}</td>
                    <td>${r.sets}</td>
                    <td>${r.reps}</td>
                    <td>${r.weight > 0 ? r.weight : "—"}</td>
                  </tr>`).join("")}
                </tbody>
              </table>
            </details>`;
        }
      }

      return `
        <article class="history-card">
          <div class="hc-head">
            <strong>${dayLabel}</strong>
            <button class="btn-sm" data-date="${item.date}" title="编辑此条">✏️ 编辑</button>
          </div>
          <div class="meta">
            <span>体重：${item.weight || "—"} kg</span>
            <span>蛋白质：${item.protein || "—"} g</span>
            <span>饮水：${item.water || "—"} L</span>
            ${weightInfo}
            ${guitarInfo}
          </div>
          <div class="meta badges-row">${badges.join("")}</div>
          ${trainingSummary}
          ${item.note ? `<p class="note-text">💬 ${item.note}</p>` : ""}
        </article>
      `;
    })
    .join("");

  historyList.querySelectorAll(".btn-sm").forEach((btn) => {
    btn.addEventListener("click", () => {
      const date = btn.dataset.date;
      const entry = entries.find((e) => e.date === date);
      if (entry) {
        fillForm(entry);
        form.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// ---------- Toast ----------

function showToast(msg) {
  let toast = $(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove("show"), 1800);
}

// ---------- 执行要点 ----------

tipsToggle.addEventListener("click", () => {
  const open = tipsBody.classList.toggle("open");
  tipsToggle.textContent = open ? "📌 执行要点 ▲" : "📌 执行要点 ▼";
});

function renderTips() {
  tipsBody.innerHTML = KEY_TIPS.map(
    (t) => `<div class="tip-item"><strong>${t.title}</strong><p>${t.body}</p></div>`
  ).join("");
}

// ---------- 初始化 ----------

function init() {
  currentPlanDay = getTodayKey();
  renderPlan(currentPlanDay);
  planPrevBtn.addEventListener("click", () => switchPlanDay(-1));
  planNextBtn.addEventListener("click", () => switchPlanDay(1));

  todayPill.textContent = fmtDateCN(new Date());

  renderStats();

  const now = new Date();
  calendarYear = now.getFullYear();
  calendarMonth = now.getMonth();
  renderCalendar(calendarYear, calendarMonth);
  calendarPrevBtn.addEventListener("click", () => switchCalendar(-1));
  calendarNextBtn.addEventListener("click", () => switchCalendar(1));

  resetFormForToday();
  updateProteinPlaceholder();

  const todayStr = fmtDate(new Date());
  const todayEntry = entries.find((e) => e.date === todayStr);
  if (todayEntry) {
    fillForm(todayEntry);
  }

  renderHistory();
  renderTips();
}

init();
