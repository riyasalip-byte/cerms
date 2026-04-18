export type AssetStatus = 'available' | 'rented' | 'maintenance'

export type Asset = {
  id: string
  name: string
  category: string
  serialNumber: string
  location: string
  dailyRate: number
  status: AssetStatus
}

export const mockAssets: Asset[] = [
  {
    id: 'AST-1001',
    name: 'Excavator EX-21',
    category: 'Heavy Equipment',
    serialNumber: 'EX21-AX-9901',
    location: 'Yard A',
    dailyRate: 320,
    status: 'rented',
  },
  {
    id: 'AST-1002',
    name: 'Forklift FL-08',
    category: 'Warehouse',
    serialNumber: 'FL08-WH-1203',
    location: 'Warehouse 2',
    dailyRate: 140,
    status: 'available',
  },
  {
    id: 'AST-1003',
    name: 'Generator GN-14',
    category: 'Power',
    serialNumber: 'GN14-PW-4421',
    location: 'Yard B',
    dailyRate: 95,
    status: 'maintenance',
  },
  {
    id: 'AST-1004',
    name: 'Concrete Mixer CM-03',
    category: 'Construction',
    serialNumber: 'CM03-CS-7740',
    location: 'Site C',
    dailyRate: 110,
    status: 'available',
  },
  {
    id: 'AST-1005',
    name: 'Scissor Lift SL-06',
    category: 'Lifting',
    serialNumber: 'SL06-LF-5507',
    location: 'Yard A',
    dailyRate: 180,
    status: 'rented',
  },
]

