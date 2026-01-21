import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { errorLogger } from "./services/errorLogger";
import { ErrorBoundary as ErrorBoundaryComponent } from "./components/ErrorBoundary";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const handleError = (error: Error, errorInfo: any) => {
    errorLogger.log(error, {
      severity: 'critical',
      context: {
        componentName: 'RootLayout',
        action: 'app_render',
        additionalData: errorInfo
      }
    });
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorBoundaryComponent onError={handleError}>
          {children}
        </ErrorBoundaryComponent>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ErrorBoundaryComponent>
      <Outlet />
    </ErrorBoundaryComponent>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Log route errors
  if (error) {
    errorLogger.log({
      name: 'RouteError',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, {
      severity: 'high',
      context: {
        componentName: 'RouteErrorBoundary',
        action: 'route_error'
      }
    });
  }

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-red-900 text-center mb-2">
            {message}
          </h1>
          
          <p className="text-red-700 text-center mb-6">
            {details}
          </p>

          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Reload Page
            </button>
          </div>

          {stack && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900 text-center">
                Technical Details
              </summary>
              <pre className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-900 max-h-64 overflow-auto">
                {stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </main>
  );
}
