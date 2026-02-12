interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export default function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[var(--border-muted)] last:border-b-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="whitespace-nowrap px-6 py-4">
              <div className="h-4 w-20 animate-pulse rounded bg-[var(--secondary)]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
