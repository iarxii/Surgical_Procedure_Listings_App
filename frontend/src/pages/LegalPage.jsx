import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Link2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    sections: [
      {
        heading: 'Data Collection',
        text: 'This application operates primarily as a clinical reference tool. We do not collect personal health information (PHI) of patients. User accounts are for professional identification and logging of administrative actions.'
      },
      {
        heading: 'Usage Metrics',
        text: 'We may record anonymous usage statistics to improve search algorithms and data mapping accuracy. This includes search queries and frequency of procedure access.'
      },
      {
        heading: 'Data Security',
        text: 'All administrative data and user credentials are encrypted. Access is restricted to authorized GDoH personnel and clinical stakeholders.'
      }
    ]
  },
  terms: {
    title: 'Terms of Use',
    icon: Link2,
    sections: [
      {
        heading: 'Professional Use Only',
        text: 'This tool is intended for use by clinical staff and hospital administrators. It provides reference mappings for clinical SLA tracking and coding support.'
      },
      {
        heading: 'Clinical Judgment',
        text: 'While we strive for 100% accuracy in ICD-10 and ICD-11 mappings, this tool does not replace professional clinical coding judgment or institutional policy.'
      },
      {
        heading: 'Intellectual Property',
        text: 'The code mapping logic and integrated datasets remain the property of Adaptivconcept FL and the respective health authorities.'
      }
    ]
  },
  license: {
    title: 'License',
    icon: FileText,
    sections: [
      {
        heading: 'MIT License',
        text: 'Copyright (c) 2026 Thabang Mposula | Adaptivconcept FL'
      },
      {
        heading: 'Permissions',
        text: 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, subject to the conditions of the MIT license framework.'
      },
      {
        heading: 'Third Party Data',
        text: 'ICD codes and clinical datasets are provided under their respective licensing terms from the WHO and local health departments.'
      }
    ]
  }
};

export default function LegalPage({ type }) {
  const navigate = useNavigate();
  const data = CONTENT[type];

  if (!data) return null;

  const Icon = data.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-sm font-bold transition-all hover:gap-3"
        style={{ color: 'var(--accent)' }}
      >
        <ChevronLeft size={16} />
        Back to App
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 md:p-12 shadow-xl border overflow-hidden relative"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-bl-full -z-10 blur-3xl" />
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-accent/10" style={{ color: 'var(--accent)' }}>
            <Icon size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {data.title}
          </h1>
        </div>

        <div className="space-y-10">
          {data.sections.map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="text-xl font-bold uppercase tracking-wide text-xs" style={{ color: 'var(--accent)' }}>
                {section.heading}
              </h2>
              <p className="text-lg leading-relaxed opacity-80" style={{ color: 'var(--text-primary)' }}>
                {section.text}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t text-sm opacity-50" style={{ borderColor: 'var(--border)' }}>
          Last updated: April 20, 2026
        </div>
      </motion.div>
    </div>
  );
}
