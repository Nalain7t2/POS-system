import { Suspense } from 'react'
import ReceiptContent from './ReceiptContent'

export default function ReceiptPage() {
  return (
    <Suspense fallback={<p style={{ padding: '48px', textAlign: 'center', fontFamily: 'sans-serif' }}>Receipt Loading....</p>}>
      <ReceiptContent />
    </Suspense>
  )
}