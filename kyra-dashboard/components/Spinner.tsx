type SpinnerProps = { size?: "sm" | "md" };

export function Spinner({ size = "md" }: SpinnerProps) {
  const dim = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <span className={`${dim} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
  );
}
