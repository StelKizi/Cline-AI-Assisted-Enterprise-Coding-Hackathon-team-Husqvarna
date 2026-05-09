import type { ReactNode } from "react";

type ErrorBoxProps = {
  message?: string;
  children?: ReactNode;
  className?: string;
};

export function ErrorBox({ message, children, className = "" }: ErrorBoxProps) {
  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 ${className}`}
    >
      {children ?? message}
    </div>
  );
}
