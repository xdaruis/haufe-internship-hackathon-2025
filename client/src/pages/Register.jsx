import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/user';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOk(false);
    setSubmitting(true);

    if (submitting) return;

    try {
      await axios.post('/api/user/register', {
        username: form.username,
        password: form.password,
      });
      setOk(true);
      dispatch(login({ username: form.username }));
      navigate('/login');
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
    justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-sm ring-1 ring-gray-200
        rounded-xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Create your account
          </h1>
          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-md border border-red-200
              bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}
          {ok ? (
            <div
              role="status"
              className="mb-4 rounded-md border border-emerald-200
              bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
            >
              Account created. Redirecting…
            </div>
          ) : null}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                value={form.username}
                onChange={onChange}
                disabled={submitting}
                className="mt-1 block w-full rounded-md border
                  border-gray-300 bg-white px-3 py-2 text-gray-900
                  shadow-sm placeholder:text-gray-400 focus:border-indigo-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                  sm:text-sm"
                placeholder="username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={onChange}
                disabled={submitting}
                className="mt-1 block w-full rounded-md border
                  border-gray-300 bg-white px-3 py-2 text-gray-900
                  shadow-sm placeholder:text-gray-400 focus:border-indigo-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                  sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center
              rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium
              text-white shadow-sm transition hover:bg-indigo-500
              disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              disabled={submitting}
              className="text-sm font-medium text-indigo-600
              hover:text-indigo-500 disabled:opacity-60"
            >
              Already have an account? Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
