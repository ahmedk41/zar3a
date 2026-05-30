import { Outlet, useLocation } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";

const MainLayout = () => {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Hidden by default on all screens

  // Scroll to top and auto-close sidebar on route change (especially for mobile)
  useEffect(() => {
    window.scrollTo(0, 0);
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#020617] transition-colors">
      
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40"
          />
        )}

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <main ref={mainRef} className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden pt-6">
          
          <div className="flex-1 px-4 md:px-8 pb-8">
            <div className="min-h-full bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-8">
              <Outlet />
            </div>
          </div>

          <div className="w-full mt-auto">
            <Footer />
          </div>

        </main>
      </div>
    </div>
  );
};

export default MainLayout;