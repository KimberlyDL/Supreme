<script setup>
import { ref } from 'vue';
const checkbox = ref(true);
</script>

<template>
    <v-row class="d-flex mb-3">
        <v-col cols="12">
            <v-label class="font-weight-semibold mb-1">Username</v-label>
            <v-text-field variant="outlined" density="compact" hide-details color="primary"></v-text-field>
        </v-col>
        <v-col cols="12">
            <v-label class="font-weight-semibold mb-1">Password</v-label>
            <v-text-field variant="outlined"  density="compact" type="password"   hide-details color="primary"></v-text-field>
        </v-col>
        <v-col cols="12" class="pt-0">
            <div class="d-flex flex-wrap align-center">
                <v-checkbox v-model="checkbox"  color="primary" hide-details>
                    <template v-slot:label class="text-body-1">Remeber this Device</template>
                </v-checkbox>
                <div class="ml-sm-auto">
                    <RouterLink to="/"
                        class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium">Forgot
                        Password ?</RouterLink>
                </div>
            </div>
        </v-col>
        <v-col cols="12" class="pt-0">
            <v-btn to="/" rounded="md" color="primary" size="large" block   flat>Sign in</v-btn>
        </v-col>
    </v-row>
</template>
