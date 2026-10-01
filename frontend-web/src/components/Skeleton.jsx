import React from 'react';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[24px] border border-white/70 bg-[#FFFFFFCC] p-6 shadow-glass backdrop-blur-xl">
      <Skeleton className="h-4 w-24 rounded-full" />
      <Skeleton className="mt-3 h-8 w-16 rounded-lg" />
    </div>
  );
}

export function ReportCardSkeleton() {
  return (
    <div className="rounded-[24px] border border-white/70 bg-[#FFFFFFCC] p-5 shadow-glass backdrop-blur-xl">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4 rounded-full" />
          <Skeleton className="h-6 w-3/4 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function ReportDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/70 bg-[#FFFFFFCC] p-6 shadow-glass backdrop-blur-xl space-y-4">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
        <div className="space-y-2 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
