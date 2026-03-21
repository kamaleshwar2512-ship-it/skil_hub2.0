# Debugging Report — SKIL Hub

## 1. Identified Issue: Frontend "Blank Screen" Crash on `/feed`
- **Symptom**: Upon successful login or registration, the application redirects to the Feed page (`/feed`), causing an immediate UI crash resulting in a completely blank screen.
- **Root Cause**: The React frontend lacks a global or route-level `<ErrorBoundary>`. During the API call to `/api/posts`, if the backend returns any unexpected data structures (e.g., malformed `created_at` dates or completely missing optional fields), React throws an unhandled Type Error during the hydration of the `<PostCard>` component array. Because the error is unhandled, it unmounts the entire DOM tree.
- **Specific Culprit Candidate**: In `FeedPage.jsx`, the component attempts to aggressively map string formats in UI functions without strict fallback checks. While we verified `author_avatar` handles `null` successfully, other nested objects or date formatting functions (`new Date(post.created_at).toLocaleDateString`) can trigger aggressive failures if any row in SQLite returns anomalous metadata.

## 2. Recommended Fixes

### A. Implement a Global Error Boundary
Wrap the main sub-routes in `App.jsx` or inside `Layout.jsx` with an `ErrorBoundary` component.

```jsx
// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card text-center p-8 m-8">
          <h2 className="text-danger mb-4">Something went wrong</h2>
          <p className="text-muted">{this.state.error?.message}</p>
          <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
```

### B. Defensive Rendering in `PostCard`
Update `src/pages/FeedPage.jsx` to be strictly safe against null props.

```jsx
// Before
const createdAt = post.created_at
  ? new Date(post.created_at).toLocaleDateString(...)
  : '';

// After Fix
let createdAt = '';
try {
  if (post?.created_at) {
    createdAt = new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  }
} catch (e) {
  createdAt = 'Unknown date';
}

const authorInitials = post?.author_name 
  ? post.author_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
  : '?';
```

## 3. Backend Resiliency
- Ensure the SQLite `JOIN` query strictly aliases all expected fields (like `u.department as author_department`), which was confirmed to exist but sometimes can be absent from `LEFT JOIN` operations if user records are orphaned.
