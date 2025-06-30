import { createRouter, createWebHashHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Employees from '../views/Employees.vue'
import Payroll from '@/views/Payroll.vue'
import LeaveRequests from '@/views/LeaveRequests.vue'
import Attendance from '@/views/Attendance.vue'
import PerformanceReview from '@/views/PerformanceReview.vue'



const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: Login },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/employees', name: 'employees', component: Employees },
  { path: '/payroll', name: 'payroll', component: Payroll },
  { path: '/leave-requests', name: 'leave-requests', component: LeaveRequests },
  { path: '/attendance', name: 'attendance', component: Attendance },
  { path: '/performance-review', name: 'performance-review', component: PerformanceReview },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
