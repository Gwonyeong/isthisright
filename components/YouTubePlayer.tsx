interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  isShorts?: boolean;
}

export default function YouTubePlayer({
  videoId,
  title,
  isShorts = false,
}: YouTubePlayerProps) {
  return (
    <div className="w-full">
      {isShorts ? (
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm aspect-[9/16] rounded-lg overflow-hidden bg-gray-800">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title || "YouTube Shorts player"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      ) : (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title || "YouTube video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      )}

      <div className="flex items-center justify-center mt-2">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isShorts
              ? "bg-red-900/50 text-red-300 border border-red-700"
              : "bg-blue-900/50 text-blue-300 border border-blue-700"
          }`}
        >
          {isShorts ? "📱 YouTube Shorts" : "🎬 YouTube Video"}
        </span>
      </div>
    </div>
  );
}
