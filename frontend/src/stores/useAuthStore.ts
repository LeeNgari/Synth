import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

// Define the User type based on your backend model
interface User {
  _id: string;
  clerkId: string;
  fullName: string;
  imageUrl: string;
  role: 'user' | 'admin';
  // Add other fields from your user model if needed
}

interface AuthStore {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  fetchUser: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAdmin: false,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get<User>("/auth/me");
      const user = response.data;
      set({ user: user, isAdmin: user.role === 'admin', isLoading: false });
    } catch (error: any) {
      set({ user: null, isAdmin: false, error: error.response?.data?.message || "An error occurred", isLoading: false });
    }
  },

  reset: () => {
    set({ user: null, isAdmin: false, isLoading: false, error: null });
  },
}));
