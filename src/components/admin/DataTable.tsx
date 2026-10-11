import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { DirectionalChevronLeft, DirectionalChevronRight } from '../ui/DirectionalIcon';
import { ColumnDef } from '../../types';

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyField: keyof T | string;
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
  pageSizeOptions?: number[];
  initialPageSize?: number;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  emptyMessage?: string;
  className?: string;
  id?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  defaultSortKey,
  defaultSortDirection = 'asc',
  pageSizeOptions = [5, 10, 20],
  initialPageSize = 5,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  emptyMessage,
  className = '',
  id = 'admin-data-table',
}: DataTableProps<T>) {
  const { locale } = useI18n();
  const effectiveEmptyMessage = emptyMessage ?? (locale === 'ar' ? 'لم يتم العثور على سجلات.' : 'No records found.');
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [data, sortKey, sortDirection]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, validPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(undefined);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const allIds = data.map((item) => item[keyField]);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (rowId: string | number, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, rowId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== rowId));
    }
  };

  const isAllSelected =
    data.length > 0 && selectedIds.length === data.length;
  const isPartiallySelected =
    selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div
      id={id}
      className={`w-full bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] overflow-hidden flex flex-col font-body ${className}`}
    >
      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-start border-collapse text-[13px]">
          {/* Table Header */}
          <thead>
            <tr className="bg-[#F5F1EA] border-b border-[#E4DED3] text-[#7A736A] font-mono text-[11px] uppercase tracking-wider">
              {selectable && (
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label={locale === 'ar' ? 'تحديد كافة الصفوف' : 'Select all rows'}
                    className="w-3.5 h-3.5 accent-[#1C1A17] cursor-pointer rounded-[2px]"
                  />
                </th>
              )}

              {columns.map((col) => {
                const colKey = String(col.key);
                const isSorted = sortKey === colKey;
                const alignClass =
                  col.align === 'right'
                    ? 'text-end'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-start';

                return (
                  <th
                    key={colKey}
                    scope="col"
                    onClick={() => handleSort(colKey, col.sortable)}
                    className={`
                      px-4 py-3 font-medium select-none
                      ${alignClass}
                      ${col.sortable ? 'cursor-pointer hover:text-[#1C1A17] transition-colors' : ''}
                    `}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right'
                          ? 'justify-end'
                          : col.align === 'center'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-[#7A736A] shrink-0">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#1C1A17]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#1C1A17]" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#E4DED3]/80 bg-[#FAF7F2]">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-10 text-center text-[#7A736A] font-body text-[13px]"
                >
                  {effectiveEmptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const rowId = row[keyField];
                const isSelected = selectedIds.includes(rowId);

                return (
                  <tr
                    key={String(rowId) || rowIndex}
                    className={`
                      transition-colors duration-100
                      ${isSelected ? 'bg-[#E4DED3]/30' : 'hover:bg-[#FFFFFF]'}
                    `}
                  >
                    {selectable && (
                      <td className="w-10 px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                          aria-label={locale === 'ar' ? `تحديد الصف ${rowId}` : `Select row ${rowId}`}
                          className="w-3.5 h-3.5 accent-[#1C1A17] cursor-pointer rounded-[2px]"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const colKey = String(col.key);
                      const alignClass =
                        col.align === 'right'
                          ? 'text-end'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-start';

                      return (
                        <td
                          key={colKey}
                          className={`px-4 py-2.5 text-[#1C1A17] whitespace-nowrap ${alignClass}`}
                        >
                          {col.render ? col.render(row) : row[colKey] ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-2.5 bg-[#F5F1EA] border-t border-[#E4DED3] flex flex-wrap items-center justify-between gap-3 text-[12px] font-mono text-[#7A736A]">
        {/* Left: Summary & Page Size */}
        <div className="flex items-center gap-4">
          <span>
            {locale === 'ar' ? 'عرض' : 'Showing'} <strong className="text-[#1C1A17]">{totalItems > 0 ? (validPage - 1) * pageSize + 1 : 0}</strong>-
            <strong className="text-[#1C1A17]">{Math.min(validPage * pageSize, totalItems)}</strong> {locale === 'ar' ? 'من أصل' : 'of'}{' '}
            <strong className="text-[#1C1A17]">{totalItems}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <span>{locale === 'ar' ? 'الصفوف:' : 'Rows:'}</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] px-2 py-0.5 text-[11px] text-[#1C1A17] cursor-pointer focus:outline-none focus:border-[#1C1A17]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={validPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label={locale === 'ar' ? 'الصفحة السابقة' : 'Previous page'}
            className="p-1 border border-[#E4DED3] rounded-[2px] bg-[#FAF7F2] text-[#1C1A17] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#1C1A17] transition-colors"
          >
            <DirectionalChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2">
            {locale === 'ar' ? 'صفحة' : 'Page'} <strong className="text-[#1C1A17]">{validPage}</strong> / {totalPages}
          </span>

          <button
            type="button"
            disabled={validPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label={locale === 'ar' ? 'الصفحة التالية' : 'Next page'}
            className="p-1 border border-[#E4DED3] rounded-[2px] bg-[#FAF7F2] text-[#1C1A17] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#1C1A17] transition-colors"
          >
            <DirectionalChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
