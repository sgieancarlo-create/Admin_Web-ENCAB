import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive as ArchiveIcon,
  ChevronRight,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  Inbox,
} from 'lucide-react';
import { getArchivedSchoolYears, getArchivedEnrollments } from '../lib/api';

type ArchivedRow = {
  id: string;
  user_id: string;
  status: string;
  studentName: string;
  email: string;
  contact_no: string | null;
  submitted_at: string | null;
  archived_at: string;
  school_year: string | null;
  created_at: string;
  updated_at: string;
};

const statusBadgeClass: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
  draft: 'bg-slate-500/20 text-slate-400',
};

const DEFAULT_SCHOOL_YEARS = ['2025-2026', '2026-2027', '2024-2025'];

export default function Archive() {
  const [schoolYears, setSchoolYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [list, setList] = useState<ArchivedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getArchivedSchoolYears()
      .then((years) => {
        const combined = [...new Set([...DEFAULT_SCHOOL_YEARS, ...years])].sort().reverse();
        setSchoolYears(combined);
        setSelectedYear((prev) => prev);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (selectedYear === '') return;
    setLoading(true);
    const sy = selectedYear === 'all' ? undefined : selectedYear;
    getArchivedEnrollments(sy)
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  function formatDate(s: string | null) {
    if (!s) return '—';
    try {
      return new Date(s).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return s;
    }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-[0.9375rem] text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-500/20 text-slate-400">
            <ArchiveIcon size={26} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Archive
            </h1>
            <p className="text-sm text-white/55">
              View archived enrollments by school year (read-only)
            </p>
          </div>
        </div>
      </header>

      {/* School year tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedYear('all')}
          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            selectedYear === 'all'
              ? 'border-maroon-accent bg-maroon-accent/20 text-maroon-accent'
              : 'border-white/15 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {schoolYears.map((sy) => (
          <button
            key={sy}
            type="button"
            onClick={() => setSelectedYear(sy)}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              selectedYear === sy
                ? 'border-maroon-accent bg-maroon-accent/20 text-maroon-accent'
                : 'border-white/15 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10'
            }`}
          >
            SY {sy}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2
              className="h-10 w-10 animate-spin text-maroon-accent"
              strokeWidth={2}
            />
            <span className="text-sm text-white/60">Loading archived enrollments…</span>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white/40">
              <Inbox size={32} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-white/70">
              {selectedYear === 'all' ? 'No archived enrollments.' : `No archived enrollments for SY ${selectedYear}.`}
            </p>
            <p className="max-w-sm text-center text-xs text-white/50">
              Archived records appear here by school year and are view-only.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.06]">
                  <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider text-white/70">
                    <span className="flex items-center gap-2">
                      <User size={16} strokeWidth={2} />
                      Student
                    </span>
                  </th>
                  <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider text-white/70">
                    <span className="flex items-center gap-2">
                      <Mail size={16} strokeWidth={2} />
                      Email
                    </span>
                  </th>
                  <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider text-white/70">
                    <span className="flex items-center gap-2">
                      <Phone size={16} strokeWidth={2} />
                      Contact
                    </span>
                  </th>
                  <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider text-white/70">
                    <span className="flex items-center gap-2">
                      <FileText size={16} strokeWidth={2} />
                      Status
                    </span>
                  </th>
                  <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider text-white/70">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} strokeWidth={2} />
                      Archived
                    </span>
                  </th>
                  <th className="w-[100px] px-5 py-4 text-right font-semibold uppercase tracking-wider text-white/70">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.06] ${
                      index % 2 === 1 ? 'bg-white/[0.02]' : ''
                    }`}
                  >
                    <td className="px-5 py-4 font-medium text-slate-200">
                      {row.studentName}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{row.email}</td>
                    <td className="px-5 py-4 text-slate-300">
                      {row.contact_no || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                          statusBadgeClass[row.status] ?? 'bg-white/10 text-white/70'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 tabular-nums">
                      {formatDate(row.archived_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/enrollments/${row.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium text-maroon-accent no-underline transition-colors hover:bg-maroon-accent/15 hover:no-underline"
                      >
                        View
                        <ChevronRight size={16} strokeWidth={2} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && list.length > 0 && (
          <div className="border-t border-white/[0.06] bg-white/[0.03] px-5 py-3">
            <p className="text-xs font-medium text-white/50">
              Showing {list.length} archived enrollment{list.length !== 1 ? 's' : ''}
              {selectedYear && selectedYear !== 'all' ? ` for SY ${selectedYear}` : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
