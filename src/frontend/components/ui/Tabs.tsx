import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const active = tabs.find(t => t.id === activeTab);

  return (
    <div className={className}>
      {/* Tab list */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200
              ${activeTab === tab.id
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] -mb-px'
                : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {active?.content}
      </div>
    </div>
  );
}
