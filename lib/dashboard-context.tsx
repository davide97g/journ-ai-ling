"use client";

import { createContext, useContext } from "react";

// Create context for dashboard state
interface DashboardContextType {
  currentSection: string | null;
  navigateToSection: (pageId: string, sectionId: string) => void;
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

export { DashboardContext };
export type { DashboardContextType };
