import {
  getTodayLog, sumNutrition, getWeeklyData,
  clearTodayLog, removeFromFoodLog, appState,
} from '../localstorage/localstorage.js';
import { renderLoggedItem, renderEmptyState } from './components.js';
import { navigateTo } from './navigation.js';

const loggedList   = document.getElementById('logged-items-list');
const clearBtn     = document.getElementById('clear-foodlog');
const dateEl       = document.getElementById('foodlog-date');

const MACROS = [
  { key: 'calories', goal: 2000, barId: 'progress-calories', labelId: 'label-calories', unit: 'kcal' },
  { key: 'protein',  goal: 50,   barId: 'progress-protein',  labelId: 'label-protein',  unit: 'g' },
  { key: 'carbs',    goal: 250,  barId: 'progress-carbs',    labelId: 'label-carbs',    unit: 'g' },
  { key: 'fat',      goal: 65,   barId: 'progress-fat',      labelId: 'label-fat',      unit: 'g' },
];

export function renderFoodLog() {
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric',
    });
  }

  const items = getTodayLog();
  const totals = sumNutrition(items);

  updateProgressBars(totals, items.length);

  if (!loggedList) return;
  const countEl = loggedList.closest('.border-t')?.querySelector('h4');
  if (countEl) countEl.textContent = `Logged Items (${items.length})`;

  if (items.length === 0) {
    loggedList.innerHTML = renderEmptyState('No meals logged today', 'Add meals from the Meals page or scan products', 'fa-utensils');
    if (clearBtn) clearBtn.style.display = 'none';
  } else {
    loggedList.innerHTML = items.map(renderLoggedItem).join('');
    if (clearBtn) clearBtn.style.display = '';
    loggedList.querySelectorAll('.remove-log-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.logId;
        removeFromFoodLog(id);
        renderFoodLog();
      });
    });
  }

  renderWeeklyChart();
}

function updateProgressBars(totals, count) {
  const calBar   = document.querySelector('#foodlog-today-section .bg-emerald-50 .bg-emerald-500');
  const calLabel = document.querySelector('#foodlog-today-section .bg-emerald-50 span:last-child');
  if (calBar)   calBar.style.width   = Math.min(100, (totals.calories / appState.goals.calories) * 100) + '%';
  if (calLabel) calLabel.textContent = `${totals.calories} / ${appState.goals.calories} kcal`;

  const proBar   = document.querySelector('#foodlog-today-section .bg-blue-50 .bg-blue-500');
  const proLabel = document.querySelector('#foodlog-today-section .bg-blue-50 span:last-child');
  if (proBar)   proBar.style.width   = Math.min(100, (totals.protein / appState.goals.protein) * 100) + '%';
  if (proLabel) proLabel.textContent = `${totals.protein} / ${appState.goals.protein} g`;

  const crbBar   = document.querySelector('#foodlog-today-section .bg-amber-50 .bg-amber-500');
  const crbLabel = document.querySelector('#foodlog-today-section .bg-amber-50 span:last-child');
  if (crbBar)   crbBar.style.width   = Math.min(100, (totals.carbs / appState.goals.carbs) * 100) + '%';
  if (crbLabel) crbLabel.textContent = `${totals.carbs} / ${appState.goals.carbs} g`;

  const fatBar   = document.querySelector('#foodlog-today-section .bg-purple-50 .bg-purple-500');
  const fatLabel = document.querySelector('#foodlog-today-section .bg-purple-50 span:last-child');
  if (fatBar)   fatBar.style.width   = Math.min(100, (totals.fat / appState.goals.fat) * 100) + '%';
  if (fatLabel) fatLabel.textContent = `${totals.fat} / ${appState.goals.fat} g`;
}

function renderWeeklyChart() {
  const chartEl = document.getElementById('weekly-chart');
  if (!chartEl || !window.Plotly) return;

  const weekData = getWeeklyData();
  const labels = weekData.map((d) => d.label);
  const calories = weekData.map((d) => d.calories);
  const goal = appState.goals.calories;

  Plotly.newPlot(
    chartEl,
    [
      {
        x: labels, y: calories, type: 'bar',
        marker: { color: calories.map((c) => (c > goal ? '#ef4444' : '#10b981')) },
        name: 'Calories',
      },
      {
        x: labels, y: Array(7).fill(goal), type: 'scatter', mode: 'lines',
        line: { color: '#6b7280', dash: 'dot', width: 2 },
        name: 'Daily Goal',
      },
    ],
    {
      margin: { t: 10, r: 10, b: 60, l: 50 },
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      yaxis: { title: 'Calories', gridcolor: '#f3f4f6' },
      legend: { orientation: 'h', y: -0.3 },
      font: { family: 'Inter, sans-serif', size: 11, color: '#374151' },
    },
    { responsive: true, displayModeBar: false }
  );
}

clearBtn?.addEventListener('click', async () => {
  const result = await Swal.fire({
    title: 'Clear Today\'s Log?',
    text: 'This will remove all food items logged today.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, clear it',
  });
  if (result.isConfirmed) {
    clearTodayLog();
    renderFoodLog();
    Swal.fire({ title: 'Cleared!', icon: 'success', timer: 1500, showConfirmButton: false });
  }
});

document.querySelectorAll('.quick-log-btn').forEach((btn) => {
  const text = btn.querySelector('p')?.textContent || '';
  btn.addEventListener('click', () => {
    if (text.includes('Meal'))    navigateTo('meals');
    if (text.includes('Product') || text.includes('Scan')) navigateTo('products');
  });
});
