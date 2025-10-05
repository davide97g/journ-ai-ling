"use client";

import { Frame, LifeBuoy, Map, PieChart, Send } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboardPages } from "@/lib/dashboard-config";
import { useDashboard } from "@/lib/dashboard-context";
import { useEffect, useState } from "react";

// Generate navigation data from dashboard configuration
const generateNavData = () => {
  const navMain = Object.values(dashboardPages).map((page) => ({
    title: page.title,
    url: `/dashboard/${page.id}`,
    icon: page.icon,
    isActive: page.id === "journal", // Default to journal being active
    items: page.sections.map((section) => ({
      title: section.title,
      url: `/dashboard/${page.id}/${section.id}`,
    })),
  }));

  return {
    navMain,
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userInitials, setUserInitials] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const { navigateToSection } = useDashboard();

  // Generate navigation data
  const data = generateNavData();

  // Fetch user data and generate initials
  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/user");
      if (response.ok) {
        const userData = await response.json();
        if (userData.user?.email) {
          const email = userData.user.email;
          const initials = email
            .split("@")[0]
            .split(".")
            .map((part: string) => part.charAt(0).toUpperCase())
            .join("")
            .slice(0, 2);
          setUserInitials(initials);
          setUserEmail(email);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUserInitials("U");
    }
  };

  const handleNavigation = (item: { title: string; url: string }) => {
    // Extract page and section from URL
    const urlParts = item.url.split("/").filter(Boolean);
    if (urlParts.length >= 3) {
      const [, pageId, sectionId] = urlParts;
      navigateToSection(pageId, sectionId);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src={"/favicon-white.svg"}
                    alt="JournalAI Logo"
                    width={16}
                    height={16}
                    className="size-4"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">JournalAI</span>
                  <span className="truncate text-xs">Daily Journaling</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onItemClick={handleNavigation} />
        {/* <NavProjects projects={data.projects} />  */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: userInitials,
            email: userEmail,
            avatar: userInitials,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
