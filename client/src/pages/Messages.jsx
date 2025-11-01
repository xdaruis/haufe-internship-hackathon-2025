import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ReviewMessagesPage() {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const fetchMessages = useCallback(async () => {
    if (!reviewId) return;
    setLoading(true);
    setErr('');
    try {
      const { data } = await axios.get(`/api/code/review/${encodeURIComponent(reviewId)}`);
      alert(JSON.stringify(data));
      setMessages(Array.isArray(data?.reviewMessages) ? data.reviewMessages : []);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sorted = useMemo(() => {
    return [...messages].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (ta !== tb) return ta - tb;
      return (a.id ?? 0) - (b.id ?? 0);
    });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← Back
          </button>
          <h1 className="text-base font-semibold text-gray-900">Conversation #{reviewId}</h1>
          <button
            onClick={fetchMessages}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4">
        {err ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((m) => (
              <li key={m.id} className="flex">
                {m.role === 'ASSISTANT' ? <div className="flex-1" /> : null}

                <div
                  className={[
                    'max-w-[80%] rounded-lg px-3 py-2 shadow-sm',
                    m.role === 'CLIENT' && 'bg-indigo-600 text-white',
                    m.role === 'ASSISTANT' && 'bg-white ring-1 ring-gray-200 text-gray-900',
                    m.role === 'SYSTEM' && 'bg-yellow-50 text-yellow-900 ring-1 ring-yellow-200',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="text-[10px] uppercase tracking-wide opacity-70 mb-1">
                    {m.role}
                  </div>
                  <div className="whitespace-pre-wrap break-words text-sm">{m.body}</div>
                  {m.createdAt ? (
                    <div className="mt-1 text-[10px] opacity-60">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  ) : null}
                </div>

                {m.role === 'CLIENT' ? <div className="flex-1" /> : null}
              </li>
            ))}
            {sorted.length === 0 && !err ? (
              <li className="text-sm text-gray-500">No messages yet.</li>
            ) : null}
          </ul>
        )}
      </main>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex">
      <div className="h-16 w-2/3 rounded-lg bg-gray-200 animate-pulse" />
    </div>
  );
}