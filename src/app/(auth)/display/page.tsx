'use client';

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Image,
  X,
  Edit,
  Trash2,
  Save,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { DisplayCalendarSchedule, DisplayPoster } from '@/types/display';

// 임시 일정 데이터
const mockSchedules: DisplayCalendarSchedule[] = [
  { id: 1, date: '2025-01-06', schedules: ['학과 MT 신청 시작', '동아리 모집'] },
  { id: 2, date: '2025-01-10', schedules: ['중간고사 기간 시작'] },
  { id: 3, date: '2025-01-15', schedules: ['학과 세미나', '취업 특강', '교수님 면담'] },
  { id: 4, date: '2025-01-20', schedules: ['중간고사 종료', '성적 입력 시작'] },
  { id: 5, date: '2025-01-25', schedules: ['학과 엠티', '신입생 환영회', '동아리 발표', '간식 배부'] },
];

// 임시 포스터 데이터
const mockPosters: DisplayPoster[] = [
  {
    id: 1,
    title: '2025 신입생 환영회',
    imageUrl: 'https://placehold.co/400x600/004A98/ffffff?text=신입생+환영회',
    createdAt: '2025-01-05',
    isActive: true,
  },
  {
    id: 2,
    title: '학과 MT 안내',
    imageUrl: 'https://placehold.co/400x600/1b8b5a/ffffff?text=학과+MT',
    createdAt: '2025-01-03',
    isActive: true,
  },
  {
    id: 3,
    title: '취업 특강 시리즈',
    imageUrl: 'https://placehold.co/400x600/f5a623/ffffff?text=취업+특강',
    createdAt: '2025-01-01',
    isActive: false,
  },
  {
    id: 4,
    title: '동아리 모집',
    imageUrl: 'https://placehold.co/400x600/e93c3c/ffffff?text=동아리+모집',
    createdAt: '2024-12-28',
    isActive: true,
  },
];

type TabType = 'calendar' | 'poster';

