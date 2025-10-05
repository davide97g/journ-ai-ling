"use client";

import { AccountSheet } from "@/components/account-sheet";
import { Button } from "@/components/ui/button";

// Componente di demo per testare AccountSheet
export function AccountDemo() {
  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Account Settings Demo</h2>
      <p className="text-muted-foreground mb-6">
        Click the button below to open the account settings sheet.
      </p>

      <AccountSheet user={mockUser}>
        <Button variant="outline">Open Account Settings</Button>
      </AccountSheet>
    </div>
  );
}
