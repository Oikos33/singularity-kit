// Vercel Edge Middleware - language routing
// Reads Accept-Language header + x-vercel-ip-country to redirect to /ja/ or /es/

export default function middleware(req) {
  const url = new URL(req.url);

  // Only intercept root
  if (url.pathname !== '/' && url.pathname !== '/index.html') return;

  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  const lang = (req.headers.get('accept-language') || '').toLowerCase();

  // Japanese: Japan, or browser language starts with ja
  if (country === 'JP' || lang.startsWith('ja')) {
    return Response.redirect(new URL('/ja/', req.url), 302);
  }

  // Spanish: Spanish-speaking countries or browser language starts with es
  const spanishCountries = ['ES','MX','AR','CO','PE','VE','CL','EC','GT','CU','BO','DO','HN','PY','SV','NI','CR','PA','UY','PR','GQ'];
  if (spanishCountries.includes(country) || lang.startsWith('es')) {
    return Response.redirect(new URL('/es/', req.url), 302);
  }

  // Default: serve English (no redirect)
}

export const config = {
  matcher: ['/', '/index.html'],
};