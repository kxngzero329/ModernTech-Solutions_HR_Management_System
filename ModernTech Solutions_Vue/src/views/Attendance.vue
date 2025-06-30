<template>
  <div class="container mt-4">
    <h2 class="mb-4">Employee Attendance</h2>

    <div class="row">
      <div class="col-md-4 mb-4" v-for="emp in attendanceData" :key="emp.employeeId">
        <div class="card h-100 shadow-sm border-0 bg-white">
          <div class="card-body">
            <h5 class="card-title text-primary">{{ emp.name }}</h5>
            <p class="text-muted mb-3">ID: {{ emp.employeeId }}</p>

            <hr>
            <!-- Attendance -->
            <h6 class="text-success mb-2">Recent Attendance</h6>
            <ul class="list-group list-group-flush mb-3">
              <li v-for="(day, index) in lastFiveDays(emp.attendance)" :key="index"
                class="list-group-item d-flex justify-content-between align-items-center border-start border-1"
                :class="borderColor(day.status)">
                <span>{{ day.date }}</span>
                <span :class="statusBadge(day.status)">{{ day.status }}</span>
              </li>
            </ul>

            <!-- Leave Requests -->
            <h6 class="text-danger mb-2">Leave Requests</h6>
            <ul class="list-group list-group-flush">
              <li v-if="emp.leaveRequests.length === 0" class="list-group-item text-muted text-center">None</li>
              <li v-for="(leave, i) in emp.leaveRequests" :key="i"
                class="list-group-item d-flex justify-content-between align-items-center border-start border-1"
                :class="borderColor(leave.status)">
                <div>
                  <strong>{{ leave.date }}</strong> — <em>{{ leave.reason }}</em>
                </div>
                <span :class="statusBadge(leave.status)">{{ leave.status }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const attendanceData = ref([])

onMounted(async () => {
  const cached = localStorage.getItem('attendanceData')
  if (cached) {
    attendanceData.value = JSON.parse(cached)
  } else {
    const res = await fetch('/data/attendance.json')
    const data = await res.json()
    attendanceData.value = data.attendanceAndLeave
  }
})

// Only show 5 most recent
function lastFiveDays(attList) {
  return attList
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
}

// Badge styling
function statusBadge(status) {
  return {
    'badge bg-success': status === 'Present',
    'badge bg-danger': status === 'Absent',
    'badge bg-warning text-dark': status === 'Pending' || status === 'Requested' || status === 'Leave'
  }
}

// Border stripe color
function borderColor(status) {
  return {
    'soft-success': status === 'Present',
    'soft-danger': status === 'Absent',
    'soft-warning': status === 'Pending' || status === 'Requested' || status === 'Leave'
  }
}

</script>

<style scoped>
.card {
  transition: transform 0.2s ease;
  border: 1px solid #b8b8b8 !important;
}

.card:hover {
  transform: scale(1.02);
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.411) !important;
}

.soft-success {
  border-left: 3px solid #87eb83 !important;
}

.soft-danger {
  border-left: 3px solid #ec979b !important;
}

.soft-warning {
  border-left: 3px solid #e0c47d !important;
}
</style>