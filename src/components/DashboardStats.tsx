'use client';

import { motion } from 'framer-motion';

export default function DashboardStats({ value }: { value: string }) {
  return (
    <motion.span 
      key={value}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic"
    >
      {value}
    </motion.span>
  );
}
