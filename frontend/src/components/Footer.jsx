import React from 'react'

const Footer = () => {
  return (
    <>
     <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h2 className="text-white text-xl font-bold mb-4">QuanStore</h2>
      <p className="mb-6">Pure premium shopping experience.</p>
      <div className="flex justify-center gap-8 text-sm">
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-white transition-colors">Contact Us</a>
      </div>
      <p className="mt-8 text-xs">&copy; 2026 QuanStore. All rights reserved.</p>
    </div>
  </footer>
    </>
  )
}

export default Footer