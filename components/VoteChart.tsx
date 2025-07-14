import { ThumbsUp, ThumbsDown } from "lucide-react";

interface VoteChartProps {
  agreeCount: number;
  disagreeCount: number;
}

export default function VoteChart({
  agreeCount,
  disagreeCount,
}: VoteChartProps) {
  const totalVotes = agreeCount + disagreeCount;
  const agreePercentage =
    totalVotes > 0 ? Math.round((agreeCount / totalVotes) * 100) : 0;
  const disagreePercentage =
    totalVotes > 0 ? Math.round((disagreeCount / totalVotes) * 100) : 0;

  if (totalVotes === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <div className="text-gray-400 text-lg mb-2">아직 투표가 없습니다</div>
        <div className="text-gray-500 text-sm">
          첫 번째 투표의 주인공이 되어보세요!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          실시간 투표 결과
        </h3>
        <div className="text-gray-300">
          총 <span className="text-white font-semibold">{totalVotes}</span>명이
          참여했습니다
        </div>
      </div>

      {/* 진행바 차트 */}
      <div className="mb-8">
        <div className="flex rounded-full overflow-hidden bg-gray-700 h-4 mb-4">
          <div
            className="bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${agreePercentage}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-500 ease-out"
            style={{ width: `${disagreePercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-blue-400">
              <ThumbsUp className="h-4 w-4" />
              <span className="font-semibold">찬성</span>
            </div>
            <div className="text-white text-lg font-bold">
              {agreePercentage}%
            </div>
            <div className="text-gray-400">({agreeCount}표)</div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-gray-400">({disagreeCount}표)</div>
            <div className="text-white text-lg font-bold">
              {disagreePercentage}%
            </div>
            <div className="flex items-center space-x-1 text-red-400">
              <span className="font-semibold">반대</span>
              <ThumbsDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 도넛 차트 (CSS로 구현) */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            {/* 배경 원 */}
            <path
              className="text-gray-700"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />

            {/* 찬성 원호 */}
            <path
              className="text-blue-500"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={`${agreePercentage}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />

            {/* 반대 원호 */}
            <path
              className="text-red-500"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={`${disagreePercentage}, 100`}
              strokeDashoffset={`-${agreePercentage}`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>

          {/* 가운데 텍스트 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white text-sm font-semibold">
                {agreePercentage > disagreePercentage
                  ? "찬성"
                  : disagreePercentage > agreePercentage
                  ? "반대"
                  : "동률"}
              </div>
              <div className="text-gray-400 text-xs">우세</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
