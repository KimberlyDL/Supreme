<template>
    <v-app :theme="theme">
      <NavHeader />
      <v-main>
        <!-- Product Catalog Section -->
      <v-container fluid class="product-catalog-section pa-0">
        <v-row no-gutters>
          <v-col cols="12" class="pa-16">
            <h1 class="text-h2 text-center mb-8">Our Product Catalog</h1>
            <v-row>
              <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4" lg="3">
                <v-card>
                  <v-img :src="product.image" height="200px" cover></v-img>
                  <v-card-title>{{ product.name }}</v-card-title>
                  <v-card-text>
                    <p>{{ product.description }}</p>
                    <p class="text-h6 mt-2">${{ product.price.toFixed(2) }}</p>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" block>Add to Cart</v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
  
        <!-- Features Section -->
        <v-container class="py-16">
          <h2 class="text-h3 text-center mb-12">Our Features</h2>
          <v-row>
            <v-col v-for="feature in features" :key="feature.title" cols="12" md="4">
              <WidgetCard :title="feature.title">
                <v-icon :icon="feature.icon" size="48" color="primary" class="mb-4"></v-icon>
                <p>{{ feature.description }}</p>
              </WidgetCard>
            </v-col>
          </v-row>
        </v-container>
  
        <!-- Pricing Section -->
        <v-container fluid class="py-16 bg-light">
          <v-container>
            <h2 class="text-h3 text-center mb-12">Pricing Plans</h2>
            <v-row>
              <v-col v-for="plan in pricingPlans" :key="plan.title" cols="12" md="4">
                <UiParentCard :title="plan.title">
                  <template #action>
                    <v-chip :color="plan.color" class="ma-2">{{ plan.price }}</v-chip>
                  </template>
                  <v-list>
                    <v-list-item v-for="feature in plan.features" :key="feature">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-check</v-icon>
                      </template>
                      {{ feature }}
                    </v-list-item>
                  </v-list>
                  <v-btn :color="plan.color" block class="mt-4">Choose Plan</v-btn>
                </UiParentCard>
              </v-col>
            </v-row>
          </v-container>
        </v-container>
  
        <!-- Testimonials Section -->
        <v-container class="py-16">
          <h2 class="text-h3 text-center mb-12">What Our Customers Say</h2>
          <v-row>
            <v-col v-for="testimonial in testimonials" :key="testimonial.name" cols="12" md="4">
              <WidgetCardv2 title="Testimonial">
                <v-card-text>
                  <p class="text-body-1 mb-4">"{{ testimonial.quote }}"</p>
                  <v-avatar size="48" class="mb-2">
                    <v-img :src="testimonial.avatar"></v-img>
                  </v-avatar>
                  <p class="text-subtitle-1 font-weight-bold mb-1">{{ testimonial.name }}</p>
                  <p class="text-caption">{{ testimonial.position }}</p>
                </v-card-text>
              </WidgetCardv2>
            </v-col>
          </v-row>
        </v-container>
  
        <!-- FAQ Section -->
        <v-container fluid class="py-16 bg-light">
          <v-container>
            <h2 class="text-h3 text-center mb-12">Frequently Asked Questions</h2>
            <UiTableCard title="FAQs">
              <v-expansion-panels>
                <v-expansion-panel v-for="(faq, index) in faqs" :key="index">
                  <v-expansion-panel-title>{{ faq.question }}</v-expansion-panel-title>
                  <v-expansion-panel-text>{{ faq.answer }}</v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </UiTableCard>
          </v-container>
        </v-container>
  
        <!-- Contact Form Section -->
        <v-container class="py-16">
          <h2 class="text-h3 text-center mb-12">Get in Touch</h2>
          <v-row justify="center">
            <v-col cols="12" md="8">
              <CardHeaderFooter title="Contact Us">
                <v-form>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field label="Name" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field label="Email" variant="outlined" type="email"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-textarea label="Message" variant="outlined" rows="4"></v-textarea>
                    </v-col>
                  </v-row>
                </v-form>
                <template #footer>
                  <v-btn color="primary" block>Send Message</v-btn>
                </template>
              </CardHeaderFooter>
            </v-col>
          </v-row>
        </v-container>
  
        <!-- Footer -->
        <v-footer class="bg-grey-darken-4">
          <v-container>
            <v-row>
              <v-col cols="12" md="4">
                <UiParentCardLogo>
                  <p class="mt-4">Your trusted partner in innovation and technology.</p>
                </UiParentCardLogo>
              </v-col>
              <v-col cols="12" md="8">
                <v-row>
                  <v-col v-for="(column, index) in footerColumns" :key="index" cols="6" md="3">
                    <h3 class="text-h6 mb-4">{{ column.title }}</h3>
                    <v-list density="compact" nav>
                      <v-list-item v-for="link in column.links" :key="link" :title="link" link></v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <div class="text-center">
              &copy; {{ new Date().getFullYear() }} Your Company Name. All rights reserved.
            </div>
          </v-container>
        </v-footer>
      </v-main>
    </v-app>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useTheme } from 'vuetify';
  import WidgetCard from '@/components/shared/WidgetCard.vue';
  import WidgetCardv2 from '@/components/shared/WidgetCardv2.vue';
  import UiTableCard from '@/components/shared/UiTableCard.vue';
  import UiParentCard from '@/components/shared/UiParentCard.vue';
  import CardHeaderFooter from '@/components/shared/CardHeaderFooter.vue';
  import UiParentCardLogo from '@/components/shared/UiParentCardLogo.vue';
  import NavHeader from '@/layouts/blank/nav-header/NavHeader.vue';
  
  const theme = useTheme();
  theme.global.name.value = 'BLUE_THEME';

