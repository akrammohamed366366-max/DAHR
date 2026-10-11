import React from 'react';
import { RouteId } from '../types';
import { AdminShell } from '../components/admin/AdminShell';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminProductsView } from '../components/admin/modules/AdminProductsView';
import { AdminOrdersView } from '../components/admin/modules/AdminOrdersView';
import { AdminJournalView } from '../components/admin/modules/AdminJournalView';
import { AdminUsersView } from '../components/admin/modules/AdminUsersView';
import { AdminSettingsView } from '../components/admin/modules/AdminSettingsView';
import { AdminShowcase } from './AdminShowcase';

export interface AdminRouterProps {
  activeRoute: RouteId;
  onRouteChange: (route: RouteId) => void;
}

export const AdminRouter: React.FC<AdminRouterProps> = ({
  activeRoute,
  onRouteChange,
}) => {
  // If explicitly navigating to login screen
  if (activeRoute === 'admin-login') {
    return <AdminLogin onRouteChange={onRouteChange} targetAdminRoute="admin-dashboard" />;
  }

  const renderModuleView = () => {
    switch (activeRoute) {
      case 'admin-products':
        return <AdminProductsView onRouteChange={onRouteChange} />;
      case 'admin-orders':
        return <AdminOrdersView onRouteChange={onRouteChange} />;
      case 'admin-journal':
        return <AdminJournalView onRouteChange={onRouteChange} />;
      case 'admin-users':
        return <AdminUsersView onRouteChange={onRouteChange} />;
      case 'admin-settings':
        return <AdminSettingsView onRouteChange={onRouteChange} />;
      case 'showcase-admin':
        return <AdminShowcase />;
      case 'admin':
      case 'admin-dashboard':
      default:
        return <AdminDashboard onRouteChange={onRouteChange} />;
    }
  };

  return (
    <AdminShell activeAdminRoute={activeRoute} onRouteChange={onRouteChange}>
      {renderModuleView()}
    </AdminShell>
  );
};
