# SmartBrew AI Prototype

## System Overview

SmartBrew AI is an interactive browser prototype for a personalized coffee machine used in an office or premium lounge. The interface lets a signed-in user browse drinks, customize a recipe, validate ingredient availability, pay for an order, receive a simulated dispensing status, and view a receipt. It also includes saved recipes, preference-based recommendations, and a technician dashboard for inventory and diagnostics.

The prototype focuses on the ten core functionalities selected from the Task A requirements. Account data, recipes, stock changes, payments, and transactions are simulated in the browser so the project can be demonstrated without a backend, database, payment provider, camera, or external API.

## Environment & Prerequisites

- Operating system: Windows, macOS, or Linux
- Browser: a modern browser such as Chrome, Edge, Firefox, or Safari with JavaScript enabled
- Runtime: no compiler or Node.js runtime is required; Python is optional if using the included local server command
- Libraries: none; the application uses plain HTML, CSS, JavaScript modules, and a JSON catalog
- External dependencies: none are required to run the prototype
- Optional connection: `styles.css` imports the DM Sans and Fraunces fonts from Google Fonts. If the network is unavailable, the interface still runs using fallback fonts.

## Execution Guide

### Build and run

There is no compilation or package-install step.

1. Clone or download this repository:

	```text
	https://github.com/Anjele9/smartbrew-coffee-machine
	```

2. Open the project folder.
3. Start a local static server from the `CoffeeApp` folder:

```text
python -m http.server 4173
```

4. Visit `http://localhost:4173` in a browser.
5. The prototype loads on the **Order coffee** screen.

The local server is required because the application uses native JavaScript modules. Opening
`index.html` directly with `file://` can cause browsers to block module imports.

### Test the 10 functionalities

Use the following GUI walkthrough to demonstrate each requirement:

1. **Browse drinks and view nutrition:** On **Order coffee**, inspect the drink cards. Each card shows the drink name, price, description, and calories. Use the category buttons to filter drinks.
2. **Customize drinks:** Select **Oat Latte**. Change size, milk, sweetness, and espresso shots in the customization dialog. Confirm that the total price and order summary update.
3. **Ingredient availability validation:** Notice that **Dark Mocha** is marked **Unavailable** because cocoa stock is depleted. It cannot be selected. Open **Admin console** to view the same stock level.
4. **User accounts and preferences:** Select **My profile**. Review the demonstration account and change **Preferred milk** or **Sweetness**. The saved preference indicator and recommendation context update.
5. **Save and edit custom recipes:** Customize a drink and select **Save as recipe**. Open **My recipes** to see it listed. Use **Edit** or **Order** to retrieve the saved recipe and reopen its customization.
6. **Place an order and simulate dispensing:** Add a drink to the order, select **Continue to checkout**, and choose **Pay and brew**. The confirmation dialog displays the dispensing status and order number, then changes to **Ready for collection**.
7. **Simulated payment processing:** In checkout, test **Contactless card**, **Employee wallet**, or **Mobile wallet**. The selected payment method is shown in the completed receipt.
8. **Receipts and transaction history:** After payment, select **View receipt**. Confirm that the receipt includes the transaction number, drink, custom settings, amount, payment method, email destination, and QR-style receipt marker.
9. **Personalized recommendations:** Return to **Order coffee**. The **Morning boost** recommendation uses the signed in user, time-of-day context, weather context, and preferred drink settings to highlight **Oat Latte** as **Best match**.
10. **Administrator dashboard:** Select **Admin console**, enter technician PIN `1048`, and review ingredient stock, wastebin and coffee grounds capacity, machine health, and event logs. Select **Register refill** to reset the oat milk stock to 100%.

### Resetting the demonstration

The profile, saved recipes, stock levels, and completed transactions persist in browser local storage. To reset the demonstration, clear site data for the local server origin in the browser developer tools, then reload the application.

## Demonstrated functionality

- Browse drinks with prices and nutrition information
- Customize size, milk, sweetness, and espresso shots
- Block unavailable drinks using ingredient stock status
- Demonstration account and coffee preferences
- Save, edit, and reorder custom recipes
- Simulated order preparation and dispensing status
- Simulated card, employee wallet, and mobile wallet payment
- Transaction receipts with customization details and QR-style receipt marker
- Personalized morning recommendations
- Admin console with ingredient stock, refill registration, bin levels, and event logs
- Browser-persisted profile, recipes, transactions, and stock state
- Dynamic recommendations based on time of day, preferences, availability, and order history
- Catalog and machine defaults loaded from `data/catalog.json`, separate from application behavior
