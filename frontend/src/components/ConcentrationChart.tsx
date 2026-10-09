import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  time: string;
  value: number;
}

interface ConcentrationChartProps {
  data: DataPoint[];
  pollutant: string;
}

export default function ConcentrationChart({ data }: ConcentrationChartProps) {
  return (
    <div className="w-full h-full p-4 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-brand-danger)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-brand-danger)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            tickFormatter={(tick: string) => {
              const d = new Date(tick);
              return `${d.getHours()}:${d.getMinutes() === 0 ? '00' : d.getMinutes()}`;
            }} 
            stroke="var(--color-brand-ink)" 
            opacity={0.5} 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="var(--color-brand-ink)" 
            opacity={0.5} 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-brand-bg)', borderColor: 'var(--color-brand-soft)', borderRadius: '4px', fontSize: '14px', fontFamily: 'var(--font-sans)' }}
            labelFormatter={(label: any) => new Date(label).toLocaleTimeString()}
            itemStyle={{ color: 'var(--color-brand-danger)' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="var(--color-brand-danger)" 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
