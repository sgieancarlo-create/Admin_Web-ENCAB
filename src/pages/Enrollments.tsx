import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Filter,
  Loader2,
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Inbox,
} from 'lucide-react';
import { getEnrollments } from '../lib/api';

type EnrollmentRow = {
  id: string;
  user_id: string;
  status: string;
  studentName: string;
  email: string;
  contact_no: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

const statusBadgeClass: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
  draft: 'bg-slate-500/20 text-slate-400',
};

export default function Enrollments() {
  const [list, setList] = useState<EnrollmentRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getEnrollments(statusFilter || undefined)
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

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
      {/* Page header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-maroon-accent/20 text-maroon-accent">
            <ClipboardList size={26} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Enrollments
            </h1>
            <p className="text-sm text-white/55">
              Manage and review enrollment applications
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="shrink-0 text-white/60" strokeWidth={2} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-status cursor-pointer rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 shadow-sm transition-colors hover:border-white/25 focus:border-maroon-accent focus:outline-none focus:ring-2 focus:ring-maroon-accent/25"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </header>

      {/* Data table card */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2
              className="h-10 w-10 animate-spin text-maroon-accent"
              strokeWidth={2}
            />
            <span className="text-sm text-white/60">Loading enrollments…</span>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white/40">
              <Inbox size={32} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-white/70">
              No enrollments found
            </p>
            <p className="max-w-sm text-center text-xs text-white/50">
              {statusFilter
                ? 'Try changing the status filter or check back later.'
                : 'Submitted applications will appear here.'}
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
                      Submitted
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
                          statusBadgeClass[row.status] ??
                          'bg-white/10 text-white/70'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 tabular-nums">
                      {formatDate(row.submitted_at)}
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

        {/* Table footer with count */}
        {!loading && list.length > 0 && (
          <div className="border-t border-white/[0.06] bg-white/[0.03] px-5 py-3">
            <p className="text-xs font-medium text-white/50">
              Showing {list.length} enrollment{list.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
