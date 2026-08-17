import {
  searchProductByName,
  searchProductByBarcode,
  fetchProductsByCategory
} from '../api/openfoodfacts.js';
import { appState, addToFoodLog } from '../localstorage/localstorage.js';
import { renderProductCard, renderLoadingSpinner, renderEmptyState } from './components.js';
import { renderFoodLog } from './foodlog.js';

const grid = document.getElementById('products-grid');
const countEl = document.getElementById('products-count');
const nameInput = document.getElementById('product-search-input');
const searchBtn = document.getElementById('search-product-btn');
const barcodeInput = document.getElementById('barcode-input');
const lookupBtn = document.getElementById('lookup-barcode-btn');

function showLoading() {
  if (grid) grid.innerHTML = renderLoadingSpinner();
  if (countEl) countEl.textContent = 'Searching…';
}

function displayProducts(products) {
  appState.displayedProducts = products;
  applyNutriFilter();
}

function applyNutriFilter() {
  const grade = appState.activeNutriScoreFilter;
  let filtered = appState.displayedProducts;
  if (grade) filtered = filtered.filter((p) => (p.nutriscore_grade || '').toLowerCase() === grade);

  if (!grid) return;
  if (filtered.length === 0) {
    grid.innerHTML = renderEmptyState('No products found', 'Try a different search term or barcode', 'fa-barcode');
    if (countEl) countEl.textContent = 'No results';
    return;
  }
  grid.innerHTML = filtered.map(renderProductCard).join('');
  if (countEl) countEl.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;

  grid.querySelectorAll('.add-product-to-log').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const data = JSON.parse(btn.dataset.product);
      addToFoodLog({ ...data, type: 'product' });
      renderFoodLog();
      btn.textContent = '✓ Added!';
      btn.classList.replace('bg-emerald-600', 'bg-green-500');
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Food Log';
        btn.classList.replace('bg-green-500', 'bg-emerald-600');
        btn.disabled = false;
      }, 2000);
    });
  });
}

async function handleNameSearch() {
  const query = nameInput?.value.trim();
  if (!query) return;
  showLoading();
  try {
    const products = await searchProductByName(query);
    displayProducts(products);
  } catch {
    if (grid) grid.innerHTML = renderEmptyState('Search failed', 'Check your internet connection and try again', 'fa-exclamation-triangle');
    if (countEl) countEl.textContent = 'Error';
  }
}

searchBtn?.addEventListener('click', handleNameSearch);
nameInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleNameSearch(); });

async function handleBarcodeSearch() {
  const code = barcodeInput?.value.trim();
  if (!code) return;
  showLoading();
  try {
    const product = await searchProductByBarcode(code);
    if (product) {
      displayProducts([product]);
    } else {
      if (grid) grid.innerHTML = renderEmptyState('Product not found', 'Try another barcode or search by name', 'fa-barcode');
      if (countEl) countEl.textContent = 'Not found';
    }
  } catch {
    if (grid) grid.innerHTML = renderEmptyState('Lookup failed', 'Check your internet connection', 'fa-exclamation-triangle');
    if (countEl) countEl.textContent = 'Error';
  }
}

lookupBtn?.addEventListener('click', handleBarcodeSearch);
barcodeInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleBarcodeSearch(); });

document.querySelectorAll('.nutri-score-filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    appState.activeNutriScoreFilter = btn.dataset.grade;

    document.querySelectorAll('.nutri-score-filter').forEach((b) => {
      b.classList.remove('ring-2', 'ring-offset-1', 'ring-emerald-500', 'opacity-100');
      b.classList.add('opacity-70');
    });
    btn.classList.add('ring-2', 'ring-offset-1', 'ring-emerald-500', 'opacity-100');
    btn.classList.remove('opacity-70');

    applyNutriFilter();
  });
});

document.querySelectorAll('.product-category-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.textContent.trim().replace(/^.*\s/, '');
    if (nameInput) nameInput.value = text;
    showLoading();
    try {
      let products = await fetchProductsByCategory(text);
      if (!products.length) {
        products = await searchProductByName(text);
      }
      displayProducts(products);
    } catch {
      handleNameSearch();
    }
  });
});
