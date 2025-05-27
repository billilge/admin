'use client';

import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useGetAdminList } from '@/api-client'; // 실제 경로 맞게 조정
import AddAdminModal from '@/components/modal/AddAdminModal';

interface Student {
  id: number;
  name: string;
  studentId: string;
  selected: boolean;
}

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleAddAdmins = (selectedStudents: Student[]) => {
    const newAdmins = selectedStudents.map((student) => ({
      name: student.name,
      studentId: student.studentId,
    }));

    setIsModalOpen(false);
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>데이터를 불러오는 데 실패했습니다.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-[#191f28]">관리자 조회하기</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b95a1]" />
            <input
              type="text"
              placeholder="이름을 입력해 주세요"
              className="h-10 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] pl-10 pr-4 text-sm text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#3182f6] focus:outline-none focus:ring-1 focus:ring-[#3182f6]"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-10 shrink-0 items-center gap-1 rounded-md bg-[#004A98] px-4 text-sm font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새로운 관리자 추가하기</span>
            <span className="sm:hidden">추가</span>
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
              </tr>
            </thead>
            <tbody>
              {adminListData?.admins?.map((admin, index) => (
                <tr
                  key={index}
                  className="border-b border-[#e5e8eb] last:border-b-0 hover:bg-[#f9fbfc]"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {admin.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {admin.studentId}
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

      <AddAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleAddAdmins}
      />
    </div>
  );
}
