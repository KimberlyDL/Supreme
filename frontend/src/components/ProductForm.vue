<script>
import { ref, watch } from 'vue';
import { createProduct, updateProduct } from '@/services/api';

export default {
  props: {
    productToEdit: Object,
  },
  setup(props, { emit }) {
    const name = ref('');
    const description = ref('');
    const price = ref(0);
    const quantity = ref(0);
    const file = ref(null);
    const showForm = ref(false);
    const isEditing = ref(false);

    const handleFileUpload = (event) => {
      file.value = event.target.files[0];
    };

    const toggleForm = () => {
      showForm.value = !showForm.value;
      if (showForm.value) {
        resetForm();
      } else {
        isEditing.value = false; // Reset editing state when hiding form
      }
    };

    const submitProduct = async () => {
      const formData = new FormData();
      formData.append('name', name.value);
      formData.append('description', description.value);
      formData.append('price', price.value);
      formData.append('quantity', quantity.value);
      if (file.value) {
        formData.append('image', file.value);
      }

      try {
        if (isEditing.value) {
          await updateProduct(props.productToEdit.id, formData);
        } else {
          await createProduct(formData);
        }
        emit('product-created');
        resetForm();
        toggleForm();
      } catch (error) {
        console.error('Error saving product:', error);
      }
    };

    const resetForm = () => {
      name.value = '';
      description.value = '';
      price.value = 0;
      quantity.value = 0;
      file.value = null;
      isEditing.value = false;
    };

    // Watch for productToEdit prop to populate the form for editing
    watch(
      () => props.productToEdit,
      (newProduct) => {
        if (newProduct) {
          name.value = newProduct.name;
          description.value = newProduct.description;
          price.value = newProduct.price;
          quantity.value = newProduct.quantity;
          isEditing.value = true;
          showForm.value = true; // Show form when editing a product
        } else {
          resetForm();
        }
      }
    );

    return {
      name,
      description,
      price,
      quantity,
      handleFileUpload,
      submitProduct,
      showForm,
      toggleForm,
      isEditing,
    };
  },
};
</script>
