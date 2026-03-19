import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FeedPage from './FeedPage';

// Mock AuthContext with a fake authenticated user
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true,
  }),
}));

// Mock axiosInstance to return a controlled empty feed
vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          success: true,
          data: [],
          meta: { page: 1, totalPages: 1, total: 0 },
        },
      })
    ),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('FeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Feed heading', async () => {
    renderWithRouter(<FeedPage />);
    // The heading is rendered immediately
    expect(screen.getByText('Feed')).toBeInTheDocument();
  });

  it('renders the create-post textarea', async () => {
    renderWithRouter(<FeedPage />);
    expect(
      screen.getByPlaceholderText(/what's on your mind/i)
    ).toBeInTheDocument();
  });

  it('renders Trending and Recent sort buttons', () => {
    renderWithRouter(<FeedPage />);
    expect(screen.getByRole('button', { name: /trending/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recent/i })).toBeInTheDocument();
  });

  it('shows empty state message when feed returns no posts', async () => {
    renderWithRouter(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
    });
  });
});
