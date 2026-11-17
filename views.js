import { builtInRecipes, drinks, stockItems } from './data.js';
import { $, $$, escapeHtml, money } from './dom.js';
import {
  calculatePrice,
  isDrinkAvailable,
  savedRecipes,
  getRecommendation,
  state,
  stock,
  transactions,
} from './state.js';

/**
 * Renders menu cards for the selected category.
 * @param {Function} onSelect - Callback invoked with the selected drink.
 * @returns {void} Updates the drink grid.
 */
export function renderDrinks(onSelect) {
  const recommendation = getRecommendation(drinks);
  $('#drinkGrid').innerHTML = drinks
    .filter((drink) => state.category === 'all' || drink.category === state.category)
    .map((drink) => {
      const unavailable = !isDrinkAvailable(drink);
      return `
        <article class="drink-card ${unavailable ? 'sold-out' : ''}" data-id="${drink.id}">
          ${recommendation && recommendation.id === drink.id ? '<span class="best-match">BEST MATCH</span>' : ''}
          ${unavailable ? '<span class="stock-warning">Unavailable</span>' : ''}
          <div class="drink-visual visual-${drink.visual}"><span class="cup-art"></span></div>
          <h3>${escapeHtml(drink.name)}</h3>
          <p>${escapeHtml(drink.description)}</p>
          <div class="drink-meta">
            <span class="drink-price">${money(drink.price)}</span>
            <span class="nutrition">${drink.calories} kcal</span>
          </div>
        </article>`;
    })
    .join('');

  $$('.drink-card').forEach((card) =>
    card.addEventListener('click', () => {
      const drink = drinks.find((item) => item.id === card.dataset.id);
      if (drink && isDrinkAvailable(drink)) {
        onSelect(drink);
      }

    }),
  );
}

/**
 * Renders completed transactions in the profile view.
 * @returns {void} Updates the transaction history.
 */
export function renderHistory() {
  const history = $('#transactionHistory');
  if (!history) return;

  history.innerHTML = transactions.length
    ? transactions
        .slice()
        .reverse()
        .map(
          (transaction) => `
            <div class="history-row">
              <span><b>${escapeHtml(transaction.drink.name)}</b><small>${escapeHtml(transaction.number)} · ${escapeHtml(transaction.payment)}</small></span>
              <strong>${money(transaction.total)}</strong>
            </div>`,
        )
        .join('')
    : '<p class="empty-history">No completed transactions yet.</p>';
}

/**
 * Updates customization controls and the calculated price.
 * @returns {void} Refreshes the customization modal.
 */
export function renderCustomization() {
  if (!state.drink) return;

  const price = calculatePrice(state.drink, state.custom);
  $('#modalPrice').textContent = money(price);
  $('#shotValue').textContent = state.custom.shots;
  $('#milkSelect').value = state.custom.milk;

  $$('#sizeOptions button').forEach((button) =>
    button.classList.toggle('selected', button.dataset.value === state.custom.size),
  );
  $$('#sweetOptions button').forEach((button) =>
    button.classList.toggle('selected', button.dataset.value === state.custom.sweet),
  );

  const available = isDrinkAvailable(state.drink);
  $('#availabilityText').textContent = available
    ? 'All required ingredients are available.'
    : 'One or more required ingredients are unavailable.';
}

/**
 * Renders built-in and user-created recipes.
 * @param {Function} onOrder - Callback invoked when a recipe is ordered or edited.
 * @returns {void} Updates the recipe list.
 */
export function renderRecipes(onOrder) {
  const recipes = [
    ...builtInRecipes,
    ...savedRecipes.map((recipe) => ({ ...recipe, last: 'Saved just now' })),
  ];

  $('#recipeList').innerHTML = recipes
    .map(
      (recipe, index) => `
        <article class="recipe-card">
          <div>
            <p class="eyebrow">SAVED RECIPE</p>
            <h3>${escapeHtml(recipe.name)}</h3>
            <p>${escapeHtml(recipe.detail)}</p>
            <div class="recipe-meta">${escapeHtml(recipe.last)} - ${escapeHtml(recipe.drink)}</div>
          </div>
          <div class="recipe-actions">
            <button data-recipe="${index}">Edit</button>
            <button class="order-recipe" data-recipe="${index}">Order</button>
          </div>
        </article>`,
    )
    .join('');

  $$('[data-recipe]').forEach((button) =>
    button.addEventListener('click', () => onOrder(recipes[button.dataset.recipe])),
  );
}

/**
 * Renders current ingredient stock levels in the admin console.
 * @returns {void} Updates the stock list.
 */
export function renderStock() {
  $('#stockList').innerHTML = stockItems
    .map(
      ([key, label]) => `
        <div class="stock-row">
          <header><b>${escapeHtml(label)}</b><span>${stock[key]}%</span></header>
          <span></span>
          <div class="stock-bar ${stock[key] < 20 ? 'low' : ''}">
            <span style="width:${stock[key]}%"></span>
          </div>
        </div>`,
    )
    .join('');
}
