export type StaffStatus = 'active' | 'on_leave' | 'inactive'

export type StaffMember = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: StaffStatus
  licenseType: string
  licenseNumber: string
  licenseExpiry: string
}

export const mockStaff: StaffMember[] = [
  {
    id: 'STF-1001',
    name: 'Ethan Brooks',
    email: 'ethan.brooks@cerms.com',
    phone: '+1 (555) 908-1120',
    role: 'Field Technician',
    status: 'active',
    licenseType: 'Heavy Equipment Operator',
    licenseNumber: 'LIC-HEO-9921',
    licenseExpiry: '2027-05-20',
  },
  {
    id: 'STF-1002',
    name: 'Ava Campbell',
    email: 'ava.campbell@cerms.com',
    phone: '+1 (555) 774-2210',
    role: 'Rental Coordinator',
    status: 'active',
    licenseType: 'Commercial Driver (Class C)',
    licenseNumber: 'LIC-CDL-1208',
    licenseExpiry: '2026-11-02',
  },
  {
    id: 'STF-1003',
    name: 'Mason Reed',
    email: 'mason.reed@cerms.com',
    phone: '+1 (555) 511-6622',
    role: 'Maintenance Engineer',
    status: 'on_leave',
    licenseType: 'Safety & Maintenance Certificate',
    licenseNumber: 'LIC-SMC-4401',
    licenseExpiry: '2028-01-15',
  },
  {
    id: 'STF-1004',
    name: 'Isabella Moore',
    email: 'isabella.moore@cerms.com',
    phone: '+1 (555) 210-8890',
    role: 'Operations Supervisor',
    status: 'inactive',
    licenseType: 'Operations Compliance Certificate',
    licenseNumber: 'LIC-OCC-5019',
    licenseExpiry: '2025-09-30',
  },
]

