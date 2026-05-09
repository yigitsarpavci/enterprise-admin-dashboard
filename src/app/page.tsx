import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">System v1.4.2 Active</span>
          </div>

          {/* Hero Text */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter italic leading-none">
              PERFORMO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500">OPERATIONAL</span><br/>
              INTELLIGENCE
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-500 text-sm md:text-base font-bold uppercase tracking-[0.3em] leading-relaxed">
              Proprietary performance tracking and human resource optimization for high-output environments.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <Link
              href="/dashboard"
              className="group relative px-12 py-5 bg-white text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-cyan-400 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              Access Dashboard
            </Link>
            <Link
              href="/login"
              className="px-12 py-5 bg-zinc-900/50 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-300"
            >
              User Login
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
            title="Personnel Management" 
            description="Detailed records and role-based clearance for every operational node."
          />
          <FeatureCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
            title="Strategic Missions" 
            description="Real-time task deployment and objective monitoring for maximum throughput."
          />
          <FeatureCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5z" /></svg>}
            title="Analytics Engine" 
            description="Deep performance indices and cross-departmental efficiency benchmarking."
          />
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
         <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.8em]">Performo Technology Group &bull; Proprietary System</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="group bg-zinc-900/40 backdrop-blur-xl p-10 rounded-[32px] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-cyan-500/10 transition-colors" />
      <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-cyan-400 mb-8 border border-white/5 group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white italic tracking-tight mb-4">{title}</h3>
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">{description}</p>
    </div>
  );
}

