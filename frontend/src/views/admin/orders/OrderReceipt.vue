<template>
  <div class="p-4 bg-bgPrimary-0">
    <div class="max-w-3xl mx-auto">
      <!-- Actions Bar -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-tBase-100">Order Receipt</h1>
        <div class="flex space-x-2">
          <button 
            @click="printReceipt" 
            class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
          >
            <Printer class="h-4 w-4 mr-2" />
            Print
          </button>
          <button 
            @click="downloadPdf" 
            class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 flex items-center"
          >
            <Download class="h-4 w-4 mr-2" />
            Download PDF
          </button>
          <router-link 
            :to="`/administrator/orders/${orderId}`" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
          >
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to Order
          </router-link>
        </div>
      </div>
      
      <!-- Receipt Card -->
      <div id="receipt" class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <!-- Loading State -->
        <div v-if="orderStore.loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="orderStore.error" class="text-center py-12">
          <XCircle class="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p class="text-lg text-red-500">{{ orderStore.error }}</p>
          <button 
            @click="loadOrder" 
            class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
        
        <!-- Receipt Content -->
        <template v-else-if="order">
          <!-- Header -->
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-800">RECEIPT</h2>
            <p class="text-gray-500">Order #{{ order.orderNumber || order.id }}</p>
          </div>
          
          <!-- Company Info -->
          <div class="flex justify-between mb-8">
            <div>
              <h3 class="font-bold text-gray-800">Your Company Name</h3>
              <p class="text-gray-600">123 Business Street</p>
              <p class="text-gray-600">City, State 12345</p>
              <p class="text-gray-600">Phone: (123) 456-7890</p>
            </div>
            <div class="text-right">
              <p class="text-gray-600">Date: {{ formatDate(order.createdAt) }}</p>
              <p class="text-gray-600">Time: {{ formatTime(order.createdAt) }}</p>
              <p class="text-gray-600">Status: {{ order.status }}</p>
              <p class="text-gray-600">Payment: {{ order.paymentType }}</p>
            </div>
          </div>
          
          <!-- Customer Info -->
          <div class="mb-8">
            <h3 class="font-bold text-gray-800 mb-2">Customer</h3>
            <p class="text-gray-600">{{ order.customerName || order.client || 'Walk-in Customer' }}</p>
          </div>
          
          <!-- Order Items -->
          <div class="mb-8">
            <h3 class="font-bold text-gray-800 mb-2">Order Items</h3>
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-gray-200">
                  <th class="py-2 text-left text-gray-600">Item</th>
                  <th class="py-2 text-center text-gray-600">Quantity</th>
                  <th class="py-2 text-right text-gray-600">Unit Price</th>
                  <th class="py-2 text-right text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in order.items" :key="index" class="border-b border-gray-200">
                  <td class="py-3">
                    <div class="font-medium text-gray-800">{{ item.productName }}</div>
                    <div class="text-sm text-gray-500">{{ item.varietyName }}</div>
                  </td>
                  <td class="py-3 text-center text-gray-600">{{ item.quantity }} {{ item.unit }}</td>
                  <td class="py-3 text-right text-gray-600">{{ formatCurrency(item.unitPrice) }}</td>
                  <td class="py-3 text-right text-gray-600">{{ formatCurrency(item.totalPrice) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Totals -->
          <div class="border-t-2 border-gray-200 pt-4">
            <div class="flex justify-between mb-2">
              <span class="font-medium text-gray-600">Subtotal:</span>
              <span class="text-gray-800">{{ formatCurrency(calculateSubtotal()) }}</span>
            </div>
            <div v-if="order.discounts" class="flex justify-between mb-2">
              <span class="font-medium text-gray-600">Discounts:</span>
              <span class="text-gray-800">-{{ formatCurrency(order.discounts) }}</span>
            </div>
            <div v-if="order.tax" class="flex justify-between mb-2">
              <span class="font-medium text-gray-600">Tax:</span>
              <span class="text-gray-800">{{ formatCurrency(order.tax) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>{{ formatCurrency(order.totalPrice) }}</span>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="mt-8 text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
            <p class="mt-2">For questions or concerns, please contact us at support@yourcompany.com</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore';
import { Printer, Download, ArrowLeft, XCircle } from 'lucide-vue-next';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Route and stores
const route = useRoute();
const orderStore = useOrderStore();

// State
const orderId = computed(() => route.params.id);
const order = computed(() => orderStore.formattedCurrentOrder);
const isLoading = ref(false);

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate subtotal
const calculateSubtotal = () => {
  if (!order.value || !order.value.items) return 0;
  
  return order.value.items.reduce((total, item) => total + (item.totalPrice || 0), 0);
};

// Print receipt
const printReceipt = () => {
  const receiptContent = document.getElementById('receipt');
  const originalContents = document.body.innerHTML;
  
  document.body.innerHTML = receiptContent.innerHTML;
  window.print();
  document.body.innerHTML = originalContents;
  
  // Reload the page to restore Vue functionality
  window.location.reload();
};

// Download PDF
const downloadPdf = () => {
  if (!order.value) return;
  
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('RECEIPT', 105, 20, { align: 'center' });
  
  // Add order number
  doc.setFontSize(12);
  doc.text(`Order #${order.value.orderNumber || order.value.id}`, 105, 30, { align: 'center' });
  
  // Add company info
  doc.setFontSize(14);
  doc.text('Your Company Name', 20, 45);
  doc.setFontSize(10);
  doc.text('123 Business Street', 20, 52);
  doc.text('City, State 12345', 20, 58);
  doc.text('Phone: (123) 456-7890', 20, 64);
  
  // Add order info
  doc.text(`Date: ${formatDate(order.value.createdAt)}`, 190, 45, { align: 'right' });
  doc.text(`Time: ${formatTime(order.value.createdAt)}`, 190, 52, { align: 'right' });
  doc.text(`Status: ${order.value.status}`, 190, 58, { align: 'right' });
  doc.text(`Payment: ${order.value.paymentType}`, 190, 64, { align: 'right' });
  
  // Add customer info
  doc.setFontSize(12);
  doc.text('Customer', 20, 80);
  doc.setFontSize(10);
  doc.text(order.value.customerName || order.value.client || 'Walk-in Customer', 20, 87);
  
  // Add items table
  const tableColumn = ['Item', 'Quantity', 'Unit Price', 'Total'];
  const tableRows = [];
  
  order.value.items.forEach(item => {
    const itemData = [
      `${item.productName}\n${item.varietyName}`,
      `${item.quantity} ${item.unit}`,
      formatCurrency(item.unitPrice),
      formatCurrency(item.totalPrice)
    ];
    tableRows.push(itemData);
  });
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 95,
    theme: 'grid',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' }
    },
    headStyles: { fillColor: [66, 66, 66] }
  });
  
  // Add totals
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.text('Subtotal:', 130, finalY);
  doc.text(formatCurrency(calculateSubtotal()), 190, finalY, { align: 'right' });
  
  if (order.value.discounts) {
    doc.text('Discounts:', 130, finalY + 7);
    doc.text(`-${formatCurrency(order.value.discounts)}`, 190, finalY + 7, { align: 'right' });
  }
  
  if (order.value.tax) {
    doc.text('Tax:', 130, finalY + 14);
    doc.text(formatCurrency(order.value.tax), 190, finalY + 14, { align: 'right' });
  }
  
  // Add total
  doc.setFontSize(12);
  doc.text('Total:', 130, finalY + 25);
  doc.text(formatCurrency(order.value.totalPrice), 190, finalY + 25, { align: 'right' });
  
  // Add footer
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 105, finalY + 40, { align: 'center' });
  doc.text('For questions or concerns, please contact us at support@yourcompany.com', 105, finalY + 47, { align: 'center' });
  
  // Save the PDF
  doc.save(`receipt-${order.value.orderNumber || order.value.id}.pdf`);
};

// Load order data
const loadOrder = async () => {
  if (!orderId.value) return;
  
  isLoading.value = true;
  try {
    await orderStore.setupRealtimeOrderById(orderId.value);
  } catch (error) {
    console.error('Error loading order:', error);
  } finally {
    isLoading.value = false;
  }
};

// Initialize component
onMounted(() => {
  loadOrder();
});
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #receipt, #receipt * {
    visibility: visible;
  }
  #receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>