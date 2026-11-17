import { drinks } from './data.js';
import { $, $$, money } from './dom.js';
import {
  calculatePrice,
  isDrinkAvailable,
  persistState,
  profile,
  savedRecipes,
  state,
  stock,
  transactions,
} from './state.js';
import {
  renderCustomization,
  renderDrinks,
  renderHistory,
  renderRecipes,
  renderStock,
} from './views.js';

/**
 * Opens the customization modal for a selected drink.
 * @param {Object} drink - Drink data to display and customize.
 * @returns {void} Opens the customization modal.
 */
function openCustomize(drink) {
  state.drink = drink;
  $('#modalTitle').textContent = drink.name;
  $('#modalDescription').textContent = drink.description;
  $('#modalOrb').textContent = drink.visual;
  $('#modalOrb').className = `drink-orb ${drink.visual}`;
  $('#customizeModal').classList.remove('hidden');
  renderCustomization();
}

/**
 * Activates an application view and refreshes view-specific content.
 * @param {string} view - View identifier.
 * @returns {void} Updates the active view.
 */
function showView(view) {
  $$('.view').forEach((element) => element.classList.remove('active-view'));
  $(`#${view}View`).classList.add('active-view');
  $$('.nav-item').forEach((element) =>
    element.classList.toggle('active', element.dataset.view === view),
  );

  if (view === 'recipes') renderRecipes(openRecipe);
  if (view === 'account') renderHistory();
  if (view === 'admin') renderStock();
}

/**
 * Adds the customized drink to the order panel.
 * @returns {void} Updates the order panel.
 */
function addOrder() {
  const drink = state.drink;
  const price = calculatePrice(drink, state.custom);

  $('#customizeModal').classList.add('hidden');
  $('#orderEmpty').classList.add('hidden');
  $('#orderDetails').classList.remove('hidden');
  $('#orderDetails').innerHTML = `
    <div class="order-item-head"><h3>${drink.name}</h3><strong>${money(price)}</strong></div>
    <p class="order-description">${state.custom.size} / ${state.custom.milk} / ${state.custom.shots} shots</p>
    <div class="order-lines">
      <div class="order-line"><span>Size</span><strong>${state.custom.size}</strong></div>
      <div class="order-line"><span>Sweetness</span><strong>${state.custom.sweet}</strong></div>
      <div class="order-line"><span>Milk</span><strong>${state.custom.milk}</strong></div>
      <div class="order-total"><span>Total</span><strong>${money(price)}</strong></div>
    </div>
    <button class="primary-button order-button" id="checkoutButton">Continue to checkout <span>-></span></button>
    <button class="outline-button order-button" id="saveRecipeButton">Save as recipe</button>`;

  $('#checkoutButton').addEventListener('click', openCheckout);
  $('#saveRecipeButton').addEventListener('click', saveRecipe);
}

/**
 * Saves the current customization as a named recipe.
 * @returns {void} Adds a recipe and displays feedback.
 */
function saveRecipe() {
  $('#recipeNameInput').value = `My ${state.drink.name}`;
  $('#recipeNameModal').classList.remove('hidden');
}

/**
 * Saves a recipe after the user confirms its name in the recipe dialog.
 * @returns {void} Stores the named recipe.
 */
function confirmSaveRecipe() {
  const name = $('#recipeNameInput').value.trim() || `My ${state.drink.name}`;
  savedRecipes.push({
    name,
    drink: state.drink.name,
    detail: `${state.custom.size} / ${state.custom.milk} / ${state.custom.sweet}`,
    custom: { ...state.custom },
  });
  persistState();
  renderRecipes(openRecipe);
  toast('Recipe saved to your profile');
  $('#recipeNameModal').classList.add('hidden');
}

/**
 * Opens checkout with a summary of the current order.
 * @returns {void} Displays the checkout modal.
 */
function openCheckout() {
  const drink = state.drink;
  $('#checkoutSummary').innerHTML = `
    <div class="summary-row"><span>${drink.name}</span><strong>${money(calculatePrice(drink, state.custom))}</strong></div>
    <div class="summary-row"><span>${state.custom.size}, ${state.custom.milk}</span><span>${state.custom.shots} shots</span></div>
    <div class="summary-row"><span>${state.custom.sweet}</span><span>Prepared fresh</span></div>`;
  $('#checkoutModal').classList.remove('hidden');
}

/**
 * Completes simulated payment and starts the brew status sequence.
 * @returns {void} Stores the order and displays confirmation.
 */
function pay() {
  if (!state.drink || !isDrinkAvailable(state.drink)) {
    toast('This drink is no longer available');
    return;
  }

  state.lastOrder = {
    drink: state.drink,
    custom: { ...state.custom },
    total: calculatePrice(state.drink, state.custom),
    payment: state.payment,
    number: `#${Math.floor(1000 + Math.random() * 8999)}`,
    createdAt: new Date().toISOString(),
  };
  state.drink.ingredients.forEach((ingredient) => {
    stock[ingredient] = Math.max(0, stock[ingredient] - 5);
  });
  transactions.push(state.lastOrder);
  persistState();
  renderDrinks(openCustomize);
  renderHistory();

  $('#checkoutModal').classList.add('hidden');
  $('#successText').textContent = `Your ${state.drink.name} is being prepared now.`;
  $('#orderNumber').textContent = state.lastOrder.number;
  $('#successModal').classList.remove('hidden');
  setTimeout(() => {
    $('#brewStatus').textContent = 'Ready for collection';
  }, 1800);
}

/**
 * Opens a saved recipe in the customization modal.
 * @param {Object} recipe - Recipe to open.
 * @returns {void} Loads the recipe and opens customization.
 */
