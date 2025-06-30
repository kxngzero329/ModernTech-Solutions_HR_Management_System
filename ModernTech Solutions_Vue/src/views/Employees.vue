<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Employees</h2>
      <button class="btn btn-outline-info" @click="openAddForm">Add Employee</button>
    </div>

    <input v-model="searchTerm" type="text" class="form-control mb-4" placeholder="Search by name or department" />

    <div class="row g-4">
      <div class="col-md-4" v-for="emp in filteredEmployees" :key="emp.employeeId">
        <div class="card h-100 border shadow-sm employee-card">
          <div class="card-body">
            <h5 class="card-title">{{ emp.name }}</h5>
            <p class="text-muted">{{ emp.position }} — {{ emp.department }}</p>
            <p><strong>Salary:</strong> R {{ emp.salary.toLocaleString() }}</p>
            <p><strong>Contact:</strong> {{ emp.contact }}</p>
          </div>
          <div class="card-footer d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-outline-primary" @click="openEditForm(emp)">Edit</button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteEmployee(emp.employeeId)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="employeeModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Edit' : 'Add' }} Employee</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label>Name</label>
              <input v-model="form.name" class="form-control" />
            </div>
            <div class="mb-3">
              <label>Position</label>
              <input v-model="form.position" class="form-control" />
            </div>
            <div class="mb-3">
              <label>Department</label>
              <input v-model="form.department" class="form-control" />
            </div>
            <div class="mb-3">
              <label>Salary</label>
              <input type="number" v-model.number="form.salary" class="form-control" />
            </div>
            <div class="mb-3">
              <label>Contact</label>
              <input v-model="form.contact" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-outline-primary" @click="saveEmployee">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as bootstrap from 'bootstrap'

const employees = ref([])
const searchTerm = ref('')
const editMode = ref(false)
const form = ref({})

// Load from localStorage or JSON
onMounted(async () => {
  const stored = localStorage.getItem('employeeData')
  if (stored) {
    employees.value = JSON.parse(stored)
  } else {
    const res = await fetch('/data/employee_info.json')
    const data = await res.json()
    employees.value = data.employeeInformation
    localStorage.setItem('employeeData', JSON.stringify(employees.value))
  }
})

// Watch & sync localStorage
// to keep data persistent
watch(employees, (val) => {
  localStorage.setItem('employeeData', JSON.stringify(val))
}, { deep: true })

const filteredEmployees = computed(() => {
  if (!searchTerm.value) return employees.value
  const term = searchTerm.value.toLowerCase()
  return employees.value.filter(emp =>
    emp.name.toLowerCase().includes(term) ||
    emp.department.toLowerCase().includes(term)
  )
})

function openAddForm() {
  editMode.value = false
  form.value = {
    employeeId: 'EMP' + Date.now(),
    name: '',
    position: '',
    department: '',
    salary: 0,
    contact: ''
  }
  new bootstrap.Modal(document.getElementById('employeeModal')).show()
}

function openEditForm(emp) {
  editMode.value = true
  form.value = { ...emp }
  new bootstrap.Modal(document.getElementById('employeeModal')).show()
}

function saveEmployee() {
  if (editMode.value) {
    const index = employees.value.findIndex(e => e.employeeId === form.value.employeeId)
    if (index !== -1) employees.value[index] = { ...form.value }
  } else {
    employees.value.push({ ...form.value })
  }
  bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide()
}

function deleteEmployee(id) {
  const emp = employees.value.find(e => e.employeeId === id)
  const confirmed = confirm(`Are you sure you want to delete ${emp?.name}?`)
  if (confirmed) {
    employees.value = employees.value.filter(emp => emp.employeeId !== id)
  }
}
</script>

<style scoped>
.employee-card {
  transition: 0.3s ease;
  border: 1px solid #c7c7c7 !important;
  border-radius: 10px;
  background-color: #f5f5f5;
}

.employee-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.719) !important;
}

.card-footer .btn {
  min-width: 80px;
}
</style>
