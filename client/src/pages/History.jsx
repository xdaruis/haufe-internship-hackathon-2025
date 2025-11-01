import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [reviewId, setReviewId] = useState('');

  const openReview = (e) => {
    e.preventDefault();
    const id = reviewId.trim();
    if (!id) return;
    navigate(`/chat/${encodeURIComponent(id)}`);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">Utility</h1>

      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><Link className="text-indigo-600 hover:underline" to="/login">Login</Link></li>
        <li><Link className="text-indigo-600 hover:underline" to="/register">Register</Link></li>
        <li><Link className="text-indigo-600 hover:underline" to="/new-review">New Review</Link></li>
        <li><Link className="text-indigo-600 hover:underline" to="/new-model">New Model</Link></li>
        <li><Link className="text-indigo-600 hover:underline" to="/new-prompt">New Prompt</Link></li>
      </ul>

      <form onSubmit={openReview} className="flex items-center gap-2">
        <label htmlFor="rid" className="text-sm">Open conversation by ID:</label>
        <input
          id="rid"
          value={reviewId}
          onChange={(e) => setReviewId(e.target.value)}
          placeholder="reviewId"
          className="border rounded px-2 py-1 text-sm w-64"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white text-sm px-3 py-1 rounded"
        >
          Open
        </button>
      </form>
    </div>
  );
}