import { getNutriScoreColor, getNovaColor } from '../api/openfoodfacts.js';

const CATEGORY_CONFIG = {
  Beef: {
    icon: 'fa-drumstick-bite',
    badgeStyle: 'background-color: #ef4444;',
    cardStyle: 'background-color: #fef2f2; border-color: #fecaca;',
  },
  Chicken: {
    icon: 'fa-drumstick-bite',
    badgeStyle: 'background-color: #f59e0b;',
    cardStyle: 'background-color: #fffbe6; border-color: #fde68a;',
  },
  Dessert: {
    icon: 'fa-cake-candles',
    badgeStyle: 'background-color: #ec4899;',
    cardStyle: 'background-color: #fdf2f8; border-color: #fbcfe8;',
  },
  Lamb: {
    icon: 'fa-drumstick-bite',
    badgeStyle: 'background-color: #f97316;',
    cardStyle: 'background-color: #fff7ed; border-color: #fed7aa;',
  },
  Miscellaneous: {
    icon: 'fa-bowl-rice',
    badgeStyle: 'background-color: #64748b;',
    cardStyle: 'background-color: #f8fafc; border-color: #e2e8f0;',
  },
  Pasta: {
    icon: 'fa-bowl-food',
    badgeStyle: 'background-color: #f59e0b;',
    cardStyle: 'background-color: #fefce8; border-color: #fef08a;',
  },
  Pork: {
    icon: 'fa-bacon',
    badgeStyle: 'background-color: #ef4444;',
    cardStyle: 'background-color: #fef2f2; border-color: #fecaca;',
  },
  Seafood: {
    icon: 'fa-fish',
    badgeStyle: 'background-color: #0284c7;',
    cardStyle: 'background-color: #f0f9ff; border-color: #bae6fd;',
  },
  Side: {
    icon: 'fa-bowl-rice',
    badgeStyle: 'background-color: #10b981;',
    cardStyle: 'background-color: #ecfdf5; border-color: #a7f3d0;',
  },
  Starter: {
    icon: 'fa-utensils',
    badgeStyle: 'background-color: #06b6d4;',
    cardStyle: 'background-color: #ecfeff; border-color: #a5f3fc;',
  },
  Vegan: {
    icon: 'fa-leaf',
    badgeStyle: 'background-color: #10b981;',
    cardStyle: 'background-color: #ecfdf5; border-color: #a7f3d0;',
  },
  Vegetarian: {
    icon: 'fa-seedling',
    badgeStyle: 'background-color: #84cc16;',
    cardStyle: 'background-color: #f7fee7; border-color: #d9f99d;',
  },
  Breakfast: {
    icon: 'fa-egg',
    badgeStyle: 'background-color: #f59e0b;',
    cardStyle: 'background-color: #fffbe6; border-color: #fde68a;',
  },
  Goat: {
    icon: 'fa-cow',
    badgeStyle: 'background-color: #f97316;',
    cardStyle: 'background-color: #fff7ed; border-color: #fed7aa;',
  },
};

export const NUTRITION_ESTIMATES = {
  Beef: { calories: 520, protein: 38, carbs: 22, fat: 30 },
  Chicken: { calories: 380, protein: 42, carbs: 18, fat: 12 },
  Dessert: { calories: 460, protein: 6, carbs: 72, fat: 18 },
  Lamb: { calories: 490, protein: 35, carbs: 15, fat: 28 },
  Miscellaneous: { calories: 350, protein: 18, carbs: 40, fat: 14 },
  Pasta: { calories: 420, protein: 16, carbs: 62, fat: 12 },
  Pork: { calories: 480, protein: 36, carbs: 12, fat: 28 },
  Seafood: { calories: 310, protein: 40, carbs: 10, fat: 10 },
  Side: { calories: 280, protein: 8, carbs: 48, fat: 8 },
  Starter: { calories: 260, protein: 10, carbs: 28, fat: 12 },
  Vegan: { calories: 290, protein: 12, carbs: 44, fat: 8 },
  Vegetarian: { calories: 320, protein: 14, carbs: 46, fat: 10 },
  Breakfast: { calories: 400, protein: 18, carbs: 50, fat: 16 },
  Goat: { calories: 460, protein: 34, carbs: 16, fat: 24 },
  default: { calories: 380, protein: 22, carbs: 38, fat: 14 },
};

function clamp(val, max) {
  return Math.min(100, Math.round((val / max) * 100));
}

