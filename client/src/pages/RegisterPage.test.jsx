import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';

// Mock AuthContext in unauthenticated state
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: vi.fn(),
    isAuthenticated: false,
    loading: false,
  }),
}));

// Mock axiosInstance
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

describe('RegisterPage', () => {
  it('renders the registration form inputs', () => {
    renderWithRouter(<RegisterPage />);
    // Label text in RegisterPage.jsx: "Name", "Email", "Password", "Department"
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^department$/i)).toBeInTheDocument();
  });

  it('renders a Submit / Register button', () => {
    renderWithRouter(<RegisterPage />);
    // Accept "Create Account", "Register", or "Sign up"
    const btn = screen.getByRole('button', { name: /create account|register|sign up/i });
    expect(btn).toBeInTheDocument();
  });

  it('shows an error when submitting an empty form', async () => {
    renderWithRouter(<RegisterPage />);
    const submit = screen.getByRole('button', { name: /create account|register|sign up/i });
    fireEvent.click(submit);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('renders a link back to login', () => {
    renderWithRouter(<RegisterPage />);
    expect(
      screen.getByRole('link', { name: /sign in|log in|login/i })
    ).toBeInTheDocument();
  });
});
