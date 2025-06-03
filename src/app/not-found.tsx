export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4 py-16">
      <h1 className="text-4xl font-bold text-[#004A98] mb-4">페이지를 찾을 수 없습니다</h1>
      <p className="text-[#4e5968] mb-8">
        요청하신 페이지가 존재하지 않거나, 이동되었을 수 있어요.
      </p>
      <a
        href="/"
        className="inline-block rounded bg-[#004A98] px-6 py-2 text-white font-medium hover:bg-[#003674]"
      >
        메인으로 돌아가기
      </a>
    </div>
  );
}
