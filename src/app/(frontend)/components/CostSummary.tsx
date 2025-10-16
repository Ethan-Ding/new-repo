'use client'

import React from 'react'
import { Download } from 'lucide-react'

interface CostSummaryProps {
  projectTotal: number | null
  loading: boolean
  onGeneratePDF?: () => void
}

export default function CostSummary({ projectTotal, loading, onGeneratePDF }: CostSummaryProps) {
  return (
    <div className="total-cost">
      {loading ? (
        <h2>Calculating...</h2>
      ) : projectTotal !== null ? (
        <>
          <h2>Total Project Cost: ${Number(projectTotal).toFixed(2)}</h2>
          {onGeneratePDF && (
            <button
              className="btn btn-primary pdf-report-btn"
              onClick={onGeneratePDF}
              style={{ marginTop: '10px', padding: '10px 20px', fontSize: '14px' }}
            >
              <Download size={18} /> Generate PDF Report
            </button>
          )}
        </>
      ) : (
        <h2>Total Project Cost: ...</h2>
      )}
    </div>
  )
}