import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const PERIOD_OPTIONS = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SIX_MONTHS', label: '6 Months' },
  { value: 'YEARLY', label: 'Yearly' },
];

function toYMD(d) {
  if (!d) return '';
  const x = new Date(d);
  return x.toISOString().slice(0, 10);
}

function formatCurrency(n) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function downloadCsv(headers, rows, filename) {
  const escape = (v) => (v == null ? '' : String(v).replace(/"/g, '""'));
  const line = (arr) => arr.map((c) => `"${escape(c)}"`).join(',');
  const content = [line(headers), ...rows.map((r) => line(r))].join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename || 'export.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AccountingPage() {
  const { user } = useAuth();
  const institutionId = user?.institutionId;
  const [tab, setTab] = useState('ledger');
  const [ledgerType, setLedgerType] = useState('member');
  const [coaLoaded, setCoaLoaded] = useState(false);
  const [start, setStart] = useState(toYMD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
  const [end, setEnd] = useState(toYMD(new Date()));
  const [periodType, setPeriodType] = useState('MONTHLY');
  const [memberId, setMemberId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [members, setMembers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [memberLedger, setMemberLedger] = useState([]);
  const [generalLedger, setGeneralLedger] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalRef, setJournalRef] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [reports, setReports] = useState({ savingsByProduct: null, loanSummary: null, memberSummary: null, cashFlow: null, incomeStatement: null, balanceSheet: null });
  const [reportTab, setReportTab] = useState('savings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!institutionId) return;
    api.get('/members', { params: { saccoId: institutionId } })
      .then(({ data }) => { if (data?.success && data?.data) setMembers(data.data); })
      .catch(() => {});
    api.get('/accounting/accounts', { params: { institutionId, activeOnly: false } })
      .then(({ data }) => { if (data?.success && data?.data) setAccounts(data.data); setCoaLoaded(true); })
      .catch(() => setCoaLoaded(true));
  }, [institutionId]);

  const fetchMemberLedger = () => {
    if (!institutionId || !memberId || !start || !end) return;
    setLoading(true);
    setError('');
    api.get('/accounting/ledger/member', { params: { memberId, institutionId, start, end } })
      .then(({ data }) => { if (data?.success && data?.data) setMemberLedger(data.data); })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load member ledger'))
      .finally(() => setLoading(false));
  };

  const fetchGeneralLedger = () => {
    if (!institutionId || !accountId || !start || !end) return;
    setLoading(true);
    setError('');
    api.get('/accounting/ledger/general', { params: { accountId, institutionId, start, end } })
      .then(({ data }) => { if (data?.success && data?.data) setGeneralLedger(data.data); })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load general ledger'))
      .finally(() => setLoading(false));
  };

  const fetchJournal = () => {
    if (!institutionId || !start || !end) return;
    setLoading(true);
    setError('');
    api.get('/accounting/entries', { params: { institutionId, start, end, referenceNumber: journalRef || undefined } })
      .then(({ data }) => { if (data?.success && data?.data) setJournalEntries(data.data); })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load journal'))
      .finally(() => setLoading(false));
  };

  const loadReports = () => {
    if (!institutionId) return;
    setLoading(true);
    setError('');
    const asOf = end || toYMD(new Date());
    const params = { institutionId, saccoId: institutionId, start, end, periodType, asOf };
    Promise.all([
      api.get('/reports/savings-by-product', { params: { ...params, institutionId, start, end, periodType, asOf } }).then(({ data }) => data?.success && data?.data && { key: 'savingsByProduct', data: data.data }),
      api.get('/reports/loan-summary', { params: { saccoId: institutionId, asOf } }).then(({ data }) => data?.success && data?.data && { key: 'loanSummary', data: data.data }),
      api.get('/reports/member-financial-summary', { params: { saccoId: institutionId, asOf } }).then(({ data }) => data?.success && data?.data && { key: 'memberSummary', data: data.data }),
      api.get('/reports/cash-flow', { params: { institutionId, start, end, periodType, asOf } }).then(({ data }) => data?.success && data?.data && { key: 'cashFlow', data: data.data }),
      api.get('/reports/income-statement', { params: { institutionId, start, end, periodType, asOf } }).then(({ data }) => data?.success && data?.data && { key: 'incomeStatement', data: data.data }),
      api.get('/reports/balance-sheet', { params: { institutionId, asOf } }).then(({ data }) => data?.success && data?.data && { key: 'balanceSheet', data: data.data }),
    ])
      .then((results) => {
        setReports((prev) => {
          const next = { ...prev };
          results.forEach((r) => { if (r) next[r.key] = r.data; });
          return next;
        });
      })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load reports'))
      .finally(() => setLoading(false));
  };

  const handleLedgerGo = () => {
    if (ledgerType === 'member') fetchMemberLedger();
    else fetchGeneralLedger();
  };

  const handleExportLedger = () => {
    const data = ledgerType === 'member' ? memberLedger : generalLedger;
    if (!data?.length) return;
    if (ledgerType === 'member') {
      downloadCsv(
        ['Date', 'Member Name', 'Product Type', 'Description', 'Debit', 'Credit', 'Running Balance'],
        data.map((r) => [r.date, r.memberName, r.productType, r.description, r.debit, r.credit, r.runningBalance]),
        'member-ledger.csv'
      );
    } else {
      downloadCsv(
        ['Date', 'Account Name', 'Account Code', 'Description', 'Debit', 'Credit', 'Balance'],
        data.map((r) => [r.date, r.accountName, r.accountCode, r.description, r.debit, r.credit, r.balance]),
        'general-ledger.csv'
      );
    }
  };

  if (!institutionId && user?.role !== 'SUPER_ADMIN') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-forest">Accounting</h1>
        <p className="mt-2 text-polished/80">You are not linked to an institution. Accounting is available per SACCO.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-forest">Accounting</h1>
      <p className="mt-2 text-polished/80">Ledgers, journal entries, and financial reports. Filter by date and export to CSV.</p>

      <div className="mt-6 flex gap-2 border-b border-champagne/30">
        {[
          { id: 'ledger', label: 'Ledgers' },
          { id: 'journal', label: 'Journal' },
          { id: 'chart', label: 'Chart of Accounts' },
          { id: 'reports', label: 'Reports' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 font-medium ${tab === id ? 'border-b-2 border-forest text-forest' : 'text-polished/80 hover:text-forest'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'ledger' && (
        <div className="mt-8 rounded-xl border border-champagne/20 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-forest mb-4">Ledger</h2>
          <div className="flex flex-wrap gap-4 items-end mb-6">
            <label className="flex items-center gap-2">
              <input type="radio" checked={ledgerType === 'member'} onChange={() => setLedgerType('member')} />
              Member Ledger
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={ledgerType === 'general'} onChange={() => setLedgerType('general')} />
              General Ledger
            </label>
            {ledgerType === 'member' && (
              <div>
                <label className="block text-sm text-polished/80">Member</label>
                <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="rounded-lg border border-bronze/30 px-3 py-2 min-w-[200px]">
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.memberNumber})</option>
                  ))}
                </select>
              </div>
            )}
            {ledgerType === 'general' && (
              <div>
                <label className="block text-sm text-polished/80">Account</label>
                <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="rounded-lg border border-bronze/30 px-3 py-2 min-w-[200px]">
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.code} – {a.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm text-polished/80">Start</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border border-bronze/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-polished/80">End</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border border-bronze/30 px-3 py-2" />
            </div>
            <button type="button" onClick={handleLedgerGo} disabled={loading} className="rounded-lg bg-forest px-4 py-2 font-semibold text-offwhite hover:bg-emerald disabled:opacity-50">
              {loading ? 'Loading…' : 'Load'}
            </button>
            <button type="button" onClick={handleExportLedger} disabled={!(ledgerType === 'member' ? memberLedger : generalLedger).length} className="rounded-lg border border-forest px-4 py-2 text-forest hover:bg-forest/10 disabled:opacity-50">
              Export CSV
            </button>
          </div>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <div className="overflow-x-auto">
            {ledgerType === 'member' && (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-forest/30 text-left">
                      <th className="p-3 font-semibold">Date</th>
                      <th className="p-3 font-semibold">Member Name</th>
                      <th className="p-3 font-semibold">Product Type</th>
                      <th className="p-3 font-semibold">Description</th>
                      <th className="p-3 font-semibold text-right">Debit (ETB)</th>
                      <th className="p-3 font-semibold text-right">Credit (ETB)</th>
                      <th className="p-3 font-semibold text-right">Running Balance (ETB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberLedger.length === 0 && !loading && (
                      <tr><td colSpan={7} className="p-8 text-center text-polished/70">No ledger lines in this date range. Record savings deposits or withdrawals to see entries.</td></tr>
                    )}
                    {memberLedger.map((r, i) => (
                      <tr key={i} className="border-b border-champagne/10 hover:bg-champagne/5">
                        <td className="p-3">{r.date}</td>
                        <td className="p-3">{r.memberName}</td>
                        <td className="p-3">{r.productType ?? '—'}</td>
                        <td className="p-3">{r.description ?? '—'}</td>
                        <td className="p-3 text-right tabular-nums">{formatCurrency(r.debit)}</td>
                        <td className="p-3 text-right tabular-nums">{formatCurrency(r.credit)}</td>
                        <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.runningBalance)}</td>
                      </tr>
                    ))}
                    {memberLedger.length > 0 && (
                      <tr className="border-t-2 border-forest/20 bg-champagne/10 font-semibold">
                        <td colSpan={4} className="p-3 text-right">Totals</td>
                        <td className="p-3 text-right tabular-nums">{formatCurrency(memberLedger.reduce((s, r) => s + Number(r.debit || 0), 0))}</td>
                        <td className="p-3 text-right tabular-nums">{formatCurrency(memberLedger.reduce((s, r) => s + Number(r.credit || 0), 0))}</td>
                        <td className="p-3 text-right tabular-nums">{formatCurrency(memberLedger[memberLedger.length - 1]?.runningBalance)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
            {ledgerType === 'general' && (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-forest/30 text-left">
                      <th className="p-3 font-semibold">Date</th>
                      <th className="p-3 font-semibold">Account</th>
                      <th className="p-3 font-semibold">Description</th>
                      <th className="p-3 font-semibold text-right">Debit (ETB)</th>
                      <th className="p-3 font-semibold text-right">Credit (ETB)</th>
                      <th className="p-3 font-semibold text-right">Balance (ETB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalLedger.length === 0 && !loading && (
                      <tr><td colSpan={6} className="p-8 text-center text-polished/70">No lines for this account in this date range.</td></tr>
                    )}
                    {generalLedger.map((r, i) => (
                      <tr key={i} className="border-b border-champagne/10 hover:bg-champagne/5">
                        <td className="p-3">{r.date}</td>
                        <td className="p-3">{r.accountName} <span className="text-polished/70">({r.accountCode})</span></td>
                        <td className="p-3">{r.description ?? '—'}</td>
                        <td className="p-3 text-right tabular-nums">{formatCurrency(r.debit)}</td>
                        <td className="p-3 text-right tabular-nums">{formatCurrency(r.credit)}</td>
                        <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.balance)}</td>
                      </tr>
                    ))}
                    {generalLedger.length > 0 && (
                      <tr className="border-t-2 border-forest/20 bg-champagne/10 font-semibold">
                        <td colSpan={3} className="p-3 text-right">Totals</td>
                        <td className="p-3 text-right tabular-nums">{formatCurrency(generalLedger.reduce((s, r) => s + Number(r.debit || 0), 0))}</td>
                        <td className="p-3 text-right tabular-nums">{formatCurrency(generalLedger.reduce((s, r) => s + Number(r.credit || 0), 0))}</td>
                        <td className="p-3 text-right tabular-nums">{formatCurrency(generalLedger[generalLedger.length - 1]?.balance)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'journal' && (
        <div className="mt-8 rounded-xl border border-champagne/20 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-forest mb-2">Journal</h2>
          <p className="text-sm text-polished/80 mb-4">All double-entry postings. Each entry has at least two lines (debit = credit). Expand to see lines.</p>
          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div>
              <label className="block text-sm text-polished/80">Start</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border border-bronze/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-polished/80">End</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border border-bronze/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-polished/80">Ref. number</label>
              <input type="text" value={journalRef} onChange={(e) => setJournalRef(e.target.value)} placeholder="Search by ref" className="rounded-lg border border-bronze/30 px-3 py-2 w-40" />
            </div>
            <button type="button" onClick={fetchJournal} disabled={loading || !institutionId} className="rounded-lg bg-forest px-4 py-2 font-semibold text-offwhite hover:bg-emerald disabled:opacity-50">
              {loading ? 'Loading…' : 'Load'}
            </button>
          </div>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-forest/30 text-left">
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Ref No</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Description</th>
                  <th className="p-3 font-semibold text-right">Total Debit (ETB)</th>
                  <th className="p-3 font-semibold text-right">Total Credit (ETB)</th>
                  <th className="p-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {journalEntries.length === 0 && !loading && (
                  <tr><td colSpan={7} className="p-8 text-center text-polished/70">No journal entries in this date range. Entries are created when you record savings, transfers, or loans.</td></tr>
                )}
                {journalEntries.map((e) => (
                  <tr key={e.id} className="border-b border-champagne/10 hover:bg-champagne/5">
                    <td className="p-3">{e.entryDate}</td>
                    <td className="p-3 font-mono text-polished/90">{e.referenceNumber ?? '—'}</td>
                    <td className="p-3 text-polished/80">{e.referenceType ?? '—'}</td>
                    <td className="p-3">{e.description ?? '—'}</td>
                    <td className="p-3 text-right tabular-nums">{formatCurrency(e.totalDebit)}</td>
                    <td className="p-3 text-right tabular-nums">{formatCurrency(e.totalCredit)}</td>
                    <td className="p-3">
                      <button type="button" onClick={() => setSelectedEntry(selectedEntry?.id === e.id ? null : e)} className="text-forest font-medium hover:underline">
                        {selectedEntry?.id === e.id ? 'Hide lines' : 'Show lines'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedEntry?.lines?.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-forest">
                <p className="font-medium text-polished/80 mb-2">Lines</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Account</th>
                      <th className="p-2">Product</th>
                      <th className="p-2 text-right">Debit</th>
                      <th className="p-2 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="p-2">{l.accountCode} {l.accountName}</td>
                        <td className="p-2">{l.productCategory ?? l.productType ?? '—'}</td>
                        <td className="p-2 text-right">{formatCurrency(l.debit)}</td>
                        <td className="p-2 text-right">{formatCurrency(l.credit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'chart' && (
        <div className="mt-8 rounded-xl border border-champagne/20 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-forest mb-2">Chart of Accounts</h2>
          <p className="text-sm text-polished/80 mb-4">All GL accounts for this institution. Used for double-entry postings and general ledger.</p>
          {!coaLoaded ? (
            <p className="text-polished/70">Loading…</p>
          ) : !accounts.length ? (
            <p className="text-polished/70 py-6">No accounts found. Accounts are created automatically when you record savings (e.g. Cash, Member Savings liability).</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-forest/30 text-left">
                    <th className="p-3 font-semibold">Code</th>
                    <th className="p-3 font-semibold">Account Name</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr key={a.id} className="border-b border-champagne/15 hover:bg-champagne/5">
                      <td className="p-3 font-mono text-polished/90">{a.code}</td>
                      <td className="p-3">{a.name}</td>
                      <td className="p-3">{a.type || '—'}</td>
                      <td className="p-3">{a.isActive !== false ? 'Active' : 'Inactive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="mt-8 rounded-xl border border-champagne/20 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-forest mb-2">Financial Reports</h2>
          <p className="text-sm text-polished/80 mb-4">Institution-level summaries. Use period preset or custom date range, then click Load Reports.</p>
          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div>
              <label className="block text-sm text-polished/80">Period preset</label>
              <select
                value={periodType}
                onChange={(e) => {
                  const v = e.target.value;
                  setPeriodType(v);
                  const endDate = end ? new Date(end) : new Date();
                  const d = new Date(endDate);
                  if (v === 'WEEKLY') d.setDate(d.getDate() - 7);
                  else if (v === 'MONTHLY') d.setMonth(d.getMonth() - 1);
                  else if (v === 'QUARTERLY') d.setMonth(d.getMonth() - 3);
                  else if (v === 'SIX_MONTHS') d.setMonth(d.getMonth() - 6);
                  else if (v === 'YEARLY') d.setFullYear(d.getFullYear() - 1);
                  setStart(toYMD(d));
                }}
                className="rounded-lg border border-bronze/30 px-3 py-2"
              >
                {PERIOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-polished/80">Start</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border border-bronze/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-polished/80">End / As of</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border border-bronze/30 px-3 py-2" />
            </div>
            <button type="button" onClick={loadReports} disabled={loading || !institutionId} className="rounded-lg bg-forest px-4 py-2 font-semibold text-offwhite hover:bg-emerald disabled:opacity-50">
              {loading ? 'Loading…' : 'Load Reports'}
            </button>
          </div>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <div className="flex gap-2 border-b border-champagne/30 mb-4">
            {['savings', 'loan', 'memberSummary', 'cashFlow', 'incomeStatement', 'balanceSheet'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReportTab(r)}
                className={`px-3 py-1.5 text-sm font-medium ${reportTab === r ? 'border-b-2 border-forest text-forest' : 'text-polished/80'}`}
              >
                {r === 'memberSummary' ? 'Member Summary' : r === 'cashFlow' ? 'Cash Flow' : r === 'incomeStatement' ? 'Income Statement' : r === 'balanceSheet' ? 'Balance Sheet' : r === 'loan' ? 'Loan Report' : 'Savings Report'}
              </button>
            ))}
          </div>
          {reportTab === 'savings' && reports.savingsByProduct && (
            <div className="report-panel">
              <h3 className="text-lg font-bold text-forest mb-1">{reports.savingsByProduct.institutionName}</h3>
              <p className="text-sm text-polished/80 mb-4">Savings by Product · {reports.savingsByProduct.periodLabel}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-forest/30 text-left">
                    <th className="p-3 font-semibold">Product Type</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold text-right">Deposits (ETB)</th>
                    <th className="p-3 font-semibold text-right">Withdrawals (ETB)</th>
                    <th className="p-3 font-semibold text-right">Net (ETB)</th>
                  </tr>
                </thead>
                <tbody>
                  {(reports.savingsByProduct.rows || []).map((row, i) => (
                    <tr key={i} className="border-b border-champagne/10">
                      <td className="p-3">{row.productType}</td>
                      <td className="p-3">{row.productCategory}</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.totalDeposits)}</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.totalWithdrawals)}</td>
                      <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(row.netBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {reportTab === 'loan' && reports.loanSummary && (
            <div className="report-panel">
              <h3 className="text-lg font-bold text-forest mb-1">{reports.loanSummary.institutionName}</h3>
              <p className="text-sm text-polished/80 mb-4">Loan Summary · {reports.loanSummary.periodLabel}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-4 rounded-lg bg-champagne/10">
                <div><span className="text-polished/70 text-xs block">Total Disbursed</span><span className="font-semibold tabular-nums">{formatCurrency(reports.loanSummary.totalDisbursed)}</span></div>
                <div><span className="text-polished/70 text-xs block">Total Repaid</span><span className="font-semibold tabular-nums">{formatCurrency(reports.loanSummary.totalRepaid)}</span></div>
                <div><span className="text-polished/70 text-xs block">Outstanding</span><span className="font-semibold tabular-nums">{formatCurrency(reports.loanSummary.totalOutstanding)}</span></div>
                <div><span className="text-polished/70 text-xs block">Interest Collected</span><span className="font-semibold tabular-nums">{formatCurrency(reports.loanSummary.totalInterestCollected)}</span></div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-forest/30 text-left">
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold text-right">Disbursed (ETB)</th>
                    <th className="p-3 font-semibold text-right">Repaid (ETB)</th>
                    <th className="p-3 font-semibold text-right">Outstanding (ETB)</th>
                    <th className="p-3 font-semibold text-right">Interest (ETB)</th>
                  </tr>
                </thead>
                <tbody>
                  {(reports.loanSummary.rows || []).map((row, i) => (
                    <tr key={i} className="border-b border-champagne/10">
                      <td className="p-3">{row.category}</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.totalDisbursed)}</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.totalRepaid)}</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.outstanding)}</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.interestCollected)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {reportTab === 'memberSummary' && reports.memberSummary && (
            <div className="report-panel overflow-x-auto">
              <h3 className="text-lg font-bold text-forest mb-1">{reports.memberSummary.institutionName}</h3>
              <p className="text-sm text-polished/80 mb-4">Member Financial Summary · {reports.memberSummary.periodLabel}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-forest/30 text-left">
                    <th className="p-3 font-semibold">Member</th>
                    <th className="p-3 font-semibold text-right">Savings (ETB)</th>
                    <th className="p-3 font-semibold text-right">Loans (ETB)</th>
                    <th className="p-3 font-semibold text-right">Outstanding (ETB)</th>
                    <th className="p-3 font-semibold text-right">Interest Paid (ETB)</th>
                  </tr>
                </thead>
                <tbody>
                  {(reports.memberSummary.rows || []).map((row, i) => (
                    <tr key={i} className="border-b border-champagne/10">
                      <td className="p-3">{row.memberName} <span className="text-polished/70">({row.memberNumber})</span></td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.totalSavings)}</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.totalLoans)}</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.outstandingLoan)}</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.interestPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {reportTab === 'cashFlow' && reports.cashFlow && (
            <div className="report-panel">
              <h3 className="text-lg font-bold text-forest mb-1">{reports.cashFlow.institutionName}</h3>
              <p className="text-sm text-polished/80 mb-4">Cash Flow Statement · {reports.cashFlow.periodLabel}</p>
              <div className="max-w-md space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-champagne/20">
                  <span>Opening balance (cash)</span>
                  <span className="tabular-nums font-medium">{formatCurrency(reports.cashFlow.openingBalance)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-champagne/20 text-emerald-700">
                  <span>+ Savings deposits</span>
                  <span className="tabular-nums">{formatCurrency(reports.cashFlow.savingsDeposits)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-champagne/20 text-emerald-700">
                  <span>+ Loan repayments</span>
                  <span className="tabular-nums">{formatCurrency(reports.cashFlow.loanRepayments)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-champagne/20 text-red-700">
                  <span>− Loan disbursements</span>
                  <span className="tabular-nums">{formatCurrency(reports.cashFlow.loanDisbursements)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-champagne/20 text-red-700">
                  <span>− Withdrawals</span>
                  <span className="tabular-nums">{formatCurrency(reports.cashFlow.withdrawals)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-champagne/20 text-red-700">
                  <span>− Expenses</span>
                  <span className="tabular-nums">{formatCurrency(reports.cashFlow.expenses)}</span>
                </div>
                <div className="flex justify-between py-2 mt-2 border-t-2 border-forest/30 font-bold">
                  <span>Closing balance (cash)</span>
                  <span className="tabular-nums">{formatCurrency(reports.cashFlow.closingBalance)}</span>
                </div>
              </div>
            </div>
          )}
          {reportTab === 'incomeStatement' && reports.incomeStatement && (
            <div className="report-panel">
              <h3 className="text-lg font-bold text-forest mb-1">{reports.incomeStatement.institutionName}</h3>
              <p className="text-sm text-polished/80 mb-4">Income Statement · {reports.incomeStatement.periodLabel}</p>
              <div className="space-y-4">
                <section>
                  <h4 className="font-semibold text-forest mb-2">Income</h4>
                  <ul className="space-y-1 pl-4">{(reports.incomeStatement.income || []).map((item, i) => <li key={i} className="flex justify-between"><span>{item.accountName}</span><span className="tabular-nums">{formatCurrency(item.amount)}</span></li>)}</ul>
                  <p className="text-right font-medium border-t border-champagne/30 pt-2 mt-2">Total Income: {formatCurrency((reports.incomeStatement.income || []).reduce((s, i) => s + Number(i.amount || 0), 0))}</p>
                </section>
                <section>
                  <h4 className="font-semibold text-forest mb-2">Expenses</h4>
                  <ul className="space-y-1 pl-4">{(reports.incomeStatement.expenses || []).map((item, i) => <li key={i} className="flex justify-between"><span>{item.accountName}</span><span className="tabular-nums">{formatCurrency(item.amount)}</span></li>)}</ul>
                  <p className="text-right font-medium border-t border-champagne/30 pt-2 mt-2">Total Expenses: {formatCurrency((reports.incomeStatement.expenses || []).reduce((s, i) => s + Number(i.amount || 0), 0))}</p>
                </section>
                <p className="text-lg font-bold border-t-2 border-forest/30 pt-3">Net Income: {formatCurrency(reports.incomeStatement.netIncome)}</p>
              </div>
            </div>
          )}
          {reportTab === 'balanceSheet' && reports.balanceSheet && (
            <div className="report-panel">
              <h3 className="text-lg font-bold text-forest mb-1">{reports.balanceSheet.institutionName}</h3>
              <p className="text-sm text-polished/80 mb-4">Balance Sheet · {reports.balanceSheet.periodLabel}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <section>
                  <h4 className="font-semibold text-forest mb-2">Assets</h4>
                  <ul className="space-y-1 pl-4">{(reports.balanceSheet.assets || []).map((item, i) => <li key={i} className="flex justify-between"><span>{item.accountName}</span><span className="tabular-nums">{formatCurrency(item.amount)}</span></li>)}</ul>
                  <p className="font-medium border-t border-champagne/30 pt-2 mt-2">Total Assets: {formatCurrency(reports.balanceSheet.totalAssets)}</p>
                </section>
                <section>
                  <h4 className="font-semibold text-forest mb-2">Liabilities</h4>
                  <ul className="space-y-1 pl-4">{(reports.balanceSheet.liabilities || []).map((item, i) => <li key={i} className="flex justify-between"><span>{item.accountName}</span><span className="tabular-nums">{formatCurrency(item.amount)}</span></li>)}</ul>
                  <p className="font-medium border-t border-champagne/30 pt-2 mt-2">Total Liabilities: {formatCurrency(reports.balanceSheet.totalLiabilities)}</p>
                  <h4 className="font-semibold text-forest mt-4 mb-2">Equity</h4>
                  <ul className="space-y-1 pl-4">{(reports.balanceSheet.equity || []).map((item, i) => <li key={i} className="flex justify-between"><span>{item.accountName}</span><span className="tabular-nums">{formatCurrency(item.amount)}</span></li>)}</ul>
                  <p className="font-medium border-t border-champagne/30 pt-2 mt-2">Total Equity: {formatCurrency(reports.balanceSheet.totalEquity)}</p>
                </section>
              </div>
            </div>
          )}
          {reportTab && !reports[reportTab] && !loading && (
            <p className="text-polished/70 py-6">Click &quot;Load Reports&quot; to load data for the selected period.</p>
          )}
          {reportTab && reports[reportTab] && ['savings', 'loan', 'memberSummary'].includes(reportTab) && reports[reportTab]?.rows?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-champagne/20">
              <button
                type="button"
                onClick={() => {
                  const r = reports[reportTab];
                  if (reportTab === 'savings') {
                    downloadCsv(['Product Type', 'Category', 'Deposits', 'Withdrawals', 'Net'], r.rows.map((row) => [row.productType, row.productCategory, row.totalDeposits, row.totalWithdrawals, row.netBalance]), 'savings-by-product.csv');
                  } else if (reportTab === 'loan') {
                    downloadCsv(['Category', 'Disbursed', 'Repaid', 'Outstanding', 'Interest'], r.rows.map((row) => [row.category, row.totalDisbursed, row.totalRepaid, row.outstanding, row.interestCollected]), 'loan-summary.csv');
                  } else if (reportTab === 'memberSummary') {
                    downloadCsv(['Member', 'Member Number', 'Savings', 'Loans', 'Outstanding', 'Interest Paid'], r.rows.map((row) => [row.memberName, row.memberNumber, row.totalSavings, row.totalLoans, row.outstandingLoan, row.interestPaid]), 'member-financial-summary.csv');
                  }
                }}
                className="rounded-lg border border-forest px-3 py-1.5 text-sm text-forest hover:bg-forest/10"
              >
                Export current report (CSV)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
