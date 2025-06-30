<template>
  <div class="container mt-4">
    <h2 class="mb-4">Performance Reviews</h2>

    <!-- Toggle Form -->
    <button class="btn btn-outline-success mb-3" @click="showForm = !showForm">
      {{ showForm ? 'Cancel' : 'Add Review' }}
    </button>

    <!-- Add Review Form -->
    <div v-if="showForm" class="card p-3 mb-4">
      <div class="mb-3">
        <label class="form-label">Employee</label>
        <select v-model="newReview.employeeId" class="form-select">
          <option disabled value="">-- Select Employee --</option>
          <option v-for="emp in employees" :key="emp.employeeId" :value="emp.employeeId">
            {{ emp.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Rating (1–5)</label>
        <input v-model.number="newReview.rating" type="number" min="1" max="5" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label">Feedback</label>
        <textarea v-model="newReview.feedback" rows="3" class="form-control"
          placeholder="e.g. Great leadership skills."></textarea>
      </div>

      <button class="btn btn-primary" @click="submitReview">Submit Review</button>
    </div>

    <!-- Reviews Table -->
    <div class="table-responsive">
      <table class="table table-bordered table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th>Employee</th>
            <th>Rating</th>
            <th>Feedback</th>
            <th>Date</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(review, index) in reviewsSorted" :key="index">
            <td>{{ getEmployeeName(review.employeeId) }}</td>
            <td><span class="badge bg-primary">{{ review.rating }}/5</span></td>
            <td>{{ review.feedback }}</td>
            <td>{{ review.date }}</td>
            <td>
              <button class="btn btn-outline-primary btn-sm" @click="downloadSingleReview(review)">
                DOCX
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx'
import { saveAs } from 'file-saver'

// Refs
const employees = ref([])
const reviews = ref([])
const showForm = ref(false)

const newReview = ref({
  employeeId: '',
  rating: 3,
  feedback: '',
  date: ''
})

// Load data
onMounted(async () => {
  const empRes = await fetch('/data/employee_info.json')
  const empData = await empRes.json()
  employees.value = empData.employeeInformation

  const stored = localStorage.getItem('performanceData')
  reviews.value = stored ? JSON.parse(stored) : []
})

function submitReview() {
  if (!newReview.value.employeeId || !newReview.value.feedback || !newReview.value.rating) return

  newReview.value.date = new Date().toISOString().split('T')[0]
  reviews.value.push({ ...newReview.value })
  saveData()

  newReview.value = { employeeId: '', rating: 3, feedback: '', date: '' }
  showForm.value = false
}

function saveData() {
  localStorage.setItem('performanceData', JSON.stringify(reviews.value))
}

function getEmployeeName(id) {
  const emp = employees.value.find(e => e.employeeId === id)
  return emp ? emp.name : 'Unknown'
}

const reviewsSorted = computed(() =>
  [...reviews.value].sort((a, b) => new Date(b.date) - new Date(a.date))
)

// Convert image URL to Base64
// This is needed to embed images in DOCX
function getBase64Image(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = url
  })
}

// Download single review as DOCX
async function downloadSingleReview(review) {
  const name = getEmployeeName(review.employeeId)
  const base64Image = await getBase64Image('/images/logo.png')

  const logoImage = new ImageRun({
    data: base64Image.split(',')[1],
    transformation: { width: 100, height: 100 }
  })

  const logoCentered = new Paragraph({
    children: [logoImage],
    alignment: 'center',
    spacing: { after: 200 }
  })

  // Create the info table
  // This table will contain employee name, rating, and date

  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Name:', bold: true, size: 24 })],
                alignment: 'center',
              })
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: name, size: 24 })],
                alignment: 'center'
              })
            ],
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Rating:', bold: true, size: 24 })],
                alignment: 'center',
              })
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: `${review.rating}/5`, size: 24 })],
                alignment: 'center'
              })
            ],
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Date:', bold: true, size: 24 })],
                alignment: 'center',
              })
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: review.date, size: 24 })],
                alignment: 'center'
              })
            ],
          })
        ]
      }),
    ]
  })

  // Create the document
  // Add logo, title, info table, feedback, and footer
  const doc = new Document({
    sections: [
      {
        children: [
          logoCentered,

          new Paragraph({
            text: 'Performance Review',
            alignment: 'center',
            heading: 'Heading1',
            spacing: { after: 300 }
          }),

          infoTable,

          new Paragraph({
            text: 'Feedback:',
            bold: true,
            alignment: 'center',
            spacing: { before: 300, after: 100 }
          }),

          new Paragraph({
            text: review.feedback,
            alignment: 'center'
          }),

          new Paragraph({
            text: '',
            spacing: { before: 300 }
          }),

          new Paragraph({
            text: 'Generated by ModernTech HRMS',
            italics: true,
            alignment: 'center'
          })
        ]
      }
    ]
  })

  // Convert to DOCX and save
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Review_${name.replace(/\s+/g, '_')}.docx`)
}
</script>
