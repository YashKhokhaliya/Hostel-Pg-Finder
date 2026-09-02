import React from 'react';
import { Wifi, Wind, Shirt, Car, Utensils, Flame, ShieldCheck } from 'lucide-react';

const facilityConfig = {
  wifi: { label: 'Wi-Fi', icon: Wifi, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  ac: { label: 'AC', icon: Wind, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  laundry: { label: 'Laundry', icon: Shirt, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  parking: { label: 'Parking', icon: Car, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  food: { label: 'Food / Mess', icon: Utensils, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  hotWater: { label: 'Hot Water', icon: Flame, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  security: { label: '24/7 Security', icon: ShieldCheck, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
};

const FacilityBadge = ({ facilityKey, active = true, size = 'sm' }) => {
  const config = facilityConfig[facilityKey];
  if (!config) return null;

  const Icon = config.icon;
  const isSmall = size === 'sm';

  if (!active) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all ${config.color} ${
        isSmall ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      }`}
    >
      <Icon className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </div>
  );
};

export default FacilityBadge;
