"use client";

type ChatThreadErrorProps = {
  message?: string;
};

export function ChatThreadError(props: ChatThreadErrorProps) {
  const { message } = props;

  return (
    <div className="openui-shell-thread-error">
      <div
        className="flex flex-col gap-1.5 rounded-lg border border-[#b42318]/25 bg-[#fef3f2] px-3.5 py-3 text-[#7a271a]"
        role="alert"
      >
        <p className="m-0 font-semibold">응답을 생성하지 못했습니다.</p>
        <p className="m-0 text-sm leading-normal text-[#912018]">
          {message || "잠시 후 다시 시도해 주세요."}
        </p>
      </div>
    </div>
  );
}
