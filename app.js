// Menu data used to render drinks and calculate availability.
const drinks = [
  {
    id: 'oat-latte',
    name: 'Oat Latte',
    category: 'milk',
    description: 'Silky oat milk with a double espresso.',
    price: 4.8,
    calories: 140,
    visual: 'latte',
    best: true,
    ingredients: ['espresso', 'oat milk'],
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    category: 'espresso',
    description: 'Velvety microfoam, rich and balanced.',
    price: 4.4,
    calories: 110,
    visual: 'latte',
    ingredients: ['espresso', 'whole milk'],
  },
  {
    id: 'cold-brew',
    name: 'Vanilla Cold Brew',
    category: 'cold',
    description: 'Slow-steeped, bright, with vanilla.',
    price: 4.95,
    calories: 95,
    visual: 'cold',
    ingredients: ['coffee beans', 'vanilla'],
  },
  {
    id: 'americano',
    name: 'Long Black',
    category: 'espresso',
    description: 'Bold espresso over filtered water.',
    price: 3.6,
    calories: 15,
    visual: 'espresso',
    ingredients: ['espresso', 'water'],
  },
  {
    id: 'matcha',
    name: 'Iced Matcha',
    category: 'tea',
    description: 'Ceremonial matcha, oat milk and ice.',
    price: 4.7,
    calories: 120,
    visual: 'tea',
    ingredients: ['matcha', 'oat milk'],
  },
  {
    id: 'mocha',
    name: 'Dark Mocha',
    category: 'milk',
    description: 'Espresso, dark chocolate and milk.',
    price: 5.2,
    calories: 260,
    visual: 'espresso',
    ingredients: ['espresso', 'whole milk', 'cocoa'],
    soldOut: true,
  },
];

// Centralized prototype state. The app does not persist data between sessions.
let state = {
  drink: null,
  custom: {
    size: 'Medium',
    milk: 'Oat milk',
    sweet: 'Less sweet',
    shots: 2,
  },
  payment: 'Contactless card',
  lastOrder: null,
  category: 'all',
};

let savedRecipes = [];
let stock = {
  espresso: 87,
  'oat milk': 72,
  'whole milk': 38,
  'coffee beans': 92,
  vanilla: 16,
  matcha: 55,
  cocoa: 0,
  water: 96,
};

/**
 * Finds the first element matching a CSS selector.
 * @param {string} selector - CSS selector to search for.
 * @returns {Element|null} The matching element, or null when none is found.
 */
const $ = (selector) => document.querySelector(selector);

/**
 * Finds all elements matching a CSS selector.
 * @param {string} selector - CSS selector to search for.
 * @returns {Element[]} An array containing all matching elements.
 */
const $$ = (selector) => [...document.querySelectorAll(selector)];

/**
 * Formats a numeric amount as a two-decimal-place currency value.
 * @param {number} amount - Amount to format.
 * @returns {string} Formatted currency text.
 */
const money = (amount) => `Â£${amount.toFixed(2)}`;

/**
 * Renders menu cards for the currently selected drink category.
 * @returns {void} Updates the drink grid in the document.
 */
function renderDrinks() {
  const grid = $('#drinkGrid');

  grid.innerHTML = drinks
    .filter(
      (drink) =>
        state.category === 'all' || drink.category === state.category,
    )
    .map(
      (drink) => `
        <article class="drink-card ${
          drink.soldOut ? 'sold-out' : ''
        }" data-id="${drink.id}">
          ${
            drink.best
              ? '<span class="best-match">BEST MATCH</span>'
              : ''
          }
          ${
            drink.soldOut
              ? '<span class="stock-warning">Unavailable</span>'
              : ''
          }
          <div class="drink-visual visual-${drink.visual}">
            <span class="cup-art"></span>
          </div>
          <h3>${drink.name}</h3>
          <p>${drink.description}</p>
          <div class="drink-meta">
            <span class="drink-price">${money(drink.price)}</span>
            <span class="nutrition">${drink.calories} kcal</span>
          </div>
        </article>
      `,
    )
    .join('');

  $$('.drink-card').forEach((card) =>
    card.addEventListener('click', () => {
      const drink = drinks.find((item) => item.id === card.dataset.id);

      if (!drink.soldOut) {
        openCustomize(drink);
      }
    }),
  );
}

