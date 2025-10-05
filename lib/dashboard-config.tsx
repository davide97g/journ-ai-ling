import { HistoryContent } from "@/components/history-content";
import {
  BarChart3,
  BookOpen,
  Bot,
  LucideIcon,
  Settings2,
  Star,
} from "lucide-react";

// Define the structure for dashboard sections
export interface DashboardSection {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  component: React.ComponentType;
  breadcrumb: {
    page: string;
    section: string;
  };
}

// Define the structure for dashboard pages
export interface DashboardPage {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  sections: DashboardSection[];
}

// Registry of all dashboard sections
export const dashboardSections: Record<string, DashboardSection> = {
  history: {
    id: "history",
    title: "History",
    description: "View your journal entries",
    icon: BookOpen,
    component: HistoryContent,
    breadcrumb: {
      page: "Journal",
      section: "History",
    },
  },
  starred: {
    id: "starred",
    title: "Starred",
    description: "Your favorite entries",
    icon: Star,
    component: () => (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Starred Entries</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No starred entries yet</p>
        </div>
      </div>
    ),
    breadcrumb: {
      page: "Journal",
      section: "Starred",
    },
  },
  analytics: {
    id: "analytics",
    title: "Analytics",
    description: "Your journaling insights",
    icon: BarChart3,
    component: () => (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Analytics</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Analytics coming soon</p>
        </div>
      </div>
    ),
    breadcrumb: {
      page: "Journal",
      section: "Analytics",
    },
  },
  settings: {
    id: "settings",
    title: "Settings",
    description: "Journal preferences",
    icon: Settings2,
    component: () => (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Settings coming soon</p>
        </div>
      </div>
    ),
    breadcrumb: {
      page: "Journal",
      section: "Settings",
    },
  },
};

// Registry of all dashboard pages
export const dashboardPages: Record<string, DashboardPage> = {
  journal: {
    id: "journal",
    title: "Journal",
    description: "Your daily journaling",
    icon: BookOpen,
    sections: [
      dashboardSections.history,
      dashboardSections.starred,
      dashboardSections.analytics,
      dashboardSections.settings,
    ],
  },
  models: {
    id: "models",
    title: "Models",
    description: "AI model management",
    icon: Bot,
    sections: [
      {
        id: "genesis",
        title: "Genesis",
        description: "Primary AI model",
        icon: Bot,
        component: () => (
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h1 className="text-2xl font-semibold">Genesis Model</h1>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">
                Model configuration coming soon
              </p>
            </div>
          </div>
        ),
        breadcrumb: {
          page: "Models",
          section: "Genesis",
        },
      },
    ],
  },
};

// Helper function to get section by URL path
export const getSectionByPath = (path: string): DashboardSection | null => {
  const pathParts = path
    .split("/")
    .filter(Boolean)
    .filter((part) => part !== "/" && part !== "dashboard");

  if (pathParts.length === 0) {
    return dashboardSections.history; // Default section
  }

  if (pathParts.length === 1) {
    // /dashboard/journal -> history section
    const pageId = pathParts[0];
    const page = dashboardPages[pageId];
    if (page && page.sections.length > 0) {
      return page.sections[0]; // Return first section of the page
    }
  }

  if (pathParts.length === 2) {
    // /dashboard/journal/history -> specific section
    const [pageId, sectionId] = pathParts;
    const page = dashboardPages[pageId];
    if (page) {
      const section = page.sections.find((s) => s.id === sectionId);
      if (section) {
        return section;
      }
    }
  }

  return null;
};

// Helper function to get page by URL path
export const getPageByPath = (path: string): DashboardPage | null => {
  const pathParts = path
    .split("/")
    .filter(Boolean)
    .filter((part) => part !== "/" && part !== "dashboard");

  if (pathParts.length === 0) {
    return dashboardPages.journal; // Default page
  }

  const pageId = pathParts[0];
  return dashboardPages[pageId] || null;
};

// Helper function to generate breadcrumb data
export const getBreadcrumbData = (path: string) => {
  const section = getSectionByPath(path);
  const page = getPageByPath(path);

  if (!section || !page) {
    return {
      page: "Dashboard",
      section: "Home",
    };
  }

  return {
    page: section.breadcrumb.page,
    section: section.breadcrumb.section,
  };
};
