import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="container max-w-screen-2xl py-8">
        <Separator className="mb-8 bg-gray-800" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-gray-300 md:text-left">
              영상 속 그 장면, 당신의 생각은?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-400">
              © 2024 이게 맞아?. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
