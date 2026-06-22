import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";

export default function AppLayout() {
  return (
    <div data-themed="bg" className="h-screen bg-background flex overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Outlet />
      </div>
      <MobileBottomNav />
    </div>
  );
}
