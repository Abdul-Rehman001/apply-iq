import { create } from "zustand";

interface UserState {
  resumeText: string;
  hasResume: boolean;
  completedOnboarding: boolean;
  setResumeText: (text: string) => void;
  setCompletedOnboarding: (val: boolean) => void;
}

interface JobsState {
  refreshKey: number;
  triggerRefresh: () => void;
}

interface AppState extends UserState, JobsState {}

export const useAppStore = create<AppState>((set) => ({
  // User
  resumeText: "",
  hasResume: false,
  completedOnboarding: true,
  setResumeText: (text: string) =>
    set({ resumeText: text, hasResume: text.length > 50 }),
  setCompletedOnboarding: (val: boolean) =>
    set({ completedOnboarding: val }),

  // Jobs
  refreshKey: 0,
  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}));
