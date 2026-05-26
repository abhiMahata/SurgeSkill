import React from 'react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();
  if (!toast.visible) return null;
  return (
    <div className="toast">
      <span className="material-symbols-outlined" style={{ fontSize: 15, marginRight: 6, color: '#A5B4FC' }}>check_circle</span>
      {toast.message}
    </div>
  );
};
