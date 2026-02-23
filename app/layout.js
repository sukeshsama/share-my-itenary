import "./globals.css";

// Force server-side rendering so process.env.GOOGLE_MAPS_API_KEY
// is read at request time (not baked in as undefined at build time)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Travel Expenses Tracker",
  description: "Track your travel trips and expenses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Maps Places API — replace YOUR_API_KEY */}
        {process.env.GOOGLE_MAPS_API_KEY && (
          <script
            async
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`}
          />
        )}
      </head>
      <body className="min-h-screen">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
            <span className="text-xl">✈️</span>
            <a href="/" className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
              Travel Expenses
            </a>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
