<template>
  <div class="login-page">
    <div class="overlay d-flex justify-content-center align-items-center">
      <div class="login-box p-4 shadow rounded">
        <img src="/images/logo-2.png" alt="ModernTech Logo" class="img-fluid mx-auto d-block mb-3"
          style="max-height: 90px;" />
        <h3 class="text-center mb-1">ModernTech HR</h3>
        <p class="text-center text-muted mb-1">Login to your account</p>
        <p class="text-center text-muted">Admin</p>
        <hr class="my-3" />

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input v-model="username" type="text" class="form-control" id="username" placeholder="Enter username"
              required />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input v-model="password" type="password" class="form-control" id="password" placeholder="Enter password"
              required />
          </div>

          <button type="submit" class="btn w-100">Login</button>
        </form>

        <div v-if="error" class="text-danger mt-2 text-center">{{ error }}</div>
        <p class="text-center mt-3 text-muted">Credentials: <strong>Admin / admin123</strong></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

function handleLogin() {
  if (username.value === 'Admin' && password.value === 'admin123') {
    localStorage.setItem('auth', 'true')
    router.push('/dashboard')
  } else {
    error.value = 'Invalid username or password.'
  }
}
</script>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  background: url('/public/images/login-bg.jpg') no-repeat center center;
  background-size: cover;
  overflow: hidden;
}

.overlay {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

}

img {
  border: 2px solid #91279b;
  border-radius: 50%;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background-color: #ffffffce;

}

button {
  background-color: #91279b;
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s ease;
  border-radius: 5px;
}


button:hover {
  background-color: #7a1f8b;
  box-shadow: 0 0 20px rgba(145, 39, 155, 0.5);
  color: white;
}
</style>
