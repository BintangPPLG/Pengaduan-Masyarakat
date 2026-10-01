import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#F4FAF6] via-[#F8FAF9] to-[#E2F8EB]/30">
      <div
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#6FCF97]/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-80px] top-40 h-96 w-96 rounded-full bg-[#A3E635]/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#56B97E]/10 blur-3xl"
        aria-hidden
      />
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
        <div className="space-y-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
