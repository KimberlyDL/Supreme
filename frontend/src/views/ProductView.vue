<!-- src/views/ProductView.vue -->
<template>
  <div>
    <ProductForm
      v-if="isEditing"
      :product="editingProduct"
      :isEdit="true"
      @productSaved="handleProductSaved"
    />
    <ProductForm
      v-else
      :product="{ name: '', description: '', price: 0, quantity: 0 }"
      @productSaved="handleProductSaved"
    />
    <ProductList @editProduct="startEdit" />
  </div>
</template>

<script>
import ProductForm from '../components/ProductForm.vue';
import ProductList from '../components/ProductList.vue';

export default {
  components: {
    ProductForm,
    ProductList
  },
  data() {
    return {
      isEditing: false,
      editingProduct: {}
    };
  },
  methods: {
    startEdit(product) {
      this.editingProduct = product;
      this.isEditing = true;
    },
    handleProductSaved() {
      this.isEditing = false;
      this.editingProduct = {};
    }
  }
};
</script>
