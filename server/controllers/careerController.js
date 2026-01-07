import CareerRoadmap from '../models/CareerRoadmap.js';
import User from '../models/User.js';
import { createSessionMeetings } from '../utils/zoomClient.js';

// Career paths database
const careerPaths = {
  'frontend-developer': {
    title: 'Frontend Developer',
    description: 'Build beautiful, responsive user interfaces using modern web technologies.',
    estimatedWeeks: { beginner: 24, intermediate: 16, advanced: 8 },
    skills: [
      { name: 'HTML5', category: 'Core', proficiencyLevel: 'advanced', priority: 1 },
      { name: 'CSS3', category: 'Core', proficiencyLevel: 'advanced', priority: 2 },
      { name: 'JavaScript', category: 'Core', proficiencyLevel: 'expert', priority: 3 },
      { name: 'React', category: 'Framework', proficiencyLevel: 'advanced', priority: 4 },
      { name: 'TypeScript', category: 'Language', proficiencyLevel: 'intermediate', priority: 5 },
      { name: 'CSS Frameworks (Tailwind)', category: 'Styling', proficiencyLevel: 'advanced', priority: 6 },
      { name: 'Git & GitHub', category: 'Tools', proficiencyLevel: 'intermediate', priority: 7 },
      { name: 'Responsive Design', category: 'Design', proficiencyLevel: 'advanced', priority: 8 },
      { name: 'API Integration', category: 'Integration', proficiencyLevel: 'intermediate', priority: 9 },
      { name: 'Testing (Jest)', category: 'Quality', proficiencyLevel: 'basic', priority: 10 }
    ],
    milestones: [
      { order: 1, title: 'Web Fundamentals', description: 'Master HTML, CSS, and basic JavaScript', duration: '4 weeks', durationWeeks: 4, skills: ['HTML5', 'CSS3', 'JavaScript Basics'] },
      { order: 2, title: 'JavaScript Deep Dive', description: 'Advanced JavaScript concepts, ES6+, async programming', duration: '4 weeks', durationWeeks: 4, skills: ['ES6+', 'Async/Await', 'DOM Manipulation'] },
      { order: 3, title: 'React Fundamentals', description: 'Components, hooks, state management', duration: '4 weeks', durationWeeks: 4, skills: ['React', 'Hooks', 'Component Design'] },
      { order: 4, title: 'Advanced React', description: 'Context, Redux, performance optimization', duration: '3 weeks', durationWeeks: 3, skills: ['Redux', 'Context API', 'React Router'] },
      { order: 5, title: 'TypeScript & Tooling', description: 'TypeScript basics, build tools, testing', duration: '3 weeks', durationWeeks: 3, skills: ['TypeScript', 'Webpack/Vite', 'Jest'] },
      { order: 6, title: 'Portfolio & Job Prep', description: 'Build portfolio projects, interview prep', duration: '4 weeks', durationWeeks: 4, skills: ['Portfolio', 'Interviews', 'Best Practices'] }
    ],
    exams: [
      { title: 'HTML & CSS Fundamentals', skill: 'HTML/CSS', difficulty: 'beginner', order: 1 },
      { title: 'JavaScript Essentials', skill: 'JavaScript', difficulty: 'intermediate', order: 2 },
      { title: 'React Component Mastery', skill: 'React', difficulty: 'intermediate', order: 3 },
      { title: 'Advanced React Patterns', skill: 'React', difficulty: 'advanced', order: 4 },
      { title: 'TypeScript Proficiency', skill: 'TypeScript', difficulty: 'intermediate', order: 5 },
      { title: 'Frontend Developer Certification', skill: 'Full Stack', difficulty: 'advanced', order: 6 }
    ],
    courses: [
      { title: 'HTML & CSS Crash Course', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=mU6anWqZJcc', duration: '2h', type: 'video', priority: 'essential' },
      { title: 'JavaScript Full Course', provider: 'Bro Code', url: 'https://www.youtube.com/watch?v=lfmg-EJ8gm4', duration: '8h', type: 'video', priority: 'essential' },
      { title: 'React Complete Guide', provider: 'Traversy Media', url: 'https://www.youtube.com/watch?v=LDB4uaJ87e0', duration: '3h', type: 'video', priority: 'essential' },
      { title: 'TypeScript Tutorial', provider: 'Net Ninja', url: 'https://www.youtube.com/watch?v=2pZmKW9-I_k', duration: '4h', type: 'video', priority: 'recommended' },
      { title: 'Tailwind CSS Course', provider: 'Traversy Media', url: 'https://www.youtube.com/watch?v=dFgzHOX84xQ', duration: '3h', type: 'video', priority: 'recommended' },
      { title: 'Git & GitHub for Beginners', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk', duration: '1h', type: 'video', priority: 'essential' }
    ],
    liveSessions: [
      { title: 'React Best Practices Workshop', topic: 'React', duration: '2 hours', instructor: 'Senior Developer' },
      { title: 'Building Responsive UIs', topic: 'CSS', duration: '1.5 hours', instructor: 'UI Expert' },
      { title: 'Interview Prep Session', topic: 'Career', duration: '2 hours', instructor: 'Tech Recruiter' }
    ]
  },
  'data-analyst': {
    title: 'Data Analyst',
    description: 'Transform raw data into actionable insights using statistical analysis and visualization.',
    estimatedWeeks: { beginner: 20, intermediate: 14, advanced: 8 },
    skills: [
      { name: 'Excel/Google Sheets', category: 'Tools', proficiencyLevel: 'advanced', priority: 1 },
      { name: 'SQL', category: 'Database', proficiencyLevel: 'expert', priority: 2 },
      { name: 'Python', category: 'Programming', proficiencyLevel: 'advanced', priority: 3 },
      { name: 'Pandas', category: 'Library', proficiencyLevel: 'advanced', priority: 4 },
      { name: 'Data Visualization', category: 'Skills', proficiencyLevel: 'advanced', priority: 5 },
      { name: 'Tableau/Power BI', category: 'Tools', proficiencyLevel: 'intermediate', priority: 6 },
      { name: 'Statistics', category: 'Core', proficiencyLevel: 'intermediate', priority: 7 },
      { name: 'Data Cleaning', category: 'Skills', proficiencyLevel: 'advanced', priority: 8 }
    ],
    milestones: [
      { order: 1, title: 'Data Fundamentals', description: 'Excel, basic statistics, data types', duration: '3 weeks', durationWeeks: 3, skills: ['Excel', 'Statistics Basics', 'Data Types'] },
      { order: 2, title: 'SQL Mastery', description: 'Database queries, joins, aggregations', duration: '4 weeks', durationWeeks: 4, skills: ['SQL', 'Database Design', 'Query Optimization'] },
      { order: 3, title: 'Python for Data', description: 'Python basics, Pandas, NumPy', duration: '4 weeks', durationWeeks: 4, skills: ['Python', 'Pandas', 'NumPy'] },
      { order: 4, title: 'Data Visualization', description: 'Matplotlib, Seaborn, storytelling with data', duration: '3 weeks', durationWeeks: 3, skills: ['Matplotlib', 'Seaborn', 'Data Storytelling'] },
      { order: 5, title: 'BI Tools', description: 'Tableau or Power BI for dashboards', duration: '3 weeks', durationWeeks: 3, skills: ['Tableau', 'Power BI', 'Dashboard Design'] },
      { order: 6, title: 'Capstone Project', description: 'End-to-end data analysis project', duration: '3 weeks', durationWeeks: 3, skills: ['Project', 'Presentation', 'Portfolio'] }
    ],
    exams: [
      { title: 'Excel Data Analysis', skill: 'Excel', difficulty: 'beginner', order: 1 },
      { title: 'SQL Query Mastery', skill: 'SQL', difficulty: 'intermediate', order: 2 },
      { title: 'Python Data Manipulation', skill: 'Python', difficulty: 'intermediate', order: 3 },
      { title: 'Statistical Analysis', skill: 'Statistics', difficulty: 'intermediate', order: 4 },
      { title: 'Data Visualization Expert', skill: 'Visualization', difficulty: 'advanced', order: 5 },
      { title: 'Data Analyst Certification', skill: 'Full Stack', difficulty: 'advanced', order: 6 }
    ],
    courses: [
      { title: 'Excel for Data Analysis', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=Vl0H-qTclOg', duration: '4h', type: 'video', priority: 'essential' },
      { title: 'SQL Full Course', provider: 'Programming with Mosh', url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA', duration: '3h', type: 'video', priority: 'essential' },
      { title: 'Python for Data Science', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI', duration: '12h', type: 'video', priority: 'essential' },
      { title: 'Pandas Tutorial', provider: 'Corey Schafer', url: 'https://www.youtube.com/watch?v=ZyhVh-qRZPA', duration: '1h', type: 'video', priority: 'essential' },
      { title: 'Tableau for Beginners', provider: 'Simplilearn', url: 'https://www.youtube.com/watch?v=aHaOIvR00So', duration: '4h', type: 'video', priority: 'recommended' },
      { title: 'Statistics Fundamentals', provider: 'StatQuest', url: 'https://www.youtube.com/watch?v=xxpc-HPKN28', duration: '2h', type: 'video', priority: 'essential' }
    ],
    liveSessions: [
      { title: 'SQL Query Optimization', topic: 'SQL', duration: '1.5 hours', instructor: 'Database Expert' },
      { title: 'Data Storytelling Workshop', topic: 'Visualization', duration: '2 hours', instructor: 'Data Scientist' },
      { title: 'Career Paths in Data', topic: 'Career', duration: '1 hour', instructor: 'Hiring Manager' }
    ]
  },
  'iot-engineer': {
    title: 'IoT Engineer',
    description: 'Design and build connected devices and smart systems using sensors, microcontrollers, and cloud platforms.',
    estimatedWeeks: { beginner: 28, intermediate: 18, advanced: 10 },
    skills: [
      { name: 'C/C++', category: 'Programming', proficiencyLevel: 'advanced', priority: 1 },
      { name: 'Python', category: 'Programming', proficiencyLevel: 'intermediate', priority: 2 },
      { name: 'Arduino', category: 'Hardware', proficiencyLevel: 'advanced', priority: 3 },
      { name: 'Raspberry Pi', category: 'Hardware', proficiencyLevel: 'advanced', priority: 4 },
      { name: 'Sensors & Actuators', category: 'Hardware', proficiencyLevel: 'advanced', priority: 5 },
      { name: 'MQTT Protocol', category: 'Networking', proficiencyLevel: 'intermediate', priority: 6 },
      { name: 'Cloud IoT (AWS/Azure)', category: 'Cloud', proficiencyLevel: 'intermediate', priority: 7 },
      { name: 'Embedded Systems', category: 'Core', proficiencyLevel: 'advanced', priority: 8 },
      { name: 'Networking Basics', category: 'Networking', proficiencyLevel: 'intermediate', priority: 9 },
      { name: 'Security', category: 'Security', proficiencyLevel: 'basic', priority: 10 }
    ],
    milestones: [
      { order: 1, title: 'Programming Foundations', description: 'C/C++ basics, Python fundamentals', duration: '4 weeks', durationWeeks: 4, skills: ['C/C++', 'Python', 'Programming Logic'] },
      { order: 2, title: 'Electronics Basics', description: 'Circuits, components, sensors', duration: '4 weeks', durationWeeks: 4, skills: ['Electronics', 'Circuits', 'Sensors'] },
      { order: 3, title: 'Arduino Development', description: 'Arduino programming, projects', duration: '4 weeks', durationWeeks: 4, skills: ['Arduino', 'Sensors', 'Actuators'] },
      { order: 4, title: 'Raspberry Pi & Linux', description: 'Pi setup, Linux basics, GPIO', duration: '4 weeks', durationWeeks: 4, skills: ['Raspberry Pi', 'Linux', 'GPIO'] },
      { order: 5, title: 'Networking & Protocols', description: 'MQTT, HTTP, WiFi, Bluetooth', duration: '4 weeks', durationWeeks: 4, skills: ['MQTT', 'Protocols', 'Networking'] },
      { order: 6, title: 'Cloud Integration', description: 'AWS IoT, Azure IoT Hub', duration: '4 weeks', durationWeeks: 4, skills: ['AWS IoT', 'Azure IoT', 'Cloud'] },
      { order: 7, title: 'IoT Project', description: 'Complete IoT solution end-to-end', duration: '4 weeks', durationWeeks: 4, skills: ['Project', 'Integration', 'Deployment'] }
    ],
    exams: [
      { title: 'C/C++ Programming Fundamentals', skill: 'C/C++', difficulty: 'beginner', order: 1 },
      { title: 'Electronics & Circuits', skill: 'Electronics', difficulty: 'intermediate', order: 2 },
      { title: 'Arduino Development', skill: 'Arduino', difficulty: 'intermediate', order: 3 },
      { title: 'Raspberry Pi Mastery', skill: 'Raspberry Pi', difficulty: 'intermediate', order: 4 },
      { title: 'IoT Protocols & Networking', skill: 'Networking', difficulty: 'advanced', order: 5 },
      { title: 'Cloud IoT Solutions', skill: 'Cloud', difficulty: 'advanced', order: 6 },
      { title: 'IoT Engineer Certification', skill: 'IoT', difficulty: 'advanced', order: 7 }
    ],
    courses: [
      { title: 'C Programming Full Course', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=KJgsSFOSQv0', duration: '4h', type: 'video', priority: 'essential' },
      { title: 'Arduino Crash Course', provider: 'Programming Electronics', url: 'https://www.youtube.com/watch?v=nL34zDTPkcs', duration: '2h', type: 'video', priority: 'essential' },
      { title: 'Raspberry Pi Full Guide', provider: 'NetworkChuck', url: 'https://www.youtube.com/watch?v=eZ74x6dVYes', duration: '1h', type: 'video', priority: 'essential' },
      { title: 'IoT Tutorial for Beginners', provider: 'Simplilearn', url: 'https://www.youtube.com/watch?v=LlhmzVL5bm8', duration: '3h', type: 'video', priority: 'essential' },
      { title: 'MQTT Explained', provider: 'HiveMQ', url: 'https://www.youtube.com/watch?v=EIxdz-2rhLs', duration: '30m', type: 'video', priority: 'recommended' },
      { title: 'AWS IoT Core Tutorial', provider: 'AWS', url: 'https://www.youtube.com/watch?v=WAp6FHbhYCk', duration: '1h', type: 'video', priority: 'recommended' }
    ],
    liveSessions: [
      { title: 'Hands-on Arduino Workshop', topic: 'Arduino', duration: '3 hours', instructor: 'Hardware Engineer' },
      { title: 'IoT Security Best Practices', topic: 'Security', duration: '2 hours', instructor: 'Security Expert' },
      { title: 'Industry IoT Applications', topic: 'Career', duration: '1.5 hours', instructor: 'IoT Architect' }
    ]
  },
  'backend-developer': {
    title: 'Backend Developer',
    description: 'Build robust server-side applications, APIs, and database systems.',
    estimatedWeeks: { beginner: 22, intermediate: 14, advanced: 8 },
    skills: [
      { name: 'Node.js', category: 'Runtime', proficiencyLevel: 'expert', priority: 1 },
      { name: 'Express.js', category: 'Framework', proficiencyLevel: 'advanced', priority: 2 },
      { name: 'MongoDB', category: 'Database', proficiencyLevel: 'advanced', priority: 3 },
      { name: 'SQL Databases', category: 'Database', proficiencyLevel: 'intermediate', priority: 4 },
      { name: 'REST API Design', category: 'Architecture', proficiencyLevel: 'advanced', priority: 5 },
      { name: 'Authentication (JWT)', category: 'Security', proficiencyLevel: 'advanced', priority: 6 },
      { name: 'Docker', category: 'DevOps', proficiencyLevel: 'intermediate', priority: 7 },
      { name: 'Git', category: 'Tools', proficiencyLevel: 'intermediate', priority: 8 }
    ],
    milestones: [
      { order: 1, title: 'JavaScript & Node.js', description: 'JS fundamentals, Node.js basics', duration: '4 weeks', durationWeeks: 4, skills: ['JavaScript', 'Node.js', 'npm'] },
      { order: 2, title: 'Express & APIs', description: 'REST APIs with Express.js', duration: '4 weeks', durationWeeks: 4, skills: ['Express.js', 'REST API', 'Middleware'] },
      { order: 3, title: 'Database Mastery', description: 'MongoDB & SQL databases', duration: '4 weeks', durationWeeks: 4, skills: ['MongoDB', 'PostgreSQL', 'ORMs'] },
      { order: 4, title: 'Authentication & Security', description: 'JWT, OAuth, security best practices', duration: '3 weeks', durationWeeks: 3, skills: ['JWT', 'OAuth', 'Security'] },
      { order: 5, title: 'DevOps Basics', description: 'Docker, deployment, CI/CD', duration: '3 weeks', durationWeeks: 3, skills: ['Docker', 'CI/CD', 'Deployment'] },
      { order: 6, title: 'Portfolio Project', description: 'Full backend application', duration: '4 weeks', durationWeeks: 4, skills: ['Project', 'Documentation', 'Testing'] }
    ],
    exams: [
      { title: 'JavaScript Essentials', skill: 'JavaScript', difficulty: 'intermediate', order: 1 },
      { title: 'Node.js Fundamentals', skill: 'Node.js', difficulty: 'intermediate', order: 2 },
      { title: 'RESTful API Design', skill: 'API', difficulty: 'intermediate', order: 3 },
      { title: 'Database Management', skill: 'Database', difficulty: 'intermediate', order: 4 },
      { title: 'Security & Authentication', skill: 'Security', difficulty: 'advanced', order: 5 },
      { title: 'Backend Developer Certification', skill: 'Full Stack', difficulty: 'advanced', order: 6 }
    ],
    courses: [
      { title: 'Node.js Full Course', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE', duration: '8h', type: 'video', priority: 'essential' },
      { title: 'Express.js Tutorial', provider: 'Traversy Media', url: 'https://www.youtube.com/watch?v=L72fhGm1tfE', duration: '2h', type: 'video', priority: 'essential' },
      { title: 'MongoDB Complete Course', provider: 'Net Ninja', url: 'https://www.youtube.com/watch?v=ExcRbA7fy_A', duration: '1h', type: 'video', priority: 'essential' },
      { title: 'Docker Tutorial', provider: 'TechWorld with Nana', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE', duration: '3h', type: 'video', priority: 'recommended' },
      { title: 'JWT Authentication', provider: 'Web Dev Simplified', url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4', duration: '30m', type: 'video', priority: 'essential' }
    ],
    liveSessions: [
      { title: 'API Architecture Workshop', topic: 'API', duration: '2 hours', instructor: 'Senior Backend Dev' },
      { title: 'Database Optimization', topic: 'Database', duration: '1.5 hours', instructor: 'DBA Expert' },
      { title: 'System Design Basics', topic: 'Architecture', duration: '2 hours', instructor: 'Tech Lead' }
    ]
  },
  'machine-learning-engineer': {
    title: 'Machine Learning Engineer',
    description: 'Build and deploy machine learning models to solve real-world problems.',
    estimatedWeeks: { beginner: 32, intermediate: 20, advanced: 12 },
    skills: [
      { name: 'Python', category: 'Programming', proficiencyLevel: 'expert', priority: 1 },
      { name: 'Mathematics (Linear Algebra)', category: 'Core', proficiencyLevel: 'advanced', priority: 2 },
      { name: 'Statistics & Probability', category: 'Core', proficiencyLevel: 'advanced', priority: 3 },
      { name: 'NumPy & Pandas', category: 'Libraries', proficiencyLevel: 'expert', priority: 4 },
      { name: 'Scikit-learn', category: 'ML', proficiencyLevel: 'advanced', priority: 5 },
      { name: 'TensorFlow/PyTorch', category: 'Deep Learning', proficiencyLevel: 'advanced', priority: 6 },
      { name: 'Data Visualization', category: 'Tools', proficiencyLevel: 'intermediate', priority: 7 },
      { name: 'Model Deployment', category: 'MLOps', proficiencyLevel: 'intermediate', priority: 8 }
    ],
    milestones: [
      { order: 1, title: 'Python Mastery', description: 'Advanced Python, libraries', duration: '4 weeks', durationWeeks: 4, skills: ['Python', 'NumPy', 'Pandas'] },
      { order: 2, title: 'Math Foundations', description: 'Linear algebra, calculus, statistics', duration: '4 weeks', durationWeeks: 4, skills: ['Linear Algebra', 'Calculus', 'Statistics'] },
      { order: 3, title: 'Machine Learning Basics', description: 'Supervised, unsupervised learning', duration: '5 weeks', durationWeeks: 5, skills: ['Regression', 'Classification', 'Clustering'] },
      { order: 4, title: 'Advanced ML', description: 'Ensemble methods, feature engineering', duration: '4 weeks', durationWeeks: 4, skills: ['Ensemble Methods', 'Feature Engineering', 'Model Selection'] },
      { order: 5, title: 'Deep Learning', description: 'Neural networks, CNN, RNN', duration: '6 weeks', durationWeeks: 6, skills: ['TensorFlow', 'PyTorch', 'Neural Networks'] },
      { order: 6, title: 'MLOps & Deployment', description: 'Model deployment, monitoring', duration: '4 weeks', durationWeeks: 4, skills: ['MLOps', 'Docker', 'Cloud'] },
      { order: 7, title: 'Capstone Project', description: 'End-to-end ML project', duration: '5 weeks', durationWeeks: 5, skills: ['Project', 'Portfolio', 'Presentation'] }
    ],
    exams: [
      { title: 'Python for ML', skill: 'Python', difficulty: 'intermediate', order: 1 },
      { title: 'Mathematics for ML', skill: 'Math', difficulty: 'intermediate', order: 2 },
      { title: 'Supervised Learning', skill: 'ML', difficulty: 'intermediate', order: 3 },
      { title: 'Unsupervised Learning', skill: 'ML', difficulty: 'intermediate', order: 4 },
      { title: 'Deep Learning Fundamentals', skill: 'DL', difficulty: 'advanced', order: 5 },
      { title: 'ML Engineer Certification', skill: 'Full', difficulty: 'advanced', order: 6 }
    ],
    courses: [
      { title: 'Python for Data Science', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI', duration: '12h', type: 'video', priority: 'essential' },
      { title: 'Machine Learning Course', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=NWONeJKn6kc', duration: '10h', type: 'video', priority: 'essential' },
      { title: 'Deep Learning Specialization', provider: 'Andrew Ng', url: 'https://www.youtube.com/watch?v=CS4cs9xVecg', duration: '5h', type: 'video', priority: 'essential' },
      { title: 'TensorFlow Tutorial', provider: 'TechWithTim', url: 'https://www.youtube.com/watch?v=tPYj3fFJGjk', duration: '3h', type: 'video', priority: 'recommended' },
      { title: 'Linear Algebra for ML', provider: '3Blue1Brown', url: 'https://www.youtube.com/watch?v=fNk_zzaMoSs', duration: '3h', type: 'video', priority: 'essential' }
    ],
    liveSessions: [
      { title: 'ML Model Selection', topic: 'ML', duration: '2 hours', instructor: 'ML Engineer' },
      { title: 'Deep Learning Workshop', topic: 'DL', duration: '3 hours', instructor: 'AI Researcher' },
      { title: 'ML Interview Prep', topic: 'Career', duration: '2 hours', instructor: 'Hiring Manager' }
    ]
  },
  'devops-engineer': {
    title: 'DevOps Engineer',
    description: 'Bridge development and operations with automation, CI/CD, and cloud infrastructure.',
    estimatedWeeks: { beginner: 24, intermediate: 16, advanced: 8 },
    skills: [
      { name: 'Linux', category: 'OS', proficiencyLevel: 'advanced', priority: 1 },
      { name: 'Docker', category: 'Containerization', proficiencyLevel: 'expert', priority: 2 },
      { name: 'Kubernetes', category: 'Orchestration', proficiencyLevel: 'advanced', priority: 3 },
      { name: 'CI/CD (Jenkins/GitHub Actions)', category: 'Automation', proficiencyLevel: 'advanced', priority: 4 },
      { name: 'Cloud (AWS/Azure)', category: 'Cloud', proficiencyLevel: 'advanced', priority: 5 },
      { name: 'Infrastructure as Code', category: 'IaC', proficiencyLevel: 'intermediate', priority: 6 },
      { name: 'Scripting (Bash/Python)', category: 'Programming', proficiencyLevel: 'intermediate', priority: 7 },
      { name: 'Monitoring', category: 'Observability', proficiencyLevel: 'intermediate', priority: 8 }
    ],
    milestones: [
      { order: 1, title: 'Linux & Scripting', description: 'Linux administration, Bash scripting', duration: '4 weeks', durationWeeks: 4, skills: ['Linux', 'Bash', 'CLI'] },
      { order: 2, title: 'Docker Mastery', description: 'Containers, images, Docker Compose', duration: '4 weeks', durationWeeks: 4, skills: ['Docker', 'Compose', 'Networking'] },
      { order: 3, title: 'CI/CD Pipelines', description: 'Jenkins, GitHub Actions, automation', duration: '4 weeks', durationWeeks: 4, skills: ['CI/CD', 'Jenkins', 'GitHub Actions'] },
      { order: 4, title: 'Kubernetes', description: 'Container orchestration', duration: '4 weeks', durationWeeks: 4, skills: ['Kubernetes', 'Helm', 'Pods'] },
      { order: 5, title: 'Cloud Infrastructure', description: 'AWS/Azure services', duration: '4 weeks', durationWeeks: 4, skills: ['AWS', 'Azure', 'Cloud Architecture'] },
      { order: 6, title: 'IaC & Monitoring', description: 'Terraform, monitoring tools', duration: '4 weeks', durationWeeks: 4, skills: ['Terraform', 'Prometheus', 'Grafana'] }
    ],
    exams: [
      { title: 'Linux Administration', skill: 'Linux', difficulty: 'intermediate', order: 1 },
      { title: 'Docker Essentials', skill: 'Docker', difficulty: 'intermediate', order: 2 },
      { title: 'CI/CD Pipeline Design', skill: 'CI/CD', difficulty: 'intermediate', order: 3 },
      { title: 'Kubernetes Fundamentals', skill: 'K8s', difficulty: 'advanced', order: 4 },
      { title: 'Cloud Architecture', skill: 'Cloud', difficulty: 'advanced', order: 5 },
      { title: 'DevOps Engineer Certification', skill: 'DevOps', difficulty: 'advanced', order: 6 }
    ],
    courses: [
      { title: 'Linux Full Course', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=wBp0Rb-ZJak', duration: '5h', type: 'video', priority: 'essential' },
      { title: 'Docker Tutorial', provider: 'TechWorld with Nana', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE', duration: '3h', type: 'video', priority: 'essential' },
      { title: 'Kubernetes Course', provider: 'TechWorld with Nana', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', duration: '4h', type: 'video', priority: 'essential' },
      { title: 'AWS Certified Cloud Practitioner', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=SOTamWNgDKc', duration: '13h', type: 'video', priority: 'recommended' },
      { title: 'Terraform Course', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=SLB_c_ayRMo', duration: '2h', type: 'video', priority: 'recommended' }
    ],
    liveSessions: [
      { title: 'CI/CD Best Practices', topic: 'CI/CD', duration: '2 hours', instructor: 'DevOps Lead' },
      { title: 'Kubernetes Deep Dive', topic: 'K8s', duration: '3 hours', instructor: 'K8s Expert' },
      { title: 'Cloud Architecture Design', topic: 'Cloud', duration: '2 hours', instructor: 'Solutions Architect' }
    ]
  }
};

// Generate roadmap for user
export const generateRoadmap = async (req, res) => {
  try {
    const { careerGoal, currentLevel = 'beginner' } = req.body;
    const userId = req.user.id;

    // Check if career path exists
    const careerPath = careerPaths[careerGoal];
    if (!careerPath) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid career goal. Please select a valid career path.' 
      });
    }

    // Check if user already has an active roadmap for this career
    const existingRoadmap = await CareerRoadmap.findOne({
      userId,
      careerGoal,
      status: 'active'
    });

    if (existingRoadmap) {
      return res.json({ 
        success: true, 
        roadmap: existingRoadmap,
        message: 'Returning existing roadmap'
      });
    }

    // Calculate estimated time based on level
    const estimatedWeeks = careerPath.estimatedWeeks[currentLevel];
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedWeeks * 7);

    // Format display time
    let estimatedTimeDisplay;
    if (estimatedWeeks >= 52) {
      estimatedTimeDisplay = `${Math.round(estimatedWeeks / 52)} year${estimatedWeeks >= 104 ? 's' : ''}`;
    } else if (estimatedWeeks >= 4) {
      estimatedTimeDisplay = `${Math.round(estimatedWeeks / 4)} months`;
    } else {
      estimatedTimeDisplay = `${estimatedWeeks} weeks`;
    }

    // Schedule live sessions
    const scheduledLiveSessions = careerPath.liveSessions.map((session, index) => ({
      ...session,
      scheduledDate: new Date(Date.now() + (index + 1) * 14 * 24 * 60 * 60 * 1000) // Every 2 weeks
    }));

    // Create Zoom meetings for live sessions
    const sessionsWithZoom = await createSessionMeetings(scheduledLiveSessions);

    // Create new roadmap
    const roadmap = new CareerRoadmap({
      userId,
      careerGoal,
      currentLevel,
      targetRole: careerPath.title,
      estimatedTimeWeeks: estimatedWeeks,
      estimatedTimeDisplay,
      milestones: careerPath.milestones,
      requiredSkills: careerPath.skills,
      exams: careerPath.exams,
      courses: careerPath.courses,
      liveSessions: sessionsWithZoom,
      estimatedCompletionDate,
      progress: {
        overall: 0,
        skillsCompleted: 0,
        examsCleared: 0,
        coursesCompleted: 0,
        milestonesCompleted: 0
      }
    });

    await roadmap.save();

    res.status(201).json({ 
      success: true, 
      roadmap,
      message: 'Career roadmap generated successfully!'
    });
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate roadmap' });
  }
};

// Get user's roadmaps
export const getUserRoadmaps = async (req, res) => {
  try {
    const roadmaps = await CareerRoadmap.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, roadmaps });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch roadmaps' });
  }
};

// Get single roadmap
export const getRoadmapById = async (req, res) => {
  try {
    const roadmap = await CareerRoadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    // Verify ownership
    if (roadmap.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch roadmap' });
  }
};

// Update milestone status
export const updateMilestone = async (req, res) => {
  try {
    const { milestoneId, status } = req.body;
    const roadmap = await CareerRoadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    const milestone = roadmap.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    milestone.status = status;
    if (status === 'completed') {
      milestone.completedAt = new Date();
    }

    roadmap.calculateProgress();
    await roadmap.save();

    res.json({ success: true, roadmap, message: 'Milestone updated' });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ success: false, message: 'Failed to update milestone' });
  }
};

// Update exam status
export const updateExam = async (req, res) => {
  try {
    const { examId, status, score } = req.body;
    const roadmap = await CareerRoadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    const exam = roadmap.exams.id(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    exam.status = status;
    if (score) exam.estimatedScore = score;

    roadmap.calculateProgress();
    await roadmap.save();

    res.json({ success: true, roadmap, message: 'Exam updated' });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ success: false, message: 'Failed to update exam' });
  }
};

// Update course completion
export const updateCourse = async (req, res) => {
  try {
    const { courseId, completed } = req.body;
    const roadmap = await CareerRoadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    const course = roadmap.courses.id(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.completed = completed;

    roadmap.calculateProgress();
    await roadmap.save();

    res.json({ success: true, roadmap, message: 'Course updated' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Failed to update course' });
  }
};

// Get available career paths
export const getCareerPaths = async (req, res) => {
  try {
    const paths = Object.entries(careerPaths).map(([key, value]) => ({
      id: key,
      title: value.title,
      description: value.description,
      estimatedWeeks: value.estimatedWeeks,
      skillCount: value.skills.length,
      milestoneCount: value.milestones.length,
      examCount: value.exams.length,
      courseCount: value.courses.length
    }));

    res.json({ success: true, careerPaths: paths });
  } catch (error) {
    console.error('Get career paths error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch career paths' });
  }
};

// Delete roadmap
export const deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await CareerRoadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    if (roadmap.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await CareerRoadmap.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Roadmap deleted' });
  } catch (error) {
    console.error('Delete roadmap error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete roadmap' });
  }
};

// Register for a live session
export const registerForSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;
    
    const roadmap = await CareerRoadmap.findById(req.params.id);
    
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }
    
    const session = roadmap.liveSessions.id(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    // Check if already registered
    if (session.registeredUsers?.includes(userId)) {
      return res.json({ 
        success: true, 
        message: 'Already registered',
        session: {
          title: session.title,
          zoomJoinUrl: session.zoomJoinUrl,
          zoomPassword: session.zoomPassword,
          scheduledDate: session.scheduledDate
        }
      });
    }
    
    // Register user
    session.registeredUsers = session.registeredUsers || [];
    session.registeredUsers.push(userId);
    await roadmap.save();
    
    res.json({ 
      success: true, 
      message: 'Successfully registered for session',
      session: {
        title: session.title,
        zoomJoinUrl: session.zoomJoinUrl,
        zoomPassword: session.zoomPassword,
        scheduledDate: session.scheduledDate
      }
    });
  } catch (error) {
    console.error('Register for session error:', error);
    res.status(500).json({ success: false, message: 'Failed to register for session' });
  }
};

// Get session Zoom details
export const getSessionZoomDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    const roadmap = await CareerRoadmap.findById(req.params.id);
    
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }
    
    const session = roadmap.liveSessions.id(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    res.json({ 
      success: true, 
      session: {
        title: session.title,
        topic: session.topic,
        instructor: session.instructor,
        duration: session.duration,
        scheduledDate: session.scheduledDate,
        zoomJoinUrl: session.zoomJoinUrl,
        zoomMeetingId: session.zoomMeetingId,
        zoomPassword: session.zoomPassword,
        status: session.status,
        isRegistered: session.registeredUsers?.includes(userId) || false,
        isMockMeeting: session.isMockMeeting
      }
    });
  } catch (error) {
    console.error('Get session details error:', error);
    res.status(500).json({ success: false, message: 'Failed to get session details' });
  }
};