export function renderCategoryCard(category) {
  const name = category.strCategory;
  const config = CATEGORY_CONFIG[name] || {
    icon: 'fa-utensils',
    badgeStyle: 'background-color: #10b981;',
    cardStyle: 'background-color: #ecfdf5; border-color: #a7f3d0;',
  };

  return `
    <div
      class="category-card rounded-2xl p-3 border hover:shadow-sm cursor-pointer transition-all group"
      style="${config.cardStyle}"
      data-category="${name}"
    >
      <div class="flex items-center gap-3">
        <div class="text-white w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs flex-shrink-0" style="${config.badgeStyle}">
          <i class="fa-solid ${config.icon} text-sm"></i>
        </div>
        <div class="min-w-0">
          <h3 class="text-sm font-bold text-gray-900 truncate">${name}</h3>
        </div>
      </div>
    </div>`;
}

export function renderRecipeCard(meal) {
  const category = meal.strCategory || '';
  const area = meal.strArea || '';
  const nutrition = NUTRITION_ESTIMATES[category] || NUTRITION_ESTIMATES.default;
  return `
    <div
      class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      data-meal-id="${meal.idMeal}"
    >
      <div class="relative h-48 overflow-hidden">
        <img
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src="${meal.strMealThumb}"
          alt="${meal.strMeal}"
          loading="lazy"
        />
        <div class="absolute bottom-3 left-3 flex gap-2 flex-wrap">
          ${category ? `<span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${category}</span>` : ''}
          ${area ? `<span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${area}</span>` : ''}
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.strMeal}</h3>
        <p class="text-xs text-gray-500 mb-3">~${nutrition.calories} cal/serving</p>
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-gray-900">
            <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${category || 'Meal'}
          </span>
          <span class="font-semibold text-gray-500">
            <i class="fa-solid fa-globe text-blue-500 mr-1"></i>${area || 'International'}
          </span>
        </div>
      </div>
    </div>`;
}

export function renderIngredientsList(ingredients) {
  if (!ingredients.length) return '<p class="text-gray-500">No ingredients listed.</p>';
  return ingredients
    .map(
      ({ ingredient, measure }) => `
    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
      <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
      <span class="text-gray-700">
        <span class="font-medium text-gray-900">${measure}</span> ${ingredient}
      </span>
    </div>`
    )
    .join('');
}