/**
 * Opens the customization modal for a selected drink.
 * @param {Object} drink - Drink data to display and customize.
 * @returns {void} Updates state and opens the customization modal.
 */
function openCustomize(drink) {
  state.drink = drink;
  $('#modalTitle').textContent = drink.name;
  $('#modalDescription').textContent = drink.description;
  $('#modalOrb').textContent = drink.visual;
  $('#modalOrb').className = `drink-orb ${drink.visual}`;
  $('#customizeModal').classList.remove('hidden');
  updatePrice();
}

/**
 * Recalculates the selected drink price and refreshes customization controls.
 * @returns {void} Updates price and control elements in the document.
 */
function updatePrice() {
  if (!state.drink) {
    return;
  }

  let price =
    state.drink.price +
    { Small: -0.4, Medium: 0, Large: 0.55 }[state.custom.size] +
    Math.max(0, state.custom.shots - 2) * 0.7;

  if (state.custom.milk === 'Almond milk') {
    price += 0.35;
  }

  $('#modalPrice').textContent = money(price);
  $('#shotValue').textContent = state.custom.shots;
  $('#milkSelect').value = state.custom.milk;

  $$('#sizeOptions button').forEach((button) =>
    button.classList.toggle(
      'selected',
      button.dataset.value === state.custom.size,
    ),
  );
  $$('#sweetOptions button').forEach((button) =>
    button.classList.toggle(
      'selected',
      button.dataset.value === state.custom.sweet,
    ),
  );
}

/**
 * Activates a top-level application view.
 * @param {string} view - View identifier, such as "menu", "recipes", or "admin".
 * @returns {void} Updates the active view and renders view-specific content.
 */
function showView(view) {
  $$('.view').forEach((element) =>
    element.classList.remove('active-view'),
  );
  $(`#${view}View`).classList.add('active-view');
  $$('.nav-item').forEach((element) =>
    element.classList.toggle('active', element.dataset.view === view),
  );

  if (view === 'recipes') {
    renderRecipes();
  }

  if (view === 'admin') {
    renderStock();
  }
}

/**
 * Adds the customized drink to the order panel.
 * @returns {void} Updates the order panel and binds checkout actions.
 */
function addOrder() {
  const drink = state.drink;
  const price = parseFloat($('#modalPrice').textContent.replace('Â£', ''));

  $('#customizeModal').classList.add('hidden');
  $('#orderEmpty').classList.add('hidden');
  $('#orderDetails').classList.remove('hidden');
  $('#orderDetails').innerHTML = `
    <div class="order-item-head">
      <h3>${drink.name}</h3>
      <strong>${money(price)}</strong>
    </div>
    <p class="order-description">
      ${state.custom.size} / ${state.custom.milk} / ${state.custom.shots} shots
    </p>
    <div class="order-lines">
      <div class="order-line">
        <span>Size</span>
        <strong>${state.custom.size}</strong>
      </div>
      <div class="order-line">
        <span>Sweetness</span>
        <strong>${state.custom.sweet}</strong>
      </div>
      <div class="order-line">
        <span>Milk</span>
        <strong>${state.custom.milk}</strong>
      </div>
      <div class="order-total">
        <span>Total</span>
        <strong>${money(price)}</strong>
      </div>
    </div>
    <button class="primary-button order-button" id="checkoutButton">
      Continue to checkout <span>-></span>
    </button>
    <button class="outline-button order-button" id="saveRecipeButton">
      Save as recipe
    </button>
  `;

  $('#checkoutButton').addEventListener('click', openCheckout);
  $('#saveRecipeButton').addEventListener('click', saveRecipe);
}

