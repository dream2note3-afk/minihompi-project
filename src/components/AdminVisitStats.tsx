import React, { useState, useMemo } from 'react';
import { DailyVisitStat, VisitorStatsData } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  AreaChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  Calendar,
  Award,
  BarChart3,
  LineChart as LineChartIcon,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
  Table as TableIcon
} from 'lucide-react';

interface AdminVisitStatsProps {
  statsData: VisitorStatsData;
  onRefresh?: () => void;
  onSimulateVisit?: () => void;
}

type ChartViewType = 'composed' | 'daily' | 'total';
type DateRangeType = '7d' | '14d' | '30d';

export const AdminVisitStats: React.FC<AdminVisitStatsProps> = ({
  statsData,
  onRefresh,
  onSimulateVisit
}) => {
  const [chartView, setChartView] = useState<ChartViewType>('composed');
  const [dateRange, setDateRange] = useState<DateRangeType>('14d');
  const [showTable, setShowTable] = useState(false);

  // Filtered dataset according to selected date range
  const chartData = useMemo(() => {
    const raw = statsData.history || [];
    if (raw.length === 0) return [];

    let count = 14;
    if (dateRange === '7d') count = 7;
    if (dateRange === '30d') count = 30;

    return raw.slice(-count);
  }, [statsData.history, dateRange]);

  // Derived Key Metrics
  const metrics: {
    todayCount: number;
    totalCount: number;
    dayDiff: number;
    dayPercent: number;
    avg7: number;
    peakDay: DailyVisitStat | null;
  } = useMemo(() => {
    const raw = statsData.history || [];
    const todayCount = statsData.today;
    const totalCount = statsData.total;

    // Previous day
    const prevDay = raw.length >= 2 ? raw[raw.length - 2] : null;
    const prevCount = prevDay ? prevDay.daily : Math.max(1, todayCount - 5);
    const dayDiff = todayCount - prevCount;
    const dayPercent = prevCount > 0 ? Math.round((dayDiff / prevCount) * 100) : 0;

    // 7-day average
    const last7 = raw.slice(-7);
    const avg7 = last7.length > 0
      ? Math.round(last7.reduce((sum, item) => sum + item.daily, 0) / last7.length)
      : todayCount;

    // Peak day
    let peakDay: DailyVisitStat | null = null;
    for (const d of raw) {
      if (!peakDay || d.daily > peakDay.daily) {
        peakDay = d;
      }
    }

    return {
      todayCount,
      totalCount,
      dayDiff,
      dayPercent,
      avg7,
      peakDay
    };
  }, [statsData]);

  // Custom Retro Cyworld Tooltip Component
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const dataPoint = chartData.find((d) => d.date === label);
      return (
        <div className="bg-[#1e293b]/95 backdrop-blur-xs text-white p-2.5 rounded-lg border border-[#475569] shadow-xl text-xs flex flex-col gap-1 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-white/20 pb-1 font-mono">
            <span className="font-bold text-[#ff9f43]">{dataPoint?.fullDate || label}</span>
            <span className="text-[10px] text-gray-300">({dataPoint?.dayName || ''}요일)</span>
          </div>

          <div className="flex flex-col gap-1 pt-0.5">
            {payload.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-gray-200">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-mono font-bold" style={{ color: entry.color }}>
                  {entry.value.toLocaleString()}명
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[#c6d7e2] rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col gap-3.5">
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#e2edf2]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff6b2b] to-[#ff9f43] text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1a2f3f] flex items-center gap-1.5">
              <span>방문자 통계 분석 (Visit Statistics)</span>
              <span className="text-[10px] bg-[#fff5ee] text-[#ff6b2b] border border-[#fed7aa] px-1.5 py-0.2 rounded font-bold font-mono">
                Recharts 실시간 차트
              </span>
            </h3>
            <p className="text-[11px] text-[#6d8494]">
              싸이월드 미니홈피 일일 방문자 및 총 누적 방문자 추이를 다각도로 시각화합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onSimulateVisit && (
            <button
              type="button"
              onClick={onSimulateVisit}
              className="px-2.5 py-1 bg-white hover:bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="방문자 +1 카운트 테스트"
            >
              <Sparkles className="w-3 h-3 text-[#ff6b2b]" />
              <span>방문자 +1 테스트</span>
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 bg-white hover:bg-[#f0f6fa] text-[#557082] hover:text-[#1a2f3f] border border-[#c4d7e2] rounded shadow-2xs transition-colors cursor-pointer"
              title="통계 새로고침"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* TODAY */}
        <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#fff7ed] to-[#fff1e6] border border-[#fed7aa] rounded-lg shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#9a3412] font-medium">
            <span className="font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#ff6b2b]" />
              오늘 방문 (TODAY)
            </span>
            {metrics.dayDiff !== 0 && (
              <span className={`text-[10px] font-mono font-bold flex items-center ${metrics.dayDiff > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {metrics.dayDiff > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {metrics.dayPercent > 0 ? `+${metrics.dayPercent}%` : `${metrics.dayPercent}%`}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#c2410c] font-mono tabular-nums">
              {metrics.todayCount.toLocaleString()}
            </span>
            <span className="text-xs text-[#9a3412] font-medium">명</span>
          </div>
          <span className="text-[10px] text-[#b45309] mt-0.5">
            실시간 방문자 카운트 반영
          </span>
        </div>

        {/* TOTAL */}
        <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] border border-[#ddd6fe] rounded-lg shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#5b21b6] font-medium">
            <span className="font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#7c3aed]" />
              총 누적 방문 (TOTAL)
            </span>
            <span className="text-[9px] bg-[#7c3aed]/15 text-[#6d28d9] px-1 py-0.2 rounded font-mono font-bold">
              누적성장
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#6d28d9] font-mono tabular-nums">
              {metrics.totalCount.toLocaleString()}
            </span>
            <span className="text-xs text-[#5b21b6] font-medium">명</span>
          </div>
          <span className="text-[10px] text-[#7c3aed] mt-0.5">
            홈피 개설 이래 총 방문 건수
          </span>
        </div>

        {/* 7-DAY AVERAGE */}
        <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border border-[#bae6fd] rounded-lg shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#075985] font-medium">
            <span className="font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#0284c7]" />
              주간 일평균 (7-Day Avg)
            </span>
            <span className="text-[9px] bg-[#0284c7]/15 text-[#0369a1] px-1 py-0.2 rounded font-mono font-bold">
              평균
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#0369a1] font-mono tabular-nums">
              {metrics.avg7.toLocaleString()}
            </span>
            <span className="text-xs text-[#075985] font-medium">명 / 일</span>
          </div>
          <span className="text-[10px] text-[#0284c7] mt-0.5">
            최근 7일간 하루 평균 방문객
          </span>
        </div>

        {/* PEAK RECORD */}
        <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0] rounded-lg shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#166534] font-medium">
            <span className="font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#16a34a]" />
              최고 일일 방문 (Peak)
            </span>
            <span className="text-[9px] bg-[#16a34a]/15 text-[#15803d] px-1 py-0.2 rounded font-mono font-bold">
              BEST
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#15803d] font-mono tabular-nums">
              {metrics.peakDay ? metrics.peakDay.daily.toLocaleString() : metrics.todayCount}
            </span>
            <span className="text-xs text-[#166534] font-medium">명</span>
          </div>
          <span className="text-[10px] text-[#16a34a] mt-0.5 font-mono truncate">
            {metrics.peakDay ? `${metrics.peakDay.date} (${metrics.peakDay.dayName}) 달성` : '기록 집계 중'}
          </span>
        </div>
      </div>

      {/* 3. Controls Bar: Chart View Tabs & Date Range Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f4f8fa] p-2 rounded-lg border border-[#cde0e9]">
        {/* Chart View Toggle Tabs */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-[#c4d7e2]">
          <button
            type="button"
            onClick={() => setChartView('composed')}
            className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              chartView === 'composed'
                ? 'bg-[#2b7294] text-white shadow-2xs font-bold'
                : 'text-[#506c7e] hover:bg-[#eaf2f6]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>통합 분석 (일별+누적)</span>
          </button>

          <button
            type="button"
            onClick={() => setChartView('daily')}
            className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              chartView === 'daily'
                ? 'bg-[#ff6b2b] text-white shadow-2xs font-bold'
                : 'text-[#506c7e] hover:bg-[#eaf2f6]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>일별 방문자 (Daily)</span>
          </button>

          <button
            type="button"
            onClick={() => setChartView('total')}
            className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              chartView === 'total'
                ? 'bg-[#7c3aed] text-white shadow-2xs font-bold'
                : 'text-[#506c7e] hover:bg-[#eaf2f6]'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>누적 총 방문자 (Total)</span>
          </button>
        </div>

        {/* Date Range & Table Toggle */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-[#c4d7e2] text-xs">
            <button
              type="button"
              onClick={() => setDateRange('7d')}
              className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer ${
                dateRange === '7d' ? 'bg-[#3b5998] text-white font-bold' : 'text-[#556e80] hover:bg-[#f0f6fa]'
              }`}
            >
              최근 7일
            </button>
            <button
              type="button"
              onClick={() => setDateRange('14d')}
              className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer ${
                dateRange === '14d' ? 'bg-[#3b5998] text-white font-bold' : 'text-[#556e80] hover:bg-[#f0f6fa]'
              }`}
            >
              최근 14일
            </button>
            <button
              type="button"
              onClick={() => setDateRange('30d')}
              className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer ${
                dateRange === '30d' ? 'bg-[#3b5998] text-white font-bold' : 'text-[#556e80] hover:bg-[#f0f6fa]'
              }`}
            >
              최근 30일
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className={`p-1.5 rounded border transition-colors cursor-pointer text-xs flex items-center gap-1 ${
              showTable
                ? 'bg-[#2b7294] text-white border-[#2b7294] font-bold'
                : 'bg-white text-[#556e80] border-[#c4d7e2] hover:bg-[#f0f6fa]'
            }`}
            title="상세 표 보기/숨기기"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">표 보기</span>
          </button>
        </div>
      </div>

      {/* 4. Main Recharts Visualization Canvas */}
      <div className="bg-[#fcfdfd] border border-[#dce8ee] rounded-xl p-3 shadow-inner">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'composed' ? (
              <ComposedChart data={chartData} margin={{ top: 15, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b2b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ff9f43" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6eef3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                {/* Left Y Axis for Daily visitors */}
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fontSize: 11, fill: '#ea580c' }}
                  tickLine={{ stroke: '#ea580c' }}
                  axisLine={{ stroke: '#ea580c' }}
                  allowDecimals={false}
                  label={{ value: '일별(명)', angle: -90, position: 'insideLeft', fill: '#ea580c', fontSize: 10 }}
                />
                {/* Right Y Axis for Cumulative Total visitors */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#7c3aed' }}
                  tickLine={{ stroke: '#7c3aed' }}
                  axisLine={{ stroke: '#7c3aed' }}
                  domain={['dataMin - 100', 'dataMax + 100']}
                  label={{ value: '누적(명)', angle: 90, position: 'insideRight', fill: '#7c3aed', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconSize={10}
                />
                {/* Daily visitor bar */}
                <Bar
                  yAxisId="left"
                  dataKey="daily"
                  name="일별 방문자"
                  fill="url(#colorDaily)"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
                {/* Cumulative total line with smooth curve */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="total"
                  name="총 누적 방문자"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#7c3aed', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 5, fill: '#6d28d9', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            ) : chartView === 'daily' ? (
              <BarChart data={chartData} margin={{ top: 15, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b2b" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#ff9f43" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6eef3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#ea580c' }}
                  tickLine={{ stroke: '#ea580c' }}
                  axisLine={{ stroke: '#ea580c' }}
                  allowDecimals={false}
                  label={{ value: '방문자수(명)', angle: -90, position: 'insideLeft', fill: '#ea580c', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar
                  dataKey="daily"
                  name="일일 방문자"
                  fill="url(#barGradient)"
                  radius={[5, 5, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 15, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="totalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6eef3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#7c3aed' }}
                  tickLine={{ stroke: '#7c3aed' }}
                  axisLine={{ stroke: '#7c3aed' }}
                  domain={['dataMin - 50', 'dataMax + 50']}
                  label={{ value: '누적 방문자(명)', angle: -90, position: 'insideLeft', fill: '#7c3aed', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="총 누적 방문자 수"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fill="url(#totalAreaGrad)"
                  dot={{ r: 3, fill: '#7c3aed', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 5, fill: '#6d28d9', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Detailed Daily Log Table (Collapsible) */}
      {showTable && (
        <div className="overflow-x-auto border border-[#d6e4ec] rounded-lg mt-1 animate-fadeIn">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f0f6fa] text-[#486377] font-bold border-b border-[#d6e4ec]">
                <th className="p-2 font-medium">날짜 (요일)</th>
                <th className="p-2 font-medium text-right">일일 방문자 (TODAY)</th>
                <th className="p-2 font-medium text-right">누적 방문자 (TOTAL)</th>
                <th className="p-2 font-medium text-right">전일 대비</th>
              </tr>
            </thead>
            <tbody>
              {chartData.slice().reverse().map((item, idx, arr) => {
                const prev = arr[idx + 1];
                const diff = prev ? item.daily - prev.daily : 0;
                const isToday = idx === 0;

                return (
                  <tr
                    key={item.fullDate || item.date}
                    className={`border-b border-[#e8f1f5] hover:bg-[#f8fafc] ${isToday ? 'bg-[#fffbf6] font-bold' : ''}`}
                  >
                    <td className="p-2 flex items-center gap-1.5 font-mono">
                      <span>{item.fullDate || item.date}</span>
                      <span className="text-[10px] text-[#718b9c]">({item.dayName})</span>
                      {isToday && (
                        <span className="text-[9px] bg-[#ff6b2b] text-white px-1 py-0.2 rounded font-mono font-bold">
                          오늘
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-right font-mono text-[#ea580c]">
                      {item.daily.toLocaleString()}명
                    </td>
                    <td className="p-2 text-right font-mono text-[#6d28d9]">
                      {item.total.toLocaleString()}명
                    </td>
                    <td className="p-2 text-right font-mono">
                      {prev ? (
                        diff > 0 ? (
                          <span className="text-emerald-600 font-bold">+{diff} ▲</span>
                        ) : diff < 0 ? (
                          <span className="text-rose-600 font-bold">{diff} ▼</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. Footer Note */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-[#7992a2] pt-1">
        <span>
          💡 방문자가 미니홈피에 접속할 때마다 방문자 통계가 실시간으로 집계됩니다.
        </span>
        <span className="font-mono text-[#4a6375]">
          최종 확인: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
