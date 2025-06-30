<template>
  <div class="container mt-4">
    <h2 class="mb-4">Leave Requests</h2>

    <!-- Toggle form -->
    <button class="btn btn-outline-success mb-3" @click="showAddForm = !showAddForm">
      {{ showAddForm ? 'Cancel' : 'Add Leave Request' }}
    </button>

    <!-- Add Form -->
    <div v-if="showAddForm" class="card p-3 mb-4">
      <div class="mb-3">
        <label class="form-label">Employee</label>
        <select v-model="newRequest.employeeId" class="form-select">
          <option disabled value="">-- Select Employee --</option>
          <option v-for="emp in employees" :key="emp.employeeId" :value="emp.employeeId">
            {{ emp.name }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Date</label>
        <input v-model="newRequest.date" type="date" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">Reason</label>
        <input v-model="newRequest.reason" type="text" class="form-control" placeholder="e.g. Sick Leave" />
      </div>
      <button class="btn btn-primary" @click="submitRequest">Submit Request</button>
    </div>

    <!-- Leave Requests Table -->
    <div class="table-responsive">
      <table class="table table-bordered table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(req, index) in allRequests" :key="index">
            <td>{{ req.name }}</td>
            <td>{{ req.date }}</td>
            <td>{{ req.reason }}</td>
            <td>
              <span :class="badgeClass(req.status)">{{ req.status }}</span>
            </td>
            <td>
              <div v-if="req.status === 'Pending'" class="d-flex gap-2">
                <button class="btn btn-sm btn-success" @click="updateStatus(req, 'Approved')">Approve</button>
                <button class="btn btn-sm btn-danger" @click="updateStatus(req, 'Denied')">Deny</button>
              </div>
              <div v-else class="text-muted small">No action needed</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const employees = ref([])
const attendanceData = ref([])
const showAddForm = ref(false)

const newRequest = ref({
  employeeId: '',
  date: '',
  reason: '',
  status: 'Pending'
})

// Load data
onMounted(async () => {
  const cached = localStorage.getItem('attendanceData')
  if (cached) {
    attendanceData.value = JSON.parse(cached)
  } else {
    const res = await fetch('/data/attendance.json')
    const data = await res.json()
    attendanceData.value = data.attendanceAndLeave
  }

  const empRes = await fetch('/data/employee_info.json')
  const empData = await empRes.json()
  employees.value = empData.employeeInformation
})

// Combine all leave requests with index
const allRequests = computed(() => {
  return attendanceData.value.flatMap(emp => {
    return emp.leaveRequests.map((req, i) => ({
      ...req,
      employeeId: emp.employeeId,
      name: emp.name,
      index: i
    }))
  }).sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1
    if (a.status !== 'Pending' && b.status === 'Pending') return 1
    return new Date(b.date) - new Date(a.date)
  })
})

// Submit new leave request
function submitRequest() {
  if (!newRequest.value.employeeId || !newRequest.value.date || !newRequest.value.reason) return

  const emp = attendanceData.value.find(e => e.employeeId === newRequest.value.employeeId)
  emp.leaveRequests.push({
    date: newRequest.value.date,
    reason: newRequest.value.reason,
    status: 'Pending'
  })

  saveData()
  showAddForm.value = false
  newRequest.value = { employeeId: '', date: '', reason: '', status: 'Pending' }
}

// Approve / Deny request using index
function updateStatus(req, status) {
  const emp = attendanceData.value.find(e => e.employeeId === req.employeeId)
  const leave = emp.leaveRequests[req.index]

  if (leave) {
    leave.status = status
    if (status === 'Approved') {
      emp.attendance.push({ date: leave.date, status: 'Absent' })
    }
    saveData()
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('attendanceData', JSON.stringify(attendanceData.value))
}

// Badge styling
function badgeClass(status) {
  return {
    'badge bg-warning text-dark': status === 'Pending',
    'badge bg-success': status === 'Approved',
    'badge bg-danger': status === 'Denied'
  }
}
</script>
