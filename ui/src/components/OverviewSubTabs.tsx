import type { OverviewSection } from '../types';

interface OverviewSubTabsProps {
  activeSection: OverviewSection;
  onSectionChange: (section: OverviewSection) => void;
}

export function OverviewSubTabs({ activeSection, onSectionChange }: OverviewSubTabsProps) {
  const sections: { id: OverviewSection; label: string }[] = [
    { id: 'genesis-city', label: 'Genesis City' },
    { id: 'worlds', label: 'Worlds' },
    { id: 'wearables-emotes', label: 'Wearables & Emotes' },
  ];

  return (
    <div className="sub-tabs">
      {sections.map((section) => (
        <button
          key={section.id}
          className={`sub-tab ${activeSection === section.id ? 'active' : ''}`}
          onClick={() => onSectionChange(section.id)}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}
