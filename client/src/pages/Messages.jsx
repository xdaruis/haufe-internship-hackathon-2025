import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ReviewMessagesPage() {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [reviewCode, setReviewCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Chatbox state
  const [modelOptions, setModelOptions] = useState([
    'qwen2.5-coder:0.5b',
    'qwen2.5-coder:1.5b',
    'llama3.2:3b-instruct',
    'mistral:7b-instruct',
  ]);
  const [model, setModel] = useState('qwen2.5-coder:0.5b');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!reviewId) return;
    setLoading(true);
    setErr('');
    try {
      const { data } = await axios.get(`/api/code/review/${encodeURIComponent(reviewId)}`);
      setMessages(Array.isArray(data?.reviewMessages) ? data.reviewMessages : []);

      // Try to pull code if the API includes it
      const inlineCode = data?.review?.code ?? data?.code;
      // alert(JSON.stringify(inlineCode));
      if (typeof inlineCode === 'string') {
        setReviewCode(inlineCode);
      } else {
        // Optional fallback to a meta endpoint if you add it on the server
        try {
          const meta = await axios.get(`/api/code/review/${encodeURIComponent(reviewId)}/meta`);
          const c = meta?.data?.review?.code ?? meta?.data?.code;
          if (typeof c === 'string') setReviewCode(c);
        } catch {
          // ignore
        }
      }
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Load local models from server (optional)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get('/api/models');
        const names = Array.isArray(data?.models)
          ? data.models.map((m) => m.name || m.model).filter(Boolean)
          : [];
        if (mounted && names.length) {
          setModelOptions(names);
          if (!names.includes(model)) setModel(names[0]);
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => {
    return [...messages].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (ta !== tb) return ta - tb;
      return (a.id ?? 0) - (b.id ?? 0);
    });
  }, [messages]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setErr('');
    setSending(true);

    // Optimistic append of client message
    const tempId = Date.now();
    const optimistic = {
      id: tempId,
      role: 'CLIENT',
      body: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await axios.post(`/api/code/follow-up-review`, {
        reviewId,
        model,
        prompt: input,
      });
      setInput('');
      await fetchMessages();
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2?.message || 'Failed to send message.');
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

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

      {/* Review code at top */}
      {reviewCode ? (
        <section className="mx-auto w-full max-w-3xl px-4 py-3">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Code</h2>
          <pre className="bg-gray-100 border border-gray-200 rounded p-3 text-xs font-mono overflow-auto max-h-72 whitespace-pre-wrap">
            {reviewCode}
          </pre>
        </section>
      ) : null}

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

      {/* Chatbox */}
      <footer className="border-t border-gray-200 bg-white">
        <form onSubmit={onSend} className="mx-auto max-w-3xl px-4 py-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={sending}
              className="border rounded px-2 py-1 text-sm"
              aria-label="Model"
            >
              {modelOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              rows={3}
              placeholder="Type your message…"
              className="flex-1 border rounded px-2 py-1 text-sm"
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded h-fit"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </footer>
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