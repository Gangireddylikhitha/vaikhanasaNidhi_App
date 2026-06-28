export function getApiError(error, fallback = 'Something went wrong. Try again.') {
  return error?.response?.data?.error || error?.message || fallback;
}

export function mapAuthError(error) {
  const code = error?.response?.data?.code;
  const message = error?.response?.data?.error;

  switch (code) {
    case 'USERNAME_TAKEN':
      return 'Username already taken. Choose another.';
    case 'NOT_FOUND':
      return 'No account found with that username.';
    case 'WRONG_PASSWORD':
      return 'Incorrect password. Try again.';
    case 'INVALID_CREDENTIALS':
      return 'Invalid credentials.';
    case 'BAD_REQUEST':
      return message || 'Please check your input.';
    default:
      return getApiError(error);
  }
}

export function mapAdminError(error) {
  const code = error?.response?.data?.code;
  const message = error?.response?.data?.error;

  switch (code) {
    case 'DUPLICATE':
      return 'This category already exists.';
    case 'BAD_REQUEST':
      return message || 'Please check your input.';
    case 'NOT_FOUND':
      return message || 'Item not found.';
    case 'FORBIDDEN':
      return 'Admin access required.';
    case 'UNAUTHORIZED':
      return 'Please login as admin again.';
    case 'SERVICE_UNAVAILABLE':
      return message || 'Service temporarily unavailable.';
    default:
      return getApiError(error);
  }
}
