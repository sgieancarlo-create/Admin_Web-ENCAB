import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  LayoutDashboard,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  ArrowRightCircle,
  Loader2,
  UserPlus,
  Venus,
  Mars,
  Minus,
} from 'lucide-react';
import { getStats } from '../lib/api';

type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  enrollingNow?: number;
  gender?: { male: number; female: number; other: number };
  byDate?: { date: string; count: number }[];
};

const statusColors = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  draft: '#64748b',
};

const genderColors = {
  female: '#ec4899',
  male: '#3b82f6',
  other: '#64748b',
};

const statConfig: Record<
  string,
  { label: string; border: string; icon: React.ReactNode; iconBg: string }
> = {
  total: {
    label: 'Total Enrollments',
    border: 'border-l-maroon-accent',
    icon: <Users size={22} strokeWidth={2} />,
    iconBg: 'bg-maroon-accent/20 text-maroon-accent',
  },
  pending: {
    label: 'Pending',
    border: 'border-l-amber-500',
    icon: <Clock size={22} strokeWidth={2} />,
    iconBg: 'bg-amber-500/20 text-amber-400',
  },
  approved: {
    label: 'Approved',
    border: 'border-l-emerald-500',
    icon: <CheckCircle2 size={22} strokeWidth={2} />,
    iconBg: 'bg-emerald-500/20 text-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    border: 'border-l-red-500',
    icon: <XCircle size={22} strokeWidth={2} />,
    iconBg: 'bg-red-500/20 text-red-400',
  },
  draft: {
    label: 'Draft',
    border: 'border-l-slate-500',
    icon: <FileEdit size={22} strokeWidth={2} />,
    iconBg: 'bg-slate-500/20 text-slate-400',
  },
};

