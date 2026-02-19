import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  UserCircle,
  GraduationCap,
  School,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Archive,
  Trash2,
  Send,
  Paperclip,
} from 'lucide-react';
import {
  getEnrollment,
  getDocuments,
  updateEnrollmentStatus,
  archiveEnrollment,
  deleteEnrollment,
  sendEnrollmentEmail,
} from '../lib/api';

type BasicInfo = {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  suffix?: string;
  birthdate?: string;
  birthPlace?: string;
  gender?: string;
  motherName?: string;
  fatherName?: string;
  guardianName?: string;
  guardianContact?: string;
  studentType?: string;
};

type SchoolRecord = {
  schoolName?: string;
  location?: string;
  yearFrom?: string;
  yearTo?: string;
};
type SchoolBackground = {
  elementary?: SchoolRecord[];
  juniorHigh?: SchoolRecord[];
  highSchool?: SchoolRecord[];
};

type Enrollment = {
  id: string;
  user_id: string;
  status: string;
  studentName: string;
  email: string;
  username: string;
  contact_no: string | null;
  profile_picture_url: string | null;
  basic_info: BasicInfo;
  school_background: SchoolBackground;
  submitted_at: string | null;
  archived_at: string | null;
  school_year: string | null;
  created_at: string;
  updated_at: string;
};

type Doc = {
  id: string;
  name: string;
  type: string;
  url: string;
  status: string;
  remarks: string | null;
};

const statusBadgeClass: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
  draft: 'bg-slate-500/20 text-slate-400',
};

const SCHOOL_YEAR_OPTIONS = ['2024-2025', '2025-2026', '2026-2027', '2027-2028'];

const EMAIL_TEMPLATES: Record<string, { subject: string; body: string }> = {
  approved: {
    subject: 'Enrollment Approved – Next Steps',
    body: `Dear Student,

Your enrollment application has been APPROVED.

Please complete the following by the deadline (fill in deadline):
• [Instructions – type here]
• [Any requirements – type here]

You may contact the registrar office for questions.

Registrar Office`,
  },
  incomplete: {
    subject: 'Enrollment – Incomplete Requirements',
    body: `Dear Student,

Your enrollment application is missing some requirements.

Missing requirements:
• [List what is missing – type here]

How to resubmit:
• [Instructions – type here]

Please submit the missing documents by [deadline].

Registrar Office`,
  },
  rejected: {
    subject: 'Enrollment Application – Update',
    body: `Dear Student,

Your enrollment application could not be approved at this time.

Reason: [Specify cause – e.g. invalid document, incomplete grades, duplicate record]

You may reapply or correct your submission. Instructions:
• [Type instructions here]

Registrar Office`,
  },
};

