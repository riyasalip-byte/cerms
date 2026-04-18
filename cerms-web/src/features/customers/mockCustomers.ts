export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: 'active' | 'inactive'
  joinedOn: string
}

export type RentalHistoryItem = {
  rentalId: string
  assetName: string
  startDate: string
  endDate: string
  amount: number
  status: 'completed' | 'ongoing' | 'overdue'
}

export const mockCustomers: Customer[] = [
  {
    id: 'CUS-1001',
    name: 'Olivia Bennett',
    email: 'olivia.bennett@acme.com',
    phone: '+1 (555) 124-1122',
    company: 'Acme Construction',
    status: 'active',
    joinedOn: '2025-02-14',
  },
  {
    id: 'CUS-1002',
    name: 'Liam Carter',
    email: 'liam.carter@northfield.io',
    phone: '+1 (555) 661-2044',
    company: 'Northfield Logistics',
    status: 'active',
    joinedOn: '2024-11-03',
  },
  {
    id: 'CUS-1003',
    name: 'Sophia Miller',
    email: 'sophia.miller@brightworks.co',
    phone: '+1 (555) 781-9903',
    company: 'BrightWorks Co.',
    status: 'inactive',
    joinedOn: '2024-07-25',
  },
  {
    id: 'CUS-1004',
    name: 'Noah Patel',
    email: 'noah.patel@urbanbuild.com',
    phone: '+1 (555) 330-7705',
    company: 'Urban Build Ltd.',
    status: 'active',
    joinedOn: '2025-01-09',
  },
]

export const mockRentalHistoryByCustomer: Record<string, RentalHistoryItem[]> = {
  'CUS-1001': [
    {
      rentalId: 'RNT-9031',
      assetName: 'Excavator EX-21',
      startDate: '2026-03-01',
      endDate: '2026-03-08',
      amount: 2240,
      status: 'completed',
    },
    {
      rentalId: 'RNT-9176',
      assetName: 'Generator GN-14',
      startDate: '2026-04-10',
      endDate: '2026-04-18',
      amount: 760,
      status: 'ongoing',
    },
  ],
  'CUS-1002': [
    {
      rentalId: 'RNT-9010',
      assetName: 'Forklift FL-08',
      startDate: '2026-02-21',
      endDate: '2026-02-25',
      amount: 560,
      status: 'completed',
    },
  ],
  'CUS-1003': [
    {
      rentalId: 'RNT-8872',
      assetName: 'Scissor Lift SL-06',
      startDate: '2026-01-15',
      endDate: '2026-01-20',
      amount: 900,
      status: 'overdue',
    },
  ],
  'CUS-1004': [],
}

