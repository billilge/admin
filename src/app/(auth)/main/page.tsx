'use client';
import {
  Package,
  Users,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  PieChart,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // Sample data
  const stats = [
    {
      title: '총 물품 수',
      value: '42',
      icon: Package,
      color: 'bg-[#e6eef5]',
      iconColor: 'text-[#004A98]',
      link: '/item',
    },
    {
      title: '총 관리자 수',
      value: '10',
      icon: Users,
      color: 'bg-[#e7f4ec]',
      iconColor: 'text-[#1b8b5a]',
      link: '/admin',
    },
    {
      title: '오늘 대여',
      value: '8',
      icon: Calendar,
      color: 'bg-[#f2f4f6]',
      iconColor: 'text-[#4e5968]',
      link: '/rental',
    },
    {
      title: '연체 중',
      value: '3',
      icon: AlertTriangle,
      color: 'bg-[#fff0f1]',
      iconColor: 'text-[#e93c3c]',
      link: '/rental',
    },
  ];

  const recentRentals = [
    {
      id: 1,
      studentName: '김민수',
      studentId: '20223456',
      itemName: '노트북',
      rentalDate: '2025-04-06',
      returnDate: '2025-04-13',
      status: '대여중',
    },
    {
      id: 2,
      studentName: '이지은',
      studentId: '20223457',
      itemName: '빔프로젝터',
      rentalDate: '2025-04-06',
      returnDate: '2025-04-13',
      status: '대여중',
    },
    {
      id: 3,
      studentName: '박준호',
      studentId: '20223458',
      itemName: '카메라',
      rentalDate: '2025-04-05',
      returnDate: '2025-04-12',
      status: '대여중',
    },
    {
      id: 4,
      studentName: '최유진',
      studentId: '20223459',
      itemName: '스피커',
      rentalDate: '2025-04-05',
      returnDate: '2025-04-12',
      status: '대여중',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '대여중':
        return 'bg-[#e6eef5] text-[#004A98]';
      case '연체':
        return 'bg-[#fff0f1] text-[#e93c3c]';
      case '반납완료':
        return 'bg-[#e7f4ec] text-[#1b8b5a]';
      default:
        return 'bg-[#f2f4f6] text-[#4e5968]';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#191f28]">대시보드</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link
            key={index}
            href={stat.link}
            className="flex items-center justify-between rounded-md border border-[#e5e8eb] bg-white p-6 shadow-sm transition-all hover:border-[#004A98] hover:shadow-md"
          >
            <div className="space-y-1">
              <p className="text-sm text-[#6b7684]">{stat.title}</p>
              <p className="text-2xl font-bold text-[#191f28]">{stat.value}</p>
            </div>
            <div className={`rounded-full p-3 ${stat.color}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-[#e5e8eb] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e5e8eb] px-6 py-4">
            <h2 className="font-medium text-[#191f28]">최근 대여 현황</h2>
            <Link
              href="/desktop/rental"
              className="flex items-center gap-1 text-sm font-medium text-[#004A98] hover:underline"
            >
              <span>전체보기</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#e5e8eb] bg-[#f9fbfc]">
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-[#4e5968]">
                    학생명
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-[#4e5968]">
                    물품명
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-[#4e5968]">
                    대여일
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-[#4e5968]">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRentals.map((rental) => (
                  <tr
                    key={rental.id}
                    className="border-b border-[#e5e8eb] last:border-b-0 hover:bg-[#f9fbfc]"
                  >
                    <td className="whitespace-nowrap px-6 py-3 text-xs text-[#191f28]">
                      {rental.studentName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-xs text-[#191f28]">
                      {rental.itemName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-xs text-[#6b7684]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{rental.rentalDate}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-xs">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(rental.status)}`}
                      >
                        {rental.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="overflow-hidden rounded-md border border-[#e5e8eb] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium text-[#191f28]">카테고리별 물품</h2>
              <PieChart className="h-4 w-4 text-[#8b95a1]" />
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4e5968]">전자기기</span>
                  <span className="text-sm font-medium text-[#191f28]">24</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#f2f4f6]">
                  <div className="h-full w-[60%] rounded-full bg-[#004A98]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4e5968]">가구</span>
                  <span className="text-sm font-medium text-[#191f28]">10</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#f2f4f6]">
                  <div className="h-full w-[25%] rounded-full bg-[#1b8b5a]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4e5968]">기타</span>
                  <span className="text-sm font-medium text-[#191f28]">8</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#f2f4f6]">
                  <div className="h-full w-[15%] rounded-full bg-[#8b95a1]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-[#e5e8eb] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium text-[#191f28]">대여 현황</h2>
              <BarChart3 className="h-4 w-4 text-[#8b95a1]" />
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4e5968]">대여 가능</span>
                  <span className="text-sm font-medium text-[#191f28]">28</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#f2f4f6]">
                  <div className="h-full w-[70%] rounded-full bg-[#1b8b5a]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4e5968]">대여 중</span>
                  <span className="text-sm font-medium text-[#191f28]">11</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#f2f4f6]">
                  <div className="h-full w-[25%] rounded-full bg-[#004A98]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4e5968]">연체</span>
                  <span className="text-sm font-medium text-[#191f28]">3</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#f2f4f6]">
                  <div className="h-full w-[5%] rounded-full bg-[#e93c3c]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
