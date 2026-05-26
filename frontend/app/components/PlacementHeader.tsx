"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Map, 
  ClipboardCheck, 
  Trophy, 
  UserPlus,
  ChevronRight
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/drives", icon: Home },
  { label: "Portal Navigation", href: "/drives/navigation", icon: Map },
  { label: "Placement Drives", href: "/drives/list", icon: ClipboardCheck },
  { label: "My Rank", href: "/drives/rank", icon: Trophy },
  { label: "Placement Process-2 Registration", href: "/drives/process-2", icon: UserPlus },
];

export default function PlacementHeader() {
  const pathname = usePathname();

  return (
    <div className="w-full bg-white dark:bg-black border-b border-gray-200 dark:border-neutral-900 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center overflow-x-auto no-scrollbar py-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <React.Fragment key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-all relative group ${
                    isActive 
                      ? "text-black dark:text-white dark:text-gray-500" 
                      : "text-neutral-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-gray-1000" : "text-neutral-400"}`} />
                  {item.label}
                  
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-1000 rounded-t-full shadow-[0_-4px_10px_rgba(79,70,229,0.3)]" />
                  )}
                </Link>
                
                {index < navItems.length - 1 && (
                  <div className="h-6 w-px bg-gray-200 dark:bg-neutral-900 shrink-0 mx-2" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Subtle Breadcrumb/Status Bar below */}
      <div className="bg-neutral-50 dark:bg-black/80 backdrop-blur-xl/50 border-t border-gray-100 dark:border-neutral-900/50 px-4 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <span>Placement Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-1000">{navItems.find(i => i.href === pathname)?.label || "Overview"}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white dark:text-gray-500">System Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
