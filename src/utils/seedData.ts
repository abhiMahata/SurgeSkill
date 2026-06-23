import type { EventItem, Hackathon, Course } from '../types';

export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'gis-2024', title: 'Global Innovation Summit 2026', date: '2026-08-22',
    description: 'Join industry leaders for an immersive experience in the future of AI and sustainable technology architecture.',
    venue: 'Moscone Center South, San Francisco', capacity: 500, price: '$299',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    type: 'Conference', registrationsCount: 289, status: 'Confirmed', createdBy: 'system',
  },
  {
    id: 'ux-paradigm', title: 'The UX Paradigm Shift', date: '2026-08-28',
    description: 'Learn the new methodologies for building high-conversion spatial layouts in spatial computing and modern UI schemas.',
    venue: 'Metropolitan Pavilion, New York', capacity: 150, price: '$99',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    type: 'Workshop', registrationsCount: 132, status: 'Confirmed', createdBy: 'system',
  },
  {
    id: 'tech-tea', title: 'Networking: Tech & Tea', date: '2026-09-05',
    description: 'An informal gathering of engineers, organizers, and developers looking to share ideas and projects.',
    venue: 'Prestige Hall, Chicago', capacity: 100, price: 'Free',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    type: 'Networking', registrationsCount: 45, status: 'Confirmed', createdBy: 'system',
  },
  {
    id: 'data-arch-2025', title: 'Data Architecture 2025', date: '2025-10-15',
    description: 'Understanding real-time analytics stream sync protocols, Apache Kafka clusters, and modern distributed storage layers.',
    venue: 'Silicon Center, San Jose', capacity: 300, price: '$199',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    type: 'Conference', registrationsCount: 300, status: 'Completed', createdBy: 'system',
  },
  {
    id: 'prod-strategy-sync', title: 'Product Strategy Sync', date: '2025-12-08',
    description: 'Annual gathering of product leads discussing outcome-based roadmapping and high-density interface metrics.',
    venue: 'Hybrid / Silicon Valley', capacity: 80, price: 'Free',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    type: 'Workshop', registrationsCount: 80, status: 'Completed', createdBy: 'system',
  },
];

export const DEFAULT_HACKATHONS: Hackathon[] = [
  {
    id: 'hack-ai-2026', title: 'AI Innovation Hackathon', date: '2026-09-15', endDate: '2026-09-17',
    venue: 'Online', mode: 'online', teamSizeMin: 2, teamSizeMax: 4,
    prizes: ['$5000', '$3000', '$1000'], description: 'Build AI-powered solutions for real-world challenges. 48-hour sprint with mentors and workshops.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    registrationsCount: 120, capacity: 200, status: 'Upcoming', createdBy: 'system',
  },
  {
    id: 'hack-web3', title: 'Web3 Builders Jam', date: '2026-10-01', endDate: '2026-10-03',
    venue: 'Tech Park, Bangalore', mode: 'hybrid', teamSizeMin: 1, teamSizeMax: 5,
    prizes: ['$3000', '$1500', '$500'], description: 'Decentralized apps, smart contracts, and blockchain innovation. Open to all skill levels.',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=800&q=80',
    registrationsCount: 65, capacity: 150, status: 'Upcoming', createdBy: 'system',
  },
];

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-react', title: 'Mastering React & TypeScript', mentor: 'System', mentorId: 'system',
    description: 'A comprehensive course covering React 19, TypeScript, hooks, state management, and building production-ready applications.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    category: 'Web Development', duration: '8 weeks', level: 'Intermediate',
    syllabus: ['React Fundamentals', 'TypeScript Basics', 'Hooks Deep Dive', 'State Management', 'Testing', 'Deployment'],
    enrolledCount: 45, capacity: 60, price: '$49', status: 'Active', createdBy: 'system',
  },
  {
    id: 'course-ml', title: 'Machine Learning Foundations', mentor: 'System', mentorId: 'system',
    description: 'From linear regression to neural networks. Hands-on projects with Python, scikit-learn, and TensorFlow.',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80',
    category: 'AI / ML', duration: '12 weeks', level: 'Beginner',
    syllabus: ['Python for ML', 'Linear Models', 'Decision Trees', 'Neural Networks', 'CNNs', 'Capstone Project'],
    enrolledCount: 78, capacity: 100, price: 'Free', status: 'Active', createdBy: 'system',
  },
  {
    id: 'course-ui', title: 'UI/UX Design Masterclass', mentor: 'System', mentorId: 'system',
    description: 'Learn design thinking, Figma mastery, user research, and building beautiful, accessible interfaces.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    category: 'Design', duration: '6 weeks', level: 'Beginner',
    syllabus: ['Design Thinking', 'Figma Basics', 'Typography & Color', 'Prototyping', 'User Testing'],
    enrolledCount: 32, capacity: 50, price: '$29', status: 'Active', createdBy: 'system',
  },
];
