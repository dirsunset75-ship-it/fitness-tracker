/* ================================================================
   本地存储工具
   ================================================================ */

const STORAGE_KEY = "fitness-tracker-entries";
const CUSTOM_DIET_KEY = "fitness-custom-diets";

const app = getApp();

function loadEntries() {
  return app.globalData.entries || [];
}

function saveEntries(entries) {
  app.saveEntries(entries);
}

function loadCustomDiets() {
  return app.globalData.customDiets || {};
}

function saveCustomDiets(diets) {
  app.saveCustomDiets(diets);
}

module.exports = {
  loadEntries,
  saveEntries,
  loadCustomDiets,
  saveCustomDiets,
  STORAGE_KEY,
  CUSTOM_DIET_KEY,
};
