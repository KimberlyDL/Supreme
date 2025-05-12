// frontend/src/utils/priceUtils.js

/**
 * Check if a variety is currently on sale
 * @param {Object} variety - The product variety
 * @returns {boolean} - Whether the variety is on sale
 */
export function isVarietyOnSale(variety) {
    if (!variety?.onSale || !variety?.sale) return false

    const now = Date.now()
    const startDate = variety.sale.startDate?.seconds * 1000
    const endDate = variety.sale.endDate?.seconds * 1000

    return now >= startDate && now <= endDate
}

export function computeOrderTotalPrice(items) {
    if (!items) return 0

    let totalPrice = 0
    for (const item of items) {
        totalPrice += item.totalPrice
    }

    return totalPrice
}

/**
 * Get the current price for a variety (considering sales)
 * @param {Object} variety - The product variety
 * @returns {number} - The current price
 */
export function getVarietyPrice(variety) {
    if (isVarietyOnSale(variety)) {
        return variety.sale.salePrice
    }
    return variety.price
}

/**
 * Check if a sale price is still valid
 * @param {Object} saleInfo - Sale information
 * @returns {boolean} - Whether the sale price is valid
 */
export function isSalePriceValid(saleInfo) {
    if (!saleInfo?.onSale) return false

    const now = Date.now()

    // Check if sale has start and end dates
    if (saleInfo.sale?.startDate && saleInfo.sale?.endDate) {
        const startDate = saleInfo.sale.startDate?.seconds * 1000
        const endDate = saleInfo.sale.endDate?.seconds * 1000
        return now >= startDate && now <= endDate
    }

    // Legacy support for saleEndTime
    const endTime = saleInfo.saleEndTime
    return endTime && now <= endTime
}

/**
 * Validate sale prices for a list of items
 * @param {Array} items - Order items
 * @param {Array} products - Current products
 * @returns {Array} - Array of invalid items
 */
export function validateSalePrices(items, products) {
    const invalidItems = []
    const now = Date.now()

    items.forEach((item) => {
        if (item.saleInfo?.onSale) {
            const product = products.find((p) => p.id === item.productId)
            if (!product) return

            const variety = product.varieties.find((v) => v.id === item.varietyId)
            if (!variety) return

            // Check if variety is still on sale
            const isOnSale = isVarietyOnSale(variety)
            if (!isOnSale) {
                invalidItems.push({
                    item,
                    issue: "Sale has ended",
                    currentPrice: variety.price,
                })
                return
            }

            // Check if sale price matches
            const currentSalePrice = variety.sale.salePrice
            if (Math.abs(currentSalePrice - item.unitPrice) > 0.01) {
                invalidItems.push({
                    item,
                    issue: "Sale price has changed",
                    oldPrice: item.unitPrice,
                    currentPrice: currentSalePrice,
                })
            }
        }
    })

    return invalidItems
}

/**
 * Determine if two order items should be combined
 * @param {Object} existingItem - Existing order item
 * @param {Object} newItem - New order item
 * @returns {boolean} - Whether the items should be combined
 */
export function shouldCombineItems(existingItem, newItem) {
    // Must be same product and variety
    if (existingItem.productId !== newItem.productId) return false
    if (existingItem.variety.varietyName !== newItem.variety.name) return false

    // Check pricing compatibility
    const existingOnSale = existingItem.saleInfo?.onSale || false
    const newOnSale = newItem.saleInfo?.onSale || false

    // If both are on sale or both are not on sale, they can be combined
    if (existingOnSale === newOnSale) {
        // If both on sale, check if it's the same sale price
        if (existingOnSale && Math.abs(existingItem.unitPrice - newItem.pricePerUnit) > 0.01) {
            return false
        }
        return true
    }

    // If existing item is not on sale but new item is, they can be combined
    // (we'll update to the sale price)
    if (!existingOnSale && newOnSale) return true

    // If existing item is on sale but new item is not, don't combine
    return false
}

/**
 * Find price discrepancies between order items and current product prices
 * @param {Array} orderItems - Order items
 * @param {Array} products - Current products
 * @returns {Array} - Array of price discrepancies
 */
export function findPriceDiscrepancies(orderItems, products) {
    const discrepancies = []

    orderItems.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) return

        const variety = product.varieties.find((v) => v.name === item.variety.varietyName)
        if (!variety) return

        const currentPrice = isVarietyOnSale(variety) ? variety.sale.salePrice : variety.price

        // Check if price has changed
        if (Math.abs(currentPrice - item.unitPrice) > 0.01) {
            discrepancies.push({
                item,
                originalPrice: item.unitPrice,
                currentPrice,
            })
        }
    })

    return discrepancies
}

/**
 * Validate stock levels for order items
 * @param {Array} orderItems - Order items
 * @param {Array} products - Current products
 * @returns {Array} - Array of stock issues
 */
export function findStockIssues(orderItems, products) {
    const stockIssues = []

    orderItems.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) {
            stockIssues.push({
                item,
                issue: "Product not found",
                available: 0,
            })
            return
        }

        const variety = product.varieties.find((v) => v.name === item.variety.varietyName)
        if (!variety) {
            stockIssues.push({
                item,
                issue: "Variety not found",
                available: 0,
            })
            return
        }

        if (item.quantity > variety.stockQuantity) {
            stockIssues.push({
                item,
                issue: "Insufficient stock",
                available: variety.stockQuantity,
            })
        }
    })

    return stockIssues
}
