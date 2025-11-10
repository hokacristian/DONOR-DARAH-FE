"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ProtectedRoute from "@/components/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 bg-gray-50">
          <div className="p-4 bg-white border-b">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  )
}