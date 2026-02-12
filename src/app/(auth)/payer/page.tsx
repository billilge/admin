'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  FileDown,
  Trash2,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetAllPayers, useDeletePayers } from '@/api-client';
import { useAddPayers } from '@/api-client';
import { createPayerExcel } from '@/api-client';
import AddPayerModal from '@/components/modal/AddPayerModal';
import TableSkeleton from '@/components/ui/table-skeleton';
import { Payer } from '@/types/payer';

export default function PayerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const cachedTotalPages = useRef(1);

  const { data, isLoading } = useGetAllPayers(
    {
      pageNo: currentPage - 1,
      search: searchKeyword || undefined,
    },
    {
      query: {
        staleTime: 1000 * 60 * 3,
      },
    },
  );

  const payers = data?.payers ?? [];
  const totalPages = data?.totalPage ?? cachedTotalPages.current;

  useEffect(() => {
    if (data?.totalPage) {
      cachedTotalPages.current = data.totalPage;
    }
  }, [data?.totalPage]);

  const { mutate: addPayers } = useAddPayers();
  const { mutateAsync: deletePayers } = useDeletePayers();

  const queryClient = useQueryClient();

  const handleDeletePayer = async (payerId: number) => {
    try {
      await deletePayers({ data: { payerIds: [payerId] } });
      await queryClient.invalidateQueries({ queryKey: ['/admin/members/payers'] });
      toast.success('납부자가 삭제되었습니다.');
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAddPayers = (newPayers: Payer[]) => {
    const payload = {
      data: {
        payers: newPayers.map(({ name, studentId }) => ({
          name,
          studentId,
        })),
      },
    };

    addPayers(payload, {
      onSuccess: () => {
        toast.success('학생회비 납부자가 추가되었습니다.');
        queryClient.invalidateQueries({ queryKey: ['getAllPayers'] });
        setIsModalOpen(false);
      },
      onError: () => {
        toast.error('추가 중 오류가 발생했습니다.');
      },
    });
  };

  const handleExcelDownload = async () => {
    try {
      const response = await createPayerExcel();

      const blob = new Blob([response as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileName = `학생회비_납부자_목록_${new Date().toISOString().split('T')[0]}.xlsx`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      toast.error('엑셀 다운로드에 실패했습니다.');
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchKeyword(searchInput.trim());
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">납부자 관리</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="학번 또는 이름을 입력해 주세요"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <button
            onClick={handleExcelDownload}
            className="flex h-10 shrink-0 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">엑셀 다운로드</span>
            <span className="sm:hidden">엑셀</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-10 shrink-0 items-center gap-1 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새로운 납부자 등록</span>
            <span className="sm:hidden">등록</span>
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
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  빌릴게 d회원 여부
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] w-16">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {isLoading ? (
                <TableSkeleton columns={5} rows={10} />
              ) : (
                payers.map((payer, index) => (
                  <tr
                    key={payer.payerId}
                    className="transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-medium text-[var(--foreground-muted)]">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-[var(--foreground)]">
                      {payer.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--foreground-muted)]">
                      {payer.studentId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {payer.registered ? (
                        <div className="flex items-center gap-1.5 text-[var(--success)]">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">회원</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[var(--foreground-subtle)]">
                          <XCircle className="h-4 w-4" />
                          <span>비회원</span>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <button
                        onClick={() => handleDeletePayer(payer.payerId)}
                        className="rounded-lg p-1.5 text-[var(--foreground-subtle)] hover:bg-[var(--error-bg)] hover:text-[var(--error)] cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

      <AddPayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleAddPayers}
      />
    </div>
  );
}
