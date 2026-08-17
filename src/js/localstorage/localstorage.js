export const appState = {
  currentPage: 'meals',
  currentMealId: null,
  searchQuery: '',
  activeFilter: {
    type: null,
    value: null,
  },
  displayedMeals: [],
  displayedProducts: [],
  activeNutriScoreFilter: '',
  goals: {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
  },
};

const LS_KEY = 'nutriplan_food_log';

export function loadFoodLog() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveFoodLog(log) {
  localStorage.setItem(LS_KEY, JSON.stringify(log));
}

export function addToFoodLog(entry) {
  const log = loadFoodLog();
  const today = getTodayDateStr();
  log.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: entry.type || 'meal',
    name: entry.name,
    image: entry.image || '',
    date: today,
    calories: entry.calories || 0,
    protein: entry.protein || 0,
    carbs: entry.carbs || 0,
    fat: entry.fat || 0,
    loggedAt: Date.now(),
  });
  saveFoodLog(log);
}

export function removeFromFoodLog(id) {
  const log = loadFoodLog().filter((item) => item.id !== id);
  saveFoodLog(log);
}

export function clearTodayLog() {
  const today = getTodayDateStr();
  const log = loadFoodLog().filter((item) => item.date !== today);
  saveFoodLog(log);
}

export function getTodayLog() {
  const today = getTodayDateStr();
  return loadFoodLog().filter((item) => item.date === today);
}

export function getWeeklyData() {
  const log = loadFoodLog();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayEntries = log.filter((item) => item.date === dateStr);
    days.push({
      date: dateStr,
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      calories: dayEntries.reduce((sum, e) => sum + (e.calories || 0), 0),
      protein: +dayEntries.reduce((sum, e) => sum + (e.protein || 0), 0).toFixed(1),
      carbs: +dayEntries.reduce((sum, e) => sum + (e.carbs || 0), 0).toFixed(1),
      fat: +dayEntries.reduce((sum, e) => sum + (e.fat || 0), 0).toFixed(1),
    });
  }
  return days;
}

export function getTodayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export function sumNutrition(entries) {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein: +(acc.protein + (e.protein || 0)).toFixed(1),
      carbs: +(acc.carbs + (e.carbs || 0)).toFixed(1),
      fat: +(acc.fat + (e.fat || 0)).toFixed(1),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
