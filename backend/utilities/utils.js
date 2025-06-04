// backend\utilities\utils.js
const { v4: uuidv4 } = require("uuid");

const _generateShortId = (prefix) => {
  const [block1, block2] = uuidv4().split("-");
  return `${prefix}${block1}${block2}`;
};

const _generateBranchId = () => {
  const random = uuidv4().split("-")[0];
  return `BR${random.slice(0,4)}`;
};

const _generateLogId = (targetId) => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");

  return `LOG-${targetId}-${timestamp}`;
};

/**
 * Generate a unique log ID
 * @param {'ORDER' | 'SALE'} type - Type of the log
 * @returns {string} - Formatted log ID
 */
const _generateOrdSaleLogId = (type) => {
  const now = new Date();

  const pad = (n) => n.toString().padStart(2, "0");

  const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");

  const random = uuidv4().split("-")[0];

  return `LOG-${type}-${timestamp}-${random.slice(0, 4)}`;
};

const _generateActivityLogId = (userId) => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");

  return `LOG-${timestamp}-${userId}`;
};

/**
 * Validates expirationDates array against the total quantity
 *
 * @param {Array} expirationDates - Array of expiration entries like [{ date: 1748131200, qty: 5 }]
 * @param {number} quantity - The total quantity expected
 * @returns {{ isValid: boolean, message?: string, total?: number }}
 */
const validateExpirationDates = (expirationDates, quantity) => {
  if (!Array.isArray(expirationDates) || expirationDates.length === 0) {
    return {
      isValid: false,
      message: "expirationDates must be a non-empty array",
    };
  }

  let totalQty = 0;

  for (let i = 0; i < expirationDates.length; i++) {
    const entry = expirationDates[i];

    if (
      !entry ||
      typeof entry.date !== "number" ||
      typeof entry.qty !== "number"
    ) {
      return {
        isValid: false,
        message: `Invalid expiration entry at index ${i}: must include a numeric date and qty`,
      };
    }

    if (entry.qty <= 0) {
      return {
        isValid: false,
        message: `Invalid qty at index ${i}: quantity must be greater than 0`,
      };
    }

    totalQty += entry.qty;
  }

  if (totalQty !== quantity) {
    return {
      isValid: false,
      message: `Total quantity from expirationDates (${totalQty}) does not match provided quantity (${quantity})`,
    };
  }

  return {
    isValid: true,
    total: totalQty,
  };
};

const _generateOrderId = (branchId = "") => {
  const now = new Date();

  const pad = (n) => n.toString().padStart(2, "0");

  const timestamp = [
    now.getFullYear().toString().slice(-2),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("");

  const branch = branchId
    ? branchId.replace(/\s+/g, "").slice(0, 3).toUpperCase()
    : "XXX";

  const random = uuidv4().split("-")[0];

  return `ORD-${branch}-${timestamp}-${random.slice(0, 4)}`;
};

module.exports = {
  _generateBranchId,
  _generateShortId,
  _generateLogId,
  _generateOrdSaleLogId,
  _generateOrderId,
  _generateActivityLogId,
  validateExpirationDates,
};