function openRecipe(recipe) {
  const drink = drinks.find((item) => item.name === recipe.drink);
  if (!drink) {
    toast('This recipe is no longer available');
    return;
  }

  if (recipe.custom) state.custom = { ...recipe.custom };
  openCustomize(drink);
}

/**
 * Displays a temporary notification.
 * @param {string} message - Text to display.
 * @returns {void} Shows and hides the notification.
 */
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.remove('hidden');
  setTimeout(() => $('#toast').classList.add('hidden'), 2400);
}

$$('.nav-item').forEach((button) =>
  button.addEventListener('click', () => {
    if (button.dataset.view === 'admin' && !state.adminUnlocked) {
      $('#adminAuthModal').classList.remove('hidden');
      return;
    }
    showView(button.dataset.view);
  }),
);

$$('.category').forEach((button) =>
  button.addEventListener('click', () => {
    state.category = button.dataset.category;
    $$('.category').forEach((element) => element.classList.remove('active'));
    button.classList.add('active');
    renderDrinks(openCustomize);
  }),
);

$$('[data-close]').forEach((button) =>
  button.addEventListener('click', () =>
    button.closest('.modal-backdrop').classList.add('hidden'),
  ),
);

$$('#sizeOptions button').forEach((button) =>
  button.addEventListener('click', () => {
    state.custom.size = button.dataset.value;
    renderCustomization();
  }),
);

$$('#sweetOptions button').forEach((button) =>
  button.addEventListener('click', () => {
    state.custom.sweet = button.dataset.value;
    renderCustomization();
  }),
);

$('#milkSelect').addEventListener('change', (event) => {
  state.custom.milk = event.target.value;
  renderCustomization();
});

$('#shotMinus').addEventListener('click', () => {
  state.custom.shots = Math.max(1, state.custom.shots - 1);
  renderCustomization();
});

$('#shotPlus').addEventListener('click', () => {
  state.custom.shots = Math.min(4, state.custom.shots + 1);
  renderCustomization();
});

$('#addToOrderButton').addEventListener('click', () => {
  if (state.drink && isDrinkAvailable(state.drink)) addOrder();
  else toast('This drink is currently unavailable');
});

$('#payButton').addEventListener('click', pay);
$('#recipeNameForm').addEventListener('submit', (event) => {
  event.preventDefault();
  confirmSaveRecipe();
});
$('#adminAuthForm').addEventListener('submit', (event) => {
  event.preventDefault();
  if ($('#adminPinInput').value !== '1048') {
    $('#adminAuthError').textContent = 'Incorrect technician PIN';
    return;
  }
  state.adminUnlocked = true;
  $('#adminAuthModal').classList.add('hidden');
  $('#adminPinInput').value = '';
  $('#adminAuthError').textContent = '';
  toast('Admin mode unlocked');
  showView('admin');
});

$$('.payment-option').forEach((button) =>
  button.addEventListener('click', () => {
    $$('.payment-option').forEach((element) => element.classList.remove('selected'));
    button.classList.add('selected');
    state.payment = button.dataset.payment;
  }),
);

$('#receiptButton').addEventListener('click', () => {
  const order = state.lastOrder;
  if (!order) return;

  $('#receiptContent').innerHTML = `
    <div class="summary-row"><span>Transaction ${order.number}</span><span>Today, 09:41</span></div>
    <div class="summary-row"><span>${order.drink.name}</span><strong>${money(order.total)}</strong></div>
    <div class="summary-row"><span>${order.custom.size}, ${order.custom.milk}, ${order.custom.shots} shots</span><span>${order.payment}</span></div>`;
  $('#receiptModal').classList.remove('hidden');
});

$('#historyButton').addEventListener('click', () => {
  showView('account');
  toast('Transaction history is available in your profile');
});

$('#profileButton').addEventListener('click', () => showView('account'));
$('#tapCardButton').addEventListener('click', () => toast('NFC demo sign-in verified'));

$('#refillButton').addEventListener('click', () => {
  stock['oat milk'] = 100;
  persistState();
  renderStock();
  toast('Milk refill registered and counters reset');
});

$('#newRecipeButton').addEventListener('click', () => {
  showView('menu');
  toast('Customize a drink, then save it as a new recipe');
});

$('#prefMilk').addEventListener('change', (event) => {
  state.custom.milk = event.target.value;
  profile.milk = event.target.value;
  persistState();
  $('#preferenceSaved').textContent = 'Saved just now';
  toast('Preference updated');
});

$('#prefSweet').addEventListener('change', (event) => {
  state.custom.sweet = event.target.value;
  profile.sweet = event.target.value;
  persistState();
  $('#preferenceSaved').textContent = 'Saved just now';
  toast('Preference updated');
});

$('#profileName').value = profile.name;
$('#profileEmail').value = profile.email;
$('#prefMilk').value = profile.milk;
$('#prefSweet').value = profile.sweet;

$('#profileForm').addEventListener('submit', (event) => {
  event.preventDefault();
  profile.name = $('#profileName').value.trim() || profile.name;
  profile.email = $('#profileEmail').value.trim() || profile.email;
  persistState();
  $('#profileNameDisplay').textContent = profile.name;
  $('#profileEmailDisplay').textContent = profile.email;
  toast('Account details saved');
});

window.addEventListener('online', () => {
  state.connected = true;
  $('#connectionStatus').textContent = 'Connected';
});

window.addEventListener('offline', () => {
  state.connected = false;
  $('#connectionStatus').textContent = 'Offline mode';
});

setInterval(() => {
  $('#clock').textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}, 1000);

renderDrinks(openCustomize);