//   // New products data
// const products = ref([]);

// // Simulated API call to fetch products from the database
// const fetchProducts = async () => {
//   // Replace this with an actual API call
//   const response = await fetch('/api/products');
//   const data = await response.json();
//   products.value = data;
// };

// onMounted(() => {
//   fetchProducts();
// });

// Example product data
const products = ref([
  {
    id: 1,
    name: 'Smartphone X',
    description: 'Latest model with advanced features and long battery life.',
    price: 799.99,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smartphone-NjMxOTk0.jpg'
  },
  {
    id: 2,
    name: 'Laptop Pro',
    description: 'Powerful laptop for professionals and creatives.',
    price: 1299.99,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/laptop-NjMxOTk0.jpg'
  },
  {
    id: 3,
    name: 'Wireless Earbuds',
    description: 'High-quality sound with noise cancellation.',
    price: 149.99,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/earbuds-NjMxOTk0.jpg'
  },
  {
    id: 4,
    name: 'Smartwatch',
    description: 'Track your fitness and stay connected on the go.',
    price: 249.99,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smartwatch-NjMxOTk0.jpg'
  },
  {
    id: 5,
    name: 'Tablet Ultra',
    description: 'Versatile tablet for work and entertainment.',
    price: 499.99,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tablet-NjMxOTk0.jpg'
  },
  {
    id: 6,
    name: 'Bluetooth Speaker',
    description: 'Portable speaker with rich, immersive sound.',
    price: 79.99,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/speaker-NjMxOTk0.jpg'
  }
]);

  
  const features = ref([
    { title: 'Easy Integration', icon: 'mdi-puzzle', description: 'Seamlessly integrate our platform with your existing systems.' },
    { title: 'Advanced Analytics', icon: 'mdi-chart-bar', description: 'Gain valuable insights with our powerful analytics tools.' },
    { title: '24/7 Support', icon: 'mdi-headphones', description: 'Our dedicated support team is always here to help you.' },
  ]);
  
  const pricingPlans = ref([
    { title: 'Basic', price: '$9.99/mo', color: 'primary', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { title: 'Pro', price: '$19.99/mo', color: 'secondary', features: ['All Basic features', 'Feature 4', 'Feature 5'] },
    { title: 'Enterprise', price: 'Custom', color: 'success', features: ['All Pro features', 'Feature 6', 'Feature 7'] },
  ]);
  
  const testimonials = ref([
    { name: 'John Doe', position: 'CEO, TechCorp', quote: 'This platform has revolutionized our workflow.', avatar: '/placeholder.svg?height=48&width=48' },
    { name: 'Jane Smith', position: 'CTO, InnovateCo', quote: 'The analytics tools are incredibly powerful.', avatar: '/placeholder.svg?height=48&width=48' },
    { name: 'Mike Johnson', position: 'Founder, StartupX', quote: 'Customer support is top-notch. Highly recommended!', avatar: '/placeholder.svg?height=48&width=48' },
  ]);
  
  const faqs = ref([
    { question: 'How do I get started?', answer: 'Sign up for an account and follow our easy onboarding process.' },
    { question: 'Is there a free trial?', answer: 'Yes, we offer a 14-day free trial for all new users.' },
    { question: 'Can I upgrade or downgrade my plan?', answer: 'You can change your plan at any time.' },
    { question: 'How secure is my data?', answer: 'We use industry-standard encryption and security measures to protect your data.' },
  ]);
  
  const footerColumns = ref([
    { title: 'Product', links: ['Features', 'Pricing', 'FAQ', 'Support'] },
    { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
    { title: 'Resources', links: ['Documentation', 'Tutorials', 'Webinars', 'eBooks'] },
    { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'GDPR'] },
  ]);
  </script>
  
  <style scoped>
  .hero-section {
    background: linear-gradient(135deg, var(--v-primary-base), var(--v-secondary-base));
    color: white;
    min-height: 80vh;
  }
  </style>
  