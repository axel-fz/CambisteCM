/**
 * app/dashboard/layout.tsx
 * Dashboard shell: persistent <Sidebar /> on the left, scrollable main content on the right.
 */
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7faf3]">
      {/* Left sidebar — fixed width, full height */}
      <Sidebar />

      {/* Main content area — scrollable */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
