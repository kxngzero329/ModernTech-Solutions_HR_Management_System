<template>
  <div :class="[
    'sidebar bg-light border-end p-3',
    { 'collapsed': isCollapsed, 'sidebar-overlay': isMobile && isCollapsed }
  ]">
    <h5 class="mb-4 d-none d-md-block">
      <img src="/images/logo-2.png" alt="ModernTech Logo" class="img-fluid rounded" style="max-height: 50px;" />
      MT Solutions
    </h5>
    <hr />
    <ul class="nav flex-column">
      <li class="nav-item">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/employees" class="nav-link">Employees</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/leave-requests" class="nav-link">Leave Requests</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/attendance" class="nav-link">Attendance</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/payroll" class="nav-link">Payroll</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/performance-review" class="nav-link">Reviews</router-link>
      </li>
    </ul>
    <hr />
    <div class="d-flex justify-content-between align-items-center">
      <span>Logged in as: <strong>Admin</strong></span>
      <router-link to="/login" class="btn btn-outline-danger btn-sm">Logout</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  isCollapsed: Boolean
})

const isMobile = ref(false)

onMounted(() => {
  const checkSize = () => {
    isMobile.value = window.innerWidth < 768
  }
  checkSize()
  window.addEventListener('resize', checkSize)
})
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  z-index: 1040;
  transition: transform 0.3s ease;
  background-color: #f8f9fa;
}

.collapsed {
  transform: translateX(-100%);
}

/* overlay effect on small screens */
.sidebar-overlay {
  position: fixed !important;
  background-color: rgba(248, 249, 250, 0.97);
  /* soft light bg */
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
}

@media (min-width: 768px) {
  .sidebar {
    transform: translateX(0) !important;
    position: fixed;
  }

  .collapsed {
    transform: translateX(0);
    position: fixed;
  }
}

.nav-link.router-link-exact-active {
  font-weight: bold;
  color: #0d6efd;
}
</style>
