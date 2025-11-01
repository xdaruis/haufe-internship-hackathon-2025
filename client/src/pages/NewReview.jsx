import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewReviewPage() {
  const navigate = useNavigate();

  const [models, setModels] = useState([
    'qwen2.5-coder:0.5b',
    'qwen2.5-coder:1.5b',
    'llama3.2:3b-instruct',
    'mistral:7b-instruct',
  ]);
  const [model, setModel] = useState('qwen2.5-coder:0.5b');

  const [presets, setPresets] = useState([]);
  const [presetKey, setPresetKey] = useState('');

  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formattingPreset = [
    'You are a code formatter.',
    'Reformat the provided code for readability and consistent style.',
    'Do not change behavior or meaning.',
    'Do not rename, reorder logic, introduce new code, or add comments.',
    'Output ONLY the fully formatted code as plain text. No markdown fences, no explanations.',
  ].join('\n');

  useEffect(() => {
    let mounted = true;

    // Load models (optional)
    (async () => {
      try {
        const { data } = await axios.get('/api/code/models');
        const names = Array.isArray(data?.models)
          ? data.models.map((m) => m.model).filter(Boolean)
          : [];
        if (mounted && names.length) {
          setModels(names);
          if (!names.includes(model)) setModel(names[0]);
        }
      } catch {
        /* keep defaults */
      }
    })();

    // Load presets
    (async () => {
      try {
        const { data } = await axios.get('/api/code/prompts'); // expected: { prompts: [{id,name,prompt}, ...] }
        const serverItems = Array.isArray(data?.prompts || data?.presets)
          ? data.prompts || data.presets
          : [];
        const normalized = serverItems
          .map((p) => ({
            id: p.id ?? p.name,
            name: p.name ?? p.title ?? `Preset ${p.id ?? ''}`,
            prompt: p.prompt ?? p.content ?? '',
          }))
          .filter((p) => p.id && p.name && p.prompt);

        const localDefault = {
          id: '__format_only__',
          name: 'Formatting-only (local)',
          prompt: formattingPreset,
        };

        if (mounted) setPresets([localDefault, ...normalized]);
      } catch {
        if (mounted)
          setPresets([
            {
              id: '__format_only__',
              name: 'Formatting-only (local)',
              prompt: formattingPreset,
            },
          ]);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectPreset = (key) => {
    setPresetKey(key);
    const p = presets.find((x) => String(x.id) === String(key));
    if (p?.prompt) setPrompt(p.prompt);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!model.trim()) return setError('Model is required.');
    if (!prompt.trim()) return setError('Prompt is required.');
    if (!code.trim()) return setError('Code is required.');

    setSubmitting(true);
    try {
      const { data } = await axios.post('/api/code/new-review', {
        model,
        prompt,
        code,
      });

      const reviewId =
        data?.reviewId ??
        data?.id ??
        data?.review?.id ??
        data?.conversationId ??
        null;
      if (reviewId) {
        navigate(`/chat/${encodeURIComponent(reviewId)}`);
      } else {
        alert('Review created successfully.');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create review.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">New Review</h1>
        </div>

        {error ? (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={submitting}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                >
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Local model via Ollama.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preset
                </label>
                <select
                  value={presetKey}
                  onChange={(e) => onSelectPreset(e.target.value)}
                  disabled={submitting || presets.length === 0}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                >
                  <option value="">Select a preset…</option>
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Choose a server-provided prompt or the local default.
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={submitting}
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                placeholder="Describe how the model should review/format the code…"
              />
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPresetKey('');
                    setPrompt('');
                  }}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={submitting}
              rows={14}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder={`// Paste code to review/format\nfunction add(a,b){return a+b}`}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
