import { Outlet, useLocation } from "react-router-dom";
import { useRef, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";

const MainLayout = () => {
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  // Scroll the main content area and outer window to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    // 1. الحاوية الأساسية h-screen ثابتة
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#020617] transition-colors">
      
      {/* الـ Navbar فوق خالص بعرض الشاشة */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* 2. السايد بار ثابت على الشمال */}
        <Sidebar />

        {/* 3. الجزء اليمين بالكامل هو اللي بيعمل سكرول */}
        <main ref={mainRef} className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden pt-6">
          
          {/* 4. كارت المحتوى (المنطقة البيضاء اللي بيظهر فيها الـ Outlet) */}
          <div className="flex-1 px-4 md:px-8 pb-8">
            <div className="min-h-full bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-8">
              <Outlet /> {/* هنا الصفحات بتظهر جوه الكارت الأبيض */}
            </div>
          </div>

          {/* 5. الفوتر الآن خارج الكارت الأبيض تماماً */}
          <div className="w-full mt-auto">
            <Footer />
          </div>

        </main>
      </div>
    </div>
  );
};

export default MainLayout;