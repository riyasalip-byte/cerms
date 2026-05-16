import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { ColumnFiltersState, VisibilityState } from "@tanstack/react-table"

interface TableState {
  pagination: Record<string, { pageIndex: number; pageSize: number }>
  filters: Record<string, ColumnFiltersState>
  columnVisibility: Record<string, VisibilityState>
  setPagination: (tableId: string, pageIndex: number, pageSize: number) => void
  setFilters: (tableId: string, filters: ColumnFiltersState) => void
  setColumnVisibility: (tableId: string, visibility: VisibilityState) => void
  resetColumnVisibility: (tableId: string) => void
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      pagination: {},
      filters: {},
      columnVisibility: {},
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
      setColumnVisibility: (tableId, visibility) =>
        set((state) => ({
          columnVisibility: {
            ...state.columnVisibility,
            [tableId]: visibility,
          },
        })),
      resetColumnVisibility: (tableId) =>
        set((state) => {
          const columnVisibility = { ...state.columnVisibility }
          delete columnVisibility[tableId]
          return { columnVisibility }
        }),
    }),
    {
      name: "table-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
