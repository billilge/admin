'use client';

import { useQueryClient } from '@tanstack/react-query';
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
  Upload,
} from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAllPosters,
  useAddPoster,
  useUpdatePoster,
  useDeletePoster,
  useActivatePoster,
  useDeactivatePoster,
  useGetSchedules,
  useAddSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  getGetAllPostersQueryKey,
  getGetSchedulesQueryKey,
} from '@/api-client';
import type { DisplayCalendarScheduleDetail, DisplayPosterDetail } from '@/api-client/model';

type TabType = 'calendar' | 'poster';

export default function DisplayPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // 일정 모달 상태
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSchedules, setEditingSchedules] = useState<string[]>([]);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);

  // 포스터 모달 상태
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<DisplayPosterDetail | null>(null);
  const [posterTitle, setPosterTitle] = useState('');
  const [posterImageFile, setPosterImageFile] = useState<File | null>(null);
  const [posterImagePreview, setPosterImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 삭제 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [posterToDelete, setPosterToDelete] = useState<DisplayPosterDetail | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // --- API 쿼리 ---

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

  const { data: schedulesData } = useGetSchedules(
    { startDate, endDate },
    { query: { staleTime: 1000 * 60 * 3 } },
  );

  const { data: postersData } = useGetAllPosters({
    query: { staleTime: 1000 * 60 * 3 },
  });

  const schedules = schedulesData?.schedules ?? [];
  const posters = postersData?.posters ?? [];

  // --- Mutations ---

  const addScheduleMutation = useAddSchedule({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSchedulesQueryKey({ startDate, endDate }) });
        toast.success('일정이 추가되었습니다.');
        setIsScheduleModalOpen(false);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || '일정 추가에 실패했습니다.');
      },
    },
  });

  const updateScheduleMutation = useUpdateSchedule({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSchedulesQueryKey({ startDate, endDate }) });
        toast.success('일정이 수정되었습니다.');
        setIsScheduleModalOpen(false);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || '일정 수정에 실패했습니다.');
      },
    },
  });

  const deleteScheduleMutation = useDeleteSchedule({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSchedulesQueryKey({ startDate, endDate }) });
        toast.success('일정이 삭제되었습니다.');
        setIsScheduleModalOpen(false);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || '일정 삭제에 실패했습니다.');
      },
    },
  });

  const addPosterMutation = useAddPoster({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAllPostersQueryKey() });
        toast.success('포스터가 추가되었습니다.');
        setIsPosterModalOpen(false);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || '포스터 추가에 실패했습니다.');
      },
    },
  });

  const updatePosterMutation = useUpdatePoster({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAllPostersQueryKey() });
        toast.success('포스터가 수정되었습니다.');
        setIsPosterModalOpen(false);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || '포스터 수정에 실패했습니다.');
      },
    },
  });

  const deletePosterMutation = useDeletePoster({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAllPostersQueryKey() });
        toast.success('포스터가 삭제되었습니다.');
        setIsDeleteModalOpen(false);
        setPosterToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || '포스터 삭제에 실패했습니다.');
      },
    },
  });

  const activatePosterMutation = useActivatePoster({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAllPostersQueryKey() });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || '포스터 상태 변경에 실패했습니다.');
      },
    },
  });

  const deactivatePosterMutation = useDeactivatePoster({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAllPostersQueryKey() });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || '포스터 상태 변경에 실패했습니다.');
      },
    },
  });

  // --- 캘린더 핸들러 ---

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const formatDateString = (y: number, m: number, day: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getScheduleForDate = (dateString: string): DisplayCalendarScheduleDetail | undefined => {
    return schedules.find((s) => s.date === dateString);
  };

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (dateString: string) => {
    const existing = getScheduleForDate(dateString);
    setSelectedDate(dateString);
    setEditingSchedules(existing?.schedules ?? []);
    setEditingScheduleId(existing?.scheduleId ?? null);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedules = () => {
    if (!selectedDate) return;

    const filteredSchedules = editingSchedules.filter((s) => s.trim() !== '');

    if (editingScheduleId) {
      // 기존 일정이 있는 경우
      if (filteredSchedules.length === 0) {
        deleteScheduleMutation.mutate({ id: editingScheduleId });
      } else {
        updateScheduleMutation.mutate({
          id: editingScheduleId,
          data: { date: selectedDate, schedules: filteredSchedules },
        });
      }
    } else {
      // 새 일정
      if (filteredSchedules.length === 0) {
        setIsScheduleModalOpen(false);
        return;
      }
      addScheduleMutation.mutate({
        data: { date: selectedDate, schedules: filteredSchedules },
      });
    }
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

  // --- 포스터 핸들러 ---

  const handleOpenAddPoster = () => {
    setEditingPoster(null);
    setPosterTitle('');
    setPosterImageFile(null);
    setPosterImagePreview(null);
    setIsPosterModalOpen(true);
  };

  const handleOpenEditPoster = (poster: DisplayPosterDetail) => {
    setEditingPoster(poster);
    setPosterTitle(poster.title);
    setPosterImageFile(null);
    setPosterImagePreview(poster.imageUrl);
    setIsPosterModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterImageFile(file);
    setPosterImagePreview(URL.createObjectURL(file));
  };

  const handleSavePoster = () => {
    if (!posterTitle.trim()) {
      toast.error('포스터 제목을 입력해주세요.');
      return;
    }

    if (editingPoster) {
      // 수정
      updatePosterMutation.mutate({
        posterId: editingPoster.posterId,
        data: {
          ...(posterImageFile ? { image: posterImageFile } : {}),
          posterRequest: { title: posterTitle },
        },
      });
    } else {
      // 추가
      if (!posterImageFile) {
        toast.error('포스터 이미지를 선택해주세요.');
        return;
      }
      addPosterMutation.mutate({
        data: {
          image: posterImageFile,
          posterRequest: { title: posterTitle },
        },
      });
    }
  };

  const handleDeletePoster = (poster: DisplayPosterDetail) => {
    setPosterToDelete(poster);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePoster = () => {
    if (posterToDelete) {
      deletePosterMutation.mutate({ posterId: posterToDelete.posterId });
    }
  };

  const togglePosterActive = (poster: DisplayPosterDetail) => {
    if (poster.isActive) {
      deactivatePosterMutation.mutate({ posterId: poster.posterId });
    } else {
      activatePosterMutation.mutate({ posterId: poster.posterId });
    }
  };

  // --- 렌더링 ---

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-[var(--background)]" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateString(year, month, day);
      const schedule = getScheduleForDate(dateString);
      const daySchedules = schedule?.schedules ?? [];
      const isToday =
        new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(dateString)}
          className={`h-28 border-t border-[var(--border)] p-2 cursor-pointer hover:bg-[var(--background-hover)] transition-colors ${
            isToday ? 'bg-[var(--info-bg)]' : 'bg-[var(--card)]'
          }`}
        >
          <div
            className={`text-sm font-medium mb-1 ${
              isToday ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {daySchedules.slice(0, 3).map((s, idx) => (
              <div
                key={idx}
                className="text-xs px-1.5 py-0.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded truncate"
              >
                {s}
              </div>
            ))}
            {daySchedules.length > 3 && (
              <div className="text-xs text-[var(--foreground-subtle)]">+{daySchedules.length - 3}개 더</div>
            )}
          </div>
        </div>,
      );
    }

    return (
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="grid grid-cols-7">
          {weekdays.map((day, idx) => (
            <div
              key={day}
              className={`py-3 text-center text-sm font-medium ${
                idx === 0 ? 'text-[var(--error)]' : idx === 6 ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)]'
              } bg-[var(--background)] border-b border-[var(--border)]`}
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const renderPosters = () => {
    if (posters.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] py-16">
          <Image className="mb-3 h-10 w-10 text-[var(--foreground-subtle)]" />
          <p className="text-sm text-[var(--foreground-subtle)]">등록된 포스터가 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {posters.map((poster) => (
          <div
            key={poster.posterId}
            className={`rounded-lg border ${
              poster.isActive ? 'border-[var(--primary)]' : 'border-[var(--border)]'
            } bg-[var(--card)] shadow-sm overflow-hidden`}
          >
            <div className="relative aspect-[2/3] bg-[var(--background)]">
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
              <h3 className="font-medium text-[var(--foreground)] truncate">{poster.title}</h3>
              <p className="text-xs text-[var(--foreground-subtle)] mt-1">
                {poster.createdAt.split('T')[0]}
              </p>
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => togglePosterActive(poster)}
                  className="flex items-center gap-2 cursor-pointer"
                  type="button"
                >
                  <div
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      poster.isActive ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        poster.isActive ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    poster.isActive ? 'text-[var(--success)]' : 'text-[var(--foreground-subtle)]'
                  }`}>
                    {poster.isActive ? '활성화' : '비활성화'}
                  </span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditPoster(poster)}
                    className="rounded-md p-1.5 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground-muted)] cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePoster(poster)}
                    className="rounded-md p-1.5 text-[var(--foreground-subtle)] hover:bg-[var(--error-bg)] hover:text-[var(--error)] cursor-pointer"
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

  const isSaving = addScheduleMutation.isPending || updateScheduleMutation.isPending || deleteScheduleMutation.isPending;
  const isPosterSaving = addPosterMutation.isPending || updatePosterMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">디스플레이 관리</h1>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)]'
          }`}
        >
          <Calendar className="h-4 w-4" />
          학사 캘린더
        </button>
        <button
          onClick={() => setActiveTab('poster')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'poster'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)]'
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
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {year}년 {month + 1}월
              </h2>
              <button
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--foreground-subtle)]">날짜를 클릭하여 일정을 추가/수정하세요</p>
          </div>
          {renderCalendar()}
        </div>
      )}

      {/* 포스터 탭 */}
      {activeTab === 'poster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--foreground-subtle)]">
              총 {posters.length}개 / 활성화 {posters.filter((p) => p.isActive).length}개
            </p>
            <button
              onClick={handleOpenAddPoster}
              className="flex h-10 shrink-0 items-center gap-1 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 cursor-pointer"
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
          <div className="w-[480px] rounded-xl bg-[var(--popover)] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {selectedDate} 일정 편집
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-md p-1 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] cursor-pointer"
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
                    className="flex-1 h-10 rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <button
                    onClick={() => handleRemoveScheduleInput(index)}
                    className="rounded-md p-2 text-[var(--foreground-subtle)] hover:bg-[var(--error-bg)] hover:text-[var(--error)] cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {editingSchedules.length < 4 && (
                <button
                  onClick={handleAddScheduleInput}
                  className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  일정 추가 ({editingSchedules.length}/4)
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="h-10 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSaveSchedules}
                disabled={isSaving}
                className="flex items-center gap-1 h-10 px-4 rounded-lg bg-[var(--primary)] text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 포스터 추가/수정 모달 */}
      {isPosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[480px] rounded-xl bg-[var(--popover)] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {editingPoster ? '포스터 수정' : '포스터 추가'}
              </h2>
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="rounded-md p-1 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                  포스터 제목
                </label>
                <input
                  type="text"
                  value={posterTitle}
                  onChange={(e) => setPosterTitle(e.target.value)}
                  placeholder="포스터 제목을 입력하세요"
                  className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                  포스터 이미지
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  {posterImageFile ? posterImageFile.name : '이미지 파일 선택'}
                </button>
                {editingPoster && !posterImageFile && (
                  <p className="text-xs text-[var(--foreground-subtle)] mt-1">
                    변경하지 않으면 기존 이미지가 유지됩니다.
                  </p>
                )}
              </div>
              {posterImagePreview && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                    미리보기
                  </label>
                  <div className="aspect-[2/3] max-h-60 rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden">
                    <img
                      src={posterImagePreview}
                      alt="미리보기"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="h-10 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSavePoster}
                disabled={isPosterSaving}
                className="flex items-center gap-1 h-10 px-4 rounded-lg bg-[var(--primary)] text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {isPosterSaving ? '저장 중...' : editingPoster ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && posterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] rounded-xl bg-[var(--popover)] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--foreground)]">포스터 삭제</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-md p-1 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-[var(--foreground-muted)] mb-6">
              <span className="font-medium text-[var(--foreground)]">"{posterToDelete.title}"</span>{' '}
              포스터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="h-10 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={confirmDeletePoster}
                disabled={deletePosterMutation.isPending}
                className="flex items-center gap-1 h-10 px-4 rounded-lg bg-[var(--error)] text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                {deletePosterMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
