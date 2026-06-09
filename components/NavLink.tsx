"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

export function NavLink({ href, label, match = "prefix" }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    match === "exact"
      ? pathname === href
      : href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "group relative px-3 py-2 text-sm transition-colors",
        isActive ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          "absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 ease-out",
          isActive ? "w-full" : "w-0 group-hover:w-full"
        )}
      />
    </Link>
  );
}
