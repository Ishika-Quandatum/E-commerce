import React, { useState } from "react";
import { Outlet } from "react-router-dom";  
import VendorSidebar from "./VendorSidebar";
import { Menu } from "lucide-react";

const VendorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-50 flex-col md:flex-row h-screen overflow-hidden">
      
      <VendorSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <h1 className="text-xl font-bold text-gray-800">Partner Panel</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto pt-6">
          <Outlet />   
        </main>
      </div>

    </div>
  );
};

export default VendorLayout;