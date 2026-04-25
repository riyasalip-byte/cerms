import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, Settings2, X, Check } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { EmptyState } from "./EmptyState"
import { useTableStore } from "@/stores/tableStore"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  onRowClick?: (data: TData) => void
  isLoading?: boolean
  tableId?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onRowClick,
  isLoading = false,
  tableId,
}: DataTableProps<TData, TValue>) {
  const { pagination: storedPagination, filters: storedFilters, setPagination, setFilters } = useTableStore()
  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false)
  const optionsRef = React.useRef<HTMLDivElement>(null)
  
  const initialPagination = tableId ? storedPagination[tableId] || { pageIndex: 0, pageSize: 10 } : { pageIndex: 0, pageSize: 10 }
  const initialFilters = tableId ? storedFilters[tableId] || [] : []

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialFilters)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === "function" ? updater(columnFilters) : updater
      setColumnFilters(next)
      if (tableId) setFilters(tableId, next)
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(table.getState().pagination) : updater
      table.setPageIndex(next.pageIndex)
      if (tableId) setPagination(tableId, next.pageIndex, next.pageSize)
    },
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: tableId ? storedPagination[tableId] || { pageIndex: 0, pageSize: 10 } : undefined,
    },
  })

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (tableId && storedPagination[tableId]) {
      const storedIndex = storedPagination[tableId].pageIndex
      const pageCount = table.getPageCount()
      
      // If we have a stored page that's now out of bounds (due to data changes), reset to page 0
      if (pageCount > 0 && storedIndex >= pageCount) {
        console.log(`[DataTable] Resetting out-of-bounds page index for ${tableId}: ${storedIndex} -> 0`)
        table.setPageIndex(0)
        setPagination(tableId, 0, storedPagination[tableId].pageSize)
      } else {
        table.setPageIndex(storedIndex)
        table.setPageSize(storedPagination[tableId].pageSize)
      }
    }
  }, [tableId, table.getPageCount()])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          {searchKey && (
            <div className="relative w-full max-sm:max-w-none max-w-sm">
              <Input
                placeholder={`Search ${searchKey}...`}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="h-10 pr-10 shadow-sm transition-shadow focus:shadow-md"
              />
              {table.getColumn(searchKey)?.getFilterValue() && (
                <Button
                  variant="ghost"
                  onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
                  className="absolute right-0 top-0 h-10 px-3 hover:bg-transparent"
                >
                  <X className="size-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Custom Options Dropdown */}
        <div className="relative" ref={optionsRef}>
          <Button 
            variant="outline" 
            className={cn(
              "ml-auto h-10 shadow-sm transition-all border-primary/20",
              isOptionsOpen && "bg-muted ring-2 ring-primary/20"
            )}
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          >
            <Settings2 className="mr-2 size-4 text-primary" />
            Options
          </Button>
          
          {isOptionsOpen && (
            <div className="absolute right-0 mt-2 w-[220px] z-[100] rounded-xl border bg-popover p-2 text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1.5 text-sm font-bold text-muted-foreground">
                Display Settings
              </div>
              <div className="my-1 h-px bg-muted" />
              <div className="max-h-[300px] overflow-y-auto">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" && column.getCanHide()
                  )
                  .map((column) => (
                    <button
                      key={column.id}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        !column.getIsVisible() && "text-muted-foreground opacity-70"
                      )}
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <span className="capitalize">
                        {column.id.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {column.getIsVisible() && (
                        <Check className="size-4 text-primary" />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden border-muted/60">
        <Table wrapperClassName="max-h-[600px]">
          <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-muted/40">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-bold text-foreground py-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                            )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-4">
                      <Skeleton className="h-6 w-full rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    console.log(`[DataTable] Row clicked: ${row.id}`)
                    onRowClick?.(row.original)
                  }}
                  className={cn(
                    "group border-muted/40 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/40"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-4 font-medium transition-colors group-hover:text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-[400px] p-0">
                  <EmptyState
                    title="No results found"
                    description="Try adjusting your search or filters to find what you're looking for."
                    className="border-none"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="text-sm font-medium text-muted-foreground">
          {table.getFilteredRowModel().rows.length} records found
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 w-9 p-0 rounded-xl transition-transform active:scale-90"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center justify-center text-xs font-bold min-w-[120px] bg-muted/50 py-2 px-3 rounded-xl">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 w-9 p-0 rounded-xl transition-transform active:scale-90"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
