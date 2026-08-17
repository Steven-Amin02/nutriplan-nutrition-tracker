import {
  fetch25Meals, fetchCategories, fetchAreas,
  searchMeals, filterByCategory, filterByArea,
  fetchMealById, extractIngredients, getYoutubeEmbedUrl,
} from '../api/mealdb.js';
import { appState, addToFoodLog } from '../localstorage/localstorage.js';
import {
  renderCategoryCard, renderRecipeCard,
  renderIngredientsList, renderInstructionSteps,
  renderNutritionFacts, renderLoadingSpinner, renderEmptyState,
  NUTRITION_ESTIMATES,
} from './components.js';
import { navigateTo } from './navigation.js';
import { renderFoodLog } from './foodlog.js';

const categoriesGrid = document.getElementById('categories-grid');
const recipesGrid    = document.getElementById('recipes-grid');
const recipesCount   = document.getElementById('recipes-count');
const searchInput    = document.getElementById('search-input');
const filterBtns     = document.querySelectorAll('#search-filters-section button');

export async function loadMealsPage() {
  recipesGrid.innerHTML = renderLoadingSpinner();
  categoriesGrid.innerHTML = '<div class="col-span-6 flex justify-center py-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>';

  try {
    const [meals, categories, areas] = await Promise.all([
      fetch25Meals(),
      fetchCategories(),
      fetchAreas(),
    ]);

    const TARGET_CATEGORIES = [
      'Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous', 'Pasta',
      'Pork', 'Seafood', 'Side', 'Starter', 'Vegan', 'Vegetarian'
    ];

    const categoryList = TARGET_CATEGORIES.map((name) => {
      const found = categories.find((c) => (c.strCategory || c.name || '').toLowerCase() === name.toLowerCase());
      return found || { strCategory: name, name };
    });

    categoriesGrid.innerHTML = categoryList.map((c) => renderCategoryCard(c)).join('');
    attachCategoryListeners();
    buildAreaFilters(areas);

    appState.displayedMeals = meals;
    renderMealsGrid(meals);

  } catch (err) {
    recipesGrid.innerHTML = renderEmptyState('Failed to load meals', 'Check your connection and refresh', 'fa-exclamation-triangle');
    categoriesGrid.innerHTML = '';
    console.error(err);
  }
}

function renderMealsGrid(meals) {
  if (!recipesGrid) return;
  if (!meals || meals.length === 0) {
    recipesGrid.innerHTML = renderEmptyState('No recipes found', 'Try a different search term or filter', 'fa-search');
    if (recipesCount) recipesCount.textContent = '0 recipes found';
    return;
  }
  recipesGrid.innerHTML = meals.map(renderRecipeCard).join('');
  if (recipesCount) recipesCount.textContent = `Showing ${meals.length} recipe${meals.length !== 1 ? 's' : ''}`;

  recipesGrid.querySelectorAll('.recipe-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.mealId;
      loadMealDetails(id);
    });
  });
}

function attachCategoryListeners() {
  categoriesGrid.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', async () => {
      const category = card.dataset.category;

      if (appState.activeFilter.type === 'category' && appState.activeFilter.value === category) {
        appState.activeFilter = { type: null, value: null };
        setActiveFilterUI(null, null);
        await reloadDefault();
        return;
      }

      appState.activeFilter = { type: 'category', value: category };
      setActiveFilterUI('category', category);

      recipesGrid.innerHTML = renderLoadingSpinner();
      try {
        const meals = await filterByCategory(category);
        appState.displayedMeals = meals;
        renderMealsGrid(meals);
      } catch {
        recipesGrid.innerHTML = renderEmptyState('Failed to filter', '', 'fa-exclamation-triangle');
      }
    });
  });
}

function buildAreaFilters(areas) {
  const container = document.querySelector('#search-filters-section .flex.items-center.gap-3');
  if (!container || !areas.length) return;

  const allBtn = container.querySelector('button:first-child');
  container.innerHTML = '';
  if (allBtn) container.appendChild(allBtn);

  const topAreas = areas.slice(0, 12);
  topAreas.forEach(({ strArea }) => {
    const btn = document.createElement('button');
    btn.dataset.area = strArea;
    btn.className = 'area-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all';
    btn.textContent = strArea;
    container.appendChild(btn);
    btn.addEventListener('click', () => handleAreaFilter(strArea, btn));
  });

  allBtn?.addEventListener('click', async () => {
    appState.activeFilter = { type: null, value: null };
    setActiveFilterUI(null, null);
    await reloadDefault();
  });
}

async function handleAreaFilter(area, clickedBtn) {
  if (appState.activeFilter.type === 'area' && appState.activeFilter.value === area) {
    appState.activeFilter = { type: null, value: null };
    setActiveFilterUI(null, null);
    await reloadDefault();
    return;
  }
  appState.activeFilter = { type: 'area', value: area };
  setActiveFilterUI('area', area);

  recipesGrid.innerHTML = renderLoadingSpinner();
  try {
    const meals = await filterByArea(area);
    appState.displayedMeals = meals;
    renderMealsGrid(meals);
  } catch {
    recipesGrid.innerHTML = renderEmptyState('Failed to filter', '', 'fa-exclamation-triangle');
  }
}

