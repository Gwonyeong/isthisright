'use client';

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.history.back()}
      className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 px-6 py-3"
    >
      <ArrowLeft className="h-5 w-5 mr-2" />
      이전 페이지로
    </Button>
  );
}