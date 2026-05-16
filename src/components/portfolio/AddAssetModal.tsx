'use client'

// =============================================================================
// AddAssetModal — add a crypto asset to the P&L portfolio
// =============================================================================

import React, { useState } from 'react'
import { z } from 'zod'
import { PlusCircleIcon, XIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePnLPortfolioStore } from '@/store/pnlPortfolioStore'

const addAssetSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10).toUpperCase(),
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  avgBuyPrice: z.number().positive('Avg buy price must be positive'),
  currentPrice: z.number().nonnegative('Current price must be >= 0'),
})

type FormErrors = Partial<Record<keyof z.infer<typeof addAssetSchema>, string>>

interface AddAssetModalProps {
  onClose: () => void
}

export function AddAssetModal({ onClose }: AddAssetModalProps) {
  const addAsset = usePnLPortfolioStore((s) => s.addAsset)
  const [form, setForm] = useState({ symbol: '', name: '', amount: '', avgBuyPrice: '', currentPrice: '' })
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = addAssetSchema.safeParse({
      symbol: form.symbol,
      name: form.name,
      amount: parseFloat(form.amount),
      avgBuyPrice: parseFloat(form.avgBuyPrice),
      currentPrice: parseFloat(form.currentPrice),
    })
    if (!parsed.success) {
      const fieldErrors: FormErrors = {}
      parsed.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    addAsset({ ...parsed.data, realizedPnL: 0 })
    onClose()
  }

  const fields: Array<{ key: keyof typeof form; label: string; placeholder: string; type?: string }> = [
    { key: 'symbol', label: 'Symbol', placeholder: 'BTC, ETH, EGLD...' },
    { key: 'name', label: 'Name', placeholder: 'Bitcoin' },
    { key: 'amount', label: 'Amount', placeholder: '0.5', type: 'number' },
    { key: 'avgBuyPrice', label: 'Avg Buy Price (USD)', placeholder: '40000', type: 'number' },
    { key: 'currentPrice', label: 'Current Price (USD)', placeholder: '43500', type: 'number' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <PlusCircleIcon className="h-5 w-5 text-primary" />
              Add Asset
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                <input
                  type={type ?? 'text'}
                  step={type === 'number' ? 'any' : undefined}
                  value={form[key]}
                  onChange={handleChange(key)}
                  placeholder={placeholder}
                  className={cn(
                    'w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                    errors[key as keyof FormErrors] && 'border-bearish'
                  )}
                />
                {errors[key as keyof FormErrors] && (
                  <p className="text-xs text-bearish mt-1">{errors[key as keyof FormErrors]}</p>
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1">Add Asset</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddAssetModal
