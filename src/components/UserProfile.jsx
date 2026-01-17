import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, MapPin, Phone, CreditCard as Edit3, Save, X, Camera, Award, Target, Clock, Star, Trophy, Zap, BookOpen, Settings, Shield, Bell, Eye, EyeOff, Sparkles, Plus, Search, GraduationCap } from 'lucide-react';

// Skill suggestions for autocomplete
const SKILL_SUGGESTIONS = [
  'JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS',
  'Machine Learning', 'Deep Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps', 'Linux', 'Git',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'SQL', 'NoSQL',
  'React Native', 'Flutter', 'iOS Development', 'Android Development',
  'GraphQL', 'REST API', 'Microservices', 'System Design', 'Data Structures', 'Algorithms',
  'Cybersecurity', 'Blockchain', 'Web3', 'UI/UX Design', 'Figma'
];

export default function UserProfile({ user, onUpdateUser, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [knownSkills, setKnownSkills] = useState(user?.knownSkills || []);
  const [skillsToLearn, setSkillsToLearn] = useState(user?.skillsToLearn || []);
  const [newKnownSkill, setNewKnownSkill] = useState('');
  const [newSkillToLearn, setNewSkillToLearn] = useState('');
  const [savingSkills, setSavingSkills] = useState(false);
  const [skillsMessage, setSkillsMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || 'SkillMaster_42',
    email: user?.email || 'user@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Passionate AI enthusiast focused on machine learning and deep learning technologies.',
    website: 'https://skillmaster42.dev',
    linkedin: 'linkedin.com/in/skillmaster42',
    github: 'github.com/skillmaster42',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    examReminders: true,
    achievementAlerts: true,
    weeklyReports: false,
    marketingEmails: false
  });

  const stats = [
    { label: 'Total Points', value: '12,500', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Exams Completed', value: '18', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Skills Mastered', value: '4', icon: Trophy, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Current Streak', value: '14', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-100' }
  ];

  const recentAchievements = [
    { title: 'ML Expert', description: 'Mastered Machine Learning fundamentals', date: '2024-01-15', icon: Award },
    { title: 'Speed Demon', description: 'Completed exam in under 15 minutes', date: '2024-01-10', icon: Zap },
    { title: 'Streak Master', description: '14-day learning streak', date: '2024-01-08', icon: Target }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    // Update user data
    onUpdateUser({
      ...user,
      name: formData.name,
      email: formData.email
    });
    setIsEditing(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ];

  // Skills management functions
  const addKnownSkill = () => {
    const skill = newKnownSkill.trim();
    if (skill && !knownSkills.includes(skill) && !skillsToLearn.includes(skill)) {
      setKnownSkills([...knownSkills, skill]);
      setNewKnownSkill('');
    }
  };

  const addSkillToLearn = () => {
    const skill = newSkillToLearn.trim();
    if (skill && !skillsToLearn.includes(skill) && !knownSkills.includes(skill)) {
      setSkillsToLearn([...skillsToLearn, skill]);
      setNewSkillToLearn('');
    }
  };

  const removeKnownSkill = (skill) => {
    setKnownSkills(knownSkills.filter(s => s !== skill));
  };

  const removeSkillToLearn = (skill) => {
    setSkillsToLearn(skillsToLearn.filter(s => s !== skill));
  };

  const handleSaveSkills = async () => {
    setSavingSkills(true);
    setSkillsMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${apiUrl}/api/auth/skill-preferences`,
        { knownSkills, skillsToLearn },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      if (response.data.success) {
        const updatedUser = { ...user, knownSkills, skillsToLearn, hasCompletedOnboarding: true };
        localStorage.setItem('skillforge_user', JSON.stringify(updatedUser));
        onUpdateUser(updatedUser);
        setSkillsMessage('Skills updated successfully!');
        setTimeout(() => setSkillsMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save skills:', error);
      setSkillsMessage('Failed to save skills. Please try again.');
    }
    setSavingSkills(false);
  };

  const getFilteredSuggestions = (input, excludeList1, excludeList2) => {
    if (!input) return [];
    return SKILL_SUGGESTIONS.filter(skill =>
      skill.toLowerCase().includes(input.toLowerCase()) &&
      !excludeList1.includes(skill) &&
      !excludeList2.includes(skill)
    ).slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 
                
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-violet-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                  {formData.name.split(' ').map(n => n[0]).join('')}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white hover:bg-violet-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">{formData.name}</h2>
              <p className="text-gray-600 mb-4">{formData.email}</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{formData.location}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined January 2024</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="text-center">
                        <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-600">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:bg-gray-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:bg-gray-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:bg-gray-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:bg-gray-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                        <input
                          type="text"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="space-y-8">
                    {/* Skills Message */}
                    {skillsMessage && (
                      <div className={`p-4 rounded-lg ${skillsMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {skillsMessage}
                      </div>
                    )}

                    {/* Known Skills */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Skills You Know</h3>
                          <p className="text-sm text-gray-500">Skills you're already proficient in</p>
                        </div>
                      </div>

                      {/* Add Known Skill Input */}
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={newKnownSkill}
                            onChange={(e) => setNewKnownSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addKnownSkill()}
                            placeholder="Add a skill you know..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          />
                          {newKnownSkill && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                              {getFilteredSuggestions(newKnownSkill, knownSkills, skillsToLearn).map((skill, i) => (
                                <button
                                  key={i}
                                  onClick={() => { setNewKnownSkill(skill); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={addKnownSkill}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      {/* Known Skills List */}
                      <div className="flex flex-wrap gap-2">
                        {knownSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                          >
                            {skill}
                            <button onClick={() => removeKnownSkill(skill)} className="hover:opacity-70">
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                        {knownSkills.length === 0 && (
                          <p className="text-gray-400 italic">No skills added yet</p>
                        )}
                      </div>
                    </div>

                    {/* Skills to Learn */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Skills You Want to Learn</h3>
                          <p className="text-sm text-gray-500">We'll personalize exams and courses for these</p>
                        </div>
                      </div>

                      {/* Add Skill to Learn Input */}
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={newSkillToLearn}
                            onChange={(e) => setNewSkillToLearn(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkillToLearn()}
                            placeholder="Add a skill you want to learn..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                          />
                          {newSkillToLearn && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                              {getFilteredSuggestions(newSkillToLearn, skillsToLearn, knownSkills).map((skill, i) => (
                                <button
                                  key={i}
                                  onClick={() => { setNewSkillToLearn(skill); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={addSkillToLearn}
                          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      {/* Skills to Learn List */}
                      <div className="flex flex-wrap gap-2">
                        {skillsToLearn.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium"
                          >
                            <Sparkles className="w-3 h-3" />
                            {skill}
                            <button onClick={() => removeSkillToLearn(skill)} className="hover:opacity-70">
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                        {skillsToLearn.length === 0 && (
                          <p className="text-gray-400 italic">No learning goals added yet</p>
                        )}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        onClick={handleSaveSkills}
                        disabled={savingSkills}
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {savingSkills ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Skill Preferences
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                          />
                        </div>
                        
                        <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Enable 2FA</div>
                          <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
                        </div>
                        <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                            <div className="text-sm text-gray-600">
                              {key === 'emailUpdates' && 'Receive email notifications about your progress'}
                              {key === 'examReminders' && 'Get reminded about upcoming exams'}
                              {key === 'achievementAlerts' && 'Notifications when you unlock achievements'}
                              {key === 'weeklyReports' && 'Weekly summary of your learning progress'}
                              {key === 'marketingEmails' && 'Product updates and promotional content'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleNotificationChange(key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-violet-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
                    
                    <div className="space-y-4">
                      {recentAchievements.map((achievement, index) => {
                        const Icon = achievement.icon;
                        return (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-6 h-6 text-violet-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{achievement.title}</div>
                              <div className="text-sm text-gray-600">{achievement.description}</div>
                              <div className="text-xs text-gray-500 mt-1">{achievement.date}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}