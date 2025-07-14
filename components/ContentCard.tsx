"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Smartphone,
  Video,
} from "lucide-react";
import { useState } from "react";

interface ContentCardProps {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  agreeCount: number;
  disagreeCount: number;
  commentCount: number;
  createdAt: string;
  isShorts?: boolean;
}

export default function ContentCard({
  id,
  title,
  description,
  thumbnailUrl,
  agreeCount,
  disagreeCount,
  commentCount,
  createdAt,
  isShorts = false,
}: ContentCardProps) {
  const [imageError, setImageError] = useState(false);
  const totalVotes = agreeCount + disagreeCount;
  const agreePercentage =
    totalVotes > 0 ? Math.round((agreeCount / totalVotes) * 100) : 0;
  const disagreePercentage =
    totalVotes > 0 ? Math.round((disagreeCount / totalVotes) * 100) : 0;

  return (
    <Link href={`/contents/${id}`}>
      <Card className="group h-full overflow-hidden border-gray-700 bg-gray-800 transition-all duration-200 hover:border-gray-600 hover:shadow-lg hover:shadow-black/50">
        <div className="relative aspect-video overflow-hidden bg-gray-700">
          {!imageError ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Video className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">썸네일을 불러올 수 없습니다</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className={`text-xs font-medium ${
                isShorts
                  ? "bg-red-900/80 text-red-200 border border-red-600"
                  : "bg-blue-900/80 text-blue-200 border border-blue-600"
              }`}
            >
              {isShorts ? (
                <>
                  <Smartphone className="h-3 w-3 mr-1" />
                  쇼츠
                </>
              ) : (
                <>
                  <Video className="h-3 w-3 mr-1" />
                  영상
                </>
              )}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-white line-clamp-2 group-hover:text-gray-200 transition-colors">
            {title}
          </h3>
          <p className="mb-3 text-sm text-gray-300 line-clamp-2">
            {description}
          </p>

          {/* 투표 결과 */}
          {totalVotes > 0 && (
            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>찬성 vs 반대</span>
                <span>{totalVotes}표</span>
              </div>
              <div className="flex rounded-full overflow-hidden bg-gray-700 h-2">
                <div
                  className="bg-blue-500 transition-all duration-300"
                  style={{ width: `${agreePercentage}%` }}
                />
                <div
                  className="bg-red-500 transition-all duration-300"
                  style={{ width: `${disagreePercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-blue-400">
                  <ThumbsUp className="h-3 w-3" />
                  <span>{agreePercentage}%</span>
                </div>
                <div className="flex items-center space-x-1 text-red-400">
                  <ThumbsDown className="h-3 w-3" />
                  <span>{disagreePercentage}%</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          <div className="flex w-full items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>{commentCount}개</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </div>
            {totalVotes === 0 && (
              <Badge
                variant="secondary"
                className="text-xs bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                투표 없음
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
