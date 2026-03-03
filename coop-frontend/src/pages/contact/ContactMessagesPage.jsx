import { useState, useEffect } from 'react';
import api from '../../api/client';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchMessages = () => {
    setLoading(true);
    api
      .get('/contact')
      .then(({ data }) => {
        if (data?.success && data?.data) setMessages(data.data);
      })
      .catch(() => setError('Failed to load messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchMessages(), []);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-polished/70">Loading messages…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-forest">Contact Messages</h1>
        <p className="mt-1 text-sm text-polished/70">
          Messages submitted from the landing page contact form
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="rounded-lg border border-champagne/30 bg-offwhite/50 p-6 text-center text-polished/70">
              No contact messages yet
            </p>
          ) : (
            messages.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selected?.id === m.id
                    ? 'border-forest bg-forest/5 ring-2 ring-forest/20'
                    : 'border-champagne/30 bg-white hover:border-champagne/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-polished">{m.name}</p>
                    <p className="truncate text-sm text-polished/70">{m.email}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-polished/80">{m.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-polished/50">
                    {formatDate(m.createdAt)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {selected && (
          <div className="rounded-xl border border-champagne/30 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-forest">{selected.name}</h2>
            <a
              href={`mailto:${selected.email}`}
              className="text-emerald hover:underline"
            >
              {selected.email}
            </a>
            <p className="mt-2 text-xs text-polished/50">
              {formatDate(selected.createdAt)}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-polished/90">{selected.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
