'use client';

import { Search, Plus, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDeleteItem, useGetAllAdminItems } from '@/api-client';
import ItemAddModal from '@/components/modal/AddItemModal';
import DeleteItemModal from '@/components/modal/DeleteItemModal';
import { Item } from '@/types/item';

export default function ItemPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<Item | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data, isLoading, refetch } = useGetAllAdminItems({ pageNo: currentPage });
  const items = data?.items ?? [];
  const totalPages = (data?.totalPage ?? 1) - 1;

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const handleEditItem = (item: Item) => {
    setCurrentEditItem(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentEditItem(null);
  };

  const handleDeleteItem = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const { mutateAsync: deleteItem } = useDeleteItem();

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await deleteItem({ itemId: itemToDelete.itemId });
        await refetch(); // 최신 데이터 다시 불러오기
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        toast.success('물품이 성공적으로 삭제되었습니다.');
      } catch (error) {
        toast.error('물품 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // api 모달에서 호출 후 반영만 진행
  const handleItemSubmit = async () => {
    await refetch();
    handleCloseModal();
  };

  const getItemTypeColor = (itemType: Item['itemType']) => {
    return itemType === 'RENTAL' ? 'bg-[#e6eef5] text-[#004A98]' : 'bg-[#e7f4ec] text-[#1b8b5a]';
  };

  const getRentedCountColor = (rentedCount: number) => {
    if (rentedCount === 0) return 'text-[#8b95a1]';
    return 'text-[#004A98] font-medium';
  };

  const getItemTypeLabel = (itemType: Item['itemType']) => {
    return itemType === 'RENTAL' ? '대여품' : '소모품';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-[#191f28]">물품 관리</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b95a1]" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="물품명을 입력해 주세요"
              className="h-10 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] pl-10 pr-4 text-sm text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
            />
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setCurrentEditItem(null);
              setIsModalOpen(true);
            }}
            className="flex h-10 shrink-0 items-center gap-1 rounded-md bg-[#004A98] px-4 text-sm font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hitemIdden sm:inline ">새로운 물품 추가하기</span>
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
                  아이콘
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  물품명
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  대여품/소모품
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  수량
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  대여 항목 수
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.itemId}
                  className="border-b border-[#e5e8eb] last:border-b-0 hover:bg-[#f9fbfc]"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex h-10 w-10 items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center text-xs text-[#8b95a1] bg-gray-100 rounded-md">
                          없음
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {item.itemName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getItemTypeColor(
                        item.itemType,
                      )}`}
                    >
                      {getItemTypeLabel(item.itemType)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {item.count}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {item.itemType === 'RENTAL' ? (
                      <span className={getRentedCountColor(item.renterCount)}>
                        {item.renterCount}
                      </span>
                    ) : (
                      <span className="text-[#8b95a1]">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="rounded-md p-1 text-[#8b95a1] hover:bg-[#f2f4f6] hover:text-[#4e5968] cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="rounded-md p-1 text-[#8b95a1] hover:bg-[#fff0f1] hover:text-[#e93c3c] cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e8eb] bg-white text-[#4e5968] disabled:opacity-50 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-sm text-[#8b95a1]">
            {currentPage} / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e8eb] bg-white text-[#4e5968] disabled:opacity-50 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div></div>
      </div>

      <ItemAddModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApply={handleItemSubmit}
        isEditMode={isEditMode}
        editItem={
          currentEditItem
            ? {
                id: currentEditItem.itemId,
                name: currentEditItem.itemName,
                itemType: currentEditItem.itemType,
                quantity: currentEditItem.count,
                imageUrl: currentEditItem.imageUrl,
              }
            : undefined
        }
      />

      {itemToDelete && (
        <DeleteItemModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={confirmDeleteItem}
          itemName={itemToDelete.itemName}
          hasRentedItems={itemToDelete.renterCount > 0}
        />
      )}
    </div>
  );
}
