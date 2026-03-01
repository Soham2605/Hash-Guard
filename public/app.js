// Define API_BASE_URL based on the environment
const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://your-render-backend-url.com' : 'http://localhost:8080';

// Stay aware of the API_BASE_URL during development or production
console.log('API_BASE_URL:', API_BASE_URL);

// Your existing code...
