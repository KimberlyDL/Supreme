export interface menu {
  header?: string;
  title?: string;
  icon?: any;
  to?: string;
  chip?: string;
  BgColor?: string;
  chipBgColor?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  { header: 'Dashboard' },
  {
      title: 'Dashboard Overview',
      icon: 'settings-bold',  // Solar icon for dashboard
      to: '/administrator/',
  },
  { header: 'User Management' },
  {
      title: 'Manage Users',
      icon: 'users-group-rounded-bold', // As requested, no change here
      to: '/administrator/users',
      chip: 'Admin', // For admin roles only
  },
  { header: 'Branch Management' },
  {
      title: 'Manage Branches',
      icon: 'branching-paths-up-bold', // Solar icon for branch management
      to: '/administrator/branches',
  },
  {
      title: 'Branch Inventory',
      icon: 'box-outline', // Solar icon for inventory
      to: '/administrator/branches/inventory',
  },
  { header: 'Sales and Inventory' },
  {
      title: 'Sales Reports',
      icon: 'graph-bold', // Solar icon for sales report
      to: '/administrator/sales/reports',
  },
  {
      title: 'Inventory Forecasting',
      icon: 'glasses-linear', // Solar icon for forecasting
      to: '/administrator/inventory/forecast',
  },
  { header: 'Logs and Reports' },
  {
      title: 'Audit Logs',
      icon: 'list-check-outline', // Solar icon for audit logs
      to: '/administrator/audit/logs',
  },
  {
      title: 'System Reports',
      icon: 'document-text-outline', // Solar icon for system reports
      to: '/administrator/system/reports',
  },
  { header: 'Notifications' },
  {
      title: 'Notifications',
      icon: 'bell-outline', // Solar icon for notifications
      to: '/administrator/notifications',
  },
  { header: 'System Settings' },
  {
      title: 'Settings',
      icon: 'settings-outline', // Solar icon for settings
      to: '/administrator/settings',
  },
];

export default sidebarItem;
