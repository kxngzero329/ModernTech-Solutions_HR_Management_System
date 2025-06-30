<template>
  <div class="container mt-4">
    <h2 class="mb-4">Payroll Overview</h2>

    <div class="table-responsive">
      <table class="table table-bordered table-hover align-middle text-center">
        <thead class="table-dark">
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Base Salary</th>
            <th>Hours Worked</th>
            <th>Leave Days</th>
            <th>Gross Pay</th>
            <th>Deductions</th>
            <th>Net Pay</th>

            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in payroll" :key="entry.employeeId">
            <td>{{ entry.name }}</td>
            <td>{{ entry.position }}</td>
            <td>R {{ entry.baseSalary.toFixed(2) }}</td>
            <td>{{ entry.hoursWorked }}</td>
            <td>{{ entry.leaveDeductions }}</td>
            <td>R {{ entry.grossPay.toFixed(2) }}</td>
            <td>R {{ entry.deductions.toFixed(2) }}</td>
            <td>R {{ entry.netPay.toFixed(2) }}</td>

            <td>
              <button class="btn btn-outline-primary btn-sm" @click="viewPayslip(entry)">
                View Payslip
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payslip Modal -->
    <div class="modal fade" id="payslipModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content p-3">
          <div class="text-center">
            <img src="/images/logo.png" class="rounded-circle" width="80" />
            <h5 class="mt-2">Payslip from ModernTech HR</h5>
          </div>
          <hr>

          <div class="mt-3">
            <p><strong>Name:</strong> {{ selectedPayslip?.name }}</p>
            <p><strong>Position:</strong> {{ selectedPayslip?.position }}</p>
            <p><strong>Department:</strong> {{ selectedPayslip?.department }}</p>
            <p><strong>Contact/Email:</strong> {{ selectedPayslip?.contact }}</p>
          </div>
          <hr>
          <table class="table table-bordered mt-2 text-center">
            <thead class="table-light">
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hourly Rate</td>
                <td>R {{ selectedPayslip?.hourlyRate.toFixed(0) }}</td>
              </tr>
              <tr>
                <td>Hours Worked</td>
                <td>{{ selectedPayslip?.hoursWorked }} hrs</td>
              </tr>
              <tr>
                <td>Gross Pay</td>
                <td>R {{ selectedPayslip?.grossPay.toLocaleString() }}</td>
              </tr>
              <tr>
                <td>Leave Taken</td>
                <td>{{ selectedPayslip?.leaveDeductions }} days</td>
              </tr>
              <tr>
                <td>Deductions</td>
                <td>-R {{ selectedPayslip?.deductions.toLocaleString() }}</td>
              </tr>
              <tr class="table-secondary">
                <td><strong>Net Pay</strong></td>
                <td><strong>R {{ selectedPayslip?.netPay.toLocaleString() }}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="text-end">
            <button class="btn btn-success me-2" @click="downloadPDF">Download PDF</button>
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import jsPDF from 'jspdf'
import * as bootstrap from 'bootstrap'

const employeeInfo = ref([])
const payrollData = ref([])
const payroll = ref([])
const selectedPayslip = ref(null)

onMounted(async () => {
  const empRes = await fetch('/data/employee_info.json')
  const payrollRes = await fetch('/data/payroll_data.json')

  const empData = await empRes.json()
  const payrollRaw = await payrollRes.json()

  employeeInfo.value = empData.employeeInformation
  payrollData.value = payrollRaw.payrollData || []

  const employeeMap = {}
  employeeInfo.value.forEach(emp => {
    employeeMap[emp.employeeId] = emp
  })

  if (payrollData.value.length) {
    payroll.value = calculatePayroll(payrollData.value, employeeMap)
  }
})

function calculatePayroll(data, employeeMap) {
  return data.map(p => {
    const emp = employeeMap[p.employeeId]
    if (!emp) return null

    const hourlyRate = emp.salary / 160
    const grossPay = hourlyRate * p.hoursWorked
    const leaveHours = p.leaveDeductions * 8
    const deductions = leaveHours * hourlyRate
    const netPay = grossPay - deductions
    const status =
      deductions < 800 ? 'Good' : deductions < 1500 ? 'Review' : 'Warning'

    return {
      ...p,
      name: emp.name,
      position: emp.position,
      department: emp.department,
      contact: emp.contact,
      baseSalary: emp.salary,
      hourlyRate,
      grossPay,
      deductions,
      netPay,
      status
    }
  }).filter(Boolean)
}

function viewPayslip(entry) {
  selectedPayslip.value = entry
  const modal = new bootstrap.Modal(document.getElementById('payslipModal'))
  modal.show()
}

function downloadPDF() {
  const doc = new jsPDF()
  const p = selectedPayslip.value

  const logo = new Image()
  logo.src = '/images/logo.png'

  logo.onload = () => {
    doc.addImage(logo, 'PNG', 85, 10, 40, 40)

    doc.setFontSize(14)
    doc.text('Payslip from ModernTech HR', 105, 60, { align: 'center' })

    doc.setFontSize(11)
    const infoLines = [
      `Name: ${p.name}`,
      `Position: ${p.position}`,
      `Department: ${p.department}`,
      `Contact/Email: ${p.contact}`
    ]

    let y = 70
    infoLines.forEach(line => {
      doc.text(line, 30, y)
      y += 8
    })

    y += 5
    doc.setFontSize(11)
    doc.setFillColor(230, 230, 230)
    doc.rect(30, y, 70, 10, 'F')
    doc.rect(100, y, 60, 10, 'F')
    doc.setTextColor(0, 0, 0)
    doc.text('Description', 35, y + 7)
    doc.text('Amount', 105, y + 7)

    const tableRows = [
      ['Hourly Rate', `R ${p.hourlyRate.toFixed(0)}`],
      ['Hours Worked', `${p.hoursWorked} hrs`],
      ['Gross Pay', `R ${p.grossPay.toLocaleString()}`],
      ['Leave Taken', `${p.leaveDeductions} days`],
      ['Deductions', `-R ${p.deductions.toLocaleString()}`],
    ]

    y += 12
    tableRows.forEach(row => {
      doc.rect(30, y, 70, 10)
      doc.rect(100, y, 60, 10)
      doc.text(row[0], 35, y + 7)
      doc.text(row[1], 105, y + 7)
      y += 10
    })

    doc.setFont(undefined, 'bold')
    doc.rect(30, y, 70, 10)
    doc.rect(100, y, 60, 10)
    doc.text('Net Pay', 35, y + 7)
    doc.text(`R ${p.netPay.toLocaleString()}`, 105, y + 7)

    doc.save(`Payslip_${p.name.replace(/\s+/g, '_')}.pdf`)
  }
}
</script>

<style scoped>
.modal-content {
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}
</style>
