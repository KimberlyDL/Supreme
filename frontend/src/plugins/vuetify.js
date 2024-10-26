/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Composables
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { BLUE_THEME } from '@/theme/LightTheme';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

// icons
// import logo from '@assets/images/logos/logo.vue';
// import logo_icon from '@assets/images/logos/logo-icon.vue';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'BLUE_THEME',
    themes: {
      BLUE_THEME,
    }
  },
  // icons: {
  //   values: {
  //     customLogo: {
  //       component: logo,
  //     },
  //     secondaryLogo: {
  //       component: logo_icon,
  //     },
  //   },
  // },
  defaults: {
    VCard: {
      rounded: 'xl'
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
  }
});
