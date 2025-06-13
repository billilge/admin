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
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetAllPayers } from '@/api-client';
import { useAddPayers } from '@/api-client';
import { createPayerExcel } from '@/api-client';
import AddPayerModal from '@/components/modal/AddPayerModal';
import { Payer } from '@/types/payer';

export default function PayerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data, isLoading } = useGetAllPayers({
    pageNo: currentPage - 1,
    search: searchKeyword || undefined,
  });

  const payers = data?.payers ?? [];
  const totalPages = data?.totalPage ?? 1;

  const { mutate: addPayers } = useAddPayers();

  const queryClient = useQueryClient();

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
        toast.success('납부자가 추가되었습니다.');
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
      const response = await createPayerExcel(); // responseType: 'blob' 가정

      const blob = new Blob([response as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileName = `납부자_목록_${new Date().toISOString().split('T')[0]}.xlsx`;
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
        <h1 className="text-2xl font-bold text-[#191f28]">납부자 관리</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b95a1]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="학번 또는 이름을 입력해 주세요"
              className="h-10 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] pl-10 pr-4 text-sm text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#3182f6] focus:outline-none focus:ring-1 focus:ring-[#3182f6]"
            />
          </div>
          <button
            onClick={handleExcelDownload}
            className="flex h-10 shrink-0 items-center gap-1 rounded-md border border-[#e5e8eb] bg-white px-4 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">엑셀 다운로드</span>
            <span className="sm:hidden">엑셀</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-10 shrink-0 items-center gap-1 rounded-md bg-[#004A98] px-4 text-sm font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새로운 납부 등록</span>
            <span className="sm:hidden">등록</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-[#e5e8eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#e5e8eb] bg-[#f9fbfc]">
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  이름
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  학번
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  회원 여부
                </th>
              </tr>
            </thead>
            <tbody>
              {payers.map((payer) => (
                <tr
                  key={payer.payerId}
                  className="border-b border-[#e5e8eb] last:border-b-0 hover:bg-[#f9fbfc]"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {payer.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {payer.studentId}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {payer.registered ? (
                      <div className="flex items-center gap-1 text-[#1b8b5a]">
                        <CheckCircle className="h-4 w-4" />
                        <span>O</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[#e93c3c]">
                        <XCircle className="h-4 w-4" />
                        <span>X</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e8eb] bg-white text-[#4e5968] disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-sm text-[#8b95a1]">
            {currentPage} / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e8eb] bg-white text-[#4e5968] disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div></div>
      </div>

      <AddPayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleAddPayers}
      />
    </div>
  );
}
