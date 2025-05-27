'use client';

import { Search, Plus, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ItemAddModal from '@/components/modal/AddItemModal';
import ItemDeleteModal from '@/components/modal/DeleteItemModal';

// Update the item interface to include imageUrl
interface Item {
  id: number;
  name: string;
  itemType: string;
  quantity: number;
  rentedCount: number;
  icon: string;
  imageUrl?: string;
}

export default function ItemPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<Item | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Update the items state to use the Item interface
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: '노트북', itemType: '대여품', quantity: 5, rentedCount: 3, icon: 'laptop' },
    {
      id: 2,
      name: '빔프로젝터',
      itemType: '대여품',
      quantity: 2,
      rentedCount: 1,
      icon: 'projector',
    },
    { id: 3, name: '카메라', itemType: '대여품', quantity: 3, rentedCount: 3, icon: 'camera' },
    { id: 4, name: '스피커', itemType: '대여품', quantity: 3, rentedCount: 1, icon: 'speaker' },
    { id: 5, name: '마이크', itemType: '대여품', quantity: 4, rentedCount: 2, icon: 'microphone' },
    { id: 6, name: '삼각대', itemType: '대여품', quantity: 2, rentedCount: 0, icon: 'tripod' },
    { id: 7, name: '책상', itemType: '대여품', quantity: 5, rentedCount: 2, icon: 'desk' },
    { id: 8, name: '의자', itemType: '대여품', quantity: 8, rentedCount: 3, icon: 'chair' },
    { id: 9, name: 'A4 용지', itemType: '소모품', quantity: 500, rentedCount: 0, icon: 'paper' },
    { id: 10, name: '볼펜', itemType: '소모품', quantity: 100, rentedCount: 0, icon: 'pen' },
    { id: 11, name: '포스트잇', itemType: '소모품', quantity: 50, rentedCount: 0, icon: 'postit' },
    { id: 12, name: '마커펜', itemType: '소모품', quantity: 30, rentedCount: 0, icon: 'marker' },
  ]);

  // Function to open the edit modal
  const handleEditItem = (item: Item) => {
    setCurrentEditItem(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Function to close the modal and reset edit state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentEditItem(null);
  };

  const handleDeleteItem = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      setItems(items.filter((item) => item.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Update the handleAddItem function to handle both add and edit
  const handleItemSubmit = (itemData: {
    id?: number;
    name: string;
    isConsumable: boolean;
    quantity: number;
    imageFile: File | null;
    imageUrl?: string;
  }) => {
    if (isEditMode && itemData.id) {
      // Edit existing item
      const updatedItems = items.map((item) => {
        if (item.id === itemData.id) {
          // Determine icon based on name (simplified logic)
          let icon = item.icon; // Keep existing icon by default
          if (item.name !== itemData.name) {
            // Only update icon if name changed
            if (itemData.name.includes('노트북')) icon = 'laptop';
            else if (itemData.name.includes('프로젝터')) icon = 'projector';
            else if (itemData.name.includes('카메라')) icon = 'camera';
            else if (itemData.name.includes('스피커')) icon = 'speaker';
            else if (itemData.name.includes('마이크')) icon = 'microphone';
            else if (itemData.name.includes('삼각대')) icon = 'tripod';
            else if (itemData.name.includes('책상')) icon = 'desk';
            else if (itemData.name.includes('의자')) icon = 'chair';
            else if (itemData.name.includes('용지')) icon = 'paper';
            else if (itemData.name.includes('펜')) icon = 'pen';
            else if (itemData.name.includes('포스트잇')) icon = 'postit';
          }

          // Create image URL if file exists
          let imageUrl = itemData.imageUrl; // Keep existing URL if provided
          if (itemData.imageFile) {
            // In a real application, you would upload this file to a server
            // and use the returned URL. For this demo, we'll use a local object URL.
            imageUrl = URL.createObjectURL(itemData.imageFile);
          }

          return {
            ...item,
            name: itemData.name,
            itemType: itemData.isConsumable ? '소모품' : '대여품',
            quantity: itemData.quantity,
            icon,
            imageUrl,
          };
        }
        return item;
      });

      setItems(updatedItems);
    } else {
      // Add new item
      const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

      // Determine icon based on name (simplified logic)
      let icon = 'default';
      if (itemData.name.includes('노트북')) icon = 'laptop';
      else if (itemData.name.includes('프로젝터')) icon = 'projector';
      else if (itemData.name.includes('카메라')) icon = 'camera';
      else if (itemData.name.includes('스피커')) icon = 'speaker';
      else if (itemData.name.includes('마이크')) icon = 'microphone';
      else if (itemData.name.includes('삼각대')) icon = 'tripod';
      else if (itemData.name.includes('책상')) icon = 'desk';
      else if (itemData.name.includes('의자')) icon = 'chair';
      else if (itemData.name.includes('용지')) icon = 'paper';
      else if (itemData.name.includes('펜')) icon = 'pen';
      else if (itemData.name.includes('포스트잇')) icon = 'postit';
      else if (itemData.name.includes('마커')) icon = 'marker';

      // Create image URL if file exists
      let imageUrl: string | undefined = undefined;
      if (itemData.imageFile) {
        // In a real application, you would upload this file to a server
        // and use the returned URL. For this demo, we'll use a local object URL.
        imageUrl = URL.createObjectURL(itemData.imageFile);
      }

      const itemToAdd: Item = {
        id: newId,
        name: itemData.name,
        itemType: itemData.isConsumable ? '소모품' : '대여품',
        quantity: itemData.quantity,
        rentedCount: 0,
        icon: icon,
        imageUrl: imageUrl,
      };

      setItems([...items, itemToAdd]);
    }

    // Close modal and reset edit state
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentEditItem(null);
  };

  // Update the getItemIcon function to use custom images when available
  const getItemIcon = (item: Item) => {
    if (item.imageUrl) {
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <img
            src={item.imageUrl || '/placeholder.svg'}
            alt={item.name}
            className="h-full w-full object-contain"
          />
        </div>
      );
    }

    switch (item.icon) {
      case 'laptop':
        return <LaptopIcon />;
      case 'projector':
        return <ProjectorIcon />;
      case 'camera':
        return <CameraIcon />;
      case 'speaker':
        return <SpeakerIcon />;
      case 'microphone':
        return <MicrophoneIcon />;
      case 'tripod':
        return <TripodIcon />;
      case 'desk':
        return <DeskIcon />;
      case 'chair':
        return <ChairIcon />;
      case 'paper':
        return <PaperIcon />;
      case 'pen':
        return <PenIcon />;
      case 'postit':
        return <PostitIcon />;
      case 'marker':
        return <MarkerIcon />;
      default:
        return <DefaultItemIcon />;
    }
  };

  const getItemTypeColor = (itemType: string) => {
    return itemType === '대여품' ? 'bg-[#e6eef5] text-[#004A98]' : 'bg-[#e7f4ec] text-[#1b8b5a]';
  };

  const getRentedCountColor = (rentedCount: number) => {
    if (rentedCount === 0) return 'text-[#8b95a1]';
    return 'text-[#004A98] font-medium';
  };

  return (
    <div className="space-y-6">
      {/* Update the responsive layout for the header section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-[#191f28]">물품 관리</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b95a1]" />
            <input
              type="text"
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
            className="flex h-10 shrink-0 items-center gap-1 rounded-md bg-[#004A98] px-4 text-sm font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새로운 물품 추가하기</span>
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
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#e5e8eb] last:border-b-0 hover:bg-[#f9fbfc]"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex h-6 w-6 items-center justify-center text-[#004A98]">
                      {getItemIcon(item)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {item.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getItemTypeColor(
                        item.itemType,
                      )}`}
                    >
                      {item.itemType}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {item.quantity}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {item.itemType === '대여품' ? (
                      <span className={getRentedCountColor(item.rentedCount)}>
                        {item.rentedCount}
                      </span>
                    ) : (
                      <span className="text-[#8b95a1]">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="rounded-md p-1 text-[#8b95a1] hover:bg-[#f2f4f6] hover:text-[#4e5968]"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="rounded-md p-1 text-[#8b95a1] hover:bg-[#fff0f1] hover:text-[#e93c3c]"
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

      {/* Item Add/Edit Modal */}
      <ItemAddModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApply={handleItemSubmit}
        editItem={currentEditItem || undefined}
        isEditMode={isEditMode}
      />
      {/* Item Delete Modal */}
      {itemToDelete && (
        <ItemDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={confirmDeleteItem}
          itemName={itemToDelete.name}
          hasRentedItems={itemToDelete.rentedCount > 0}
        />
      )}
    </div>
  );
}

// SVG Icons for items (24x24 pixels)
const LaptopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 16V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 16H22V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V16Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 17H12.01"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProjectorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 6V4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 6V4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 18V21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 21L16 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="7.5"
      cy="11.5"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 9L17 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 12L17 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 15L17 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 9C3 7.89543 3.89543 7 5 7H5.92963C6.59834 7 7.2228 6.6658 7.59373 6.1094L8.40627 4.8906C8.7772 4.3342 9.40166 4 10.0704 4H13.9296C14.5983 4 15.2228 4.3342 15.5937 4.8906L16.4063 6.1094C16.7772 6.6658 17.4017 7 18.0704 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="13"
      r="4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SpeakerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="5"
      y="2"
      width="14"
      height="20"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="14"
      r="3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="7"
      r="1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MicrophoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 10V12C19 16.4183 15.4183 20 11 20M5 10V12C5 16.4183 8.58172 20 13 20M12 20V23"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 23H16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TripodIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 17L12 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 21H16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 3L19 3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 3V8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 3L9 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 3L15 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DeskIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="3"
      y="10"
      width="18"
      height="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 12L5 19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 12L19 19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 5H19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 5L5 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 5L19 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChairIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 19L6 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 19L18 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="4"
      y="11"
      width="16"
      height="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 13L6 19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 13L18 19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 5V11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 5V11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 5H18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PaperIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 3C5 1.89543 5.89543 1 7 1H17C18.1046 1 19 1.89543 19 3V21C19 22.1046 18.1046 23 17 23H7C5.89543 23 5 22.1046 5 21V3Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 7H15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 11H15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 15H13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PostitIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H14C15.1046 22 16 21.1046 16 20V4C16 2.89543 15.1046 2 14 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 8H20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MarkerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3C7.52285 3 4 7.02285 4 12C4 16.4771 7.52285 20 12 20C16.4771 20 20 16.4771 20 12C20 7.02285 16.4771 3 12 3Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15V12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8V9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DefaultItemIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
