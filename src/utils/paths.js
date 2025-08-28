/**
 * Utility function to get the correct asset path for deployment
 * @param {string} path - The asset path starting with '/'
 * @returns {string} - The correctly formatted path for the current environment
 */
export const getAssetPath = (path) => {
  // In Next.js, paths are handled automatically
  return path;
};

/**
 * Get the base URL for the application
 * @returns {string} - The base URL
 */
export const getBaseUrl = () => {
  return process.env.NODE_ENV === 'development' ? '/' : '/';
};
