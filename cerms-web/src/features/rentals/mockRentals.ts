export type RentalStatus = 'pending' | 'active' | 'completed' | 'overdue'

export type Rental = {
  id: string
  assetId: string
  assetName: string
  customerId: string
  customerName: string
  startDate: string
  endDate: string
  totalAmount: number
  status: RentalStatus
}

export const mockRentalAssets = [
  { id: 'AST-1001', name: 'Excavator EX-21' },
  { id: 'AST-1002', name: 'Forklift FL-08' },
  { id: 'AST-1003', name: 'Generator GN-14' },
  { id: 'AST-1004', name: 'Concrete Mixer CM-03' },
]

export const mockRentalCustomers = [
  { id: 'CUS-1001', name: 'Olivia Bennett' },
  { id: 'CUS-1002', name: 'Liam Carter' },
  { id: 'CUS-1003', name: 'Sophia Miller' },
  { id: 'CUS-1004', name: 'Noah Patel' },
]

export const mockRentals: Rental[] = [
  {
    id: 'RNT-1201',
    assetId: 'AST-1001',
    assetName: 'Excavator EX-21',
    customerId: 'CUS-1001',
    customerName: 'Olivia Bennett',
    startDate: '2026-04-11',
    endDate: '2026-04-18',
    totalAmount: 2240,
    status: 'active',
  },
  {
    id: 'RNT-1202',
    assetId: 'AST-1002',
    assetName: 'Forklift FL-08',
    customerId: 'CUS-1002',
    customerName: 'Liam Carter',
    startDate: '2026-04-13',
    endDate: '2026-04-16',
    totalAmount: 560,
    status: 'completed',
  },
  {
    id: 'RNT-1203',
    assetId: 'AST-1003',
    assetName: 'Generator GN-14',
    customerId: 'CUS-1003',
    customerName: 'Sophia Miller',
    startDate: '2026-04-14',
    endDate: '2026-04-20',
    totalAmount: 570,
    status: 'pending',
  },
  {
    id: 'RNT-1204',
    assetId: 'AST-1004',
    assetName: 'Concrete Mixer CM-03',
    customerId: 'CUS-1004',
    customerName: 'Noah Patel',
    startDate: '2026-04-01',
    endDate: '2026-04-07',
    totalAmount: 770,
    status: 'overdue',
  },
]

