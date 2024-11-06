<template>
    <footer class="bg-gray-800 text-white py-8">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-green-400">Terms of Service</a></li>
              <li><a href="#" class="hover:text-green-400">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-green-400">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-4">Contact Us</h3>
            <p>Email: support@supremeagrivet.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-4">Follow Us</h3>
            <div class="flex space-x-4">
              <a href="#" class="hover:text-green-400"><FacebookIcon class="h-6 w-6" /></a>
              <a href="#" class="hover:text-green-400"><TwitterIcon class="h-6 w-6" /></a>
              <a href="#" class="hover:text-green-400"><InstagramIcon class="h-6 w-6" /></a>
            </div>
          </div>
        </div>
        <div class="mt-8 text-center">
          <p>&copy; 2024 Supreme Agrivet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup>
  import { FacebookIcon, TwitterIcon, InstagramIcon } from 'lucide-vue-next'
  </script>