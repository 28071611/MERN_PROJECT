/**
 * API and asset endpoint configuration
 *
 * In local development:
 *   Defaults to 'http://localhost:5000' (or VITE_API_URL if configured in frontend/.env).
 *
 * In production:
 *   - If frontend and backend are deployed together as a single fullstack service on Render,
 *     API_BASE_URL defaults to '' (relative paths), requiring zero manual configuration!
 *   - If frontend and backend are deployed on separate services (e.g., Render Static Site + Render Web Service),
 *     set VITE_API_URL to your backend Render URL (e.g., https://retrievo-backend.onrender.com).
 */

const envApiUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = envApiUrl !== undefined && envApiUrl !== ''
  ? envApiUrl.replace(/\/+$/, '')
  : (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000');

/**
 * Returns a fully-qualified URL for uploaded item images.
 * Handles absolute URLs, data URIs, and relative uploads paths.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
};
