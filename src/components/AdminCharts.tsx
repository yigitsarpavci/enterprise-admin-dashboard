'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';

interface ChartProps {
  title: string;
  data: any[];
  dataKey: string;
  nameKey: string;
  type?: 'bar' | 'area' | 'line';
  color?: string;
}

export function AdminChartCard({ title, data, dataKey, nameKey, type = 'bar', color = 'var(--primary)' }: ChartProps) {
  return (
    <div className="clean-card p-10 h-[450px] flex flex-col group">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="heading-premium text-lg uppercase tracking-tight">{title}</h3>
          <p className="subheading-premium !mt-2 !tracking-[0.1em] opacity-40">{data.length} DATAPOINTS_SYNCED</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
           <span className="subheading-premium !mb-0 !text-[8px] opacity-20 uppercase tracking-[0.2em]">Live Stream</span>
        </div>
      </div>
      
      <div className="flex-grow w-full h-full opacity-70 group-hover:opacity-100 transition-all duration-700">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey={nameKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'var(--accent)', opacity: 0.4 }}
              />
              <Bar 
                dataKey={dataKey} 
                fill={color} 
                radius={[8, 8, 2, 2]} 
                barSize={32}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          ) : type === 'area' ? (
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey={nameKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke="var(--primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorGradient)"
                animationDuration={2000}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey={nameKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="var(--primary)" 
                strokeWidth={4} 
                dot={{ r: 4, strokeWidth: 2, fill: 'var(--background)' }} 
                activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}
                animationDuration={2000}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--card)] p-6 rounded-[24px] shadow-2xl border border-[var(--border)] fade-in">
        <p className="subheading-premium !mb-2 !text-[var(--muted)] !tracking-[0.1em] !text-[9px] uppercase">{label}</p>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold italic tracking-tighter text-[var(--foreground)]">
            {payload[0].value}
          </p>
          <span className="subheading-premium !mb-1.5 opacity-20 !text-[8px] uppercase tracking-widest">Units</span>
        </div>
      </div>
    );
  }
  return null;
};
