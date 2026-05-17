import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function DashboardShell() {
  return (
    <div className="min-h-screen relative overflow-hidden flex bg-[#f0f0f5]">
      <div className="dashboard-bg">
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />
      </div>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-y-auto custom-scrollbar">
        <TopNav />
        
        <main className="flex-1 p-4 md:p-10 transition-all duration-500">
          <div className="max-w-7xl mx-auto space-y-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
