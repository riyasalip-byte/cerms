import { useMyProfile } from '@/hooks/useProfile'
import { useAuthStore } from '@/stores/authStore'

export function usePermission() {
  const { data: profile } = useMyProfile()
  const { user } = useAuthStore()
  const permissions = profile?.permissions || []
  
  const hasPermission = (code: string) => {
    if (profile?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'admin') {
      return true
    }
    return permissions.includes(code)
  }

  return {
    permissions,
    hasPermission,
    canViewAssets: hasPermission('Asset.View'),
    canCreateAsset: hasPermission('Asset.Create'),
    canEditAsset: hasPermission('Asset.Edit'),
    canDeleteAsset: hasPermission('Asset.Delete'),
    
    canViewCustomers: hasPermission('Customer.View'),
    canCreateCustomer: hasPermission('Customer.Create'),
    canEditCustomer: hasPermission('Customer.Edit'),
    canDeleteCustomer: hasPermission('Customer.Delete'),

    canViewRentals: hasPermission('Rental.View'),
    canCreateRental: hasPermission('Rental.Create'),
    canEditRental: hasPermission('Rental.Edit'),
    canCloseRental: hasPermission('Rental.Close'),
    canStartRental: hasPermission('Rental.Start'),
    canCompleteRental: hasPermission('Rental.Complete'),

    canViewMaintenance: hasPermission('Maintenance.View'),
    canCreateMaintenance: hasPermission('Maintenance.Create'),
    canEditMaintenance: hasPermission('Maintenance.Edit'),
    canCloseMaintenance: hasPermission('Maintenance.Close'),

    canViewFuel: hasPermission('Fuel.View'),
    canCreateFuel: hasPermission('Fuel.Create'),
    canEditFuel: hasPermission('Fuel.Edit'),

    canViewInvoices: hasPermission('Invoice.View'),
    canCreateInvoice: hasPermission('Invoice.Create'),
    canApproveInvoice: hasPermission('Invoice.Approve'),

    canViewReports: hasPermission('Reports.View'),

    canViewStaff: hasPermission('Staff.View'),
    canCreateStaff: hasPermission('Staff.Create'),
    canEditStaff: hasPermission('Staff.Edit'),

    canViewUsers: hasPermission('Users.View'),
    canCreateUser: hasPermission('Users.Create'),
    canEditUser: hasPermission('Users.Edit'),
    canResetPassword: hasPermission('Users.ResetPassword'),

    canViewRoles: hasPermission('Roles.View'),
    canCreateRole: hasPermission('Roles.Create'),
    canEditRole: hasPermission('Roles.Edit'),

    canViewDashboard: hasPermission('Dashboard.View'),
  }
}