export default function DisplayPage() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)); // 2025년 1월
  const [schedules, setSchedules] = useState<DisplayCalendarSchedule[]>(mockSchedules);
  const [posters, setPosters] = useState<DisplayPoster[]>(mockPosters);

  // 일정 편집 모달 상태
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSchedules, setEditingSchedules] = useState<string[]>([]);

  // 포스터 모달 상태
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<DisplayPoster | null>(null);
  const [posterTitle, setPosterTitle] = useState('');
  const [posterImageUrl, setPosterImageUrl] = useState('');

  // 삭제 확인 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [posterToDelete, setPosterToDelete] = useState<DisplayPoster | null>(null);

  // 캘린더 관련 함수
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getSchedulesForDate = (dateString: string) => {
    const schedule = schedules.find((s) => s.date === dateString);
    return schedule?.schedules || [];
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString);
    setEditingSchedules(getSchedulesForDate(dateString));
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedules = () => {
    if (!selectedDate) return;

    const filteredSchedules = editingSchedules.filter((s) => s.trim() !== '');

    setSchedules((prev) => {
      const existing = prev.find((s) => s.date === selectedDate);
      if (existing) {
        if (filteredSchedules.length === 0) {
          return prev.filter((s) => s.date !== selectedDate);
        }
        return prev.map((s) =>
          s.date === selectedDate ? { ...s, schedules: filteredSchedules } : s,
        );
      } else if (filteredSchedules.length > 0) {
        return [
          ...prev,
          { id: Date.now(), date: selectedDate, schedules: filteredSchedules },
        ];
      }
      return prev;
    });

    setIsScheduleModalOpen(false);
    toast.success('일정이 저장되었습니다.');
  };

  const handleAddScheduleInput = () => {
    if (editingSchedules.length >= 4) {
      toast.error('하루에 최대 4개의 일정만 등록할 수 있습니다.');
      return;
    }
    setEditingSchedules([...editingSchedules, '']);
  };

  const handleScheduleInputChange = (index: number, value: string) => {
    const updated = [...editingSchedules];
    updated[index] = value;
    setEditingSchedules(updated);
  };

  const handleRemoveScheduleInput = (index: number) => {
    setEditingSchedules(editingSchedules.filter((_, i) => i !== index));
  };

  // 포스터 관련 함수
  const handleOpenAddPoster = () => {
    setEditingPoster(null);
    setPosterTitle('');
    setPosterImageUrl('');
    setIsPosterModalOpen(true);
  };

  const handleOpenEditPoster = (poster: DisplayPoster) => {
    setEditingPoster(poster);
    setPosterTitle(poster.title);
    setPosterImageUrl(poster.imageUrl);
    setIsPosterModalOpen(true);
  };

  const handleSavePoster = () => {
    if (!posterTitle.trim() || !posterImageUrl.trim()) {
      toast.error('제목과 이미지 URL을 입력해주세요.');
      return;
    }

    if (editingPoster) {
      setPosters((prev) =>
        prev.map((p) =>
          p.id === editingPoster.id
            ? { ...p, title: posterTitle, imageUrl: posterImageUrl }
            : p,
        ),
      );
      toast.success('포스터가 수정되었습니다.');
    } else {
      const newPoster: DisplayPoster = {
        id: Date.now(),
        title: posterTitle,
        imageUrl: posterImageUrl,
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true,
      };
      setPosters((prev) => [newPoster, ...prev]);
      toast.success('포스터가 추가되었습니다.');
    }

    setIsPosterModalOpen(false);
  };

  const handleDeletePoster = (poster: DisplayPoster) => {
    setPosterToDelete(poster);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePoster = () => {
    if (posterToDelete) {
      setPosters((prev) => prev.filter((p) => p.id !== posterToDelete.id));
      toast.success('포스터가 삭제되었습니다.');
      setIsDeleteModalOpen(false);
      setPosterToDelete(null);
    }
  };

  const togglePosterActive = (posterId: number) => {
    setPosters((prev) =>
      prev.map((p) => (p.id === posterId ? { ...p, isActive: !p.isActive } : p)),
    );
  };

  // 캘린더 렌더링
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    // 빈 셀 추가
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-[#f9fbfc]" />);
    }

    // 날짜 셀 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateString(year, month, day);
      const daySchedules = getSchedulesForDate(dateString);
      const isToday =
        new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(dateString)}
          className={`h-28 border-t border-[#e5e8eb] p-2 cursor-pointer hover:bg-[#f2f4f6] transition-colors ${
            isToday ? 'bg-[#e6eef5]' : 'bg-white'
          }`}
        >
          <div
            className={`text-sm font-medium mb-1 ${
              isToday ? 'text-[#004A98]' : 'text-[#191f28]'
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {daySchedules.slice(0, 3).map((schedule, idx) => (
              <div
                key={idx}
                className="text-xs px-1.5 py-0.5 bg-[#004A98] text-white rounded truncate"
              >
                {schedule}
              </div>
            ))}
            {daySchedules.length > 3 && (
              <div className="text-xs text-[#8b95a1]">+{daySchedules.length - 3}개 더</div>
            )}
          </div>
        </div>,
      );
    }

    return (
      <div className="overflow-hidden rounded-md border border-[#e5e8eb] bg-white shadow-sm">
        <div className="grid grid-cols-7">
          {weekdays.map((day, idx) => (
            <div
              key={day}
              className={`py-3 text-center text-sm font-medium ${
                idx === 0 ? 'text-[#e93c3c]' : idx === 6 ? 'text-[#004A98]' : 'text-[#4e5968]'
              } bg-[#f9fbfc] border-b border-[#e5e8eb]`}
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  // 포스터 그리드 렌더링
  const renderPosters = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {posters.map((poster) => (
          <div
            key={poster.id}
            className={`rounded-md border ${
              poster.isActive ? 'border-[#004A98]' : 'border-[#e5e8eb]'
            } bg-white shadow-sm overflow-hidden`}
          >
            <div className="relative aspect-[2/3] bg-[#f9fbfc]">
              <img
                src={poster.imageUrl}
                alt={poster.title}
                className="w-full h-full object-cover"
              />
              {!poster.isActive && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-medium text-sm bg-black/60 px-3 py-1 rounded">
                    비활성화
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-[#191f28] truncate">{poster.title}</h3>
              <p className="text-xs text-[#8b95a1] mt-1">{poster.createdAt}</p>
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => togglePosterActive(poster.id)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium cursor-pointer ${
                    poster.isActive
                      ? 'bg-[#e7f4ec] text-[#1b8b5a]'
                      : 'bg-[#f2f4f6] text-[#8b95a1]'
                  }`}
                >
                  {poster.isActive ? '활성화됨' : '비활성화됨'}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditPoster(poster)}
                    className="rounded-md p-1.5 text-[#8b95a1] hover:bg-[#f2f4f6] hover:text-[#4e5968] cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePoster(poster)}
                    className="rounded-md p-1.5 text-[#8b95a1] hover:bg-[#fff0f1] hover:text-[#e93c3c] cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-[#191f28]">디스플레이 관리</h1>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 border-b border-[#e5e8eb]">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-[#004A98] text-[#004A98]'
              : 'border-transparent text-[#8b95a1] hover:text-[#4e5968]'
          }`}
        >
          <Calendar className="h-4 w-4" />
          학사 캘린더
        </button>
        <button
          onClick={() => setActiveTab('poster')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'poster'
              ? 'border-[#004A98] text-[#004A98]'
              : 'border-transparent text-[#8b95a1] hover:text-[#4e5968]'
          }`}
        >
          <Image className="h-4 w-4" />
          행사 포스터
        </button>
      </div>

      {/* 캘린더 탭 */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e8eb] bg-white text-[#4e5968] hover:bg-[#f2f4f6] cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-lg font-bold text-[#191f28]">
                {year}년 {month + 1}월
              </h2>
              <button
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e8eb] bg-white text-[#4e5968] hover:bg-[#f2f4f6] cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-[#8b95a1]">날짜를 클릭하여 일정을 추가/수정하세요</p>
          </div>
          {renderCalendar()}
        </div>
      )}

      {/* 포스터 탭 */}
      {activeTab === 'poster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8b95a1]">
              총 {posters.length}개 / 활성화 {posters.filter((p) => p.isActive).length}개
            </p>
            <button
              onClick={handleOpenAddPoster}
              className="flex h-10 shrink-0 items-center gap-1 rounded-md bg-[#004A98] px-4 text-sm font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">포스터 추가하기</span>
              <span className="sm:hidden">추가</span>
            </button>
          </div>
          {renderPosters()}
        </div>
      )}

      {/* 일정 편집 모달 */}
      {isScheduleModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[480px] rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#191f28]">
                {selectedDate} 일정 편집
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-md p-1 text-[#8b95a1] hover:bg-[#f2f4f6] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {editingSchedules.map((schedule, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => handleScheduleInputChange(index, e.target.value)}
                    placeholder={`일정 ${index + 1}`}
                    className="flex-1 h-10 rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-sm text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
                  />
                  <button
                    onClick={() => handleRemoveScheduleInput(index)}
                    className="rounded-md p-2 text-[#8b95a1] hover:bg-[#fff0f1] hover:text-[#e93c3c] cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {editingSchedules.length < 4 && (
                <button
                  onClick={handleAddScheduleInput}
                  className="flex items-center gap-2 text-sm text-[#004A98] hover:underline cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  일정 추가 ({editingSchedules.length}/4)
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="h-10 px-4 rounded-md border border-[#e5e8eb] bg-white text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSaveSchedules}
                className="flex items-center gap-1 h-10 px-4 rounded-md bg-[#004A98] text-sm font-medium text-white hover:bg-[#003a7a] cursor-pointer"
              >
                <Save className="h-4 w-4" />
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 포스터 추가/수정 모달 */}
      {isPosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[480px] rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#191f28]">
                {editingPoster ? '포스터 수정' : '포스터 추가'}
              </h2>
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="rounded-md p-1 text-[#8b95a1] hover:bg-[#f2f4f6] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#4e5968] mb-2">
                  포스터 제목
                </label>
                <input
                  type="text"
                  value={posterTitle}
                  onChange={(e) => setPosterTitle(e.target.value)}
                  placeholder="포스터 제목을 입력하세요"
                  className="w-full h-10 rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-sm text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4e5968] mb-2">
                  이미지 URL (PNG)
                </label>
                <input
                  type="text"
                  value={posterImageUrl}
                  onChange={(e) => setPosterImageUrl(e.target.value)}
                  placeholder="https://example.com/poster.png"
                  className="w-full h-10 rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-sm text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
                />
                <p className="text-xs text-[#8b95a1] mt-1">
                  PNG 형식의 이미지 URL을 입력해주세요
                </p>
              </div>
              {posterImageUrl && (
                <div>
                  <label className="block text-sm font-medium text-[#4e5968] mb-2">
                    미리보기
                  </label>
                  <div className="aspect-[2/3] max-h-60 rounded-md border border-[#e5e8eb] bg-[#f9fbfc] overflow-hidden">
                    <img
                      src={posterImageUrl}
                      alt="미리보기"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/400x600/e5e8eb/8b95a1?text=이미지+로드+실패';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="h-10 px-4 rounded-md border border-[#e5e8eb] bg-white text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSavePoster}
                className="flex items-center gap-1 h-10 px-4 rounded-md bg-[#004A98] text-sm font-medium text-white hover:bg-[#003a7a] cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {editingPoster ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && posterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#191f28]">포스터 삭제</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-md p-1 text-[#8b95a1] hover:bg-[#f2f4f6] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-[#4e5968] mb-6">
              <span className="font-medium text-[#191f28]">"{posterToDelete.title}"</span>{' '}
              포스터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="h-10 px-4 rounded-md border border-[#e5e8eb] bg-white text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={confirmDeletePoster}
                className="flex items-center gap-1 h-10 px-4 rounded-md bg-[#e93c3c] text-sm font-medium text-white hover:bg-[#d63333] cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