function setActiveFilterUI(type, value) {
  document.querySelectorAll('.area-filter-btn').forEach((b) => {
    const isActive = type === 'area' && b.dataset.area === value;
    b.className = isActive
      ? 'area-filter-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap transition-all'
      : 'area-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all';
  });

  categoriesGrid?.querySelectorAll('.category-card').forEach((c) => {
    const isActive = type === 'category' && c.dataset.category === value;
    c.classList.toggle('active', isActive);
  });
}

async function reloadDefault() {
  recipesGrid.innerHTML = renderLoadingSpinner();
  try {
    const meals = await fetch25Meals();
    appState.displayedMeals = meals;
    renderMealsGrid(meals);
  } catch {
    recipesGrid.innerHTML = renderEmptyState('Failed to load meals', '', 'fa-exclamation-triangle');
  }
}

let searchTimeout;
searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const q = searchInput.value.trim();

  if (!q) {
    appState.activeFilter = { type: null, value: null };
    setActiveFilterUI(null, null);
    reloadDefault();
    return;
  }

  searchTimeout = setTimeout(async () => {
    recipesGrid.innerHTML = renderLoadingSpinner();
    try {
      const meals = await searchMeals(q);
      appState.displayedMeals = meals;
      renderMealsGrid(meals);
    } catch {
      recipesGrid.innerHTML = renderEmptyState('Search failed', '', 'fa-exclamation-triangle');
    }
  }, 450);
});

export async function loadMealDetails(mealId) {
  appState.currentMealId = mealId;
  navigateTo('details');

  const detailSection = document.getElementById('meal-details');
  if (!detailSection) return;

  const heroImg  = detailSection.querySelector('img');
  if (heroImg) heroImg.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  try {
    const meal = await fetchMealById(mealId);
    if (!meal) throw new Error('Meal not found');
    renderMealDetails(meal, detailSection);
  } catch (err) {
    detailSection.innerHTML = `<div class="text-center py-16 text-red-500"><i class="fa-solid fa-exclamation-triangle text-4xl mb-4"></i><p>Failed to load meal details.</p></div>`;
    console.error(err);
  }
}

function renderMealDetails(meal, section) {
  const nutrition = NUTRITION_ESTIMATES[meal.strCategory] || NUTRITION_ESTIMATES.default;
  const ingredients = extractIngredients(meal);
  const embedUrl = getYoutubeEmbedUrl(meal.strYoutube);

  const heroImg = section.querySelector('.relative.h-80 img, .relative.h-96 img, .relative img');
  if (heroImg) { heroImg.src = meal.strMealThumb; heroImg.alt = meal.strMeal; }

  const heroTitle = section.querySelector('h1');
  if (heroTitle) heroTitle.textContent = meal.strMeal;

  const badgeContainer = section.querySelector('.absolute.bottom-0 .flex.items-center.gap-3');
  if (badgeContainer) {
    badgeContainer.innerHTML = `
      ${meal.strCategory ? `<span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.strCategory}</span>` : ''}
      ${meal.strArea ? `<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.strArea}</span>` : ''}
      ${meal.strTags ? meal.strTags.split(',').slice(0,1).map(t=>`<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${t.trim()}</span>`).join('') : ''}`;
  }

  const heroCalEl = section.querySelector('#hero-calories');
  if (heroCalEl) heroCalEl.textContent = `${nutrition.calories} cal/serving`;

  const logBtn = section.querySelector('#log-meal-btn');
  if (logBtn) {
    logBtn.dataset.mealId = meal.idMeal;
    const newBtn = logBtn.cloneNode(true);
    logBtn.parentNode.replaceChild(newBtn, logBtn);
    newBtn.addEventListener('click', async () => {
      addToFoodLog({
        name: meal.strMeal,
        image: meal.strMealThumb,
        type: 'meal',
        ...nutrition,
      });
      renderFoodLog();
      await Swal.fire({
        title: '🍽️ Meal Logged!',
        html: `<b>${meal.strMeal}</b> has been added to your Food Log.<br><span class="text-sm text-gray-500">${nutrition.calories} cal • ${nutrition.protein}g protein</span>`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'View Food Log',
        showCancelButton: true,
        cancelButtonText: 'Stay Here',
      }).then((res) => { if (res.isConfirmed) navigateTo('foodlog', renderFoodLog); });
    });
  }

  const ingGrid = section.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-3');
  if (ingGrid) ingGrid.innerHTML = renderIngredientsList(ingredients);

  const ingCount = section.querySelector('h2 span.text-sm');
  if (ingCount) ingCount.textContent = `${ingredients.length} items`;

  const stepsContainer = section.querySelector('.space-y-4');
  if (stepsContainer) stepsContainer.innerHTML = renderInstructionSteps(meal.strInstructions);

  const iframe = section.querySelector('iframe');
  if (iframe) {
    if (embedUrl) {
      iframe.src = embedUrl;
      iframe.closest('.relative')?.parentElement?.classList.remove('hidden');
    } else {
      iframe.closest('.bg-white.rounded-2xl.shadow-lg')?.classList.add('hidden');
    }
  }

  const nutritionContainer = section.querySelector('#nutrition-facts-container');
  if (nutritionContainer) nutritionContainer.innerHTML = renderNutritionFacts(nutrition);
}

document.getElementById('back-to-meals-btn')?.addEventListener('click', () => {
  navigateTo('meals');
});