/**
 * Saves the current drink customization as a named recipe.
 * @returns {void} Adds the recipe, refreshes the recipe list, and shows feedback.
 */
function saveRecipe() {
  let name = `My ${state.drink.name}`;

  try {
    name = window.prompt('Name this recipe', name) || name;
  } catch (error) {
    name = `My ${state.drink.name}`;
  }

  savedRecipes.push({
    name,
    drink: state.drink.name,
    detail: `${state.custom.size} / ${state.custom.milk} / ${state.custom.sweet}`,
    custom: { ...state.custom },
  });
  renderRecipes();
  toast('Recipe saved to your profile');
}

/**
 * Opens checkout with a summary of the current order.
 * @returns {void} Populates and displays the checkout modal.
 */
function openCheckout() {
  const drink = state.drink;

  $('#checkoutSummary').innerHTML = `
    <div class="summary-row">
      <span>${drink.name}</span>
      <strong>${$('#modalPrice').textContent}</strong>
    </div>
    <div class="summary-row">
      <span>${state.custom.size}, ${state.custom.milk}</span>
      <span>${state.custom.shots} shots</span>
    </div>
    <div class="summary-row">
      <span>${state.custom.sweet}</span>
      <span>Prepared fresh</span>
    </div>
  `;
  $('#checkoutModal').classList.remove('hidden');
}

/**
 * Completes the simulated payment and starts the brew status sequence.
 * @returns {void} Stores the order, displays confirmation, and schedules a status update.
 */
function pay() {
  state.lastOrder = {
    drink: state.drink,
    custom: { ...state.custom },
    total: parseFloat($('#modalPrice').textContent.replace('Â£', '')),
    payment: state.payment,
    number: `#${Math.floor(1000 + Math.random() * 8999)}`,
  };

  $('#checkoutModal').classList.add('hidden');
  $('#successText').textContent = `Your ${state.drink.name} is being prepared now.`;
  $('#orderNumber').textContent = state.lastOrder.number;
  $('#successModal').classList.remove('hidden');
  setTimeout(
    () => {
      $('#brewStatus').textContent = 'Ready for collection';
    },
    1800,
  );
}

/**
 * Renders built-in and user-saved recipes.
 * @returns {void} Updates the recipe list and binds recipe actions.
 */
function renderRecipes() {
  const recipes = [
    {
      name: 'My morning oat latte',
      drink: 'Oat Latte',
      detail: 'Medium / Oat milk / Less sweet',
      last: 'Ordered today',
    },
    {
      name: 'Afternoon reset',
      drink: 'Long Black',
      detail: 'Large / No milk / No sugar',
      last: 'Ordered yesterday',
    },
    ...savedRecipes.map((recipe) => ({
      ...recipe,
      last: 'Saved just now',
    })),
  ];

  $('#recipeList').innerHTML = recipes
    .map(
      (recipe, index) => `
        <article class="recipe-card">
          <div>
            <p class="eyebrow">SAVED RECIPE</p>
            <h3>${recipe.name}</h3>
            <p>${recipe.detail}</p>
            <div class="recipe-meta">${recipe.last} - ${recipe.drink}</div>
          </div>
          <div class="recipe-actions">
            <button data-recipe="${index}">Edit</button>
            <button class="order-recipe" data-recipe="${index}">Order</button>
          </div>
        </article>
      `,
    )
    .join('');

  $$('.order-recipe').forEach((button) =>
    button.addEventListener('click', () => {
      const recipe = recipes[button.dataset.recipe];
      const drink = drinks.find((item) => item.name === recipe.drink);

      if (recipe.custom) {
        state.custom = { ...recipe.custom };
      }

      openCustomize(drink);
    }),
  );

  $$('[data-recipe]')
    .filter((button) => button.textContent === 'Edit')
    .forEach((button) =>
      button.addEventListener('click', () =>
        toast('Recipe opened for editing'),
      ),
    );
}

