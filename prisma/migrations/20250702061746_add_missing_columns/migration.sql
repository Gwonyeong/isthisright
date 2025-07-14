/*
  Warnings:

  - A unique constraint covering the columns `[comment_id,ip_address]` on the table `likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[content_id,ip_address]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ip_address` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_vote` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip_address` to the `replies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_vote` to the `replies` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('ACTIVE', 'FLAGGED', 'DELETED');

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "ip_address" TEXT NOT NULL,
ADD COLUMN     "status" "CommentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "user_vote" "VoteType" NOT NULL;

-- AlterTable
ALTER TABLE "contents" ADD COLUMN     "is_shorts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "thumbnail_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "replies" ADD COLUMN     "ip_address" TEXT NOT NULL,
ADD COLUMN     "status" "CommentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "user_vote" "VoteType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "likes_comment_id_ip_address_key" ON "likes"("comment_id", "ip_address");

-- CreateIndex
CREATE UNIQUE INDEX "votes_content_id_ip_address_key" ON "votes"("content_id", "ip_address");
