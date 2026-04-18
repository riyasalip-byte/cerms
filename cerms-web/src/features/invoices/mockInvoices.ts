export type InvoiceStatus = 'paid' | 'partial' | 'unpaid' | 'overdue'

export type PaymentMethod = 'bank_transfer' | 'card' | 'cash'

export type PaymentHistoryItem = {
  id: string
  date: string
  amount: number
  method: PaymentMethod
  reference: string
}

export type Invoice = {
  id: string
  customerId: string
  customerName: string
  rentalId: string
  issuedDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  status: InvoiceStatus
  payments: PaymentHistoryItem[]
}

export const mockInvoices: Invoice[] = [
  {
    id: 'INV-3001',
    customerId: 'CUS-1001',
    customerName: 'Olivia Bennett',
    rentalId: 'RNT-1201',
    issuedDate: '2026-04-01',
    dueDate: '2026-04-10',
    totalAmount: 2240,
    paidAmount: 2240,
    status: 'paid',
    payments: [
      {
        id: 'PAY-9001',
        date: '2026-04-05',
        amount: 2240,
        method: 'bank_transfer',
        reference: 'TXN-ABX-1188',
      },
    ],
  },
  {
    id: 'INV-3002',
    customerId: 'CUS-1002',
    customerName: 'Liam Carter',
    rentalId: 'RNT-1202',
    issuedDate: '2026-04-03',
    dueDate: '2026-04-12',
    totalAmount: 560,
    paidAmount: 280,
    status: 'partial',
    payments: [
      {
        id: 'PAY-9002',
        date: '2026-04-08',
        amount: 280,
        method: 'card',
        reference: 'CARD-4277',
      },
    ],
  },
  {
    id: 'INV-3003',
    customerId: 'CUS-1003',
    customerName: 'Sophia Miller',
    rentalId: 'RNT-1203',
    issuedDate: '2026-04-06',
    dueDate: '2026-04-15',
    totalAmount: 570,
    paidAmount: 0,
    status: 'unpaid',
    payments: [],
  },
  {
    id: 'INV-3004',
    customerId: 'CUS-1004',
    customerName: 'Noah Patel',
    rentalId: 'RNT-1204',
    issuedDate: '2026-03-20',
    dueDate: '2026-03-30',
    totalAmount: 770,
    paidAmount: 0,
    status: 'overdue',
    payments: [],
  },
]

