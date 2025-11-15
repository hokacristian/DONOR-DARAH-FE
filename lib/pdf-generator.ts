import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DonorEvaluationData {
  fullName: string
  age: number
  gender: string
  bloodType: string
  preferenceValue: number
  status: string
  isEligible: boolean
}

interface EventData {
  name: string
  location: string
  startDate: string
  endDate: string
  status: string
}

interface StatisticsData {
  totalDonors: number
  totalExamined: number
  eligibleCount: number
  notEligibleCount: number
  threshold: number
}

export const generatePMIReport = (
  event: EventData,
  statistics: StatisticsData,
  evaluations: DonorEvaluationData[]
) => {
  const doc = new jsPDF()

  // Sort evaluations by preference value (highest first)
  const sortedEvaluations = [...evaluations].sort((a, b) => b.preferenceValue - a.preferenceValue)

  const pageWidth = doc.internal.pageSize.getWidth()
  let yPosition = 20

  // ========== HEADER ==========
  // PMI Logo placeholder (you can add actual logo later)
  doc.setFillColor(220, 38, 38) // Red color for PMI
  doc.circle(20, yPosition, 8, 'F')

  // PMI Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('PALANG MERAH INDONESIA', 32, yPosition)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Indonesian Red Cross - Blood Donor Division', 32, yPosition + 5)

  // Horizontal line
  yPosition += 12
  doc.setDrawColor(220, 38, 38)
  doc.setLineWidth(0.5)
  doc.line(14, yPosition, pageWidth - 14, yPosition)

  yPosition += 10

  // ========== REPORT TITLE ==========
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN EVALUASI DONOR DARAH', pageWidth / 2, yPosition, { align: 'center' })

  yPosition += 8

  // ========== EVENT INFORMATION ==========
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const eventInfo = [
    ['Nama Event', ': ' + event.name],
    ['Lokasi', ': ' + event.location],
    ['Tanggal', ': ' + formatDate(event.startDate) + ' - ' + formatDate(event.endDate)],
    ['Status', ': ' + event.status.toUpperCase()],
  ]

  eventInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 14, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 50, yPosition)
    yPosition += 6
  })

  yPosition += 5

  // ========== STATISTICS SUMMARY ==========
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('RINGKASAN STATISTIK', 14, yPosition)
  yPosition += 7

  doc.setFontSize(9)

  // Statistics boxes
  const boxWidth = (pageWidth - 28 - 12) / 4 // 4 boxes with gaps
  const boxHeight = 18
  const boxY = yPosition
  const gap = 3

  const statsBoxes = [
    { label: 'Total Pendaftar', value: statistics.totalDonors.toString(), color: [100, 116, 139] },
    { label: 'Diperiksa', value: statistics.totalExamined.toString(), color: [59, 130, 246] },
    { label: 'Layak', value: statistics.eligibleCount.toString(), color: [34, 197, 94] },
    { label: 'Tidak Layak', value: statistics.notEligibleCount.toString(), color: [239, 68, 68] },
  ]

  statsBoxes.forEach((box, index) => {
    const x = 14 + (boxWidth + gap) * index

    // Box background
    doc.setFillColor(box.color[0], box.color[1], box.color[2])
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 2, 2, 'F')

    // Text
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(box.label, x + boxWidth / 2, boxY + 6, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(box.value, x + boxWidth / 2, boxY + 14, { align: 'center' })
  })

  doc.setTextColor(0, 0, 0) // Reset to black
  yPosition += boxHeight + 10

  // Threshold info
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setFillColor(239, 246, 255)
  doc.roundedRect(14, yPosition, pageWidth - 28, 10, 2, 2, 'F')
  doc.setTextColor(30, 64, 175)
  doc.text(`Threshold: ${statistics.threshold.toFixed(4)} `, 16, yPosition + 6)
  doc.setTextColor(0, 0, 0)

  yPosition += 15

  // ========== DONOR EVALUATION TABLE ==========
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DAFTAR EVALUASI PENDONOR', 14, yPosition)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('(Diurutkan berdasarkan nilai preferensi tertinggi)', 14, yPosition + 4)

  yPosition += 8

  // Prepare table data
  const tableData = sortedEvaluations.map((evaluation, index) => [
    (index + 1).toString(),
    evaluation.fullName,
    evaluation.age.toString() + ' th',
    evaluation.gender === 'male' ? 'L' : 'P',
    evaluation.bloodType,
    evaluation.preferenceValue.toFixed(4),
    evaluation.status,
  ])

  // Generate table
  autoTable(doc, {
    startY: yPosition,
    head: [['No', 'Nama Lengkap', 'Umur', 'L/P', 'Gol. Darah', 'Nilai Preferensi', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [220, 38, 38], // PMI Red
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // No
      1: { cellWidth: 50, halign: 'left' }, // Nama
      2: { cellWidth: 18, halign: 'center' }, // Umur
      3: { cellWidth: 12, halign: 'center' }, // L/P
      4: { cellWidth: 20, halign: 'center' }, // Gol Darah
      5: { cellWidth: 28, halign: 'center' }, // Preference
      6: { cellWidth: 30, halign: 'center' }, // Status
    },
    didParseCell: function(data) {
      // Color coding for status column
      if (data.column.index === 6 && data.section === 'body') {
        const rowIndex = data.row.index
        const isEligible = sortedEvaluations[rowIndex].isEligible

        if (isEligible) {
          data.cell.styles.fillColor = [220, 252, 231] // Light green
          data.cell.styles.textColor = [22, 101, 52] // Dark green
        } else {
          data.cell.styles.fillColor = [254, 226, 226] // Light red
          data.cell.styles.textColor = [153, 27, 27] // Dark red
        }
        data.cell.styles.fontStyle = 'bold'
      }

      // Color coding for preference value
      if (data.column.index === 5 && data.section === 'body') {
        const rowIndex = data.row.index
        const isEligible = sortedEvaluations[rowIndex].isEligible

        if (isEligible) {
          data.cell.styles.textColor = [22, 101, 52] // Dark green
          data.cell.styles.fontStyle = 'bold'
        } else {
          data.cell.styles.textColor = [153, 27, 27] // Dark red
        }
      }
    },
    margin: { left: 14, right: 14 },
  })

  // ========== FOOTER ==========
  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50
  let footerY = finalY + 15

  // Check if we need a new page
  if (footerY > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage()
    footerY = 20
  }

  // Signature section
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Dicetak pada: ${currentDate}`, pageWidth - 14, footerY, { align: 'right' })

  footerY += 10

  doc.text('Penanggung Jawab,', pageWidth - 60, footerY)

  footerY += 20

  doc.setFont('helvetica', 'bold')
  doc.text('(_________________)', pageWidth - 60, footerY)

  // Page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // ========== SAVE PDF ==========
  const fileName = `Laporan_Donor_${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`
  doc.save(fileName)
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