/**
 * Renders current ingredient stock levels in the admin console.
 * @returns {void} Updates the stock list in the document.
 */
function renderStock() {
  const items = [
    ['espresso', 'Espresso beans'],
    ['oat milk', 'Oat milk'],
    ['whole milk', 'Whole milk'],
    ['coffee beans', 'Coffee beans'],
    ['cocoa', 'Cocoa powder'],
  ];

  $('#stockList').innerHTML = items
    .map(
      ([key, label]) => `
        <div class="stock-row">
          <header>
            <b>${label}</b>
            <span>${stock[key]}%</span>
          </header>
          <span></span>
          <div class="stock-bar ${stock[key] < 20 ? 'low' : ''}">
            <span style="width:${stock[key]}%"></span>
          </div>
        </div>
      `,
    )
    .join('');
}

/**
 * Displays a temporary notification message.
 * @param {string} message - Text to display in the notification.
 * @returns {void} Shows the toast and schedules it to be hidden.
 */
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.remove('hidden');
  setTimeout(() => $('#toast').classList.add('hidden'), 2400);
}

// Wire static controls after the page markup has loaded.
$$('.nav-item').forEach((button) =>
  button.addEventListener('click', () => showView(button.dataset.view)),
);

$$('.category').forEach((button) =>
  button.addEventListener('click', () => {
    state.category = button.dataset.category;
    $$('.category').forEach((element) =>
      element.classList.remove('active'),
    );
    button.classList.add('active');
    renderDrinks();
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
    updatePrice();
  }),
);

$$('#sweetOptions button').forEach((button) =>
  button.addEventListener('click', () => {
    state.custom.sweet = button.dataset.value;
    updatePrice();
  }),
);

$('#milkSelect').addEventListener('change', (event) => {
  state.custom.milk = event.target.value;
  updatePrice();
});

$('#shotMinus').addEventListener('click', () => {
  state.custom.shots = Math.max(1, state.custom.shots - 1);
  updatePrice();
});

$('#shotPlus').addEventListener('click', () => {
  state.custom.shots = Math.min(4, state.custom.shots + 1);
  updatePrice();
});

$('#addToOrderButton').addEventListener('click', addOrder);
$('#payButton').addEventListener('click', pay);

$$('.payment-option').forEach((button) =>
  button.addEventListener('click', () => {
    $$('.payment-option').forEach((element) =>
      element.classList.remove('selected'),
    );
    button.classList.add('selected');
    state.payment = button.dataset.payment;
  }),
);

$('#receiptButton').addEventListener('click', () => {
  const order = state.lastOrder;

  $('#receiptContent').innerHTML = `
    <div class="summary-row">
      <span>Transaction ${order.number}</span>
      <span>Today, 09:41</span>
    </div>
    <div class="summary-row">
      <span>${order.drink.name}</span>
      <strong>${money(order.total)}</strong>
    </div>
    <div class="summary-row">
      <span>
        ${order.custom.size}, ${order.custom.milk}, ${order.custom.shots} shots
      </span>
      <span>${order.payment}</span>
    </div>
  `;
  $('#receiptModal').classList.remove('hidden');
});

$('#historyButton').addEventListener('click', () => {
  showView('account');
  toast('Transaction history is available in your profile');
});

$('#profileButton').addEventListener('click', () => showView('account'));
$('#tapCardButton').addEventListener('click', () =>
  toast('NFC demo sign-in verified'),
);

$('#refillButton').addEventListener('click', () => {
  stock['oat milk'] = 100;
  renderStock();
  toast('Milk refill registered and counters reset');
});

$('#newRecipeButton').addEventListener('click', () => {
  showView('menu');
  toast('Customize a drink, then save it as a new recipe');
});

$('#prefMilk').addEventListener('change', (event) => {
  state.custom.milk = event.target.value;
  $('#preferenceSaved').textContent = 'Saved just now';
  toast('Preference updated');
});

setInterval(() => {
  $('#clock').textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}, 1000);

renderDrinks();
