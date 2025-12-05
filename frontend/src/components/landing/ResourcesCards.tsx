'use client';

import { ResourceCardProps } from '@/lib/landing-types';
import { ArrowRight, BookOpen, Code, FileText } from 'lucide-react';

const resourceIcons = [
  <BookOpen key="book" className="w-6 h-6 text-purple-600" />,
  <FileText key="file" className="w-6 h-6 text-blue-600" />,
  <Code key="code" className="w-6 h-6 text-emerald-600" />,
];

function ResourceCard({
  title,
  description,
  link,
  index,
}: ResourceCardProps & { index: number }) {
  const bgColors = ['bg-purple-50', 'bg-blue-50', 'bg-emerald-50'];
  const borderColors = [
    'border-purple-100',
    'border-blue-100',
    'border-emerald-100',
  ];

  return (
    <a
      href={link || '#'}
      data-testid="resource-card"
      className={`block rounded-2xl p-8 ${bgColors[index % 3]} border ${borderColors[index % 3]} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}
    >
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
          {resourceIcons[index % 3]}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 group-hover:gap-3 transition-all">
          Learn more
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </a>
  );
}

export function ResourcesCards({
  resources,
}: {
  resources: ResourceCardProps[];
}) {
  return (
    <section id="resources" className="py-24 px-6 lg:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resources to help you succeed
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Guides, tutorials, and documentation to get the most out of SocialAI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <ResourceCard key={index} {...resource} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ResourcesCards;
