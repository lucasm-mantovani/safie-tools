import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Gera PDF a partir de um elemento HTML
export async function generatePdfFromElement(elementId, fileName = 'relatorio-safie') {
  const element = document.getElementById(elementId)
  if (!element) throw new Error(`Elemento #${elementId} não encontrado`)

  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const imgHeight = (canvas.height * pageWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight)
  pdf.save(`${fileName}.pdf`)
}

// Gera PDF com conteúdo programático (sem HTML)
export function generatePdfFromData({ title, sections, fileName = 'relatorio-safie' }) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const margin = 20
  let y = margin

  // Cabeçalho
  pdf.setFontSize(20)
  pdf.setTextColor(21, 78, 250) // primary color
  pdf.text('SAFIE Tools', margin, y)
  y += 10

  pdf.setFontSize(14)
  pdf.setTextColor(15, 15, 41) // bg-dark
  pdf.text(title, margin, y)
  y += 15

  // Seções
  sections.forEach((section) => {
    pdf.setFontSize(11)
    pdf.setTextColor(15, 15, 41)
    pdf.setFont(undefined, 'bold')
    pdf.text(section.label, margin, y)
    y += 7

    pdf.setFont(undefined, 'normal')
    pdf.setTextColor(100, 116, 139)
    pdf.text(String(section.value), margin + 4, y)
    y += 10

    if (y > 270) {
      pdf.addPage()
      y = margin
    }
  })

  pdf.save(`${fileName}.pdf`)
}
