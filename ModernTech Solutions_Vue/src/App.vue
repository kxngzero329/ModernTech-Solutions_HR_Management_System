<template>
  <div>
    <!-- Sidebar only show when not on login page -->
    <Sidebar v-if="!isLoginPage" :isCollapsed="!sidebarOpen" />

    <!-- Burger toggle hide on login page -->
    <button v-if="!isLoginPage" class="btn btn-outline-secondary toggle-btn d-md-none" @click="toggleSidebar">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Main content -->
    <main class="page-content" :class="{ 'no-sidebar': isLoginPage }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

// Sidebar toggle state
const sidebarOpen = ref(true)
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')

</script>

<style>
/* Desktop sidebar */
.page-content {
  padding: 1rem;
  margin-left: 220px;
  transition: margin-left 0.3s ease;
}

/* No sidebar margin for login page */
.page-content.no-sidebar {
  margin-left: 0 !important;
}

/* Mobile */
@media (max-width: 767.98px) {
  .page-content {
    margin-left: 0;
  }
}

/* Burger menu button positioning */
.toggle-btn {
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1051;
}
</style>
