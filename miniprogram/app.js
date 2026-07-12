App({
  onLaunch() {
    // 从本地存储加载数据到全局
    const entries = wx.getStorageSync('fitness-tracker-entries') || [];
    const customDiets = wx.getStorageSync('fitness-custom-diets') || {};
    this.globalData.entries = entries;
    this.globalData.customDiets = customDiets;
  },

  globalData: {
    entries: [],
    customDiets: {}
  },

  // 工具方法：保存并同步
  saveEntries(entries) {
    this.globalData.entries = entries;
    wx.setStorageSync('fitness-tracker-entries', entries);
  },

  saveCustomDiets(diets) {
    this.globalData.customDiets = diets;
    wx.setStorageSync('fitness-custom-diets', diets);
  }
});
