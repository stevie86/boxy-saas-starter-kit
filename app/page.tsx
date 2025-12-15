import Link from 'next/link';
import { auth, signOut } from '@/auth';

export default async function Home() {
  const session = await auth();

  return (
    <main className="hero min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          <div className="mb-4">
            <span className="badge badge-primary badge-outline uppercase tracking-wider text-xs font-bold px-3 py-1">
              HostelPulse 2025
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6">
            The Modern OS for Hostels
          </h1>
          <p className="py-6 text-lg text-base-content/80 leading-relaxed">
            Ditch the spreadsheets. Manage bookings, guests, and operations with a
            streamlined, intelligent platform built for the new era of hospitality.
          </p>
          
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="flex gap-4">
              <Link
                href="/properties"
                className="btn btn-primary btn-lg shadow-lg hover:shadow-primary/50 transition-all duration-300"
              >
                Manage Properties
              </Link>
              <a
                href="/api/health"
                className="btn btn-outline btn-lg"
              >
                System Health
              </a>
            </div>

            <div className="w-full max-w-md divider"></div>

            <div className="w-full">
              {session ? (
                 <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-medium">
                       Signed in as <span className="text-primary">{session.user?.email}</span>
                     </span>
                     <form
                       action={async () => {
                         'use server';
                         await signOut();
                       }}
                     >
                       <button className="btn btn-ghost btn-sm text-error">
                         Sign Out
                       </button>
                     </form>
                   </div>
                 </div>
              ) : (
                <Link
                  href="/login"
                  className="link link-hover text-sm font-medium text-primary"
                >
                  Log In to Access Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
