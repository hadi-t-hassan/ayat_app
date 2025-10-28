import React from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Custom SidebarTrigger that adapts to RTL
const AdaptiveSidebarTrigger = () => {
  const { isRTL } = useLanguage();
  const { toggleSidebar } = useSidebar();
  
  return (
    <Button
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className="h-10 w-10 md:hidden"
      onClick={toggleSidebar}
    >
      <MoreHorizontal className="h-6 w-6" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};

// Inner component that uses the sidebar context
const MainLayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isRTL, t } = useLanguage();
  
  // Apply RTL to body element
  React.useEffect(() => {
    document.body.className = isRTL ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en');
  }, [isRTL]);
  
  return (
    <div className="min-h-screen flex w-full bg-background" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <AppSidebar side={isRTL ? 'right' : 'left'} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`h-12 sm:h-14 border-b bg-card flex items-center px-3 sm:px-4 gap-2 sm:gap-4 sticky top-0 z-40 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <AdaptiveSidebarTrigger />
          <div className="flex-1 min-w-0">
            <h1 className={`text-base sm:text-lg font-semibold truncate ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="hidden sm:inline">{t.appTitle} {t.managementSystem}</span>
              <span className="sm:hidden">{t.appTitle}</span>
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <MainLayoutContent>
        {children}
      </MainLayoutContent>
    </SidebarProvider>
  );
};