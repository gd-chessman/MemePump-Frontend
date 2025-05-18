import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PercentStore {
  percentages: string[];
  setPercentage: (index: number, value: string) => void;
}

// Zustand store for managing percentages
const usePercent = create<PercentStore>()(
  persist(
    (set) => ({
      percentages: ["25", "50", "75", "100"], // Default values (used during SSR)

      setPercentage: (index, value) => {
        set((state) => {
          const updatedPercentages = [...state.percentages];
          updatedPercentages[index] = value;
          return { percentages: updatedPercentages };
        });
      },
    }),
    {
      name: "percentages-storage", // Key for localStorage
      storage: typeof window !== "undefined"
        ? {
            getItem: (name) => {
              const item = localStorage.getItem(name);
              return item ? JSON.parse(item) : null;
            },
            setItem: (name, value) => {
              localStorage.setItem(name, JSON.stringify(value));
            },
            removeItem: (name) => {
              localStorage.removeItem(name);
            },
          }
        : undefined, // Ensure only client-side storage
    }
  )
);

export default usePercent;
