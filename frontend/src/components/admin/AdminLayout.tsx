import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { ProtectedRoute } from "../ProtectedRoute";

export function AdminLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="ml-64 min-h-screen">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
