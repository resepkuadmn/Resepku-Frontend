import React, { useEffect } from 'react';
import { useStateContext } from '../contexts/ContextProvider';

export default function Toast() {
  const { toast } = useStateContext();

  if (!toast) return null;

  const color = toast.type === 'error' ? 'bg-red-600' : 'bg-green-600';

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className={`${color} text-white px-4 py-2 rounded shadow-lg max-w-xs`}> 
        {toast.message}
      </div>
    </div>
  );
}
