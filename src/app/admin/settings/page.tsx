import { requireAdmin } from '@/lib/auth';

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">System <span className="text-zinc-500">Parameters</span></h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-2">Configure core operational protocols</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900/40 backdrop-blur-xl p-10 rounded-[32px] border border-white/5">
          <h3 className="text-xl font-black text-white italic tracking-tight mb-6">Environment Control</h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">Management of global system variables and access nodes.</p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-white/5">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Maintenance Mode</span>
              <div className="w-10 h-5 bg-zinc-800 rounded-full relative">
                 <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-600 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-white/5">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Public Registration</span>
              <div className="w-10 h-5 bg-cyan-500/20 rounded-full relative">
                 <div className="absolute right-1 top-1 w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,1)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl p-10 rounded-[32px] border border-white/5 opacity-50 cursor-not-allowed">
           <h3 className="text-xl font-black text-white italic tracking-tight mb-6">Database Sharding</h3>
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">Advanced distributed architecture settings. Restricted to Level 5 clearance.</p>
        </div>
      </div>
    </div>
  );
}
