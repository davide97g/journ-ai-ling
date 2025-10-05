"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export const DynamicFavicon = () => {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const updateFavicon = () => {
      const currentTheme = resolvedTheme || theme;
      const faviconPath =
        currentTheme === "dark" ? "/favicon-white.svg" : "/favicon.svg";

      // Find existing favicon link element
      let linkElement = document.querySelector(
        "link[rel*='icon']"
      ) as HTMLLinkElement;

      if (!linkElement) {
        // Create new link element if it doesn't exist
        linkElement = document.createElement("link");
        linkElement.rel = "icon";
        linkElement.type = "image/svg+xml";
        document.head.appendChild(linkElement);
      }

      // Update the href
      linkElement.href = faviconPath;
    };

    // Update favicon when theme changes
    updateFavicon();
  }, [theme, resolvedTheme]);

  return null;
};
