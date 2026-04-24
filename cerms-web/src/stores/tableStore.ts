import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface TableState {
  pagination: Record<string, { pageIndex: number; pageSize: number }>
  filters: Record<string, any[]>
  setPagination: (tableId: string, pageIndex: number, pageSize: number) => void
  setFilters: (tableId: string, filters: any[]) => void
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      pagination: {},
      filters: {},
      setPagination: (tableId, pageIndex, pageSize) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            [tableId]: { pageIndex, pageSize },
          },
        })),
      setFilters: (tableId, filters) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [tableId]: filters,
          },
        })),
    }),
    {
      name: "table-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
