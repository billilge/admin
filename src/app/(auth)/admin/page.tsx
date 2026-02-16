'use client';

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetAdminList } from '@/api-client';
import { addAdmins } from '@/api-client';
import { AdminRequest } from '@/api-client/model';
import AddAdminModal from '@/components/modal/AddAdminModal';
import TableSkeleton from '@/components/ui/table-skeleton';
import { AdminRole } from '@/types/modal';
import { Student } from '@/types/student';

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cachedTotalPages = useRef(1);

  const queryClient = useQueryClient();

  const {
    data: adminListData,
    isLoading,
    isError,
  } = useGetAdminList(
    {
      pageNo: currentPage - 1,
      size: 10,
      criteria: 'name',
    },
    {
      query: {
        staleTime: 1000 * 60 * 3,
      },
    },
  );

  const totalPages = adminListData?.totalPage ?? cachedTotalPages.current;

  useEffect(() => {
    if (adminListData?.totalPage) {
      cachedTotalPages.current = adminListData.totalPage;
    }
  }, [adminListData?.totalPage]);

  const addAdminsMutation = useMutation({
    mutationFn: (data: AdminRequest) => addAdmins(data),
    onSuccess: () => {
      toast.success('관리자가 성공적으로 추가되었습니다.');
      queryClient.invalidateQueries({
        queryKey: ['/admin/members/admins'],
      });
    },
    onError: () => {
      toast.error('관리자 추가에 실패했습니다.');
    },
  });

  const handleAddAdmins = (selectedStudents: Student[], role: AdminRole) => {
    const requestData: AdminRequest = {
      memberIds: selectedStudents.map((s) => s.id),
      role,
    };
    addAdminsMutation.mutate(requestData);
    setIsModalOpen(false);
  };

  if (isError) return <div>데이터를 불러오는 데 실패했습니다.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">관리자 조회하기</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <input
              type="text"
              placeholder="이름을 입력해 주세요"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-10 shrink-0 items-center gap-1 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새로운 관리자 추가하기</span>
            <span className="sm:hidden">추가</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--secondary)]">
                <th className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] w-16">
                  No
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  이름
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  학번
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {isLoading ? (
                <TableSkeleton columns={3} rows={10} />
              ) : (
                adminListData?.admins?.map((admin, index) => (
                  <tr
                    key={index}
                    className="transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-medium text-[var(--foreground-muted)]">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-[var(--foreground)]">
                      {admin.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--foreground-muted)]">
                      {admin.studentId}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {(() => {
            const pageGroup = Math.floor((currentPage - 1) / 10);
            const startPage = pageGroup * 10 + 1;
            const endPage = Math.min(startPage + 9, totalPages);
            return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]'
                }`}
              >
                {page}
              </button>
            ));
          })()}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AddAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleAddAdmins}
      />
    </div>
  );
}
