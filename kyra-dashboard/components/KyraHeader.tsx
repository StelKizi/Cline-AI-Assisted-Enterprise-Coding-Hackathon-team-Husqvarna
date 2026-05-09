import Link from "next/link";

type NavLink = { href: string; label: string };

type KyraHeaderProps = {
  title: string;
  subtitle?: string;
  navLinks?: NavLink[];
};

export function KyraHeader({ title, subtitle, navLinks }: KyraHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">K</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {navLinks && navLinks.length > 0 && (
        <nav className="flex items-center gap-4 text-sm">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="text-gray-600 hover:text-black">
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
