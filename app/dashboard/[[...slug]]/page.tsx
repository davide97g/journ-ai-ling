"use client";

import { AppSidebar } from "@/components/app-sidebar";
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
import { getBreadcrumbData, getSectionByPath } from "@/lib/dashboard-config";
import { DashboardContext } from "@/lib/dashboard-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const pathname = usePathname();
  const router = useRouter();
  const section = getSectionByPath(pathname);

  // If we're at the root dashboard path, redirect to default section
  if (pathname === "/dashboard") {
    router.replace("/dashboard/journal/history");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (!section) {
    return <DefaultDashboardContent />;
  }

  const SectionComponent = section.component;
  return <SectionComponent />;
}

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  // Get breadcrumb data from the current path
  const breadcrumbData = getBreadcrumbData(pathname);

  // Navigation function
  const navigateToSection = (pageId: string, sectionId: string) => {
    const newPath = `/dashboard/${pageId}/${sectionId}`;
    router.push(newPath);
  };

  // Update current section when pathname changes
  useEffect(() => {
    console.log("pathname", pathname);
    const section = getSectionByPath(pathname);
    console.log("section", section);
    setCurrentSection(section?.id || null);
  }, [pathname]);

  return (
    <DashboardContext.Provider value={{ currentSection, navigateToSection }}>
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
                    <BreadcrumbLink href="/dashboard">
                      {breadcrumbData.page}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumbData.section}</BreadcrumbPage>
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
