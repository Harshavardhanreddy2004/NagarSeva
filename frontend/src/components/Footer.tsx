import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">NagarSeva</h3>
            <p>Civic Grievance Reporting & Community Safety</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-blue-400">Home</a></li>
              <li><a href="/report" className="hover:text-blue-400">Report Issue</a></li>
              <li><a href="/safety-map" className="hover:text-blue-400">Safety Map</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <p>Email: info@nagarseva.com</p>
            <p>Phone: 1800-NAGARSEVA</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center">
          <p>&copy; 2024 NagarSeva. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
