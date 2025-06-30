<template>
  <div class="container mt-4">
    <h2 class="mb-4">Dashboard</h2>

    <!-- Summary Cards -->
    <div class="row">
      <div class="col-md-4 mb-3" v-for="card in cards" :key="card.title">
        <div class="card text-white bg-primary h-100">
          <div class="card-body">
            <h5 class="card-title">{{ card.title }}</h5>
            <p class="card-text fs-4">{{ card.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="row mt-4">
      <!-- Pie Chart: Departments -->
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Employees by Department</h5>
            <PieChart v-if="charts.departmentDist" :chart-data="charts.departmentDist" />
          </div>
        </div>
      </div>

      <!-- Bar Chart: Attendance -->
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Attendance This Week</h5>
            <BarChart v-if="charts.dailyAttendance" :chart-data="charts.dailyAttendance" />
          </div>
        </div>
      </div>

      <!-- Pie Chart: Leave Status -->
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Leave Request Status</h5>
            <PieChart v-if="charts.leaveStatus" :chart-data="charts.leaveStatus" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BarChart from '../components/BarChart.vue'
import PieChart from '../components/PieChart.vue'

const employees = ref([])
const payroll = ref([])
const attendance = ref([])

const cards = ref([])
const charts = ref({
  departmentDist: null,
  dailyAttendance: null,
  leaveStatus: null
})

onMounted(async () => {
  const [empRes, payRes, attRes] = await Promise.all([
    fetch('/data/employee_info.json'),
    fetch('/data/payroll_data.json'),
    fetch('/data/attendance.json')
  ])

  const empData = await empRes.json()
  const payData = await payRes.json()
  const attData = await attRes.json()

  employees.value = empData.employeeInformation
  payroll.value = payData.payrollData
  attendance.value = attData.attendanceAndLeave

  updateCards()
  generateDepartmentChart()
  generateAttendanceChart()
  generateLeaveStatusChart()
})

function updateCards() {
  const totalPayroll = payroll.value.reduce((sum, p) => sum + p.finalSalary, 0)
  const today = new Date().toISOString().split('T')[0]
  const presentToday = attendance.value.reduce((count, emp) => {
    const todayStatus = emp.attendance.find(a => a.date === today)
    return todayStatus?.status === 'Present' ? count + 1 : count
  }, 0)
  const pendingLeaves = attendance.value.reduce((count, emp) => {
    return count + emp.leaveRequests.filter(req => req.status === 'Pending').length
  }, 0)

  cards.value = [
    { title: 'Total Employees', value: employees.value.length },
    { title: 'Total Payroll (R)', value: totalPayroll.toLocaleString() },
    { title: 'Present Today', value: 10 },
  ]
}

function generateDepartmentChart() {
  const counts = {}
  employees.value.forEach(emp => {
    counts[emp.department] = (counts[emp.department] || 0) + 1
  })

  charts.value.departmentDist = {
    labels: Object.keys(counts),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6610f2', '#6f42c1']
    }]
  }
}

function generateAttendanceChart() {
  const days = {}

  attendance.value.forEach(emp => {
    emp.attendance.forEach(entry => {
      if (entry.status === 'Present') {
        days[entry.date] = (days[entry.date] || 0) + 1
      }
    })
  })

  charts.value.dailyAttendance = {
    labels: Object.keys(days),
    datasets: [{
      label: 'Present',
      data: Object.values(days),
      backgroundColor: '#17a2b8'
    }]
  }
}

function generateLeaveStatusChart() {
  const statusCounts = { Approved: 0, Pending: 0, Denied: 0 }

  attendance.value.forEach(emp => {
    emp.leaveRequests.forEach(req => {
      statusCounts[req.status]++
    })
  })

  charts.value.leaveStatus = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ['#28a745', '#ffc107', '#dc3545']
    }]
  }
}
</script>
