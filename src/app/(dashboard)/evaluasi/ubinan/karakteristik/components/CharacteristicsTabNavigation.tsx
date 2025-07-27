// src/app/(dashboard)/evaluasi/ubinan/karakteristik/components/CharacteristicsTabNavigation.tsx

'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  LandPlot,
  Wheat,
  Zap,
  HandHeart,
  BarChart3
} from 'lucide-react';

export type CharacteristicsTab = 
  | 'karakteristik-lahan' 
  | 'varietas-benih' 
  | 'penggunaan-pupuk' 
  | 'dukungan-program'
  | 'ringkasan';

interface TabConfig {
  id: CharacteristicsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TAB_CONFIG: TabConfig[] = [
  {
    id: 'karakteristik-lahan',
    label: 'Karakteristik Lahan',
    icon: LandPlot,
    description: 'Luas lahan, jenis lahan, cara penanaman, dan sistem jajar legowo'
  },
  {
    id: 'varietas-benih',
    label: 'Varietas Benih',
    icon: Wheat,
    description: 'Jenis varietas benih dan bantuan benih'
  },
  {
    id: 'penggunaan-pupuk',
    label: 'Penggunaan Pupuk',
    icon: Zap,
    description: 'Penggunaan pupuk dan bantuan pupuk'
  },
  {
    id: 'dukungan-program',
    label: 'Dukungan Program',
    icon: HandHeart,
    description: 'Keanggotaan kelompok tani dan program bantuan'
  },
  {
    id: 'ringkasan',
    label: 'Ringkasan',
    icon: BarChart3,
    description: 'Ringkasan semua karakteristik sampel'
  }
];

interface CharacteristicsTabNavigationProps {
  activeTab: CharacteristicsTab;
  onTabChange: (tab: CharacteristicsTab) => void;
  className?: string;
}

export const CharacteristicsTabNavigation = memo(function CharacteristicsTabNavigation({
  activeTab,
  onTabChange,
  className = ""
}: CharacteristicsTabNavigationProps) {
  
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-1 ${className}`}>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex space-x-1">
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                transition-all duration-200 ease-in-out
                ${isActive 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Navigation - Dropdown style */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            {(() => {
              const activeTabConfig = TAB_CONFIG.find(tab => tab.id === activeTab);
              const Icon = activeTabConfig?.icon || BarChart3;
              return (
                <>
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {activeTabConfig?.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {activeTabConfig?.description}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Mobile Tab Buttons */}
        <div className="grid grid-cols-2 gap-1 mt-2">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium
                  transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
