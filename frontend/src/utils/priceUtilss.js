// frontend\src\components\utils\priceUtils.js
// Utility functions for price and sale validation

/**
 * Check if a variety is currently on sale
 * @param {Object} variety - The product variety
 * @returns {Boolean} - Whether the variety is on sale
 */
export function isVarietyOnSale(variety) {
    if (!variety?.onSale && !variety?.sale) return false;

    const now = Date.now();
    const startDate = variety.sale?.startDate?.seconds * 1000 || variety.sale?.startDate;
    const endDate = variety.sale?.endDate?.seconds * 1000 || variety.sale?.endDate;

    return now >= startDate && now <= endDate;
}

/**
 * Check if a sale price is still valid (within grace period)
 * @param {Object} saleInfo - The sale information
 * @param {Number} gracePeriodHours - Hours after sale end that price is still valid
 * @returns {Boolean} - Whether the sale price is still valid
 */
export function isSalePriceValid(saleInfo, gracePeriodHours = 1) {
    if (!saleInfo || !saleInfo.onSale || !saleInfo.saleEndTime) return false;

    const now = Date.now();
    const endTime = saleInfo.saleEndTime?.seconds * 1000 || saleInfo.saleEndTime;
    const gracePeriodMs = gracePeriodHours * 60 * 60 * 1000;

    // Sale is valid if we're still within the grace period
    return now <= endTime + gracePeriodMs;
}

/**
 * Calculate the current price for a variety
 * @param {Object} variety - The product variety
 * @returns {Number} - The current price
 */
export function calculateItemPrice(variety) {
    if (!variety) return 0;

    if (isVarietyOnSale(variety)) {
        return variety.sale.salePrice;
    }

    return variety.price;
}

/**
 * Get the current price for a cart item
 * @param {Object} item - The cart item
 * @param {Object} currentProduct - The current product data
 * @returns {Number} - The current price
 */
export function getCurrentPrice(item, currentProduct) {
    // If we have the current product data, use it
    if (currentProduct) {
        const variety = currentProduct.varieties.find((v) => v.name === item.variety?.varietyName);
        if (variety) {
            return isVarietyOnSale(variety) ? variety.sale.salePrice : variety.price;
        }
    }

    // If the item has valid sale pricing, use it
    if (item.saleInfo && isSalePriceValid(item.saleInfo)) {
        return item.saleInfo.salePrice;
    }

    // Otherwise use the original price or unit price
    return item.variety?.originalPrice || item.unitPrice;
}

/**
 * Check if a cart item's price has changed
 * @param {Object} item - The cart item
 * @param {Object} currentProduct - The current product data
 * @returns {Boolean} - Whether the price has changed
 */
export function hasPriceChanged(item, currentProduct) {
    const currentPrice = getCurrentPrice(item, currentProduct);
    return Math.abs(currentPrice - item.unitPrice) > 0.01; // Using a small epsilon for floating point comparison
}

/**
 * Find price discrepancies in cart items
 * @param {Array} items - The cart items
 * @param {Array} products - The current product data
 * @returns {Array} - Array of discrepancies
 */
export function findPriceDiscrepancies(items, products) {
    const discrepancies = [];

    for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;

        const variety = product.varieties.find((v) => v.name === item.variety?.varietyName);
        if (!variety) continue;

        const currentPrice = isVarietyOnSale(variety) ? variety.sale.salePrice : variety.price;

        // Check if sale has expired and grace period is over
        if (item.saleInfo && item.saleInfo.onSale) {
            if (!isSalePriceValid(item.saleInfo)) {
                discrepancies.push({
                    item,
                    originalPrice: item.unitPrice,
                    currentPrice: variety.price, // Use regular price since sale is over
                    reason: "Sale expired",
                });
            }
        }
        // Check if regular price has changed
        else if (Math.abs(currentPrice - item.unitPrice) > 0.01) {
            discrepancies.push({
                item,
                originalPrice: item.unitPrice,
                currentPrice: currentPrice,
                reason: "Price changed",
            });
        }
    }

    return discrepancies;
}

/**
 * Format time remaining in grace period
 * @param {Number} endTime - End time in milliseconds
 * @returns {String} - Formatted time string
 */
export function formatTimeRemaining(endTime) {
    if (!endTime) return '';

    const now = Date.now();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) return 'expired';

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
}

/**
 * Get remaining stock for a variety after accounting for items in cart
 * @param {Object} variety - The product variety
 * @param {Array} cartItems - Items in the cart
 * @param {String} productId - Product ID
 * @returns {Number} - Remaining stock
 */
export function getRemainingStock(variety, cartItems, productId) {
    if (!variety) return 0;

    // Find all items in cart with this product and variety
    const matchingItems = cartItems.filter(item =>
        item.productId === productId &&
        item.variety?.varietyName === variety.name
    );

    // Calculate total quantity in cart
    const quantityInCart = matchingItems.reduce((total, item) => total + item.quantity, 0);

    // Calculate remaining stock
    return Math.max(0, variety.stockQuantity - quantityInCart);
}

/**
 * Check if two items should be combined in cart
 * @param {Object} existingItem - Item already in cart
 * @param {Object} newItem - New item being added
 * @returns {Boolean} - Whether items should be combined
 */
export function shouldCombineItems(existingItem, newItemInfo) {
    // If product or variety doesn't match, don't combine
    if (existingItem.productId !== newItemInfo.productId ||
        existingItem.variety?.varietyName !== newItemInfo.variety.name) {
        return false;
    }

    // Case 1: Both items are on sale - combine if same sale price
    if (existingItem.saleInfo?.onSale && newItemInfo.saleInfo.onSale) {
        return Math.abs(existingItem.unitPrice - newItemInfo.pricePerUnit) < 0.01;
    }

    // Case 2: Existing item is not on sale, new item is on sale - combine and update to sale price
    if (!existingItem.saleInfo?.onSale && newItemInfo.saleInfo.onSale) {
        return true;
    }

    // Case 3: Existing item is on sale but in grace period, new item is not on sale - don't combine
    if (existingItem.saleInfo?.onSale && isSalePriceValid(existingItem.saleInfo) && !newItemInfo.saleInfo.onSale) {
        return false;
    }

    // Case 4: Neither item is on sale - combine if same price
    return Math.abs(existingItem.unitPrice - newItemInfo.pricePerUnit) < 0.01;
}