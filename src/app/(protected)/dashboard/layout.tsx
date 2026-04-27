/**
 * app/dashboard/layout.tsx
 * Dashboard shell: persistent <Sidebar /> on the left, scrollable main content on the right.
 */
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7faf3]">
      {/* Left sidebar — collapses to drawer on mobile */}
      <Sidebar />

      {/* Main content area — scrollable; pt-14 on mobile leaves room for the hamburger button */}
      <main className="flex-1 overflow-y-auto p-4 pt-16 md:p-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
