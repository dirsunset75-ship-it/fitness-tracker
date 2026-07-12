/* ================================================================
   首页逻辑 — 每日健身饮食打卡助手 微信小程序版
   ================================================================ */

const planUtils = require('../../utils/plan');
const storage = require('../../utils/storage');

const {
  WEEKLY_PLAN, DAILY_GOALS, KEY_TIPS,
  toChineseDay, getTodayKey, getMondayOfWeek,
  fmtDate, fmtDateCN, planKey, getDateForDayKey,
  fmtDayKeyLabel, calcTotalWeight, fmtWeight, getProteinTarget,
} = planUtils;

Page({
  data: {
    // 头部
    todayPill: '',

    // 计划
    currentDayKey: 1,
    planLabel: '',
    planPrevDimmed: false,
    trainingCard: {},
    dietCard: {},
    proteinDisplay: '',
    proteinSub: '',
    proteinPlaceholder: '',

    // 统计
    stats: {
      trainRate: '0/7',
      dietRate: '0/7',
      avgProtein: '—',
      avgWater: '—',
      weightTrend: '需周一称重',
      guitar: '—',
      trendTrain: '—',
      trendProtein: '—',
    },

    // 日历
    calendarYear: 0,
    calendarMonth: 0,
    calendarTitle: '',
    calendarCells: [],

    // 表单
    recordDate: '',
    weight: '',
    protein: '',
    water: '',
    workoutDone: false,
    dietDone: false,
    proteinShake: false,
    kegelDone: 0,
    guitarPractice: '',
    note: '',

    // 表格
    thSets: '组数',
    thReps: '次数',
    thLast: '重量 (kg)',
    trainingRecords: [],

    // 历史
    historyList: [],

    // 要点
    tipsOpen: false,
    tips: KEY_TIPS,
  },

  /* ================================================================
     生命周期
     ================================================================ */
  onLoad() {
    this.refreshAll();
  },

  onShow() {
    // 每次回到页面时刷新数据（可能从其他页回来）
    this.refreshAll();
  },

  /* ================================================================
     全量刷新
     ================================================================ */
  refreshAll() {
    const entries = storage.loadEntries();
    const dayKey = getTodayKey();
    const todayStr = fmtDate(new Date());

    this.setData({
      currentDayKey: dayKey,
      todayPill: fmtDateCN(new Date()),
      calendarYear: new Date().getFullYear(),
      calendarMonth: new Date().getMonth(),
    });

    this.renderPlan(dayKey);
    this.renderStats(entries);
    this.renderCalendar(this.data.calendarYear, this.data.calendarMonth, entries);
    this.renderHistory(entries);
    this.resetFormForToday(entries);

    // 如果今天已有记录，自动填入
    const todayEntry = entries.find(e => e.date === todayStr);
    if (todayEntry) {
      this.fillForm(todayEntry);
    }
  },

  /* ================================================================
     计划面板
     ================================================================ */
  renderPlan(dayKey) {
    const pk = planKey(dayKey);
    const plan = WEEKLY_PLAN[pk];
    if (!plan) return;

    const todayStr = fmtDate(new Date());
    const dateForThis = getDateForDayKey(dayKey);
    const isToday = dateForThis === todayStr;
    const label = fmtDayKeyLabel(dayKey) + (isToday ? ' （今天）' : '');

    // 训练卡片
    const t = plan.training;
    const trainingCard = {
      location: t.location,
      duration: t.duration,
      warmup: t.warmup,
      stretch: t.stretch,
      exercises: t.exercises.map(ex => {
        const detail = t.type === 'cardio'
          ? `${ex.weight} 分钟`
          : `${ex.sets} 组 × ${ex.reps} 次 · ${ex.weight > 0 ? ex.weight + 'kg' : '自重'}`;
        return { name: ex.name, detail };
      }),
    };

    // 饮食卡片
    const d = plan.diet;
    const customDiets = storage.loadCustomDiets();
    const cd = customDiets[pk] || {};
    const meals = [
      { icon: '🌅', label: '早餐', key: 'breakfast', val: cd.breakfast || d.breakfast },
      { icon: '🌞', label: '午餐', key: 'lunch', val: cd.lunch || d.lunch },
      { icon: '💪', label: '练后', key: 'postWorkout', val: cd.postWorkout || d.postWorkout },
      { icon: '🌙', label: '晚餐', key: 'dinner', val: cd.dinner || d.dinner },
    ];
    const dietCard = { mode: d.mode, meals };

    // 蛋白质目标
    const entries = storage.loadEntries();
    const proteinTarget = getProteinTarget(entries);
    const proteinDisplay = proteinTarget ? `${proteinTarget}g` : '请先记录体重';
    const proteinSub = proteinTarget ? `${(proteinTarget / 1.4).toFixed(1)}kg × 1.4` : '';
    const proteinPlaceholder = proteinTarget
      ? `目标 ${proteinTarget}g`
      : '请先记录体重';

    this.setData({
      currentDayKey: dayKey,
      planLabel: label,
      planPrevDimmed: dayKey === 1,
      trainingCard,
      dietCard,
      proteinDisplay,
      proteinSub,
      proteinPlaceholder,
    });
  },

  onPlanPrev() {
    const newDay = this.data.currentDayKey - 1;
    if (newDay < 1) return;
    this.renderPlan(newDay);
    this.syncFormToPlanDay(newDay);
  },

  onPlanNext() {
    const newDay = this.data.currentDayKey + 1;
    this.renderPlan(newDay);
    this.syncFormToPlanDay(newDay);
  },

  /** 切换计划天时同步表单 */
  syncFormToPlanDay(dayKey) {
    const dateForDay = getDateForDayKey(dayKey);
    const entries = storage.loadEntries();
    const existing = entries.find(e => e.date === dateForDay);
    if (existing) {
      this.fillForm(existing);
    } else {
      this.setData({ recordDate: dateForDay });
      this.resetFormFields();
      this.populateTrainingTable(planKey(dayKey));
    }
  },

  /** 饮食编辑失焦 */
  onDietBlur(e) {
    const meal = e.currentTarget.dataset.meal;
    const text = (e.detail.value || '').trim();
    const pk = planKey(this.data.currentDayKey);
    const customDiets = storage.loadCustomDiets();
    if (!customDiets[pk]) customDiets[pk] = {};
    if (text) {
      customDiets[pk][meal] = text;
    } else {
      delete customDiets[pk][meal];
      if (!Object.keys(customDiets[pk]).length) delete customDiets[pk];
    }
    storage.saveCustomDiets(customDiets);
  },

  /* ================================================================
     统计
     ================================================================ */
  renderStats(entries) {
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

    const thisWeek = entries.filter(e => e.date >= mondayStr && e.date <= sundayStr);
    const lastWeek = entries.filter(e => e.date >= lastMondayStr && e.date <= lastSundayStr);

    const trainDone = thisWeek.filter(e => e.workoutDone).length;
    const dietOk = thisWeek.filter(e => e.dietDone).length;

    const avg = (arr, key) => {
      const vals = arr.map(e => parseFloat(e[key])).filter(v => !isNaN(v) && v > 0);
      if (!vals.length) return null;
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    };

    const avgProtein = avg(thisWeek, 'protein');
    const avgWater = avg(thisWeek, 'water');
    const guitarTotal = thisWeek.reduce((sum, e) => sum + (parseInt(e.guitarPractice) || 0), 0);

    // 体重趋势
    const thisMonEntry = thisWeek.find(e => e.date === mondayStr);
    const lastMonEntry = lastWeek.find(e => e.date === lastMondayStr);
    let weightTrend = '需周一称重';
    if (thisMonEntry && thisMonEntry.weight && lastMonEntry && lastMonEntry.weight) {
      const diff = parseFloat(thisMonEntry.weight) - parseFloat(lastMonEntry.weight);
      const sign = diff > 0 ? '+' : '';
      const arrow = diff < 0 ? '📉' : diff > 0 ? '📈' : '➡️';
      weightTrend = `${arrow} ${sign}${diff.toFixed(1)} kg`;
    }

    const lastAvgProtein = avg(lastWeek, 'protein');
    const lastTrainDone = lastWeek.filter(e => e.workoutDone).length;

    const compare = (cur, prev) => {
      if (cur === null || prev === null) return '—';
      if (cur > prev) return '↑';
      if (cur < prev) return '↓';
      return '→';
    };

    this.setData({
      stats: {
        trainRate: `${trainDone}/7`,
        dietRate: `${dietOk}/7`,
        avgProtein: avgProtein !== null ? `${avgProtein} g` : '—',
        avgWater: avgWater !== null ? `${avgWater} L` : '—',
        weightTrend,
        guitar: guitarTotal > 0 ? `${guitarTotal} min` : '—',
        trendTrain: compare(trainDone, lastTrainDone),
        trendProtein: compare(avgProtein, lastAvgProtein),
      },
    });
  },

  /* ================================================================
     日历
     ================================================================ */
  renderCalendar(year, month, entries) {
    const monthNames = ['1 月','2 月','3 月','4 月','5 月','6 月','7 月','8 月','9 月','10 月','11 月','12 月'];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const totalDays = lastDay.getDate();

    const recordMap = {};
    entries.forEach(e => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        recordMap[e.date] = e;
      }
    });

    const todayStr = fmtDate(new Date());
    const cells = [];

    // 表头
    ['一','二','三','四','五','六','日'].forEach((d, i) => {
      cells.push({ key: `h${i}`, cls: 'cal-header', isDay: false, dateStr: '', day: d });
    });

    // 空白填充
    for (let i = 0; i < startOffset; i++) {
      cells.push({ key: `e${i}`, cls: 'cal-empty', isDay: false, dateStr: '' });
    }

    // 日期
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const rec = recordMap[dateStr];
      const isToday = dateStr === todayStr;
      const isDone = rec && rec.workoutDone;
      const hasRecord = !!rec;

      const totalW = rec ? calcTotalWeight(rec.trainingRecords) : 0;
      const proteinVal = rec && rec.protein ? parseFloat(rec.protein) : 0;
      const guitarVal = rec && rec.guitarPractice ? parseInt(rec.guitarPractice) : 0;

      let cls = 'cal-day';
      if (isToday) cls += ' cal-today';
      if (isDone) cls += ' cal-done';
      else if (hasRecord) cls += ' cal-has-record';

      cells.push({
        key: `d${day}`,
        cls,
        isDay: true,
        dateStr,
        day,
        weightDisplay: totalW > 0 ? fmtWeight(totalW) : '',
        proteinDisplay: proteinVal > 0 ? `${Math.round(proteinVal)}g` : '',
        guitarDisplay: guitarVal > 0 ? `🎸${guitarVal}分` : '',
      });
    }

    this.setData({
      calendarYear: year,
      calendarMonth: month,
      calendarTitle: `${year} 年 ${monthNames[month]}`,
      calendarCells: cells,
    });
  },

  onCalendarPrev() {
    let m = this.data.calendarMonth - 1;
    let y = this.data.calendarYear;
    if (m < 0) { m = 11; y--; }
    this.renderCalendar(y, m, storage.loadEntries());
  },

  onCalendarNext() {
    let m = this.data.calendarMonth + 1;
    let y = this.data.calendarYear;
    if (m > 11) { m = 0; y++; }
    this.renderCalendar(y, m, storage.loadEntries());
  },

  onCalendarCellTap(e) {
    if (!e.currentTarget.dataset.isday) return;
    const date = e.currentTarget.dataset.date;
    const entries = storage.loadEntries();
    const entry = entries.find(e => e.date === date);
    if (entry) {
      this.fillForm(entry);
    } else {
      this.setData({ recordDate: date });
      this.resetFormFields();
      const d = new Date(date);
      this.populateTrainingTable(toChineseDay(d.getDay()));
    }
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

  /* ================================================================
     训练表格
     ================================================================ */
  populateTrainingTable(dayPk) {
    const plan = WEEKLY_PLAN[dayPk];
    if (!plan) return;

    const isCardio = plan.training.type === 'cardio';
    const lastColLabel = isCardio ? '时间 (分钟)' : '重量 (kg)';

    const records = plan.training.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets,
      reps: String(ex.reps),
      repsInt: parseInt(ex.reps) || ex.reps,
      weight: ex.weight,
    }));

    this.setData({
      thSets: '组数',
      thReps: '次数',
      thLast: lastColLabel,
      trainingRecords: records,
    });
  },

  onTrainingInput(e) {
    const { idx, field } = e.currentTarget.dataset;
    const value = e.detail.value;
    const records = this.data.trainingRecords;
    records[idx][field] = value;
    if (field === 'reps') {
      records[idx].repsInt = parseInt(value) || value;
    }
    this.setData({ trainingRecords: records });
  },

  onThSetsInput(e) { this.setData({ thSets: e.detail.value }); },
  onThRepsInput(e) { this.setData({ thReps: e.detail.value }); },
  onThLastInput(e) { this.setData({ thLast: e.detail.value }); },

  /** 读取训练记录 */
  getTrainingRecords() {
    return this.data.trainingRecords.map(r => ({
      name: r.name,
      sets: r.sets,
      reps: r.reps,
      weight: parseFloat(r.weight) || 0,
    }));
  },

  /** 用已有数据填充训练表格 */
  setTrainingRecords(records) {
    if (!records || !records.length) return;
    const current = this.data.trainingRecords;
    records.forEach((r, i) => {
      if (i < current.length) {
        current[i].name = r.name || current[i].name;
        current[i].sets = r.sets || current[i].sets;
        current[i].reps = r.reps || current[i].reps;
        current[i].repsInt = parseInt(r.reps) || r.reps;
        current[i].weight = r.weight || current[i].weight;
      }
    });
    this.setData({ trainingRecords: current });
  },

  /* ================================================================
     表单
     ================================================================ */
  resetFormFields() {
    this.setData({
      weight: '',
      protein: '',
      water: '',
      workoutDone: false,
      dietDone: false,
      proteinShake: false,
      kegelDone: 0,
      guitarPractice: '',
      note: '',
      thSets: '组数',
      thReps: '次数',
      thLast: '重量 (kg)',
    });
  },

  resetFormForToday(entries) {
    const todayStr = fmtDate(new Date());
    this.setData({ recordDate: todayStr });
    this.resetFormFields();
    this.populateTrainingTable(getTodayKey());
  },

  fillForm(item) {
    const d = new Date(item.date);
    // 先重置表格模板
    this.populateTrainingTable(toChineseDay(d.getDay()));

    // 水位转 ml 显示
    let waterDisplay = '';
    if (item.water) {
      waterDisplay = String(Math.round(parseFloat(item.water) * 1000));
    }

    // kegel 兼容
    const kv = item.kegelDone;
    const kegelVal = (typeof kv === 'boolean') ? (kv ? 3 : 0) : (parseInt(kv) || 0);

    this.setData({
      recordDate: item.date,
      weight: item.weight || '',
      protein: item.protein || '',
      water: waterDisplay,
      workoutDone: !!item.workoutDone,
      dietDone: !!item.dietDone,
      proteinShake: !!item.proteinShake,
      kegelDone: kegelVal,
      guitarPractice: item.guitarPractice || '',
      note: item.note || '',
    });

    // 设置表头
    if (item.headerLabels) {
      const hl = item.headerLabels;
      this.setData({
        thSets: hl.sets || '组数',
        thReps: hl.reps || '次数',
        thLast: hl.last || '重量 (kg)',
      });
    }

    // 设置训练记录
    if (item.trainingRecords && item.trainingRecords.length) {
      this.setTrainingRecords(item.trainingRecords);
    }
  },

  /* ====== 表单输入事件 ====== */
  onDateChange(e) {
    const date = e.detail.value;
    const entries = storage.loadEntries();
    const existing = entries.find(e => e.date === date);
    if (existing) {
      this.fillForm(existing);
    } else {
      this.setData({ recordDate: date });
      this.resetFormFields();
      const d = new Date(date);
      this.populateTrainingTable(toChineseDay(d.getDay()));
    }
  },

  onWeightInput(e) { this.setData({ weight: e.detail.value }); },
  onProteinInput(e) { this.setData({ protein: e.detail.value }); },
  onWaterInput(e) { this.setData({ water: e.detail.value }); },
  onGuitarInput(e) { this.setData({ guitarPractice: e.detail.value }); },
  onKegelInput(e) { this.setData({ kegelDone: parseInt(e.detail.value) || 0 }); },
  onNoteInput(e) { this.setData({ note: e.detail.value }); },

  onWorkoutDoneChange(e) { this.setData({ workoutDone: !!e.detail.value.length }); },
  onDietDoneChange(e) { this.setData({ dietDone: !!e.detail.value.length }); },
  onProteinShakeChange(e) { this.setData({ proteinShake: !!e.detail.value.length }); },

  /* ====== 保存 ====== */
  onSave() {
    const date = this.data.recordDate;
    if (!date) {
      wx.showToast({ title: '请先选择日期', icon: 'none' });
      return;
    }

    const waterL = this.data.water
      ? (parseFloat(this.data.water) / 1000).toFixed(2)
      : '';

    const item = {
      date,
      weight: this.data.weight,
      protein: this.data.protein,
      water: waterL,
      workoutDone: this.data.workoutDone,
      dietDone: this.data.dietDone,
      proteinShake: this.data.proteinShake,
      kegelDone: parseInt(this.data.kegelDone) || 0,
      guitarPractice: this.data.guitarPractice,
      headerLabels: {
        sets: this.data.thSets,
        reps: this.data.thReps,
        last: this.data.thLast,
      },
      trainingRecords: this.getTrainingRecords(),
      note: this.data.note,
    };

    const entries = storage.loadEntries();
    const index = entries.findIndex(e => e.date === item.date);
    if (index >= 0) {
      entries[index] = item;
    } else {
      entries.push(item);
    }

    storage.saveEntries(entries);

    // 全量刷新
    this.renderPlan(this.data.currentDayKey);
    this.renderStats(entries);
    this.renderCalendar(this.data.calendarYear, this.data.calendarMonth, entries);
    this.renderHistory(entries);
    this.resetFormForToday(entries);

    wx.showToast({ title: '✅ 数据已保存', icon: 'none', duration: 1500 });

    // 如果保存的日期是今天，重回今天表单
    const todayStr = fmtDate(new Date());
    if (date !== todayStr) {
      this.setData({ recordDate: todayStr });
    }
  },

  /* ================================================================
     历史记录
     ================================================================ */
  renderHistory(entries) {
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

    const list = sorted.map(item => {
      const dayKey = toChineseDay(new Date(item.date).getDay());
      const plan = WEEKLY_PLAN[dayKey];
      const dayLabel = plan
        ? `${item.date} · ${plan.dayName} ${plan.label}`
        : item.date;

      const totalW = calcTotalWeight(item.trainingRecords);
      const totalWeightDisplay = totalW > 0 ? fmtWeight(totalW) : '';
      const guitarInfo = item.guitarPractice ? `${item.guitarPractice} min` : '';
      const kegelCount = (typeof item.kegelDone === 'boolean')
        ? (item.kegelDone ? 3 : 0)
        : (parseInt(item.kegelDone) || 0);

      return {
        date: item.date,
        dayLabel,
        weight: item.weight || '',
        protein: item.protein || '',
        water: item.water || '',
        totalWeight: totalW,
        totalWeightDisplay,
        guitarInfo,
        workoutDone: !!item.workoutDone,
        dietDone: !!item.dietDone,
        proteinShake: !!item.proteinShake,
        kegelCount,
        note: item.note || '',
      };
    });

    this.setData({ historyList: list });
  },

  onEditHistory(e) {
    const date = e.currentTarget.dataset.date;
    const entries = storage.loadEntries();
    const entry = entries.find(e => e.date === date);
    if (entry) {
      this.fillForm(entry);
      wx.pageScrollTo({ scrollTop: 0, duration: 300 });
    }
  },

  /* ================================================================
     执行要点
     ================================================================ */
  onToggleTips() {
    this.setData({ tipsOpen: !this.data.tipsOpen });
  },
});
