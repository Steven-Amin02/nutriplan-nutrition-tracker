# NutriPlan — Food, Nutrition & Fitness Planner

A modern, responsive single-page web application built with **Vanilla JavaScript (ES6 Modules)** and **Tailwind CSS** to help users discover recipes, scan packaged food products, and track their daily and weekly nutrition intake.

---

## ✨ Features

### 🍽️ Meals & Recipes
- **Browse & Search:** Explore recipes with live search by name, category filtering (Beef, Chicken, Dessert, Lamb, Pasta, Seafood, Vegan, Vegetarian, and more), and cuisine/area filters.
- **Meal Details View:** Inspect full ingredient lists with measurements, step-by-step cooking instructions, embedded YouTube recipe videos, and estimated nutrition facts.
- **Quick Logging:** Log any meal directly to your daily Food Log with one click.

### 🛒 Product Scanner
- **Name, Barcode & Category Lookup:** Search packaged food products by name, look up items by barcode, or browse by category.
- **Nutri-Score & NOVA Badges:** View Nutri-Score grades (`A`–`E`), NOVA processing groups (`1`–`4`), and per-100g macro breakdowns (calories, protein, carbs, fat, sugar, fiber).
- **Nutri-Score Filtering:** Filter displayed products by Nutri-Score grade and add items directly to your Food Log.

### 📊 Food Log & Analytics
- **Daily Macro Tracking:** Real-time progress bars comparing today's intake against daily goals (`2000 kcal`, `50g` protein, `250g` carbs, `65g` fat).
- **7-Day Weekly Chart:** Interactive weekly nutrition visualization powered by **Plotly.js**.
- **Persistent Storage:** All logged meals and products are saved locally in `localStorage` (`nutriplan_food_log`), with options to remove individual entries or clear today's log.

### 📱 Responsive Navigation
- Single-page multi-view navigation (**Meals & Recipes**, **Meal Details**, **Product Scanner**, **Food Log**) with a collapsible mobile sidebar and animated loading overlay.

---

## 🛠️ Tech Stack

- **Core:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Styling & Icons:** Tailwind CSS, Font Awesome 7, Google Fonts (`Inter`)
- **Data Visualization & Alerts:** Plotly.js, SweetAlert2
- **API:** NutriPlan API (`https://nutriplan-api.vercel.app/api`)
- **Persistence:** Browser `localStorage`

---

## 📁 Project Structure

```text
├── index.html
├── README.md
└── src/
    ├── css/
    │   ├── index.css
    │   └── style.css
    ├── images/
    │   └── favicon.png
    └── js/
        ├── main.js                      # App initialization & loading overlay
        ├── api/
        │   ├── mealdb.js                # Meals, categories, areas & search API
        │   └── openfoodfacts.js         # Product search, barcode & Nutri-Score helpers
        ├── localstorage/
        │   └── localstorage.js          # App state, goals & food log persistence
        └── ui/
            ├── components.js            # Reusable UI card & state renderers
            ├── foodlog.js               # Daily macro progress & Plotly weekly chart
            ├── meals.js                 # Meals grid, filters & meal details view
            ├── navigation.js            # SPA page switching & responsive sidebar
            └── products.js              # Product scanner, barcode lookup & filtering
```

---

## 🚀 Getting Started

Because the project uses native **ES6 Modules** (`type="module"`), serve the root directory with a local HTTP server rather than opening `index.html` via `file://`:

```bash
# Using VS Code Live Server, or any static server such as:
npx serve .
```

Then open the served URL (e.g., `http://localhost:3000`) in your browser.
