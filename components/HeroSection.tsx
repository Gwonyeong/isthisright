export default function HeroSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container max-w-screen-2xl px-4">
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            이게 맞아?
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl">
            영상 속 그 장면, 당신의 생각은?
          </p>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed">
            넷플릭스, 영화, 드라마 등 영상 콘텐츠의 특정 장면에 대해
            <br className="hidden md:block" />
            다양한 의견을 나누고 토론해보세요
          </p>
        </div>
      </div>
    </section>
  );
}
