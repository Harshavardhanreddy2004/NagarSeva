import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-slate-700">
          <div>
            <h3 className="font-semibold text-lg mb-4 text-slate-900">NagarSeva</h3>
            <p className="text-sm leading-7">Civic grievance reporting and community safety tracking made easy.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-slate-900">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-blue-600 transition">Home</a></li>
              <li><a href="/report" className="hover:text-blue-600 transition">Report Issue</a></li>
              <li><a href="/safety-map" className="hover:text-blue-600 transition">Safety Map</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-slate-900">Contact</h3>
            <p className="text-sm leading-7">Email: <a href="mailto:info@nagarseva.com" className="text-blue-600 hover:underline">info@nagarseva.com</a></p>
            <p className="text-sm leading-7">Phone: <span className="font-semibold">1800-NAGARSEVA</span></p>
          </div>
        </div>
        <div className="text-center text-sm text-slate-500">
          <p>&copy; 2024 NagarSeva. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
