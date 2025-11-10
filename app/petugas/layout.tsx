"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { PetugasSidebar } from "@/components/petugas-sidebar"
import ProtectedRoute from "@/components/protected-route"

export default function PetugasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="petugas">
      <SidebarProvider>
        <PetugasSidebar />
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
