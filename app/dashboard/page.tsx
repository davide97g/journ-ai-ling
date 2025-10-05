"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { HistoryContent } from "@/components/history-content";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";

// Create context for dashboard state
interface DashboardContextType {
  section: string;
  setSection: (section: string) => void;
  page: string;
  setPage: (page: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

// Default dashboard content component
function DefaultDashboardContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </div>
  );
}

// Main dashboard content component
function DashboardContent() {
  const { section } = useDashboard();

  const renderContent = () => {
    switch (section) {
      case "history":
        return <HistoryContent />;
      default:
        return <DefaultDashboardContent />;
    }
  };

  return renderContent();
}

export default function Page() {
  const pathname = usePathname();
  const [page, setPage] = useState(pathname.split("/").pop() || "Journal");
  const [section, setSection] = useState(
    pathname.split("/").pop() || "default"
  );

  return (
    <DashboardContext.Provider value={{ section, setSection, page, setPage }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">{page}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{section}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto flex items-center gap-2 px-4">
              <ThemeToggle />
            </div>
          </header>
          <DashboardContent />
        </SidebarInset>
      </SidebarProvider>
    </DashboardContext.Provider>
  );
}
