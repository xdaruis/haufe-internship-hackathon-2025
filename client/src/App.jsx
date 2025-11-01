import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';


import { login, logout } from './features/user';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import MessagesPage from './pages/Messages';
import NewReviewPage from './pages/NewReview';
import NewModelPage from './pages/NewModel';
import NewPromptPage from './pages/NewPrompt';
import HistoryPage from './pages/History';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HistoryPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/chat/:reviewId',
    element: <MessagesPage />,
  },
  {
    path: '/new-review',
    element: <NewReviewPage />,
  },
  {
    path: '/new-model',
    element: <NewModelPage />,
  },
  {
    path: '/new-prompt',
    element: <NewPromptPage />,
  },
]);

export default function App() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  const getSession = useCallback(async () => {
    try {
      const { data } = await axios.post('/api/user/session');
      if (data.session.username) {
        dispatch(login({ username: data.session.username }));
      } else {
        dispatch(logout());
      }
    } catch (error) {
      dispatch(logout());
      alert(error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    getSession();
  }, [getSession]);

  if (loading) return <div>Loading...</div>;

  return <RouterProvider router={router} />;
}
