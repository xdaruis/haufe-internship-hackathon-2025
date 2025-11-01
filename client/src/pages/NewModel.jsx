import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewModelPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', model: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const useQwen05Preset = () => {
    setForm({ name: 'Qwen2.5 Coder 0.5B', model: 'qwen2.5-coder:0.5b' });
  };

  const useQwen15Preset = () => {
    setForm({ name: 'Qwen2.5 Coder 1.5B', model: 'qwen2.5-coder:1.5b' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOk(false);

    const name = form.name.trim();
    const model = form.model.trim();
    if (!name || !model) {
      setError('Both name and model are required.');
      return;
    }

    setSubmitting(true);
    try {
      // Expects server to create an entry in `llm_models`
      const { data } = await axios.post('/api/code/model/update', {
        name,
        model,
      });

      setOk(true);
      // Go back or route wherever you list models/use them
      setTimeout(() => {
        navigate(-1);
      }, 500);
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || 'Failed to create model.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            New LLM Model
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={useQwen05Preset}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Use Qwen 0.5B
            </button>
            <button
              type="button"
              onClick={useQwen15Preset}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Use Qwen 1.5B
            </button>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        {ok ? (
          <div
            role="status"
            className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            Model created.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Display name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={onChange}
              disabled={submitting}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
              placeholder="Qwen2.5 Coder 0.5B"
            />
            <p className="mt-1 text-xs text-gray-500">
              Human-friendly name shown in the UI.
            </p>
          </div>

          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700"
            >
              Model identifier
            </label>
            <input
              id="model"
              name="model"
              value={form.model}
              onChange={onChange}
              disabled={submitting}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
              placeholder="qwen2.5-coder:0.5b"
            />
            <p className="mt-1 text-xs text-gray-500">
              Exact Ollama tag, e.g. qwen2.5-coder:0.5b.
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
              {submitting ? 'Creating…' : 'Create model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
