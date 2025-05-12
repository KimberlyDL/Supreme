//#region Helper Functions
/**
 * Get the display price for a product (using default variety or sale price if available)
 * @param {Object} product - Product object
 * @returns {Number} Display price
 */
export function getDisplayPrice(product) {
    if (!product) return 0

    // If it's a branch stock item with variety
    if (product.variety && product.variety.price) {
        return isVarietyOnSale(product.variety) ? product.variety.sale.salePrice : product.variety.price
    }

    // If it's a product with varieties
    if (product.product && product.product.varieties) {
        const defaultVariety = product.product.varieties.find((v) => v.isDefault) || product.product.varieties[0]
        if (defaultVariety) {
            return isVarietyOnSale(defaultVariety) ? defaultVariety.sale.salePrice : defaultVariety.price
        }
    }

    // Direct product with varieties
    if (product.varieties) {
        const defaultVariety = product.varieties.find((v) => v.isDefault) || product.varieties[0]
        if (defaultVariety) {
            return isVarietyOnSale(defaultVariety) ? defaultVariety.sale.salePrice : defaultVariety.price
        }
    }

    // Fallback to direct price
    return product.price || 0
}

/**
 * Check if a variety is on sale
 * @param {Object} variety - Variety object
 * @returns {Boolean} True if on sale
 */
export function isVarietyOnSale(variety) {
    if (!variety?.onSale || !variety?.sale) return false

    const now = Date.now()
    const startDate = variety.sale.startDate?.seconds * 1000
    const endDate = variety.sale.endDate?.seconds * 1000

    return now >= startDate && now <= endDate
}

/**
 * Get sale status information
 * @param {Object} variety - Variety object
 * @returns {Object|null} Sale status information or null if not on sale
 */
export function getSaleStatus(variety) {
    if (!variety?.onSale || !variety?.sale) return null

    const now = Date.now()
    const startDate = variety.sale.startDate?.seconds * 1000
    const endDate = variety.sale.endDate?.seconds * 1000

    // Not yet started
    if (now < startDate) {
        return {
            status: "upcoming",
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            timeRemaining: formatTimeRemaining(startDate - now),
            message: `Sale starts in ${formatTimeRemaining(startDate - now)}`,
        }
    }

    // Active sale
    if (now >= startDate && now <= endDate) {
        return {
            status: "active",
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            timeRemaining: formatTimeRemaining(endDate - now),
            message: `Sale ends in ${formatTimeRemaining(endDate - now)}`,
        }
    }

    // Expired sale
    return {
        status: "expired",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        message: "Sale has ended",
    }
}

/**
 * Format time remaining in a human-readable format
 * @param {Number} milliseconds - Time in milliseconds
 * @returns {String} Formatted time
 */
export function formatTimeRemaining(milliseconds) {
    if (milliseconds <= 0) return "Ended"

    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
        return `${days}d ${hours % 24}h`
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`
    } else {
        return `${seconds}s`
    }
}

/**
 * Format date and time
 * @param {Date} date - Date object
 * @returns {String} Formatted date and time
 */
export function formatDateTime(date) {
    if (!date) return ""

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

/**
 * Get the main image URL for a product
 * @param {Object} product - Product object
 * @returns {String} Image URL
 */
export function getProductImage(product) {
    // Handle branch stock item
    if (product.product && product.product.imageUrls) {
        return product.product.imageUrls[0] || "/placeholder.svg?height=200&width=200"
    }

    // Handle direct product
    if (product.imageUrls && product.imageUrls.length > 0) {
        return product.imageUrls[0]
    }

    if (product.imageUrl) {
        return product.imageUrl
    }

    return "/placeholder.svg?height=200&width=200"
}

/**
 * Group branch stock items by product
 * @param {Array} branchStock - Array of branch stock items
 * @returns {Array} Array of products with varieties
 */
export function groupStockByProduct(branchStock) {
    if (!branchStock || !Array.isArray(branchStock)) return []

    const productMap = new Map()

    branchStock.forEach((item) => {
        if (!item.productId) return

        if (!productMap.has(item.productId)) {
            // Create new product entry
            productMap.set(item.productId, {
                id: item.productId,
                name: item.productName || (item.product ? item.product.name : "Unknown Product"),
                description: item.product ? item.product.description : "",
                imageUrl: getProductImage(item),
                imageUrls: item.product ? item.product.imageUrls : [],
                category: item.product ? item.product.category : [],
                varieties: [],
            })
        }

        // Add variety to product
        const product = productMap.get(item.productId)

        // Check if variety already exists
        const existingVarietyIndex = product.varieties.findIndex((v) => v.id === item.varietyId)

        if (existingVarietyIndex === -1) {
            // Add new variety
            product.varieties.push({
                id: item.varietyId,
                name: item.varietyName || "Default",
                price: item.variety ? item.variety.price : 0,
                onSale: item.variety ? item.variety.onSale : false,
                sale: item.variety ? item.variety.sale : null,
                stockQuantity: item.quantity || 0,
                unit: item.variety ? item.variety.unit : "piece",
                isDefault: item.variety ? item.variety.isDefault : false,
            })
        } else {
            // Update existing variety
            product.varieties[existingVarietyIndex].stockQuantity = item.quantity || 0
        }
    })

    return Array.from(productMap.values())
}

/**
 * Filter products by category
 * @param {Array} products - Array of products
 * @param {String} category - Category to filter by
 * @returns {Array} Filtered products
 */
export function filterProductsByCategory(products, category) {
    if (!category || category === "All") return products

    return products.filter(
        (product) => product.category && Array.isArray(product.category) && product.category.includes(category),
    )
}

/**
 * Format currency
 * @param {Number} amount - Amount to format
 * @returns {String} Formatted amount
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount)
}

/**
 * Check if stock is low
 * @param {Number} quantity - Stock quantity
 * @returns {Boolean} True if stock is low
 */
export function isLowStock(quantity) {
    return quantity > 0 && quantity <= 5
}

/**
 * Get stock status label
 * @param {Number} quantity - Stock quantity
 * @returns {Object} Stock status with label and color
 */
export function getStockStatus(quantity) {
    if (quantity <= 0) {
        return { label: "Out of Stock", color: "red", textColor: "text-red-600", bgColor: "bg-red-100" }
    }

    if (quantity <= 5) {
        return { label: "Low Stock", color: "orange", textColor: "text-orange-600", bgColor: "bg-orange-100" }
    }

    return { label: "In Stock", color: "green", textColor: "text-green-600", bgColor: "bg-green-100" }
}

/**
 * Check if product has multiple varieties
 * @param {Object} product - Product object
 * @returns {Boolean} True if product has multiple varieties
 */
export function hasMultipleVarieties(product) {
    return product.varieties && product.varieties.length > 1
}



/**
 * Convert date to Local Date
 */
export function formatOrderDate(timestamp) {
    if (!timestamp) return '';

    const date = timestamp._seconds ?
        new Date(timestamp._seconds * 1000) :
        new Date(timestamp);

    return date.toLocaleString();
};
//#endregion