export function renderInstructionSteps(instructions) {
  if (!instructions) return '<p class="text-gray-500">No instructions available.</p>';

  const steps = instructions
    .split(/\r?\n/)
    .map((s) => s.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter((s) => s.length > 10);

  if (!steps.length) return `<p class="text-gray-700 leading-relaxed">${instructions}</p>`;

  return steps
    .map(
      (step, i) => `
    <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
      <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${i + 1}</div>
      <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
    </div>`
    )
    .join('');
}

export function renderNutritionFacts(nutrition, servings = 4) {
  const perServing = {
    calories: Math.round(nutrition.calories),
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
  };
  const total = {
    calories: perServing.calories * servings,
  };

  const proteinPct = clamp(perServing.protein, 50);
  const carbsPct = clamp(perServing.carbs, 250);
  const fatPct = clamp(perServing.fat, 65);

  return `
    <p class="text-sm text-gray-500 mb-4">Per serving (estimated)</p>
    <div class="text-center py-4 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
      <p class="text-sm text-gray-600">Calories per serving</p>
      <p class="text-4xl font-bold text-emerald-600">${perServing.calories}</p>
      <p class="text-xs text-gray-500 mt-1">Total: ${total.calories} cal</p>
    </div>
    <div class="space-y-4">
      <div>
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span class="text-gray-700">Protein</span>
          </div>
          <span class="font-bold text-gray-900">${perServing.protein}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-emerald-500 h-2 rounded-full transition-all" style="width: ${proteinPct}%"></div>
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-gray-700">Carbs</span>
          </div>
          <span class="font-bold text-gray-900">${perServing.carbs}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full transition-all" style="width: ${carbsPct}%"></div>
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-purple-500"></div>
            <span class="text-gray-700">Fat</span>
          </div>
          <span class="font-bold text-gray-900">${perServing.fat}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-purple-500 h-2 rounded-full transition-all" style="width: ${fatPct}%"></div>
        </div>
      </div>
    </div>`;
}

export function renderProductCard(product) {
  const name = product.product_name || 'Unknown Product';
  const brand = product.brands || '';
  const image = product.image_url || 'https://via.placeholder.com/200x160?text=No+Image';
  const grade = (product.nutriscore_grade || '').toLowerCase();
  const nova = product.nova_group;
  const quantity = product.quantity || '';
  const n = product.nutriments || {};
  const calories = Math.round(n['energy-kcal_100g'] || (n['energy_100g'] || 0) / 4.184 || 0);
  const protein = +(n['proteins_100g'] || 0).toFixed(1);
  const carbs = +(n['carbohydrates_100g'] || 0).toFixed(1);
  const fat = +(n['fat_100g'] || 0).toFixed(1);
  const sugar = +(n['sugars_100g'] || 0).toFixed(1);

  const nutriScoreBg = getNutriScoreColor(grade);
  const novaBg = getNovaColor(nova);

  return `
    <div
      class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      data-barcode="${product.code || ''}"
      data-grade="${grade}"
    >
      <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          src="${image}"
          alt="${name}"
          loading="lazy"
          onerror="this.src='https://placehold.co/200x160/f3f4f6/9ca3af?text=No+Image'"
        />
        ${grade ? `<div class="absolute top-2 left-2 ${nutriScoreBg} text-white text-xs font-bold px-2 py-1 rounded uppercase">Nutri-Score ${grade.toUpperCase()}</div>` : ''}
        ${nova ? `<div class="absolute top-2 right-2 ${novaBg} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${nova}">${nova}</div>` : ''}
      </div>
      <div class="p-4">
        <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${brand}</p>
        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${name}</h3>
        <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
          ${quantity ? `<span><i class="fa-solid fa-weight-scale mr-1"></i>${quantity}</span>` : ''}
          <span><i class="fa-solid fa-fire mr-1"></i>${calories} kcal/100g</span>
        </div>
        <div class="grid grid-cols-4 gap-1 text-center mb-3">
          <div class="bg-emerald-50 rounded p-1.5">
            <p class="text-xs font-bold text-emerald-700">${protein}g</p>
            <p class="text-[10px] text-gray-500">Protein</p>
          </div>
          <div class="bg-blue-50 rounded p-1.5">
            <p class="text-xs font-bold text-blue-700">${carbs}g</p>
            <p class="text-[10px] text-gray-500">Carbs</p>
          </div>
          <div class="bg-purple-50 rounded p-1.5">
            <p class="text-xs font-bold text-purple-700">${fat}g</p>
            <p class="text-[10px] text-gray-500">Fat</p>
          </div>
          <div class="bg-orange-50 rounded p-1.5">
            <p class="text-xs font-bold text-orange-700">${sugar}g</p>
            <p class="text-[10px] text-gray-500">Sugar</p>
          </div>
        </div>
        <button
          class="add-product-to-log w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          data-product='${JSON.stringify({ name, brand, image, calories, protein, carbs, fat }).replace(/'/g, '&#39;')}'
        >
          <i class="fa-solid fa-plus"></i> Add to Food Log
        </button>
      </div>
    </div>`;
}

export function renderLoggedItem(item) {
  const typeIcon = item.type === 'product' ? 'fa-barcode' : 'fa-utensils';
  const typeColor = item.type === 'product' ? 'text-blue-500' : 'text-emerald-500';
  return `
    <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-white transition-colors border border-gray-100" data-log-id="${item.id}">
      <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
        ${item.image
          ? `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''}
        <div class="w-full h-full flex items-center justify-center ${item.image ? 'hidden' : ''}">
          <i class="fa-solid ${typeIcon} ${typeColor}"></i>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-gray-900 text-sm truncate">${item.name}</p>
        <div class="flex gap-3 text-xs text-gray-500 mt-0.5">
          <span class="text-orange-500 font-medium"><i class="fa-solid fa-fire mr-0.5"></i>${item.calories} cal</span>
          <span>P: ${item.protein}g</span>
          <span>C: ${item.carbs}g</span>
          <span>F: ${item.fat}g</span>
        </div>
      </div>
      <button
        class="remove-log-item flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
        data-log-id="${item.id}"
        title="Remove"
      >
        <i class="fa-solid fa-times"></i>
      </button>
    </div>`;
}

export function renderLoadingSpinner() {
  return `
    <div class="col-span-full flex items-center justify-center py-16">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p class="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>`;
}

export function renderEmptyState(message, subtext = '', icon = 'fa-search') {
  return `
    <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid ${icon} text-gray-400 text-2xl"></i>
      </div>
      <p class="text-gray-600 font-medium text-lg">${message}</p>
      ${subtext ? `<p class="text-gray-400 text-sm mt-2">${subtext}</p>` : ''}
    </div>`;
}
