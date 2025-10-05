import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error getting user:", error);
          return;
        }

        if (user) {
          setUser(user);
          setProfile({
            name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User",
            email: user.email || "",
            avatar: user.user_metadata?.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Error in useUserProfile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        setProfile({
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || "",
        });
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: "No user logged in" };

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: updates.name,
          avatar_url: updates.avatar,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local state
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));

      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
    }
  };

  return {
    user,
    profile,
    isLoading,
    updateProfile,
  };
};
