'use client';

import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Check, CircleAlert, LoaderCircle, X } from 'lucide-react';
import AdminOnly from '@/components/AdminOnly';
import { getFirebaseDb } from '@/lib/firebase';

type QuestionReport = {
  id: string;
  questionId: string;
  reason: string;
  details: string;
  name: string;
  status: 'open' | 'reviewed' | 'dismissed';
  createdAt: number;
};

export default function QuestionReportsPage() {
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const db = getFirebaseDb();

  useEffect(() => {
    if (!db) return;
    return onSnapshot(query(collection(db, 'questionReports'), orderBy('createdAt', 'desc'), limit(100)), snapshot => {
      setReports(snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as QuestionReport));
      setError('');
      setLoading(false);
    }, reason => {
      console.error('Question report loading failed:', reason);
      setError('Could not load question reports.');
      setLoading(false);
    });
  }, [db]);

  const setReportStatus = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    if (!db) {
      setError('Firebase is not configured.');
      return;
    }
    setUpdating(reportId);
    setError('');
    try {
      await updateDoc(doc(db, 'questionReports', reportId), { status, reviewedAt: serverTimestamp() });
    } catch (reason) {
      console.error('Question report update failed:', reason);
      setError('Could not update this report. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const openReports = reports.filter(report => report.status === 'open');

  return (
    <AdminOnly title="Question review">
      <section className="mt-7">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1E1E1E]/55">
          <CircleAlert className="h-4 w-4" /> {openReports.length} open report{openReports.length === 1 ? '' : 's'} · latest 100
        </div>
        {(error || !db) && <p role="alert" className="mb-4 rounded-xl bg-[#EA4335]/8 p-3 text-sm text-[#9F2C23]">{error || 'Firebase is not configured.'}</p>}
        {loading && <div className="flex min-h-40 items-center justify-center" role="status"><LoaderCircle className="h-6 w-6 animate-spin text-[#3186FF]" /></div>}
        {!loading && reports.length === 0 && <p className="glass-card p-6 text-sm text-[#1E1E1E]/55">No question reports yet.</p>}
        <div className="space-y-3">
          {reports.map(report => (
            <article key={report.id} className="glass-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-[#1E1E1E]">{report.reason.replaceAll('_', ' ')}</p>
                  <p className="mt-1 text-xs text-[#1E1E1E]/50">Question {report.questionId} · {report.name} · {new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${report.status === 'open' ? 'bg-[#FBBC05]/15 text-[#725000]' : report.status === 'reviewed' ? 'bg-[#34A853]/10 text-[#277D3E]' : 'bg-[#1E1E1E]/5 text-[#1E1E1E]/50'}`}>
                  {report.status}
                </span>
              </div>
              {report.details && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#1E1E1E]/70">{report.details}</p>}
              {report.status === 'open' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" disabled={updating === report.id} onClick={() => void setReportStatus(report.id, 'reviewed')} className="btn-primary min-h-10 !px-4 !py-2 disabled:opacity-50">
                    {updating === report.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Mark reviewed
                  </button>
                  <button type="button" disabled={updating === report.id} onClick={() => void setReportStatus(report.id, 'dismissed')} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#1E1E1E]/10 px-4 py-2 text-sm font-bold text-[#1E1E1E]/65 disabled:opacity-50">
                    <X className="h-4 w-4" /> Dismiss
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </AdminOnly>
  );
}