const genderConfig = [
  { key: 'female' as const, label: 'Female', icon: <Venus size={20} strokeWidth={2} />, border: 'border-l-pink-500', iconBg: 'bg-pink-500/20 text-pink-400' },
  { key: 'male' as const, label: 'Male', icon: <Mars size={20} strokeWidth={2} />, border: 'border-l-blue-500', iconBg: 'bg-blue-500/20 text-blue-400' },
  { key: 'other' as const, label: 'Unspecified', icon: <Minus size={20} strokeWidth={2} />, border: 'border-l-slate-500', iconBg: 'bg-slate-500/20 text-slate-400' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function formatChartDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}


export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-[0.9375rem] text-red-400"
      >
        {error}
      </motion.div>
    );
  }
  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-16"
      >
        <Loader2 className="h-10 w-10 animate-spin text-maroon-accent" strokeWidth={2} />
        <span className="text-sm text-white/60">Loading dashboard…</span>
      </motion.div>
    );
  }

  const enrollingNow = stats.enrollingNow ?? stats.pending;
  const gender = stats.gender ?? { male: 0, female: 0, other: 0 };
  const byDate = stats.byDate ?? [];

  const dateChartData = byDate.map(({ date, count }) => ({
    date,
    displayDate: formatChartDate(date),
    count,
  }));

  const statusChartData = [
    { name: 'Pending', value: stats.pending, fill: statusColors.pending },
    { name: 'Approved', value: stats.approved, fill: statusColors.approved },
    { name: 'Rejected', value: stats.rejected, fill: statusColors.rejected },
    { name: 'Draft', value: stats.draft, fill: statusColors.draft },
  ].filter((d) => d.value > 0);

  const genderChartData = [
    { name: 'Female', value: gender.female, fill: genderColors.female },
    { name: 'Male', value: gender.male, fill: genderColors.male },
    { name: 'Unspecified', value: gender.other, fill: genderColors.other },
  ].filter((d) => d.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1100px] space-y-10"
    >
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-2"
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-maroon-accent/20 text-maroon-accent"
          >
            <LayoutDashboard size={26} strokeWidth={2} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Dashboard
            </h1>
            <p className="text-sm text-white/55">
              Overview of enrollment applications
            </p>
          </div>
        </div>
      </motion.header>

      {/* Status cards - top */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={container}
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
          By status
        </h2>
        <motion.div variants={container} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {(['total', 'pending', 'approved', 'rejected', 'draft'] as const).map((key) => (
            <motion.div key={key} variants={item}>
              <StatCard
                value={stats[key] ?? 0}
                label={statConfig[key].label}
                border={statConfig[key].border}
                icon={statConfig[key].icon}
                iconBg={statConfig[key].iconBg}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Gender cards - top */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={container}
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
          By gender
        </h2>
        <motion.div variants={container} className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {genderConfig.map(({ key, label, icon, border, iconBg }) => (
            <motion.div key={key} variants={item}>
              <StatCard
                value={gender[key]}
                label={label}
                border={border}
                icon={icon}
                iconBg={iconBg}
              />
            </motion.div>
          ))}
        </motion.div>
        <motion.p variants={item} className="mt-2 text-xs text-white/45">
          Based on gender reported in enrollment basic info.
        </motion.p>
      </motion.section>

      {/* Enrolling now */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={container}
        className="space-y-3"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
          Enrolling now
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div variants={item}>
            <StatCard
              value={enrollingNow}
              label="Currently enrolling (pending)"
              border="border-l-maroon-accent"
              icon={<UserPlus size={22} strokeWidth={2} />}
              iconBg="bg-maroon-accent/20 text-maroon-accent"
            />
          </motion.div>
          <motion.div variants={item} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] px-5 py-5">
              <p className="text-sm text-white/60">
                Applicants with <strong className="text-amber-400">Pending</strong> status are currently in the enrollment process and awaiting review.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Charts row */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={container}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <motion.div
          variants={item}
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-xl"
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
            Status distribution
          </h3>
          <div className="h-[260px]">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 8, 6, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#e2e8f0',
                    }}
                    formatter={(value: number | undefined) => [value ?? 0, '']}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value) => <span className="text-white/80">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/50">
                No status data yet
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-xl"
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
            Gender distribution
          </h3>
          <div className="h-[260px]">
            {genderChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={400}
                    animationDuration={800}
                  >
                    {genderChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 8, 6, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#e2e8f0',
                    }}
                    formatter={(value: number | undefined) => [value ?? 0, '']}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value) => <span className="text-white/80">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/50">
                No gender data yet
              </div>
            )}
          </div>
        </motion.div>
      </motion.section>

      {/* Enrollments by date */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={container}
      >
        <motion.div variants={item} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-xl">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
            Enrollments by date (last 30 days)
          </h3>
          <div className="h-[260px]">
            {dateChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dateChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dateFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C41E3A" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#C41E3A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} width={28} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 8, 6, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
                    formatter={(value: number | undefined) => [`${value ?? 0} enrollment(s)`, 'Count']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#C41E3A"
                    strokeWidth={2}
                    fill="url(#dateFill)"
                    animationBegin={200}
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/50">
                No enrollment dates yet
              </div>
            )}
          </div>
        </motion.div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-2"
      >
        <Link
          to="/enrollments"
          className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-maroon-accent to-[#a01830] px-6 py-3.5 text-[0.9375rem] font-semibold text-white shadow-lg shadow-maroon-accent/25 no-underline transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-maroon-accent/30"
        >
          <ArrowRightCircle size={20} strokeWidth={2} className="shrink-0" />
          View all enrollments
        </Link>
      </motion.div>
    </motion.div>
  );
}

function StatCard({
  value,
  label,
  border,
  icon,
  iconBg,
}: {
  value: number;
  label: string;
  border: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group flex min-h-[100px] flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.04] px-5 py-5 shadow-md transition-shadow hover:border-white/10 hover:bg-white/[0.06] hover:shadow-xl ${border} border-l-4`}
    >
      <div className="flex items-start justify-between">
        <motion.div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {icon}
        </motion.div>
        <span className="text-3xl font-bold tracking-tight text-white tabular-nums">
          {value}
        </span>
      </div>
      <span className="mt-3 block text-xs font-medium uppercase tracking-wider text-white/55">
        {label}
      </span>
    </motion.div>
  );
}
