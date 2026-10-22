'use client';

import { motion } from 'framer-motion';

export default function MotionWrapper({ 
  children, 
  delay = 0, 
  direction = 'up' 
}: { 
  children: React.ReactNode; 
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}) {
  const variants: any = {
    hidden: { 
      opacity: 0, 
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
      filter: 'blur(10px)'
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      filter: 'blur(0px)',
      transition: { 
        duration: 0.8, 
        delay, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
