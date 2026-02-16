export interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  room: string;
  speakers: string[];
  description: string;
  knowledge_partners: string[];
  topic?: string;
  tags: string[];
}

export interface FilterState {
  topics: string[];
  dates: string[];
  times: string[];
  locations: string[];
  knowledgePartners: string[];
  speakers: string[];
  timeSlots: string[];
  sectors: string[];
  thematics: string[];
  formats: string[];
}

export interface TimeRange {
  id: string;
  startTime: string; // "09:00" (24-hour format)
  endTime: string;   // "17:00"
}

export const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'] as const;

export const SECTORS = [
  'Healthcare',
  'Agriculture',
  'Education',
  'Finance & Fintech',
  'Defence & National Security',
  'Energy & Climate',
  'Cybersecurity',
  'Frontier Tech (Quantum, Robotics, Semiconductor)',
  'Creative Industries & Media',
  'Smart Cities & Urban Development',
  'Legal & Judiciary',
  'Disaster Management',
  'Telecom & Connectivity',
  'Transportation & Logistics',
] as const;

export const THEMATICS = [
  'AI Governance & Policy',
  'AI Safety & Trust',
  'Responsible & Ethical AI',
  'AI Infrastructure & Compute',
  'Data Governance & Open Data',
  'Digital Public Infrastructure (DPI)',
  'Generative AI, LLMs & Agentic AI',
  'Multilingual AI & Language Tech',
  'Inclusion & Equity',
  'Women & Gender in AI',
  'Youth & Children',
  'Skilling & Workforce Development',
  'Startups & Innovation Ecosystem',
  'Global South & Development Cooperation',
  'Geopolitics & Bilateral Cooperation',
  'Open Source AI',
  'Sovereign AI',
  'AI for Social Good & Nonprofits',
  'Intellectual Property & Copyright',
  'Blockchain & Digital Trust Infra',
  'AI Investment & Funding',
  'Standards & Interoperability',
  'AI Evaluation & Benchmarking',
  'India Focus',
] as const;

export const FORMATS = [
  'Keynote',
  'Leadership Talk',
  'Panel / Roundtable',
  'Hackathon / Competition',
  'Masterclass',
  'Workshop',
  'Fireside Chat',
  'Inaugural / Launch',
] as const;

const SECTOR_SET = new Set<string>(SECTORS);
const FORMAT_SET = new Set<string>(FORMATS);

export function classifyTag(tag: string): 'sector' | 'thematic' | 'format' {
  if (SECTOR_SET.has(tag)) return 'sector';
  if (FORMAT_SET.has(tag)) return 'format';
  return 'thematic';
}

export const TOPICS = [
  'AI Governance',
  'AI Safety',
  'Healthcare',
  'Education',
  'Climate',
  'Infrastructure',
  'Economic Growth',
  'International Cooperation',
  'Workforce',
  'Startups',
  'Agriculture',
  'Finance',
  'Defense',
  'Ethics',
] as const;

export type Topic = typeof TOPICS[number];

export function inferTopic(title: string, description: string): Topic {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('governance') || text.includes('regulation') || text.includes('policy') || text.includes('standards')) {
    return 'AI Governance';
  }
  if (text.includes('safety') || text.includes('security') || text.includes('trust') || text.includes('secure')) {
    return 'AI Safety';
  }
  if (text.includes('health') || text.includes('medical') || text.includes('healthcare') || text.includes('clinic')) {
    return 'Healthcare';
  }
  if (text.includes('education') || text.includes('learning') || text.includes('skill') || text.includes('literacy') || text.includes('stem')) {
    return 'Education';
  }
  if (text.includes('climate') || text.includes('energy') || text.includes('sustainable') || text.includes('environment') || text.includes('green')) {
    return 'Climate';
  }
  if (text.includes('compute') || text.includes('infrastructure') || text.includes('semiconductor') || text.includes('chip') || text.includes('6g')) {
    return 'Infrastructure';
  }
  if (text.includes('economic') || text.includes('growth') || text.includes('development') || text.includes('gdp')) {
    return 'Economic Growth';
  }
  if (text.includes('global') || text.includes('international') || text.includes('partnership') || text.includes('collaboration') || text.includes('south')) {
    return 'International Cooperation';
  }
  if (text.includes('workforce') || text.includes('talent') || text.includes('job') || text.includes('employment') || text.includes('human potential')) {
    return 'Workforce';
  }
  if (text.includes('startup') || text.includes('entrepreneur') || text.includes('innovation') || text.includes('founder')) {
    return 'Startups';
  }
  if (text.includes('agriculture') || text.includes('farm') || text.includes('food')) {
    return 'Agriculture';
  }
  if (text.includes('finance') || text.includes('fintech') || text.includes('payment') || text.includes('banking')) {
    return 'Finance';
  }
  if (text.includes('defense') || text.includes('military') || text.includes('army') || text.includes('sovereignty')) {
    return 'Defense';
  }
  if (text.includes('ethics') || text.includes('responsible') || text.includes('human rights') || text.includes('humanity')) {
    return 'Ethics';
  }
  
  return 'AI Governance';
}
