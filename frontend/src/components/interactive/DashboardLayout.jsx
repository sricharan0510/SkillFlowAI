import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Topbar />
        <main className="pt-20 px-8">{children}</main>
      </div>
    </div>
  );
}
