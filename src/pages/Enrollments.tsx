import { useEffect, useState, useRef } from 'react';
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
  Archive,
} from 'lucide-react';
import { getEnrollments, archiveEnrollment } from '../lib/api';

const SCHOOL_YEAR_OPTIONS = ['2024-2025', '2025-2026', '2026-2027', '2027-2028'];

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [archiveTarget, setArchiveTarget] = useState<{ id: string; studentName: string } | null>(null);
  const [archiveSchoolYear, setArchiveSchoolYear] = useState(SCHOOL_YEAR_OPTIONS[1]);
  const [archiving, setArchiving] = useState(false);
  const [showBulkArchiveModal, setShowBulkArchiveModal] = useState(false);
  const [bulkArchiving, setBulkArchiving] = useState(false);

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

  const selectedCount = selectedIds.size;
  const allSelected = list.length > 0 && selectedCount === list.length;
  const someSelected = selectedCount > 0;
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(list.map((r) => r.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleArchive() {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await archiveEnrollment(archiveTarget.id, archiveSchoolYear);
      setArchiveTarget(null);
      getEnrollments(statusFilter || undefined)
        .then(setList)
        .catch((e) => setError(e.message));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to archive');
    } finally {
      setArchiving(false);
    }
  }

  async function handleBulkArchive() {
    if (selectedCount === 0) return;
    setBulkArchiving(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => archiveEnrollment(id, archiveSchoolYear))
      );
      setSelectedIds(new Set());
      setShowBulkArchiveModal(false);
      getEnrollments(statusFilter || undefined)
        .then(setList)
        .catch((e) => setError(e.message));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to archive some enrollments');
    } finally {
      setBulkArchiving(false);
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
        <div className="flex flex-wrap items-center gap-3">
          {someSelected && (
            <button
              type="button"
              onClick={() => setShowBulkArchiveModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-500/50 bg-slate-500/20 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-500/30"
            >
              <Archive size={18} strokeWidth={2} />
              Archive selected ({selectedCount})
            </button>
          )}
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
                  <th className="w-12 px-4 py-4 text-left">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-white/30 bg-white/10 text-maroon-accent focus:ring-maroon-accent"
                      />
                      <span className="sr-only">Select all</span>
                    </label>
                  </th>
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
                  <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-white/70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.06] ${
                      index % 2 === 1 ? 'bg-white/[0.02]' : ''
                    } ${selectedIds.has(row.id) ? 'bg-maroon-accent/5' : ''}`}
                  >
                    <td className="w-12 px-4 py-4">
                      <label className="flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          className="h-4 w-4 rounded border-white/30 bg-white/10 text-maroon-accent focus:ring-maroon-accent"
                        />
                        <span className="sr-only">Select {row.studentName}</span>
                      </label>
                    </td>
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setArchiveTarget({ id: row.id, studentName: row.studentName })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-500/50 bg-slate-500/20 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-500/30"
                          title="Archive enrollment"
                        >
                          <Archive size={16} strokeWidth={2} />
                          Archive
                        </button>
                        <Link
                          to={`/enrollments/${row.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium text-maroon-accent no-underline transition-colors hover:bg-maroon-accent/15 hover:no-underline"
                        >
                          View
                          <ChevronRight size={16} strokeWidth={2} />
                        </Link>
                      </div>
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

      {/* Bulk archive modal */}
      {showBulkArchiveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowBulkArchiveModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-slate-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white">Archive selected enrollments</h3>
            <p className="mt-2 text-sm text-slate-300">
              Archive <strong className="text-white">{selectedCount}</strong> enrollment{selectedCount !== 1 ? 's' : ''}? They will be read-only and organized by school year.
            </p>
            <label className="mt-4 block text-sm font-medium text-slate-300">School year</label>
            <select
              value={archiveSchoolYear}
              onChange={(e) => setArchiveSchoolYear(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-slate-200 focus:border-maroon-accent focus:outline-none focus:ring-2 focus:ring-maroon-accent/25"
            >
              {SCHOOL_YEAR_OPTIONS.map((sy) => (
                <option key={sy} value={sy}>SY {sy}</option>
              ))}
            </select>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkArchiveModal(false)}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkArchive}
                disabled={bulkArchiving}
                className="rounded-xl bg-maroon-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {bulkArchiving ? 'Archiving…' : `Archive ${selectedCount}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single archive modal */}
      {archiveTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setArchiveTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-slate-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white">Archive enrollment</h3>
            <p className="mt-2 text-sm text-slate-300">
              Move <strong className="text-white">{archiveTarget.studentName}</strong> to the archive? It will be read-only and organized by school year.
            </p>
            <label className="mt-4 block text-sm font-medium text-slate-300">School year</label>
            <select
              value={archiveSchoolYear}
              onChange={(e) => setArchiveSchoolYear(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-slate-200 focus:border-maroon-accent focus:outline-none focus:ring-2 focus:ring-maroon-accent/25"
            >
              {SCHOOL_YEAR_OPTIONS.map((sy) => (
                <option key={sy} value={sy}>SY {sy}</option>
              ))}
            </select>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setArchiveTarget(null)}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchive}
                disabled={archiving}
                className="rounded-xl bg-maroon-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {archiving ? 'Archiving…' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
