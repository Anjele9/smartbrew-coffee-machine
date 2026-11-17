/**
 * Loads the SmartBrew catalog and machine configuration from JSON.
 * @returns {Promise<Object>} Parsed catalog configuration.
 */
async function loadCatalog() {
  const response = await fetch('./data/catalog.json');
  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${response.status}`);
  }
  return response.json();
}

const catalog = await loadCatalog();

/** @type {Array<Object>} Drink catalog loaded from JSON. */
export const drinks = catalog.drinks;

/** @type {Object<string, number>} Initial ingredient levels. */
export const initialStock = catalog.initialStock;

/** @type {Array<[string, string]>} Ingredient rows shown in the console. */
export const stockItems = catalog.stockItems;

/** @type {Array<Object>} Recipes available to every demonstration user. */
export const builtInRecipes = catalog.builtInRecipes;
