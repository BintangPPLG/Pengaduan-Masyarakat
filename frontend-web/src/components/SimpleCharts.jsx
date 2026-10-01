const COLORS = ['#6FCF97', '#F2994A', '#EB5757', '#60A5FA', '#A78BFA', '#34D399'];
const STATUS_COLORS = { approved: '#6FCF97', rejected: '#EB5757', pending: '#F2994A' };

export function BarChartSimple({ data, labelKey = 'name', valueKey = 'count', color = '#6FCF97' }) {
  if (!data?.length) {
    return <p className="py-8 text-center text-sm text-slate-400">Belum ada data</p>;
  }
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="space-y-2">
      {data.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const pct = Math.round((val / max) * 100);
        const label = String(item[labelKey] ?? '');
        return (
          <div key={i}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="truncate font-medium text-slate-600 max-w-[60%]">{label}</span>
              <span className="font-bold text-slate-800">{val}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] || color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StatusChart({ data }) {
  if (!data?.length) {
    return <p className="py-8 text-center text-sm text-slate-400">Belum ada data</p>;
  }
  const total = data.reduce((s, d) => s + (Number(d.count) || 0), 0) || 1;

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const val = Number(item.count) || 0;
        const pct = Math.round((val / total) * 100);
        const color = STATUS_COLORS[item.name] || COLORS[i % COLORS.length];
        return (
          <div key={item.name}>
            <div className="mb-1 flex justify-between text-xs capitalize">
              <span className="font-semibold text-slate-600">{item.name}</span>
              <span className="font-bold text-slate-800">{val} ({pct}%)</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TrendChart({ data, dateKey = 'date', valueKey = 'count' }) {
  if (!data?.length) {
    return <p className="py-8 text-center text-sm text-slate-400">Belum ada data</p>;
  }
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const h = Math.max((val / max) * 100, val > 0 ? 8 : 2);
        const label = String(item[dateKey] ?? '').slice(5, 10);
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[9px] font-bold text-slate-500">{val || ''}</span>
            <div
              className="w-full rounded-t-md bg-[#6FCF97] transition-all"
              style={{ height: `${h}%`, minHeight: val > 0 ? 4 : 2 }}
              title={`${item[dateKey]}: ${val}`}
            />
            <span className="text-[8px] text-slate-400 rotate-0 truncate w-full text-center">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
