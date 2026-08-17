const BASE_URL = 'https://nutriplan-api.vercel.app/api';

async function apiGet(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`Product API error: ${res.status}`);
  return res.json();
}

function normalizeProduct(p) {
  if (!p) return null;
  const grade = p.nutritionGrade || p.nutriscore_grade || 'unknown';
  const nova = p.novaGroup || p.nova_group || 0;

  let nutrients;
  if (p.nutrients) {
    nutrients = {
      calories: Math.round(p.nutrients.calories || 0),
      protein: +(p.nutrients.protein || 0).toFixed(1),
      carbs: +(p.nutrients.carbs || 0).toFixed(1),
      fat: +(p.nutrients.fat || 0).toFixed(1),
      sugar: +(p.nutrients.sugar || 0).toFixed(1),
      fiber: +(p.nutrients.fiber || 0).toFixed(1),
    };
  } else {
    nutrients = extractProductNutrition(p);
  }

  return {
    ...p,
    code: p.barcode || p.code || '',
    barcode: p.barcode || p.code || '',
    product_name: p.name || p.product_name || 'Unknown Product',
    name: p.name || p.product_name || 'Unknown Product',
    brands: p.brand || p.brands || '',
    brand: p.brand || p.brands || '',
    image_url: p.image || p.image_url || '',
    image: p.image || p.image_url || '',
    nutriscore_grade: grade,
    nutritionGrade: grade,
    nova_group: nova,
    novaGroup: nova,
    nutrients,
  };
}

export async function searchProductByName(name) {
  try {
    const data = await apiGet(`/products/search?q=${encodeURIComponent(name)}`);
    const products = data.results || data.products || [];
    return products.map(normalizeProduct).filter((p) => p.name);
  } catch (err) {
    console.error('Failed to search products by name:', err);
    return [];
  }
}

export async function searchProductByBarcode(barcode) {
  try {
    const data = await apiGet(`/products/barcode/${encodeURIComponent(barcode.trim())}`);
    const product = data.result || data.product || null;
    return normalizeProduct(product);
  } catch (err) {
    console.error('Failed to lookup product by barcode:', err);
    return null;
  }
}

export async function fetchProductsByCategory(category, limit = 24) {
  try {
    const data = await apiGet(`/products/category/${encodeURIComponent(category.toLowerCase())}?limit=${limit}`);
    const products = data.results || data.products || [];
    return products.map(normalizeProduct).filter((p) => p.name);
  } catch (err) {
    console.error('Failed to fetch products by category:', err);
    return [];
  }
}

export function extractProductNutrition(product) {
  if (product.nutrients) {
    return product.nutrients;
  }
  const n = product.nutriments || {};
  return {
    calories: Math.round(n['energy-kcal_100g'] || n['energy_100g'] / 4.184 || 0),
    protein: +(n['proteins_100g'] || 0).toFixed(1),
    carbs: +(n['carbohydrates_100g'] || 0).toFixed(1),
    fat: +(n['fat_100g'] || 0).toFixed(1),
    sugar: +(n['sugars_100g'] || 0).toFixed(1),
    fiber: +(n['fiber_100g'] || 0).toFixed(1),
  };
}

export function getNutriScoreColor(grade) {
  const colors = {
    a: 'bg-green-500',
    b: 'bg-lime-500',
    c: 'bg-yellow-500',
    d: 'bg-orange-500',
    e: 'bg-red-500',
  };
  return colors[(grade || '').toLowerCase()] || 'bg-gray-400';
}

export function getNovaColor(novaGroup) {
  const colors = { 1: 'bg-green-500', 2: 'bg-lime-500', 3: 'bg-orange-400', 4: 'bg-red-500' };
  return colors[novaGroup] || 'bg-gray-400';
}
