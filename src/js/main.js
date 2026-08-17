import './ui/navigation.js';
import { renderFoodLog } from './ui/foodlog.js';
import './ui/products.js';
import { loadMealsPage } from './ui/meals.js';
import { navigateTo } from './ui/navigation.js';

async function init() {
  ['meal-details', 'products-section', 'foodlog-section'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  ['search-filters-section', 'meal-categories-section', 'all-recipes-section'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });

  try {
    renderFoodLog();
    await loadMealsPage();
  } catch (err) {
    console.error('Initialisation error:', err);
  } finally {
    const overlay = document.getElementById('app-loading-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.style.display = 'none', 500);
    }
  }
}

init();