export default function EnrollmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveSchoolYear, setArchiveSchoolYear] = useState(SCHOOL_YEAR_OPTIONS[1]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState<'approved' | 'rejected' | 'incomplete'>('approved');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailFile, setEmailFile] = useState<{ name: string; base64: string } | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getEnrollment(id)
      .then((enr) => {
        setEnrollment(enr);
        return getDocuments(enr.user_id).catch(() => []);
      })
      .then((docs) => setDocuments(Array.isArray(docs) ? docs : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function setStatus(status: string) {
    if (!id) return;
    setConfirmStatus(null);
    setUpdating(true);
    try {
      await updateEnrollmentStatus(id, status);
      setEnrollment((prev) => (prev ? { ...prev, status } : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setUpdating(false);
    }
  }

  const statusConfirmLabel: Record<string, string> = {
    approved: 'approve',
    rejected: 'reject',
    pending: 'set to pending',
  };

  const isArchived = !!(enrollment && enrollment.archived_at);

  async function handleArchive() {
    if (!id) return;
    setShowArchiveModal(false);
    setUpdating(true);
    try {
      await archiveEnrollment(id, archiveSchoolYear);
      navigate('/archive');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to archive');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setShowDeleteConfirm(false);
    setUpdating(true);
    try {
      await deleteEnrollment(id);
      navigate('/enrollments');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setUpdating(false);
    }
  }

  function openEmailModal(type: 'approved' | 'rejected' | 'incomplete' = 'approved') {
    setEmailType(type);
    const t = EMAIL_TEMPLATES[type];
    setEmailSubject(t.subject);
    setEmailBody(t.body);
    setEmailFile(null);
    setShowEmailModal(true);
  }

  function onEmailTypeChange(type: 'approved' | 'rejected' | 'incomplete') {
    setEmailType(type);
    const t = EMAIL_TEMPLATES[type];
    setEmailSubject(t.subject);
    setEmailBody(t.body);
  }

  async function handleSendEmail() {
    if (!id || !emailSubject.trim() || !emailBody.trim()) return;
    setSendingEmail(true);
    try {
      await sendEnrollmentEmail(id, {
        type: emailType,
        subject: emailSubject.trim(),
        body: emailBody.trim(),
        ...(emailFile && { attachmentName: emailFile.name, attachmentBase64: emailFile.base64 }),
      });
      setShowEmailModal(false);
      setEmailFile(null);
      setEmailSuccess(`Email sent to ${enrollment?.email || 'student'}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send email');
      setEmailSuccess('');
    } finally {
      setSendingEmail(false);
    }
  }

  function onEmailFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Attachment must be under 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      setEmailFile({ name: file.name, base64 });
    };
    reader.readAsDataURL(file);
  }

  if (loading || !id) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2
          className="h-10 w-10 animate-spin text-maroon-accent"
          strokeWidth={2}
        />
        <span className="text-sm text-white/60">Loading enrollment…</span>
      </div>
    );
  }
  if (error && !enrollment) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-red-400">
        {error}
      </div>
    );
  }
  if (!enrollment) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-8 text-center text-white/70">
        Enrollment not found.
      </div>
    );
  }

  const bi = enrollment.basic_info || {};
  const sb = enrollment.school_background || {};
  const profilePic = enrollment.profile_picture_url;

  return (
    <div className="max-w-[1200px]">
      {emailSuccess && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {emailSuccess}
        </div>
      )}
      {/* Back link - full width */}
      <Link
        to={isArchived ? '/archive' : '/enrollments'}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-maroon-accent no-underline transition-colors hover:no-underline hover:text-maroon-accent/90"
      >
        <ArrowLeft size={18} strokeWidth={2} />
        {isArchived ? 'Back to Archive' : 'Back to Enrollments'}
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        {/* Left: profile + basic info + school */}
        <div className="min-w-0 space-y-6">
      {/* Profile header card */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-xl">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex shrink-0 justify-center sm:justify-start">
            {profilePic ? (
              <img
                src={profilePic}
                alt={enrollment.studentName}
                className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white/10"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-maroon-accent/20 text-maroon-accent ring-2 ring-white/10">
                <UserCircle size={48} strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-100">
              {enrollment.studentName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Mail size={14} strokeWidth={2} />
                {enrollment.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} strokeWidth={2} />
                {enrollment.contact_no || '—'}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                  statusBadgeClass[enrollment.status] ??
                  'bg-white/10 text-white/70'
                }`}
              >
                {enrollment.status === 'pending' && (
                  <Clock size={14} strokeWidth={2} />
                )}
                {enrollment.status === 'approved' && (
                  <CheckCircle2 size={14} strokeWidth={2} />
                )}
                {enrollment.status === 'rejected' && (
                  <XCircle size={14} strokeWidth={2} />
                )}
                {enrollment.status}
              </span>
              {enrollment.school_year && (
                <span className="rounded-xl bg-slate-500/20 px-3 py-1.5 text-xs font-semibold text-slate-400">
                  SY {enrollment.school_year}
                </span>
              )}
              {(bi as any).studentType && (
                <span className="rounded-xl bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-300">
                  {String((bi as any).studentType).toLowerCase() === 'transferee'
                    ? 'Transferee'
                    : 'New student'}
                </span>
              )}
              {isArchived ? (
                <>
                  <span className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
                    Archived — view only
                  </span>
                  <button
                    onClick={() => openEmailModal()}
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/50 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-300 transition-colors hover:bg-sky-500/30 disabled:opacity-60"
                  >
                    <Send size={16} strokeWidth={2} />
                    Email student
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {enrollment.status !== 'approved' && (
                      <button
                        onClick={() => setConfirmStatus('approved')}
                        disabled={updating}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 size={16} strokeWidth={2} />
                        Approve
                      </button>
                    )}
                    {enrollment.status !== 'rejected' && (
                      <button
                        onClick={() => setConfirmStatus('rejected')}
                        disabled={updating}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <XCircle size={16} strokeWidth={2} />
                        Reject
                      </button>
                    )}
                    {enrollment.status !== 'pending' && (
                      <button
                        onClick={() => setConfirmStatus('pending')}
                        disabled={updating}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-maroon-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Clock size={16} strokeWidth={2} />
                        Set Pending
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 border-l border-white/20 pl-3">
                    <button
                      onClick={() => openEmailModal()}
                      disabled={updating}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/50 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-300 transition-colors hover:bg-sky-500/30 disabled:opacity-60"
                    >
                      <Send size={16} strokeWidth={2} />
                      Email student
                    </button>
                    <button
                      onClick={() => setShowArchiveModal(true)}
                      disabled={updating}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-500/50 bg-slate-500/20 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-500/30 disabled:opacity-60"
                    >
                      <Archive size={16} strokeWidth={2} />
                      Archive
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={updating}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-60"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Status change confirmation modal */}
        {confirmStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setConfirmStatus(null)}>
            <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-slate-900 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <p className="text-slate-200">
                Are you sure you want to <strong className="text-white">{statusConfirmLabel[confirmStatus]}</strong> this enrollment?
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmStatus(null)}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(confirmStatus)}
                  disabled={updating}
                  className="rounded-xl bg-maroon-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {updating ? 'Updating…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Archive modal */}
        {showArchiveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowArchiveModal(false)}>
            <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-slate-900 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white">Archive enrollment</h3>
              <p className="mt-2 text-sm text-slate-300">
                Move this enrollment to the archive. It will be read-only and organized by school year.
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
                  onClick={() => setShowArchiveModal(false)}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={updating}
                  className="rounded-xl bg-maroon-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {updating ? 'Archiving…' : 'Archive'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDeleteConfirm(false)}>
            <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-slate-900 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white">Delete enrollment</h3>
              <p className="mt-2 text-sm text-slate-300">
                Permanently delete this enrollment? This cannot be undone. Use Archive instead if you want to keep a read-only record.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={updating}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                >
                  {updating ? 'Deleting…' : 'Delete permanently'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email student modal */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto" onClick={() => setShowEmailModal(false)}>
            <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-slate-900 p-6 shadow-xl my-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Mail size={20} strokeWidth={2} />
                Email student
              </h3>
              <p className="mt-1 text-sm text-slate-400">To: {enrollment.email}</p>

              <label className="mt-4 block text-sm font-medium text-slate-300">Email type</label>
              <select
                value={emailType}
                onChange={(e) => onEmailTypeChange(e.target.value as 'approved' | 'rejected' | 'incomplete')}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-slate-200 focus:border-maroon-accent focus:outline-none focus:ring-2 focus:ring-maroon-accent/25"
              >
                <option value="approved">Approved – confirmation & instructions</option>
                <option value="incomplete">Incomplete – missing requirements & resubmit</option>
                <option value="rejected">Rejected – reason & reapply instructions</option>
              </select>

              <label className="mt-4 block text-sm font-medium text-slate-300">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-maroon-accent focus:outline-none focus:ring-2 focus:ring-maroon-accent/25"
                placeholder="Email subject"
              />

              <label className="mt-4 block text-sm font-medium text-slate-300">Message (edit as needed)</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={10}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-maroon-accent focus:outline-none focus:ring-2 focus:ring-maroon-accent/25 resize-y"
                placeholder="Type instructions, deadline, missing requirements, or rejection reason..."
              />

              <label className="mt-4 block text-sm font-medium text-slate-300">Attachment (optional, max 10MB)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="file"
                  id="email-attachment"
                  onChange={onEmailFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="email-attachment"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10"
                >
                  <Paperclip size={18} strokeWidth={2} />
                  {emailFile ? emailFile.name : 'Choose file'}
                </label>
                {emailFile && (
                  <button
                    type="button"
                    onClick={() => setEmailFile(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-maroon-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 size={16} strokeWidth={2} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={16} strokeWidth={2} />
                      Send email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.03] px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-accent/20 text-maroon-accent">
              <User size={20} strokeWidth={2} />
            </div>
            <h2 className="text-lg font-semibold text-slate-200">
              Basic Information
            </h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-[140px_1fr]">
              <Row label="Full name" icon={User}>
                {[bi.firstName, bi.middleName, bi.lastName, bi.suffix]
                  .filter(Boolean)
                  .join(' ') || '—'}
              </Row>
              <Row label="Birthdate" icon={Calendar}>
                {bi.birthdate || '—'}
              </Row>
              <Row label="Birth place" icon={MapPin}>
                {bi.birthPlace || '—'}
              </Row>
              <Row label="Gender">{bi.gender || '—'}</Row>
              <Row label="Mother" icon={Users}>{bi.motherName || '—'}</Row>
              <Row label="Father" icon={Users}>{bi.fatherName || '—'}</Row>
              <Row label="Guardian" icon={Users}>
                {bi.guardianName || '—'}
              </Row>
              <Row label="Guardian contact" icon={Phone}>
                {bi.guardianContact || '—'}
              </Row>
            </dl>
          </div>
        </section>

        {/* School Background */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.03] px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <GraduationCap size={20} strokeWidth={2} />
            </div>
            <h2 className="text-lg font-semibold text-slate-200">
              School Background
            </h2>
          </div>
          <div className="p-6">
            {sb.elementary?.length ? (
              <div className="mb-5">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/70">
                  <School size={14} strokeWidth={2} />
                  Elementary
                </h3>
                <ul className="space-y-2 text-sm text-slate-200">
                  {sb.elementary.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-4 py-3"
                    >
                      <span className="font-medium">{r.schoolName}</span>
                      <span className="text-white/50">—</span>
                      <span>{r.location || '—'}</span>
                      <span className="text-white/50">
                        ({r.yearFrom}–{r.yearTo})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {sb.juniorHigh?.length ? (
              <div className="mb-5">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/70">
                  <School size={14} strokeWidth={2} />
                  Junior High
                </h3>
                <ul className="space-y-2 text-sm text-slate-200">
                  {sb.juniorHigh.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-4 py-3"
                    >
                      <span className="font-medium">{r.schoolName}</span>
                      <span className="text-white/50">—</span>
                      <span>{r.location || '—'}</span>
                      <span className="text-white/50">
                        ({r.yearFrom}–{r.yearTo})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {sb.highSchool?.length ? (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/70">
                  <School size={14} strokeWidth={2} />
                  Senior High School
                </h3>
                <ul className="space-y-2 text-sm text-slate-200">
                  {sb.highSchool.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-4 py-3"
                    >
                      <span className="font-medium">{r.schoolName}</span>
                      <span className="text-white/50">—</span>
                      <span>{r.location || '—'}</span>
                      <span className="text-white/50">
                        ({r.yearFrom}–{r.yearTo})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {!sb.elementary?.length &&
              !sb.juniorHigh?.length &&
              !sb.highSchool?.length && (
                <p className="m-0 flex items-center gap-2 text-sm text-white/50">
                  <School size={16} strokeWidth={2} />
                  No school background provided.
                </p>
              )}
          </div>
        </section>
        </div>

        {/* Right: Documents sidebar - sticky so it stays visible */}
        <aside className="lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.03] px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/20 text-slate-400">
                <FileText size={20} strokeWidth={2} />
              </div>
              <h2 className="text-lg font-semibold text-slate-200">Documents</h2>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-6">
              {documents.length === 0 ? (
                <p className="m-0 flex items-center gap-2 text-sm text-white/50">
                  <FileText size={16} strokeWidth={2} />
                  No documents uploaded.
                </p>
              ) : (
                <ul className="m-0 list-none space-y-2 p-0">
                  {documents.map((d) => (
                    <li key={d.id}>
                      <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                        <FileText size={18} strokeWidth={2} className="shrink-0 text-white/50" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-slate-100">{d.name}</div>
                          <div className="mt-0.5 text-xs text-slate-400 truncate">
                            {d.type || 'Document'}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(d)}
                            className="rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/10"
                          >
                            Preview
                          </button>
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-maroon-accent hover:bg-maroon-accent/15"
                          >
                            <ExternalLink size={14} strokeWidth={2} />
                            Download
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* Document preview modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border border-white/[0.1] bg-slate-950/95 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-white">
                  {previewDoc.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {previewDoc.type || 'Document preview'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-maroon-accent hover:bg-maroon-accent/15"
                >
                  <ExternalLink size={14} strokeWidth={2} />
                  Open in new tab
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-2 max-h-[70vh] overflow-hidden rounded-xl border border-white/10 bg-black/60">
              {previewDoc.type?.startsWith('image/') ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : previewDoc.type === 'application/pdf' ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="h-[70vh] w-full border-0"
                />
              ) : (
                <div className="flex h-64 flex-col items-center justify-center gap-3 px-4 text-center text-sm text-slate-300">
                  <FileText size={28} strokeWidth={2} className="text-white/50" />
                  <p>
                    Preview is not available for this file type. Use{' '}
                    <span className="font-semibold text-maroon-accent">Open in new tab</span> to
                    view or download.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="flex items-center gap-2 font-medium text-white/50">
        {Icon && <Icon size={14} strokeWidth={2} />}
        {label}
      </dt>
      <dd className="m-0 text-slate-200">{children}</dd>
    </>
  );
}
