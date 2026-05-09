'use client';

import { useEffect } from 'react';
import { heartbeatAction } from '@/app/actions/auth';

export default function UserHeartbeat() {
  useEffect(() => {
    // Initial heartbeat
    heartbeatAction();

    // Set up interval (every 1 minute)
    const interval = setInterval(() => {
      heartbeatAction();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
