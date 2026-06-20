import { describe, expect, it } from "vitest";
import {
  createUnavailableImageText,
  getUnavailableImageFilename,
} from "@/application/services/chat/unavailable-image";

describe("깨진 이미지 안내 텍스트", () => {
  it("파일명을 포함한 이미지 복원 실패 안내를 만든다", () => {
    expect(createUnavailableImageText("image.png")).toBe(
      "[이미지를 불러올 수 없습니다: image.png]",
    );
  });

  it("파일명이 없으면 첨부 파일 기본 이름을 사용한다", () => {
    expect(createUnavailableImageText()).toBe("[이미지를 불러올 수 없습니다: 첨부 파일]");
  });

  it("이미지 복원 실패 안내에서 파일명을 읽는다", () => {
    expect(getUnavailableImageFilename("[이미지를 불러올 수 없습니다: image.png]")).toBe(
      "image.png",
    );
    expect(getUnavailableImageFilename("일반 텍스트")).toBeNull();
  });
});
