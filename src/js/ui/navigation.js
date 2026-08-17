import { appState } from '../localstorage/localstorage.js';

const PAGES = {
  meals: {
    sections: ['search-filters-section', 'meal-categories-section', 'all-recipes-section'],
    title: 'Meals & Recipes',
    subtitle: 'Discover delicious and nutritious recipes tailored for you',
  },
  details: {
    sections: ['meal-details'],
    title: 'Meal Details',
    subtitle: 'Full recipe information and nutrition facts',
  },
  products: {
    sections: ['products-section'],
    title: 'Product Scanner',
    subtitle: 'Search packaged food products by name or barcode',
  },
  foodlog: {
    sections: ['foodlog-section'],
    title: 'Food Log',
    subtitle: 'Track and monitor your daily nutrition intake',
  },
};

const ALL_SECTIONS = [
  'search-filters-section',
  'meal-categories-section',
  'all-recipes-section',
  'meal-details',
  'products-section',
  'foodlog-section',
];

const NAV_LINKS = document.querySelectorAll('.nav-link');
const HEADER_TITLE = document.querySelector('#header h1');
const HEADER_SUBTITLE = document.querySelector('#header p');

export function navigateTo(page, onEnter) {
  appState.currentPage = page;
  const config = PAGES[page];

  ALL_SECTIONS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = config.sections.includes(id) ? '' : 'none';
  });

  if (HEADER_TITLE) HEADER_TITLE.textContent = config.title;
  if (HEADER_SUBTITLE) HEADER_SUBTITLE.textContent = config.subtitle;

  NAV_LINKS.forEach((link) => {
    const linkPage = link.dataset.page;
    if (!linkPage) return;
    const isActive = linkPage === page || (page === 'details' && linkPage === 'meals');
    link.className = isActive
      ? 'nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all'
      : 'nav-link flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all';
    const span = link.querySelector('span');
    if (span) span.className = isActive ? 'font-semibold' : 'font-medium';
  });

  closeSidebar();

  if (onEnter) onEnter();
}

const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const menuBtn = document.getElementById('header-menu-btn');
const closeBtn = document.getElementById('sidebar-close-btn');

function openSidebar() {
  sidebar?.classList.add('sidebar-open');
  overlay?.classList.add('active');
}

export function closeSidebar() {
  sidebar?.classList.remove('sidebar-open');
  overlay?.classList.remove('active');
}

menuBtn?.addEventListener('click', openSidebar);
closeBtn?.addEventListener('click', closeSidebar);
overlay?.addEventListener('click', closeSidebar);

NAV_LINKS.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    if (page) navigateTo(page);
  });
});
