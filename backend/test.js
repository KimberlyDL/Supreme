// Generate a unique order number
const generateOrderNumber = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${timestamp}-${random}`;
};

const _generateOrdSaleLogId = (type, branchId, orderNumber = "") => {
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

  const cleanBranch = branchId
    ? branchId.replace(/\s+/g, "").toUpperCase()
    : "NOBRANCH";
  const shortOrder = orderNumber ? `${orderNumber}` : "";

  return `${type}-${cleanBranch}-${timestamp}-${shortOrder}`;
};

console.log("method 1");

console.log(generateOrderNumber());

console.log("method 2");

console.log(_generateOrdSaleLogId("test", "branch", "orderNumber" ));