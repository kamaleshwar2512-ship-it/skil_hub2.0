import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock the AuthContext so LoginPage renders in a non-authenticated state
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isAuthenticated: false,
    loading: false,
  }),
}));

// Mock axiosInstance to prevent real network calls
vi.mock('../api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders Sign in button', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    renderWithRouter(<LoginPage />);
    const submit = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submit);
    expect(await screen.findByRole('alert')).toHaveTextContent(/email is required/i);
  });

  it('shows password required error when email filled but password empty', async () => {
    renderWithRouter(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'student@college.edu' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/password is required/i);
  });

  it('renders link to register page', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });
});
