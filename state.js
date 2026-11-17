import { initialStock } from './data.js';
import { loadStored, saveStored } from './storage.js';

const defaultProfile = {
  name: 'Jordan Park',
  email: 'jordan.park@northstar.co',
  milk: 'Oat milk',
  sweet: 'Less sweet',
  recommendations: true,
};

/**
 * Mutable state for the current browser session.
 */
export const state = {
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
  connected: navigator.onLine,
  adminUnlocked: false,
};

/** @type {Object} Persisted demonstration profile. */
export const profile = loadStored('profile', defaultProfile);

/** @type {Array<Object>} Recipes created by this profile. */
export const savedRecipes = loadStored('recipes', []);

/** @type {Array<Object>} Completed transactions for this profile. */
export const transactions = loadStored('transactions', []);

/** @type {Object<string, number>} Current ingredient levels. */
export const stock = loadStored('stock', { ...initialStock });

/**
 * Returns whether every ingredient needed for a drink is available.
 * @param {Object} drink - Drink to validate.
 * @returns {boolean} True when all required ingredients are above zero.
 */
export function isDrinkAvailable(drink) {
  return drink.ingredients.every((ingredient) => stock[ingredient] > 0);
}

/**
 * Selects a recommendation using preferences, time of day, and order history.
 * @param {Array<Object>} drinks - Catalog to score.
 * @returns {Object|null} Highest-scoring available drink.
 */
export function getRecommendation(drinks) {
  const hour = new Date().getHours();
  const preferredCategory = hour < 11 ? 'espresso' : hour < 16 ? 'milk' : 'cold';
  const orderedDrinks = transactions.map((transaction) => transaction.drink.id);

  const rankedDrinks = drinks
    .filter(isDrinkAvailable)
    .map((drink) => {
      let score = drink.category === preferredCategory ? 3 : 0;
      if (profile.milk !== 'None' && drink.ingredients.includes(profile.milk.toLowerCase())) {
        score += 2;
      }
      score += orderedDrinks.filter((id) => id === drink.id).length;
      return { drink, score };
    })
    .sort((left, right) => right.score - left.score);

  return rankedDrinks.length ? rankedDrinks[0].drink : null;
}

/**
 * Saves all user and machine data changed by the current interaction.
 * @returns {void} Persists current state.
 */
export function persistState() {
  saveStored('profile', profile);
  saveStored('recipes', savedRecipes);
  saveStored('transactions', transactions);
  saveStored('stock', stock);
}

/**
 * Calculates the current price for a drink customization.
 * @param {Object} drink - Base drink.
 * @param {Object} custom - Selected customization options.
 * @returns {number} Customized price.
 */
export function calculatePrice(drink, custom) {
  let price =
    drink.price +
    { Small: -0.4, Medium: 0, Large: 0.55 }[custom.size] +
    Math.max(0, custom.shots - 2) * 0.7;

  if (custom.milk === 'Almond milk') {
    price += 0.35;
  }

  return price;
}
