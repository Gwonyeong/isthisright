import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 시드 데이터 생성 시작...");

  // 예시 콘텐츠 데이터
  const contents = [
    {
      title: "오징어 게임 - 구슬치기 게임에서 상우가 한 선택이 맞았을까?",
      description:
        "친구를 속이고 살아남은 상우의 선택. 극한 상황에서 친구를 배신하는 것이 정당화될 수 있을까요?",
      youtube_url: "https://www.youtube.com/watch?v=oqxAJKy0ii4",
      youtube_video_id: "oqxAJKy0ii4",
      thumbnail_url: "https://img.youtube.com/vi/oqxAJKy0ii4/hqdefault.jpg",
      is_shorts: false,
      status: "PUBLISHED" as const,
    },
    {
      title: "킹덤 - 왕자가 좀비를 풀어놓은 결정, 옳았나?",
      description:
        "백성을 구하기 위해 좀비를 이용한 왕자의 선택. 목적이 수단을 정당화할 수 있을까요?",
      youtube_url: "https://www.youtube.com/watch?v=4l-yByZpaaM",
      youtube_video_id: "4l-yByZpaaM",
      thumbnail_url: "https://img.youtube.com/vi/4l-yByZpaaM/hqdefault.jpg",
      is_shorts: false,
      status: "PUBLISHED" as const,
    },
    {
      title: "기생충 - 기택이 가족의 행동이 정당했을까?",
      description:
        "반지하에서 살던 기택이 가족이 박사장 가족을 속인 행위. 계급 갈등 속에서 생존을 위한 선택이었을까?",
      youtube_url: "https://www.youtube.com/shorts/jNQXAC9IVRw",
      youtube_video_id: "jNQXAC9IVRw",
      thumbnail_url: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg",
      is_shorts: true,
      status: "PUBLISHED" as const,
    },
    {
      title: "더 글로리 - 문동은의 복수 계획, 너무 과했나?",
      description:
        "평생을 복수에 바친 문동은. 가해자들에게 가한 보복이 정당방위였을까, 아니면 과잉 복수였을까?",
      youtube_url: "https://www.youtube.com/watch?v=ZBcmBaBouh4",
      youtube_video_id: "ZBcmBaBouh4",
      thumbnail_url: "https://img.youtube.com/vi/ZBcmBaBouh4/hqdefault.jpg",
      is_shorts: false,
      status: "PUBLISHED" as const,
    },
    {
      title: "펜트하우스 - 심수련의 선택들이 옳았을까?",
      description:
        "딸을 위해 모든 것을 버린 심수련. 모성애라는 명목 하에 저질러진 일들이 정당했을까요?",
      youtube_url: "https://www.youtube.com/watch?v=FVZqGQYhDcs",
      youtube_video_id: "FVZqGQYhDcs",
      thumbnail_url: "https://img.youtube.com/vi/FVZqGQYhDcs/hqdefault.jpg",
      is_shorts: false,
      status: "PUBLISHED" as const,
    },
    {
      title: "스위트홈 - 주인공들의 생존 선택이 맞았을까?",
      description:
        "몬스터 아포칼립스 상황에서 개인의 이익을 위해 다른 생존자들을 버린 선택들. 극한 상황에서는 모든 것이 용서될까?",
      youtube_url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      youtube_video_id: "dQw4w9WgXcQ",
      thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      is_shorts: true,
      status: "PUBLISHED" as const,
    },
  ];

  // 콘텐츠 생성
  for (const content of contents) {
    const createdContent = await prisma.contents.create({
      data: content,
    });
    console.log(`✅ 콘텐츠 생성: ${createdContent.title}`);

    // 각 콘텐츠에 랜덤 투표 생성
    const voteCount = Math.floor(Math.random() * 100) + 50; // 50-150개 투표
    const agreeRatio = Math.random() * 0.6 + 0.2; // 20-80% 찬성 비율

    const votes = [];
    for (let i = 0; i < voteCount; i++) {
      votes.push({
        content_id: createdContent.id,
        vote_type: (Math.random() < agreeRatio ? "AGREE" : "DISAGREE") as
          | "AGREE"
          | "DISAGREE",
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}.${Math.floor(
          Math.random() * 255
        )}`,
      });
    }

    await prisma.votes.createMany({
      data: votes,
    });

    console.log(
      `  📊 투표 ${voteCount}개 생성 (찬성: ${Math.floor(
        voteCount * agreeRatio
      )}개)`
    );

    // 각 콘텐츠에 랜덤 댓글 생성
    const commentCount = Math.floor(Math.random() * 20) + 5; // 5-25개 댓글
    const authorNames = [
      "김철수",
      "이영희",
      "박민수",
      "최지연",
      "정대한",
      "송미영",
      "윤석진",
      "한수정",
      "장민호",
      "오세진",
      "임다영",
      "조현우",
      "신예은",
      "홍길동",
      "이순신",
      "유재석",
    ];

    for (let i = 0; i < commentCount; i++) {
      const userVote = (Math.random() < 0.5 ? "AGREE" : "DISAGREE") as
        | "AGREE"
        | "DISAGREE";
      const author =
        authorNames[Math.floor(Math.random() * authorNames.length)];
      const commentTexts = [
        "정말 복잡한 문제인 것 같아요. 쉽게 판단하기 어려워요.",
        "이 상황에서는 당연한 선택이었다고 생각해요.",
        "아무리 그래도 이건 너무 심한 것 같아요.",
        "현실적으로 생각해보면 다른 선택지가 있었을까요?",
        "감정적으로는 이해하지만 논리적으로는 동의하기 어려워요.",
        "극한 상황에서는 평소 도덕관으로 판단하기 어려워요.",
        "결과적으로 더 큰 피해를 막았다고 볼 수 있어요.",
        "개인적으로는 다른 방법을 택했을 것 같아요.",
        "이런 딜레마 상황이 정말 흥미로워요.",
        "캐릭터의 배경을 생각하면 충분히 이해할 수 있어요.",
      ];

      const comment = await prisma.comments.create({
        data: {
          content_id: createdContent.id,
          author_name: author,
          content:
            commentTexts[Math.floor(Math.random() * commentTexts.length)],
          user_vote: userVote,
          ip_address: `192.168.1.${Math.floor(
            Math.random() * 255
          )}.${Math.floor(Math.random() * 255)}`,
        },
      });

      // 랜덤 추천 생성
      const likesCount = Math.floor(Math.random() * 10);
      for (let j = 0; j < likesCount; j++) {
        await prisma.likes.create({
          data: {
            comment_id: comment.id,
            ip_address: `192.168.1.${Math.floor(
              Math.random() * 255
            )}.${Math.floor(Math.random() * 255)}`,
          },
        });
      }

      // 일부 댓글에 대댓글 생성
      if (Math.random() < 0.3) {
        // 30% 확률로 대댓글
        const replyAuthor =
          authorNames[Math.floor(Math.random() * authorNames.length)];
        const replyTexts = [
          "저도 비슷한 생각이에요!",
          "좋은 지적이네요.",
          "다른 관점에서 보면 어떨까요?",
          "동감합니다.",
          "흥미로운 의견이네요.",
        ];

        await prisma.replies.create({
          data: {
            comment_id: comment.id,
            author_name: replyAuthor,
            content: replyTexts[Math.floor(Math.random() * replyTexts.length)],
            user_vote: (Math.random() < 0.5 ? "AGREE" : "DISAGREE") as
              | "AGREE"
              | "DISAGREE",
            ip_address: `192.168.1.${Math.floor(
              Math.random() * 255
            )}.${Math.floor(Math.random() * 255)}`,
          },
        });
      }
    }

    console.log(`  💬 댓글 ${commentCount}개 생성`);

    // 랜덤 조회수 생성
    const views = Math.floor(Math.random() * 10000) + 1000;
    await prisma.contents.update({
      where: { id: createdContent.id },
      data: { views },
    });

    console.log(`  👁️ 조회수 ${views}회 설정\n`);
  }

  console.log("🎉 시드 데이터 생성 완료!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
