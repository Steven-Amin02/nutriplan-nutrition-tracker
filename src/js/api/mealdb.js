const BASE_URL = 'https://nutriplan-api.vercel.app/api';

async function apiGet(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function normalizeMeal(meal) {
  if (!meal) return null;
  return {
    ...meal,
    idMeal: meal.id || meal.idMeal,
    id: meal.id || meal.idMeal,
    strMeal: meal.name || meal.strMeal,
    name: meal.name || meal.strMeal,
    strCategory: meal.category || meal.strCategory,
    category: meal.category || meal.strCategory,
    strArea: meal.area || meal.strArea,
    area: meal.area || meal.strArea,
    strMealThumb: meal.thumbnail || meal.strMealThumb,
    thumbnail: meal.thumbnail || meal.strMealThumb,
    strYoutube: meal.youtube || meal.strYoutube || '',
    youtube: meal.youtube || meal.strYoutube || '',
    strInstructions: Array.isArray(meal.instructions) ? meal.instructions.join('\n') : (meal.strInstructions || ''),
    instructions: Array.isArray(meal.instructions) ? meal.instructions : (meal.strInstructions ? meal.strInstructions.split('\r\n').filter(Boolean) : []),
    ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : extractIngredients(meal),
  };
}

function normalizeCategory(cat) {
  if (!cat) return null;
  return {
    ...cat,
    strCategory: cat.name || cat.strCategory,
    name: cat.name || cat.strCategory,
    strCategoryThumb: cat.thumbnail || cat.strCategoryThumb,
    thumbnail: cat.thumbnail || cat.strCategoryThumb,
  };
}

function normalizeArea(area) {
  if (!area) return null;
  return {
    ...area,
    strArea: area.name || area.strArea,
    name: area.name || area.strArea,
  };
}

export async function fetchCategories() {
  try {
    const data = await apiGet('/meals/categories');
    const categories = data.results || data.categories || [];
    return categories.map(normalizeCategory);
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

export async function fetchAreas() {
  try {
    const data = await apiGet('/meals/areas');
    const areas = data.results || data.meals || [];
    return areas.map(normalizeArea);
  } catch (err) {
    console.error('Failed to fetch areas:', err);
    return [];
  }
}

export async function searchMeals(query) {
  try {
    const data = await apiGet(`/meals/search?q=${encodeURIComponent(query)}`);
    const meals = data.results || data.meals || [];
    return meals.map(normalizeMeal);
  } catch (err) {
    console.error('Failed to search meals:', err);
    return [];
  }
}

export async function fetchMealById(id) {
  try {
    const data = await apiGet(`/meals/${id}`);
    const meal = data.result || (data.meals ? data.meals[0] : null);
    return normalizeMeal(meal);
  } catch (err) {
    console.error('Failed to fetch meal by id:', err);
    return null;
  }
}

export async function filterByCategory(category) {
  try {
    const data = await apiGet(`/meals/filter?category=${encodeURIComponent(category)}`);
    const meals = data.results || data.meals || [];
    return meals.map(normalizeMeal);
  } catch (err) {
    console.error('Failed to filter by category:', err);
    return [];
  }
}

export async function filterByArea(area) {
  try {
    const data = await apiGet(`/meals/filter?area=${encodeURIComponent(area)}`);
    const meals = data.results || data.meals || [];
    return meals.map(normalizeMeal);
  } catch (err) {
    console.error('Failed to filter by area:', err);
    return [];
  }
}

export async function fetch25Meals() {
  try {
    const data = await apiGet('/meals/search?q=');
    const meals = data.results || data.meals || [];
    return meals.slice(0, 25).map(normalizeMeal);
  } catch (err) {
    console.error('Failed to fetch 25 meals:', err);
    return [];
  }
}

export function extractIngredients(meal) {
  if (Array.isArray(meal.ingredients)) {
    return meal.ingredients;
  }
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: (measure || '').trim(),
      });
    }
  }
  return ingredients;
}

export function getYoutubeEmbedUrl(youtubeUrl) {
  if (!youtubeUrl) return '';
  const match = youtubeUrl.match(/[?&]v=([^&]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  const shortMatch = youtubeUrl.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return '';
}
