import { useRef } from 'react'
import { useDD } from './DDContext'
import ReadinessScoreCard from '../../../components/tools/dd/ReadinessScoreCard'
import CategoryRadarChart from '../../../components/tools/dd/CategoryRadarChart'
import RedFlagsList from '../../../components/tools/dd/RedFlagsList'
import YellowFlagsList from '../../../components/tools/dd/YellowFlagsList'
import RecommendationsList from '../../../components/tools/dd/RecommendationsList'
import CategoryBreakdown from '../../../components/tools/dd/CategoryBreakdown'
import ContextualCTA from '../../../components/tools/dd/ContextualCTA'

const OP_LABELS = { captacao: 'Captação de Investimento', ma: 'Operação de M&A' }

async function exportPDF(containerRef, companyName, operationType) {
  const [html2canvas, jsPDF] = await Promise.all([
    import('html2canvas').then(m => m.default),
    import('jspdf').then(m => m.default),
  ])

  const element = containerRef.current
  if (!element) return

  const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, logging: false })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = 210
  const pageH = 297
  const imgW = pageW
  const imgH = (canvas.height * imgW) / canvas.width

  let y = 0
  while (y < imgH) {
    if (y > 0) pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, -y, imgW, imgH)
    y += pageH
  }

  const date = new Date().toLocaleDateString('pt-BR')
  const fileName = `due-diligence-${(companyName || 'empresa').toLowerCase().replace(/\s+/g, '-')}-${date.replace(/\//g, '-')}.pdf`
  pdf.save(fileName)
}

export default function StepResults({ onReset }) {
  const { results, sessionId, qualificationData, operationType, companySnapshot } = useDD()
  const printRef = useRef(null)

  if (!results) return null

  const handleExportPDF = () => exportPDF(printRef, companySnapshot?.company_name, operationType)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Diagnóstico concluído</p>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-bg-dark mb-1">
          {companySnapshot?.company_name || 'Sua empresa'}
        </h2>
        <p className="font-body text-sm text-gray-500">
          {OP_LABELS[operationType]} · {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div ref={printRef} className="flex flex-col gap-6">
        <ReadinessScoreCard diagnostic={results} />

        <div className="grid lg:grid-cols-2 gap-6">
          <CategoryRadarChart diagnostic={results} />
          <RecommendationsList recommendations={results.recommendations} />
        </div>

        {results.red_flags?.length > 0 && (
          <RedFlagsList flags={results.red_flags} sessionId={sessionId} />
        )}

        {results.yellow_flags?.length > 0 && (
          <YellowFlagsList flags={results.yellow_flags} sessionId={sessionId} />
        )}

        <CategoryBreakdown diagnostic={results} />

        <ContextualCTA
          diagnostic={results}
          qualificationData={qualificationData}
          onExportPDF={handleExportPDF}
        />

        <div className="text-center pb-6">
          <p className="font-body text-xs text-gray-400 mb-3">
            Relatório gerado pelo Fast Due Diligence — SAFIE Tools. Este diagnóstico é baseado nas informações fornecidas e não substitui assessoria jurídica ou financeira especializada.
          </p>
          <button
            onClick={onReset}
            className="font-cta text-sm text-gray-400 hover:text-primary transition-colors"
          >
            Fazer novo diagnóstico
          </button>
        </div>
      </div>
    </div>
  )
}
