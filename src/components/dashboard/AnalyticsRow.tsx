import { 
  AreaChart, Area, 
  BarChart, Bar, 
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import GlassCard from '../ui/GlassCard';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BarChart2, Zap, Target } from 'lucide-react';

export default function AnalyticsRow() {
  const { focusSummary, taskSummary, goalProgress } = useAnalytics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Chart 1: Focus Trends */}
      <GlassCard className="p-8 h-[380px] flex flex-col group overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 shadow-xl shadow-indigo-100 text-white rounded-2xl">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Focus Peak</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Mental Intensity</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={focusSummary}>
              <defs>
                <linearGradient id="colorFocusDesign" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}}
                tickFormatter={(val) => val.split('-').slice(2).join('')}
                dy={10}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  color: '#fff'
                }}
                itemStyle={{color: '#818cf8', fontWeight: 'bold'}}
              />
              <Area 
                type="monotone" 
                dataKey="total_minutes" 
                stroke="#6366f1" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorFocusDesign)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Chart 2: Task Completion */}
      <GlassCard className="p-8 h-[380px] flex flex-col group overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 shadow-xl shadow-slate-200 text-white rounded-2xl">
              <BarChart2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Velocity</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Output rhythm</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskSummary}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}}
                tickFormatter={(val) => val.split('-').slice(2).join('')}
                dy={10}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  color: '#fff'
                }}
                itemStyle={{color: '#818cf8', fontWeight: 'bold'}}
              />
              <Bar dataKey="tasks_completed" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Chart 3: Goal Milestones */}
      <GlassCard className="p-8 h-[380px] flex flex-col group overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 shadow-xl shadow-emerald-100 text-white rounded-2xl">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">North Stars</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Destination distance</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" cy="50%" 
              innerRadius="20%" outerRadius="110%" 
              barSize={12} 
              data={goalProgress.map((g, i) => ({ 
                name: g.title, 
                uv: g.progress_percentage, 
                fill: i === 0 ? '#6366f1' : i === 1 ? '#10b981' : '#0f172a' 
              }))}
            >
              <RadialBar
                background={{ fill: '#f1f5f9' }}
                dataKey="uv"
                cornerRadius={10}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  color: '#fff'
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
