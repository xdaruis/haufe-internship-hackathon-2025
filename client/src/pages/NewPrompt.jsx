import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function NewPromptPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', prompt: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const useFormattingPreset = () => {
    setForm((s) => ({
      ...s,
      name: s.name || 'Formatting-only',
      prompt: [
        'You are a code formatter.',
        'Reformat the provided code for readability and consistent style.',
        'Do not change behavior or meaning.',
        'Do not rename, reorder logic, introduce new code, or add comments.',
        'Output ONLY the fully formatted code as plain text. No markdown fences, no explanations.'
      ].join('\n'),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOk(false);

    const name = form.name.trim();
    const prompt = form.prompt.trim();
    if (!name || !prompt) {
      setError('Name and prompt are required.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/code/prompt/update', { name, prompt });
      setOk(true);
      setTimeout(() => navigate(-1), 600);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create prompt.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">New Prompt</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={useFormattingPreset}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Use formatting-only preset
            </button>
          </div>
        </div>

        {error ? (
          <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {ok ? (
          <div role="status" className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Prompt created.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name (unique)
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={onChange}
              disabled={submitting}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
              placeholder="Formatting-only"
            />
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
              Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              value={form.prompt}
              onChange={onChange}
              disabled={submitting}
              rows={10}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
              placeholder="Write the system/user instruction the model will follow…"
            />
            <p className="mt-1 text-xs text-gray-500">
              Keep it short and specific for faster local models.
            </p>
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
              {submitting ? 'Creating…' : 'Create prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}