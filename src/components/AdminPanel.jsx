import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, BookOpen, BarChart3, Settings, Shield, AlertTriangle, Award, Target, 
  Search, Plus, Trash2, RefreshCw, X, Check, ChevronLeft, ChevronRight,
  Edit, Eye, Download, Activity, TrendingUp, UserPlus, FileText, Trophy,
  Key, Database, Server, CheckSquare, Square, XCircle, Clock, Cpu, HardDrive,
  User, Mail, Lock, Camera, Calendar, MapPin, Phone, Globe, Save, LogOut,
  Menu, Bell, Zap, ArrowUpRight, ArrowDownRight, MoreVertical, Filter,
  PieChart, Layers, Home, ChevronDown, Sparkles, Crown, Star, MessageSquare
} from 'lucide-react';
import AdminTestimonials from './AdminTestimonials.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminPanel({ onBack, onHome }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [skills, setSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  
  // New features states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [examResults, setExamResults] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [resultPage, setResultPage] = useState(1);
  const [resultTotalPages, setResultTotalPages] = useState(1);
  
  // Admin Profile States
  const [adminProfile, setAdminProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showChangePassword, setShowChangePassword] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home, color: 'from-blue-500 to-blue-600' },
    { id: 'users', label: 'Users', icon: Users, color: 'from-violet-500 to-violet-600' },
    { id: 'exams', label: 'Exams', icon: BookOpen, color: 'from-emerald-500 to-emerald-600' },
    { id: 'results', label: 'Results', icon: FileText, color: 'from-amber-500 to-amber-600' },
    { id: 'skills', label: 'Skills', icon: Target, color: 'from-pink-500 to-pink-600' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
    { id: 'certificates', label: 'Certificates', icon: Award, color: 'from-cyan-500 to-cyan-600' },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare, color: 'from-purple-500 to-purple-600' },
    { id: 'analytics', label: 'Analytics', icon: PieChart, color: 'from-indigo-500 to-indigo-600' },
    { id: 'activity', label: 'Activity', icon: Activity, color: 'from-rose-500 to-rose-600' },
    { id: 'settings', label: 'System', icon: Database, color: 'from-slate-500 to-slate-600' },
    { id: 'profile', label: 'My Profile', icon: User, color: 'from-red-500 to-red-600' }
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const showMessage = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(null), 5000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
  };

  // API Calls
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/stats`, getAuthHeaders());
      setStats(res.data.stats);
    } catch (err) { showMessage('Failed to load stats', true); }
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/api/admin/users?page=${page}&limit=10&search=${searchQuery}&role=${roleFilter}`,
        getAuthHeaders()
      );
      setUsers(res.data.users);
      setTotalPages(res.data.pagination.pages);
      setCurrentPage(page);
    } catch (err) { showMessage('Failed to load users', true); }
    finally { setLoading(false); }
  };

  const fetchExams = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/api/admin/exams?page=${page}&limit=10&status=${statusFilter}&search=${searchQuery}`,
        getAuthHeaders()
      );
      setExams(res.data.exams);
      setTotalPages(res.data.pagination.pages);
      setCurrentPage(page);
    } catch (err) { showMessage('Failed to load exams', true); }
    finally { setLoading(false); }
  };

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/skills`, getAuthHeaders());
      setSkills(res.data.skills);
    } catch (err) { showMessage('Failed to load skills', true); }
    finally { setLoading(false); }
  };

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/achievements`, getAuthHeaders());
      setAchievements(res.data.achievements);
    } catch (err) { showMessage('Failed to load achievements', true); }
    finally { setLoading(false); }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/certificates`, getAuthHeaders());
      setCertificates(res.data.certificates);
    } catch (err) { showMessage('Failed to load certificates', true); }
    finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/analytics?period=30`, getAuthHeaders());
      setAnalytics(res.data.analytics);
    } catch (err) { showMessage('Failed to load analytics', true); }
    finally { setLoading(false); }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/activity?limit=50`, getAuthHeaders());
      setActivities(res.data.activities);
    } catch (err) { showMessage('Failed to load activities', true); }
    finally { setLoading(false); }
  };

  // New API functions
  const fetchExamResults = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/results?page=${page}&limit=10`, getAuthHeaders());
      setExamResults(res.data.results);
      setResultTotalPages(res.data.pagination.pages);
      setResultPage(page);
    } catch (err) { showMessage('Failed to load exam results', true); }
    finally { setLoading(false); }
  };

  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/system`, getAuthHeaders());
      setSystemInfo(res.data.system);
    } catch (err) { showMessage('Failed to load system info', true); }
    finally { setLoading(false); }
  };

  // Admin Profile Functions
  const fetchAdminProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, getAuthHeaders());
      setAdminProfile(res.data.user);
      setProfileForm({
        name: res.data.user.name || '',
        email: res.data.user.email || '',
        phone: res.data.user.phone || '',
        location: res.data.user.location || '',
        bio: res.data.user.bio || '',
        website: res.data.user.website || ''
      });
    } catch (err) { showMessage('Failed to load profile', true); }
    finally { setLoading(false); }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await axios.put(`${API_BASE}/api/users/profile`, profileForm, getAuthHeaders());
      setAdminProfile(res.data.user);
      setEditingProfile(false);
      showMessage('Profile updated successfully');
    } catch (err) { showMessage(err.response?.data?.message || 'Failed to update profile', true); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('Passwords do not match', true);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', true);
      return;
    }
    try {
      await axios.put(`${API_BASE}/api/users/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, getAuthHeaders());
      showMessage('Password changed successfully');
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { showMessage(err.response?.data?.message || 'Failed to change password', true); }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users/${userId}`, getAuthHeaders());
      setUserDetails(res.data);
      setShowUserDetails(true);
    } catch (err) { showMessage('Failed to load user details', true); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', true);
      return;
    }
    try {
      await axios.put(`${API_BASE}/api/admin/users/${selectedItem._id}/reset-password`, 
        { newPassword }, getAuthHeaders());
      showMessage('Password reset successfully');
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (err) { showMessage(err.response?.data?.message || 'Password reset failed', true); }
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Delete ${selectedUsers.length} users? This cannot be undone.`)) return;
    try {
      await axios.post(`${API_BASE}/api/admin/users/bulk-delete`, { userIds: selectedUsers }, getAuthHeaders());
      showMessage(`${selectedUsers.length} users deleted`);
      setSelectedUsers([]);
      fetchUsers(currentPage);
    } catch (err) { showMessage('Bulk delete failed', true); }
  };

  const handleBulkUpdateExamStatus = async (status) => {
    if (selectedExams.length === 0) return;
    try {
      await axios.post(`${API_BASE}/api/admin/exams/bulk-status`, 
        { examIds: selectedExams, status }, getAuthHeaders());
      showMessage(`${selectedExams.length} exams updated to ${status}`);
      setSelectedExams([]);
      fetchExams(currentPage);
    } catch (err) { showMessage('Bulk update failed', true); }
  };

  const handleExportUsers = async (format = 'csv') => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users/export?format=${format}`, getAuthHeaders());
      if (format === 'csv') {
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        a.click();
      } else {
        const blob = new Blob([JSON.stringify(res.data.users, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.json';
        a.click();
      }
      showMessage('Export completed');
    } catch (err) { showMessage('Export failed', true); }
  };

  const handleRevokeCertificate = async (certId) => {
    if (!confirm('Revoke this certificate?')) return;
    try {
      await axios.put(`${API_BASE}/api/admin/certificates/${certId}/revoke`, {}, getAuthHeaders());
      showMessage('Certificate revoked');
      fetchCertificates();
    } catch (err) { showMessage('Revoke failed', true); }
  };

  const handleDeleteResult = async (resultId) => {
    if (!confirm('Delete this exam result?')) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/results/${resultId}`, getAuthHeaders());
      showMessage('Result deleted');
      fetchExamResults(resultPage);
    } catch (err) { showMessage('Delete failed', true); }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const toggleExamSelection = (examId) => {
    setSelectedExams(prev => prev.includes(examId) ? prev.filter(id => id !== examId) : [...prev, examId]);
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) setSelectedUsers([]);
    else setSelectedUsers(users.map(u => u._id));
  };

  const selectAllExams = () => {
    if (selectedExams.length === exams.length) setSelectedExams([]);
    else setSelectedExams(exams.map(e => e._id));
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      const endpoint = modalType === 'user' ? '/api/admin/users' 
        : modalType === 'skill' ? '/api/admin/skills'
        : modalType === 'achievement' ? '/api/admin/achievements'
        : modalType === 'exam' ? '/api/admin/exams' : '';
      
      await axios.post(`${API_BASE}${endpoint}`, formData, getAuthHeaders());
      showMessage(`${modalType} created successfully`);
      setShowModal(false);
      refreshCurrentTab();
    } catch (err) { showMessage(err.response?.data?.message || 'Creation failed', true); }
  };

  const handleUpdate = async () => {
    try {
      const endpoint = modalType === 'user' ? `/api/admin/users/${selectedItem._id}`
        : modalType === 'skill' ? `/api/admin/skills/${selectedItem._id}`
        : modalType === 'achievement' ? `/api/admin/achievements/${selectedItem._id}`
        : modalType === 'exam' ? `/api/admin/exams/${selectedItem._id}` : '';
      
      await axios.put(`${API_BASE}${endpoint}`, formData, getAuthHeaders());
      showMessage(`${modalType} updated successfully`);
      setShowModal(false);
      refreshCurrentTab();
    } catch (err) { showMessage(err.response?.data?.message || 'Update failed', true); }
  };

  const handleDelete = async (type, id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const endpoint = type === 'user' ? `/api/admin/users/${id}`
        : type === 'skill' ? `/api/admin/skills/${id}`
        : type === 'achievement' ? `/api/admin/achievements/${id}`
        : type === 'exam' ? `/api/admin/exams/${id}`
        : type === 'certificate' ? `/api/admin/certificates/${id}` : '';
      
      await axios.delete(`${API_BASE}${endpoint}`, getAuthHeaders());
      showMessage(`${type} deleted successfully`);
      refreshCurrentTab();
    } catch (err) { showMessage(err.response?.data?.message || 'Delete failed', true); }
  };

  const refreshCurrentTab = () => {
    if (activeTab === 'overview') fetchStats();
    else if (activeTab === 'users') fetchUsers(currentPage);
    else if (activeTab === 'exams') fetchExams(currentPage);
    else if (activeTab === 'results') fetchExamResults(resultPage);
    else if (activeTab === 'skills') fetchSkills();
    else if (activeTab === 'achievements') fetchAchievements();
    else if (activeTab === 'certificates') fetchCertificates();
    else if (activeTab === 'analytics') fetchAnalytics();
    else if (activeTab === 'activity') fetchActivities();
    else if (activeTab === 'settings') fetchSystemInfo();
    else if (activeTab === 'profile') fetchAdminProfile();
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item ? { ...item } : getDefaultFormData(type));
    setShowModal(true);
  };

  const getDefaultFormData = (type) => {
    if (type === 'user') return { name: '', email: '', password: '', role: 'user' };
    if (type === 'skill') return { title: '', description: '', category: 'machine-learning', difficulty: 'Intermediate' };
    if (type === 'achievement') return { title: '', description: '', category: 'milestone', points: 100, rarity: 'common' };
    if (type === 'exam') return { title: '', skillName: '', difficulty: 'Intermediate', timeLimit: 30, passingScore: 70, status: 'draft' };
    return {};
  };

  useEffect(() => { refreshCurrentTab(); }, [activeTab]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'users') fetchUsers(1);
      else if (activeTab === 'exams') fetchExams(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter, statusFilter]);

  // Enhanced Stat Card Component
  const StatCard = ({ icon: Icon, label, value, subValue, color, trend, trendUp }) => (
    <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" 
           style={{ background: `linear-gradient(135deg, ${color === 'bg-blue-500' ? '#3B82F6' : color === 'bg-green-500' ? '#22C55E' : color === 'bg-purple-500' ? '#A855F7' : '#F97316'}, transparent)` }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
              trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
        {subValue && <div className="text-xs text-emerald-600 mt-2 font-medium">{subValue}</div>}
      </div>
    </div>
  );

  // Enhanced Pagination Component
  const Pagination = ({ currentPg = currentPage, totalPgs = totalPages, onPageChange }) => (
    totalPgs > 1 && (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button 
          onClick={() => onPageChange ? onPageChange(currentPg - 1) : (activeTab === 'users' ? fetchUsers(currentPg - 1) : fetchExams(currentPg - 1))} 
          disabled={currentPg === 1} 
          className="p-2.5 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:hover:bg-white disabled:hover:border-gray-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1">
          {[...Array(Math.min(5, totalPgs))].map((_, idx) => {
            let pageNum;
            if (totalPgs <= 5) pageNum = idx + 1;
            else if (currentPg <= 3) pageNum = idx + 1;
            else if (currentPg >= totalPgs - 2) pageNum = totalPgs - 4 + idx;
            else pageNum = currentPg - 2 + idx;
            
            return (
              <button
                key={idx}
                onClick={() => onPageChange ? onPageChange(pageNum) : (activeTab === 'users' ? fetchUsers(pageNum) : fetchExams(pageNum))}
                className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                  currentPg === pageNum 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button 
          onClick={() => onPageChange ? onPageChange(currentPg + 1) : (activeTab === 'users' ? fetchUsers(currentPg + 1) : fetchExams(currentPg + 1))}
          disabled={currentPg === totalPgs} 
          className="p-2.5 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:hover:bg-white disabled:hover:border-gray-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    )
  );

  // Loading Skeleton
  const LoadingSkeleton = ({ type = 'card' }) => (
    <div className="animate-pulse">
      {type === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
                <div className="w-16 h-6 bg-gray-200 rounded-full" />
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded-lg mb-2" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}
      {type === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="w-48 h-6 bg-gray-200 rounded" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded" />
                <div className="w-48 h-3 bg-gray-200 rounded" />
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Enhanced Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white transition-all duration-300 z-50 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/skillforge-logo.png"
              alt="SkillForge"
              className="w-10 h-10 object-contain"
            />
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg">SkillForge</h1>
                <p className="text-xs text-gray-400">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100vh-180px)] scrollbar-thin scrollbar-thumb-white/10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? `bg-gradient-to-r ${tab.color} shadow-lg` 
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                {!sidebarCollapsed && (
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                    {tab.label}
                  </span>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab === 'overview' ? 'Dashboard' : activeTab}</h2>
                  <p className="text-sm text-gray-500">Welcome back, Admin! Here's what's happening today.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative hidden lg:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search anything..." 
                    className="w-80 pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  </button>
                </div>

                {/* Refresh Button */}
                <button 
                  onClick={refreshCurrentTab} 
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors ${loading ? 'animate-spin' : ''}`} />
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{adminProfile?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-200 hover:shadow-red-300 transition-shadow"
                  >
                    {adminProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="px-8 pt-4">
          {error && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 rounded-2xl flex items-center justify-between animate-slideDown">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="p-2 hover:bg-red-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between animate-slideDown">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{success}</span>
              </div>
              <button onClick={() => setSuccess(null)} className="p-2 hover:bg-emerald-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <main className="px-8 py-6">{/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {loading ? <LoadingSkeleton type="card" /> : stats ? (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard 
                        icon={Users} 
                        label="Total Users" 
                        value={stats.users?.total || 0} 
                        trend={stats.users?.growth || '+12%'} 
                        trendUp={true}
                        color="bg-gradient-to-br from-blue-500 to-blue-600" 
                      />
                      <StatCard 
                        icon={BookOpen} 
                        label="Active Exams" 
                        value={stats.exams?.active || 0} 
                        trend="+5%"
                        trendUp={true}
                        color="bg-gradient-to-br from-emerald-500 to-emerald-600" 
                      />
                      <StatCard 
                        icon={Award} 
                        label="Certificates" 
                        value={stats.certificates?.total || 0} 
                        trend="+18%"
                        trendUp={true}
                        color="bg-gradient-to-br from-purple-500 to-purple-600" 
                      />
                      <StatCard 
                        icon={Target} 
                        label="Skills" 
                        value={stats.skills?.total || 0} 
                        color="bg-gradient-to-br from-amber-500 to-amber-600" 
                      />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Exam Statistics */}
                      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Exam Performance</h3>
                            <p className="text-sm text-gray-500">Overview of exam statistics</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg">This Month</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                            <div className="text-4xl font-bold text-blue-600 mb-2">{stats.results?.total || 0}</div>
                            <p className="text-sm text-gray-600 font-medium">Total Attempts</p>
                            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-600">
                              <ArrowUpRight className="w-3.5 h-3.5" /> +24% from last month
                            </div>
                          </div>
                          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
                            <div className="text-4xl font-bold text-emerald-600 mb-2">{stats.results?.passRate || '0%'}</div>
                            <p className="text-sm text-gray-600 font-medium">Pass Rate</p>
                            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-600">
                              <ArrowUpRight className="w-3.5 h-3.5" /> +5% improvement
                            </div>
                          </div>
                          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                            <div className="text-4xl font-bold text-purple-600 mb-2">{stats.results?.averageScore || 0}%</div>
                            <p className="text-sm text-gray-600 font-medium">Average Score</p>
                            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-600">
                              <TrendingUp className="w-3.5 h-3.5" /> Trending up
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* User Distribution */}
                      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">User Roles</h3>
                            <p className="text-sm text-gray-500">Distribution by type</p>
                          </div>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-transparent rounded-xl group hover:from-red-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                                <Crown className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-medium text-gray-700">Admins</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{stats.users?.admins || 0}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl group hover:from-blue-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                <Star className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-medium text-gray-700">Instructors</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{stats.users?.instructors || 0}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl group hover:from-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-medium text-gray-700">Regular Users</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{stats.users?.active || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <button 
                        onClick={() => setActiveTab('users')}
                        className="group p-6 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl text-white hover:shadow-xl hover:shadow-violet-200 transition-all duration-300"
                      >
                        <UserPlus className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-lg">Manage Users</p>
                        <p className="text-sm text-violet-200">Add, edit & delete users</p>
                      </button>
                      <button 
                        onClick={() => setActiveTab('exams')}
                        className="group p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white hover:shadow-xl hover:shadow-emerald-200 transition-all duration-300"
                      >
                        <BookOpen className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-lg">Manage Exams</p>
                        <p className="text-sm text-emerald-200">Create & configure exams</p>
                      </button>
                      <button 
                        onClick={() => setActiveTab('analytics')}
                        className="group p-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-white hover:shadow-xl hover:shadow-amber-200 transition-all duration-300"
                      >
                        <PieChart className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-lg">View Analytics</p>
                        <p className="text-sm text-amber-200">Insights & reports</p>
                      </button>
                      <button 
                        onClick={() => setActiveTab('settings')}
                        className="group p-6 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl text-white hover:shadow-xl hover:shadow-slate-200 transition-all duration-300"
                      >
                        <Settings className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-lg">System Settings</p>
                        <p className="text-sm text-slate-300">Configure system</p>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Click refresh to load statistics</p>
                  </div>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Enhanced Header */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-wrap gap-3 flex-1">
                    <div className="relative flex-1 min-w-[280px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm" 
                      />
                    </div>
                    <div className="relative">
                      <select 
                        value={roleFilter} 
                        onChange={e => setRoleFilter(e.target.value)} 
                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer shadow-sm"
                      >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="instructor">Instructors</option>
                        <option value="admin">Admins</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <button onClick={() => handleExportUsers('csv')} className="px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors border-r border-gray-200">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">CSV</span>
                      </button>
                      <button onClick={() => handleExportUsers('json')} className="px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">JSON</span>
                      </button>
                    </div>
                    {selectedUsers.length > 0 && (
                      <button onClick={handleBulkDeleteUsers} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 hover:bg-red-100 transition-colors font-medium">
                        <Trash2 className="w-4 h-4" />
                        Delete ({selectedUsers.length})
                      </button>
                    )}
                    <button onClick={() => openModal('user')} className="px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-red-200 transition-all font-medium">
                      <UserPlus className="w-5 h-5" />
                      Add User
                    </button>
                  </div>
                </div>
                
                {loading ? <LoadingSkeleton type="table" /> : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-6 py-4 text-left">
                              <button onClick={selectAllUsers} className="text-gray-500 hover:text-gray-700 transition-colors">
                                {selectedUsers.length === users.length && users.length > 0 ? 
                                  <CheckSquare className="w-5 h-5 text-red-500" /> : 
                                  <Square className="w-5 h-5" />
                                }
                              </button>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Exams</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Avg Score</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {users.map((user, idx) => (
                            <tr 
                              key={user._id} 
                              className={`hover:bg-gray-50 transition-colors ${selectedUsers.includes(user._id) ? 'bg-red-50' : ''}`}
                              style={{ animationDelay: `${idx * 50}ms` }}
                            >
                              <td className="px-6 py-4">
                                <button onClick={() => toggleUserSelection(user._id)} className="transition-transform hover:scale-110">
                                  {selectedUsers.includes(user._id) ? 
                                    <CheckSquare className="w-5 h-5 text-red-500" /> : 
                                    <Square className="w-5 h-5 text-gray-400" />
                                  }
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-11 h-11 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-gray-600 font-bold shadow-sm">
                                    {user.name?.charAt(0)?.toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-700 ring-1 ring-red-200' : 
                                  user.role === 'instructor' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' : 
                                  'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                                }`}>
                                  {user.role === 'admin' && <Crown className="w-3.5 h-3.5" />}
                                  {user.role === 'instructor' && <Star className="w-3.5 h-3.5" />}
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-medium text-gray-900">{user.examsTaken || 0}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${
                                        (user.avgScore || 0) >= 70 ? 'bg-emerald-500' : 
                                        (user.avgScore || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${user.avgScore || 0}%` }}
                                    />
                                  </div>
                                  <span className="font-medium text-gray-900">{user.avgScore || 0}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => fetchUserDetails(user._id)} 
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => openModal('user', user)} 
                                    className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => { setSelectedItem(user); setShowPasswordModal(true); }} 
                                    className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                    title="Reset Password"
                                  >
                                    <Key className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete('user', user._id, user.name)} 
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {users.length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No users found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </div>
                )}
                <Pagination />
              </div>
            )}

            {/* EXAMS TAB */}
            {activeTab === 'exams' && (
              <div className="space-y-6">
                {/* Enhanced Header */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-wrap gap-3 flex-1">
                    <div className="relative flex-1 min-w-[280px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search exams..." 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm" 
                      />
                    </div>
                    <div className="relative">
                      <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)} 
                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer shadow-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {selectedExams.length > 0 && (
                      <>
                        <button onClick={() => handleBulkUpdateExamStatus('active')} className="px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors font-medium flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Activate ({selectedExams.length})
                        </button>
                        <button onClick={() => handleBulkUpdateExamStatus('archived')} className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                          Archive ({selectedExams.length})
                        </button>
                      </>
                    )}
                    <button onClick={selectAllExams} className="px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm">
                      {selectedExams.length === exams.length && exams.length > 0 ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                
                {loading ? <LoadingSkeleton type="card" /> : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {exams.map((exam, idx) => (
                      <div 
                        key={exam._id} 
                        className={`group bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl overflow-hidden ${
                          selectedExams.includes(exam._id) ? 'ring-2 ring-red-500 border-red-200' : 'border-gray-100 hover:border-gray-200'
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {/* Card Header */}
                        <div className="p-6 pb-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleExamSelection(exam._id)}
                                className="transition-transform hover:scale-110"
                              >
                                {selectedExams.includes(exam._id) ? 
                                  <CheckSquare className="w-5 h-5 text-red-500" /> : 
                                  <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                                }
                              </button>
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                exam.status === 'active' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500' :
                                exam.status === 'draft' ? 'bg-gradient-to-br from-amber-400 to-amber-500' :
                                'bg-gradient-to-br from-gray-400 to-gray-500'
                              }`}>
                                <BookOpen className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                              exam.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                              exam.status === 'draft' ? 'bg-amber-100 text-amber-700' : 
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {exam.status}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{exam.title}</h4>
                          <p className="text-sm text-gray-500 mb-4">{exam.skillName || 'General'} • {exam.difficulty}</p>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                              <div className="text-lg font-bold text-gray-900">{exam.attempts || 0}</div>
                              <div className="text-xs text-gray-500">Attempts</div>
                            </div>
                            <div className="text-center p-3 bg-emerald-50 rounded-xl">
                              <div className="text-lg font-bold text-emerald-600">{exam.passRate || 0}%</div>
                              <div className="text-xs text-gray-500">Pass Rate</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-xl">
                              <div className="text-lg font-bold text-blue-600">{exam.avgScore || 0}%</div>
                              <div className="text-xs text-gray-500">Avg Score</div>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {exam.timeLimit}min
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" /> {exam.passingScore}%
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openModal('exam', exam)} 
                              className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button 
                              onClick={() => handleDelete('exam', exam._id, exam.title)} 
                              className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {exams.length === 0 && !loading && (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">No exams found</p>
                    <p className="text-sm text-gray-400 mb-6">Try adjusting your search or filters</p>
                  </div>
                )}
                <Pagination />
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Skills Management</h3>
                    <p className="text-sm text-gray-500">Manage skills and categories</p>
                  </div>
                  <button onClick={() => openModal('skill')} className="px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-red-200 transition-all font-medium">
                    <Plus className="w-5 h-5" />Add Skill
                  </button>
                </div>
                {loading ? <LoadingSkeleton type="card" /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {skills.map((skill, idx) => (
                      <div 
                        key={skill._id} 
                        className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-pink-200">
                          <Target className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 mb-2">{skill.title}</h4>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{skill.description}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-pink-50 text-pink-600 text-xs font-medium rounded-lg">{skill.category}</span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">{skill.examCount || 0} exams</span>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                          <button onClick={() => openModal('skill', skill)} className="flex-1 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2">
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => handleDelete('skill', skill._id, skill.title)} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {skills.length === 0 && !loading && (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-10 h-10 text-pink-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">No skills found</p>
                    <p className="text-sm text-gray-400 mb-6">Add your first skill to get started</p>
                    <button onClick={() => openModal('skill')} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-medium">
                      Add First Skill
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ACHIEVEMENTS TAB */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
                    <p className="text-sm text-gray-500">Manage gamification achievements</p>
                  </div>
                  <button onClick={() => openModal('achievement')} className="px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-red-200 transition-all font-medium">
                    <Plus className="w-5 h-5" />Add Achievement
                  </button>
                </div>
                {loading ? <LoadingSkeleton type="card" /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {achievements.map((ach, idx) => (
                      <div 
                        key={ach._id} 
                        className={`group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                          ach.rarity === 'legendary' ? 'hover:border-yellow-300' :
                          ach.rarity === 'epic' ? 'hover:border-purple-300' :
                          ach.rarity === 'rare' ? 'hover:border-blue-300' : 'hover:border-gray-200'
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {/* Rarity Glow Effect */}
                        {ach.rarity === 'legendary' && (
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        
                        <div className="relative">
                          <div className="flex justify-between items-start mb-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                              ach.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-200' :
                              ach.rarity === 'epic' ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-200' :
                              ach.rarity === 'rare' ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200' :
                              'bg-gradient-to-br from-gray-400 to-gray-600 shadow-gray-200'
                            }`}>
                              <Trophy className="w-7 h-7 text-white" />
                            </div>
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide ${
                              ach.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                              ach.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                              ach.rarity === 'rare' ? 'bg-blue-100 text-blue-700' : 
                              'bg-gray-100 text-gray-600'
                            }`}>{ach.rarity}</span>
                          </div>
                          <h4 className="font-bold text-lg text-gray-900 mb-2">{ach.title}</h4>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ach.description}</p>
                          <div className="flex items-center justify-between mb-4">
                            <span className="flex items-center gap-2 text-amber-600 font-bold">
                              <Sparkles className="w-4 h-4" /> {ach.points} pts
                            </span>
                            <span className="text-sm text-gray-500">{ach.unlockCount || 0} unlocks</span>
                          </div>
                          <div className="flex gap-2 pt-4 border-t border-gray-100">
                            <button onClick={() => openModal('achievement', ach)} className="flex-1 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium">Edit</button>
                            <button onClick={() => handleDelete('achievement', ach._id, ach.title)} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CERTIFICATES TAB */}
            {activeTab === 'certificates' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Certificates</h3>
                  <p className="text-sm text-gray-500">Manage issued certificates</p>
                </div>
                {loading ? <LoadingSkeleton type="table" /> : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Skill</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Issued</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {certificates.map((cert, idx) => (
                            <tr key={cert._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                                    {cert.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{cert.user?.name}</div>
                                    <div className="text-sm text-gray-500">{cert.user?.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-medium text-gray-900">{cert.skill?.title || cert.skillName}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-emerald-600">{cert.score}%</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${
                                  cert.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {cert.status === 'active' ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                  {cert.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(cert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  {cert.status === 'active' && (
                                    <button onClick={() => handleRevokeCertificate(cert._id)} className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Revoke">
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button onClick={() => handleDelete('certificate', cert._id, 'certificate')} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {certificates.length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="w-8 h-8 text-cyan-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No certificates issued yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* RESULTS TAB */}
            {activeTab === 'results' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Exam Results</h3>
                  <p className="text-sm text-gray-500">View and manage all exam attempts</p>
                </div>
                {loading ? <LoadingSkeleton type="table" /> : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Exam</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {examResults.map((result, idx) => (
                            <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                                    {result.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{result.user?.name || 'Unknown'}</div>
                                    <div className="text-sm text-gray-500">{result.user?.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{result.exam?.title || 'Unknown'}</div>
                                <div className="text-sm text-gray-500">{result.exam?.skillName}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                                    result.score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {result.score}%
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${
                                  result.status === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {result.status === 'passed' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                  {result.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  {result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(result.createdAt).toLocaleString('en-US', { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </td>
                              <td className="px-6 py-4">
                                <button onClick={() => handleDeleteResult(result._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {examResults.length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-amber-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No exam results yet</p>
                      </div>
                    )}
                  </div>
                )}
                {resultTotalPages > 1 && (
                  <Pagination 
                    currentPg={resultPage} 
                    totalPgs={resultTotalPages} 
                    onPageChange={(page) => fetchExamResults(page)} 
                  />
                )}
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Analytics Dashboard</h3>
                  <p className="text-sm text-gray-500">Insights and performance metrics</p>
                </div>
                {loading ? <LoadingSkeleton type="card" /> : analytics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Top Performers */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">Top Performers</h3>
                              <p className="text-sm text-gray-500">Highest scoring users</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                              <Crown className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {analytics.topPerformers?.slice(0, 5).map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                                  i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                                  i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                  i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                                  'bg-gray-200 text-gray-600'
                                }`}>
                                  {i + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{p.name}</div>
                                  <div className="text-sm text-gray-500">{p.totalExams} exams completed</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald-600">{p.avgScore}%</div>
                                <div className="text-xs text-gray-500">{p.passRate}% pass rate</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Popular Skills */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">Popular Skills</h3>
                              <p className="text-sm text-gray-500">Most attempted skills</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="p-6 space-y-4">
                          {analytics.skillPopularity?.slice(0, 5).map((s, i) => {
                            const maxAttempts = Math.max(...(analytics.skillPopularity?.map(sk => sk.attempts) || [1]));
                            const percentage = (s.attempts / maxAttempts) * 100;
                            return (
                              <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-700">{s._id || 'Unknown'}</span>
                                  <span className="text-sm font-semibold text-indigo-600">{s.attempts} attempts</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Role Distribution */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">Role Distribution</h3>
                          <p className="text-sm text-gray-500">User breakdown by role</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {analytics.roleDistribution?.map((r, i) => (
                          <div key={i} className={`flex-1 min-w-[150px] p-6 rounded-2xl text-center ${
                            r._id === 'admin' ? 'bg-gradient-to-br from-red-50 to-red-100' :
                            r._id === 'instructor' ? 'bg-gradient-to-br from-blue-50 to-blue-100' :
                            'bg-gradient-to-br from-gray-50 to-gray-100'
                          }`}>
                            <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                              r._id === 'admin' ? 'bg-red-500' :
                              r._id === 'instructor' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`}>
                              {r._id === 'admin' ? <Crown className="w-6 h-6 text-white" /> :
                               r._id === 'instructor' ? <Star className="w-6 h-6 text-white" /> :
                               <Users className="w-6 h-6 text-white" />}
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">{r.count}</div>
                            <div className="text-sm font-medium capitalize text-gray-600">{r._id}s</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PieChart className="w-10 h-10 text-indigo-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">No analytics data</p>
                    <p className="text-sm text-gray-400">Click refresh to load analytics</p>
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-500">Latest actions across the platform</p>
                </div>
                {loading ? <LoadingSkeleton type="table" /> : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {activities.slice(0, 30).map((act, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            act.type === 'exam' ? (act.action === 'passed' ? 'bg-emerald-100' : 'bg-red-100') :
                            act.type === 'certificate' ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                            {act.type === 'exam' ? <BookOpen className={`w-6 h-6 ${act.action === 'passed' ? 'text-emerald-600' : 'text-red-600'}`} /> : 
                             act.type === 'certificate' ? <Award className="w-6 h-6 text-purple-600" /> : 
                             <Users className="w-6 h-6 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              <span className="font-semibold">{act.user}</span> 
                              <span className="text-gray-500"> {act.action} </span>
                              {act.type !== 'user' && <span className="font-medium text-gray-700">{act.target}</span>}
                            </p>
                            <p className="text-sm text-gray-500">{act.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-500">
                              {new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(act.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {activities.length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Activity className="w-8 h-8 text-rose-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No recent activity</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Database className="w-6 h-6 text-slate-600" /> System Information
                  </h3>
                  <p className="text-sm text-gray-500">Server status and database statistics</p>
                </div>
                
                {loading ? <LoadingSkeleton type="card" /> : systemInfo ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Server Info */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Server className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">Server</h4>
                            <p className="text-sm text-gray-500">Runtime info</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">Node Version</span>
                            <span className="font-semibold text-gray-900">{systemInfo.nodeVersion}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">Platform</span>
                            <span className="font-semibold text-gray-900 capitalize">{systemInfo.platform}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">Uptime</span>
                            <span className="font-semibold text-emerald-600">
                              {Math.floor(systemInfo.uptime / 3600)}h {Math.floor((systemInfo.uptime % 3600) / 60)}m
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Memory Usage */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Cpu className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">Memory</h4>
                            <p className="text-sm text-gray-500">Usage stats</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">Heap Used</span>
                              <span className="font-semibold text-gray-900">{Math.round(systemInfo.memoryUsage?.heapUsed / 1024 / 1024)} MB</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                style={{ width: `${(systemInfo.memoryUsage?.heapUsed / systemInfo.memoryUsage?.heapTotal) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">Heap Total</span>
                            <span className="font-semibold text-gray-900">{Math.round(systemInfo.memoryUsage?.heapTotal / 1024 / 1024)} MB</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">RSS</span>
                            <span className="font-semibold text-gray-900">{Math.round(systemInfo.memoryUsage?.rss / 1024 / 1024)} MB</span>
                          </div>
                        </div>
                      </div>

                      {/* Database Stats */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                            <HardDrive className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">Database</h4>
                            <p className="text-sm text-gray-500">Collection counts</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-blue-50 rounded-xl">
                            <div className="text-xl font-bold text-blue-600">{systemInfo.dbStats?.users || 0}</div>
                            <div className="text-xs text-gray-600">Users</div>
                          </div>
                          <div className="text-center p-3 bg-emerald-50 rounded-xl">
                            <div className="text-xl font-bold text-emerald-600">{systemInfo.dbStats?.exams || 0}</div>
                            <div className="text-xs text-gray-600">Exams</div>
                          </div>
                          <div className="text-center p-3 bg-amber-50 rounded-xl">
                            <div className="text-xl font-bold text-amber-600">{systemInfo.dbStats?.results || 0}</div>
                            <div className="text-xs text-gray-600">Results</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-xl">
                            <div className="text-xl font-bold text-purple-600">{systemInfo.dbStats?.certificates || 0}</div>
                            <div className="text-xs text-gray-600">Certs</div>
                          </div>
                          <div className="text-center p-3 bg-pink-50 rounded-xl">
                            <div className="text-xl font-bold text-pink-600">{systemInfo.dbStats?.skills || 0}</div>
                            <div className="text-xs text-gray-600">Skills</div>
                          </div>
                          <div className="text-center p-3 bg-cyan-50 rounded-xl">
                            <div className="text-xl font-bold text-cyan-600">{systemInfo.dbStats?.achievements || 0}</div>
                            <div className="text-xs text-gray-600">Achievements</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-amber-800 mb-2">Danger Zone</h4>
                          <p className="text-sm text-amber-700 mb-4">These actions are irreversible. Proceed with caution.</p>
                          <div className="flex flex-wrap gap-3">
                            <button 
                              className="px-5 py-2.5 bg-white text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-50 transition-colors border border-amber-200 flex items-center gap-2" 
                              onClick={() => showMessage('Database backup feature coming soon')}
                            >
                              <Database className="w-4 h-4" /> Backup Database
                            </button>
                            <button 
                              className="px-5 py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2" 
                              onClick={() => showMessage('Clear cache feature coming soon')}
                            >
                              <Trash2 className="w-4 h-4" /> Clear Cache
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Database className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">System info not loaded</p>
                    <p className="text-sm text-gray-400 mb-6">Click refresh to load system information</p>
                    <button onClick={fetchSystemInfo} className="px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium">
                      Load System Info
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TESTIMONIALS TAB */}
            {activeTab === 'testimonials' && (
              <AdminTestimonials />
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {loading ? (
                  <LoadingSkeleton type="card" />
                ) : adminProfile ? (
                  <>
                    {/* Enhanced Profile Header */}
                    <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-rose-600 rounded-3xl p-8 text-white overflow-hidden">
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/10 rounded-full" />
                      
                      <div className="relative flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                          <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center text-6xl font-bold border-4 border-white/30 shadow-2xl group-hover:scale-105 transition-transform">
                            {adminProfile.name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <button className="absolute bottom-2 right-2 w-10 h-10 bg-white text-red-600 rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all hover:scale-110">
                            <Camera className="w-5 h-5" />
                          </button>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        <div className="text-center md:text-left flex-1">
                          <h2 className="text-4xl font-bold mb-2">{adminProfile.name}</h2>
                          <p className="text-red-100 flex items-center justify-center md:justify-start gap-2 text-lg">
                            <Mail className="w-5 h-5" /> {adminProfile.email}
                          </p>
                          <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                            <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                              <Crown className="w-4 h-4" /> {adminProfile.role?.toUpperCase()}
                            </span>
                            <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Joined {new Date(adminProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button 
                            onClick={() => setEditingProfile(!editingProfile)} 
                            className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                              editingProfile ? 'bg-white text-red-600 shadow-lg' : 'bg-white/20 hover:bg-white/30 backdrop-blur'
                            }`}
                          >
                            <Edit className="w-5 h-5" /> {editingProfile ? 'Cancel' : 'Edit Profile'}
                          </button>
                          <button 
                            onClick={handleLogout} 
                            className="px-5 py-3 bg-white/20 hover:bg-red-700 backdrop-blur rounded-xl font-medium transition-all flex items-center gap-2"
                          >
                            <LogOut className="w-5 h-5" /> Logout
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Profile Form */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                              <User className="w-5 h-5 text-red-600" />
                            </div>
                            Personal Information
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                              <input
                                type="text"
                                value={profileForm.name || ''}
                                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                disabled={!editingProfile}
                                className={`w-full px-4 py-3 border rounded-xl transition-all ${
                                  editingProfile 
                                    ? 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                    : 'bg-gray-50 border-gray-100 text-gray-600'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                              <input
                                type="email"
                                value={profileForm.email || ''}
                                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                disabled={!editingProfile}
                                className={`w-full px-4 py-3 border rounded-xl transition-all ${
                                  editingProfile 
                                    ? 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                    : 'bg-gray-50 border-gray-100 text-gray-600'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                              <div className="relative">
                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                  type="tel"
                                  value={profileForm.phone || ''}
                                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                                  disabled={!editingProfile}
                                  placeholder="Enter phone number"
                                  className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all ${
                                    editingProfile 
                                      ? 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                      : 'bg-gray-50 border-gray-100 text-gray-600'
                                  }`}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                              <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                  type="text"
                                  value={profileForm.location || ''}
                                  onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                                  disabled={!editingProfile}
                                  placeholder="City, Country"
                                  className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all ${
                                    editingProfile 
                                      ? 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                      : 'bg-gray-50 border-gray-100 text-gray-600'
                                  }`}
                                />
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                              <div className="relative">
                                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                  type="url"
                                  value={profileForm.website || ''}
                                  onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                                  disabled={!editingProfile}
                                  placeholder="https://yourwebsite.com"
                                  className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all ${
                                    editingProfile 
                                      ? 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                      : 'bg-gray-50 border-gray-100 text-gray-600'
                                  }`}
                                />
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                              <textarea
                                value={profileForm.bio || ''}
                                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                                disabled={!editingProfile}
                                placeholder="Tell us about yourself..."
                                rows={4}
                                className={`w-full px-4 py-3 border rounded-xl transition-all resize-none ${
                                  editingProfile 
                                    ? 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                    : 'bg-gray-50 border-gray-100 text-gray-600'
                                }`}
                              />
                            </div>
                          </div>

                          {editingProfile && (
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                              <button 
                                onClick={() => { setEditingProfile(false); fetchAdminProfile(); }} 
                                className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={handleUpdateProfile} 
                                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-200 transition-all font-medium flex items-center gap-2"
                              >
                                <Save className="w-5 h-5" /> Save Changes
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Security Section */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                              <Lock className="w-5 h-5 text-amber-600" />
                            </div>
                            Security Settings
                          </h3>
                          
                          {!showChangePassword ? (
                            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                                  <Key className="w-6 h-6 text-gray-500" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">Password</p>
                                  <p className="text-sm text-gray-500">Last changed: Unknown</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => setShowChangePassword(true)} 
                                className="px-5 py-2.5 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors font-medium flex items-center gap-2"
                              >
                                <Key className="w-5 h-5" /> Change Password
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                <input
                                  type="password"
                                  value={passwordForm.currentPassword}
                                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <input
                                  type="password"
                                  value={passwordForm.newPassword}
                                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                <input
                                  type="password"
                                  value={passwordForm.confirmPassword}
                                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                              </div>
                              <div className="flex justify-end gap-3 pt-4">
                                <button 
                                  onClick={() => { setShowChangePassword(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} 
                                  className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-white transition-colors font-medium"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={handleChangePassword} 
                                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                                >
                                  Update Password
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sidebar Stats */}
                      <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-5">Account Stats</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-gray-700">Exams Created</span>
                              </div>
                              <span className="text-2xl font-bold text-blue-600">{stats?.exams?.total || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                  <Users className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-gray-700">Users Managed</span>
                              </div>
                              <span className="text-2xl font-bold text-emerald-600">{stats?.users?.total || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                  <Award className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-gray-700">Certificates</span>
                              </div>
                              <span className="text-2xl font-bold text-purple-600">{stats?.certificates?.total || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                                  <Target className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-gray-700">Skills Added</span>
                              </div>
                              <span className="text-2xl font-bold text-amber-600">{stats?.skills?.total || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-5">Quick Actions</h3>
                          <div className="space-y-3">
                            <button 
                              onClick={() => setActiveTab('users')} 
                              className="w-full px-4 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left flex items-center gap-4 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UserPlus className="w-5 h-5 text-violet-600" />
                              </div>
                              <span className="font-medium text-gray-700">Manage Users</span>
                              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                            </button>
                            <button 
                              onClick={() => setActiveTab('exams')} 
                              className="w-full px-4 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left flex items-center gap-4 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="w-5 h-5 text-emerald-600" />
                              </div>
                              <span className="font-medium text-gray-700">Manage Exams</span>
                              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                            </button>
                            <button 
                              onClick={() => setActiveTab('analytics')} 
                              className="w-full px-4 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left flex items-center gap-4 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                              </div>
                              <span className="font-medium text-gray-700">View Analytics</span>
                              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                            </button>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-2xl p-6 text-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-3">
                              <Crown className="w-5 h-5" />
                              <h3 className="font-bold">Admin Privileges</h3>
                            </div>
                            <p className="text-sm text-red-100 mb-4">Full access to all system features and data.</p>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-center gap-2"><Check className="w-4 h-4" /> User Management</li>
                              <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Content Management</li>
                              <li className="flex items-center gap-2"><Check className="w-4 h-4" /> System Settings</li>
                              <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Analytics Access</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-red-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">Profile not loaded</p>
                    <p className="text-sm text-gray-400 mb-6">Click refresh to load your profile</p>
                    <button onClick={fetchAdminProfile} className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium">
                      Load Profile
                    </button>
                  </div>
                )}
              </div>
            )}
        </main>
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {modalType === 'user' && <UserPlus className="w-5 h-5" />}
                    {modalType === 'skill' && <Target className="w-5 h-5" />}
                    {modalType === 'achievement' && <Trophy className="w-5 h-5" />}
                    {modalType === 'exam' && <BookOpen className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{selectedItem ? 'Edit' : 'Create New'} {modalType}</h3>
                    <p className="text-sm text-red-100">{selectedItem ? 'Update the details below' : 'Fill in the details to create'}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
              {modalType === 'user' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter user's full name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email || ''} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="user@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                    />
                  </div>
                  {!selectedItem && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <input 
                        type="password" 
                        value={formData.password || ''} 
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder="Minimum 6 characters"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['user', 'instructor', 'admin'].map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData({...formData, role})}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            formData.role === role 
                              ? 'border-red-500 bg-red-50 text-red-700' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            {role === 'admin' && <Crown className="w-5 h-5 mx-auto mb-1" />}
                            {role === 'instructor' && <Star className="w-5 h-5 mx-auto mb-1" />}
                            {role === 'user' && <User className="w-5 h-5 mx-auto mb-1" />}
                            <span className="text-sm font-medium capitalize">{role}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {modalType === 'skill' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Skill Title</label>
                    <input 
                      type="text" 
                      value={formData.title || ''} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Machine Learning Fundamentals"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea 
                      value={formData.description || ''} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe what this skill covers..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select 
                        value={formData.category || ''} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="machine-learning">Machine Learning</option>
                        <option value="deep-learning">Deep Learning</option>
                        <option value="nlp">NLP</option>
                        <option value="computer-vision">Computer Vision</option>
                        <option value="reinforcement-learning">Reinforcement Learning</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                      <select 
                        value={formData.difficulty || ''} 
                        onChange={e => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="Novice">Novice</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                        <option value="Master">Master</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              
              {modalType === 'achievement' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Achievement Title</label>
                    <input 
                      type="text" 
                      value={formData.title || ''} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., First Steps"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea 
                      value={formData.description || ''} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="How to unlock this achievement..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select 
                        value={formData.category || ''} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="milestone">Milestone</option>
                        <option value="performance">Performance</option>
                        <option value="skill">Skill</option>
                        <option value="participation">Participation</option>
                        <option value="special">Special</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Points</label>
                      <input 
                        type="number" 
                        value={formData.points || 0} 
                        onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rarity</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['common', 'uncommon', 'rare', 'epic', 'legendary'].map(rarity => (
                        <button
                          key={rarity}
                          type="button"
                          onClick={() => setFormData({...formData, rarity})}
                          className={`p-2.5 rounded-xl border-2 transition-all text-center ${
                            formData.rarity === rarity 
                              ? rarity === 'legendary' ? 'border-yellow-500 bg-yellow-50' :
                                rarity === 'epic' ? 'border-purple-500 bg-purple-50' :
                                rarity === 'rare' ? 'border-blue-500 bg-blue-50' :
                                rarity === 'uncommon' ? 'border-green-500 bg-green-50' :
                                'border-gray-500 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className={`text-xs font-medium capitalize ${
                            formData.rarity === rarity
                              ? rarity === 'legendary' ? 'text-yellow-700' :
                                rarity === 'epic' ? 'text-purple-700' :
                                rarity === 'rare' ? 'text-blue-700' :
                                rarity === 'uncommon' ? 'text-green-700' :
                                'text-gray-700'
                              : 'text-gray-600'
                          }`}>{rarity}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {modalType === 'exam' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Title</label>
                    <input 
                      type="text" 
                      value={formData.title || ''} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Python Fundamentals Assessment"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Associated Skill</label>
                    <input 
                      type="text" 
                      value={formData.skillName || ''} 
                      onChange={e => setFormData({...formData, skillName: e.target.value})}
                      placeholder="e.g., Python Programming"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                      <select 
                        value={formData.difficulty || ''} 
                        onChange={e => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="Novice">Novice</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                        <option value="Master">Master</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select 
                        value={formData.status || 'draft'} 
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit (min)</label>
                      <input 
                        type="number" 
                        value={formData.timeLimit || 30} 
                        onChange={e => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Score (%)</label>
                      <input 
                        type="number" 
                        value={formData.passingScore || 70} 
                        onChange={e => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={selectedItem ? handleUpdate : handleCreate} 
                className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-200 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {selectedItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAILS MODAL - Enhanced */}
      {showUserDetails && userDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-slideUp">
            {/* Header with gradient and user info */}
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 px-6 py-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <button onClick={() => { setShowUserDetails(false); setUserDetails(null); }} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-5 relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-white/30">
                  {userDetails.user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{userDetails.user?.name}</h3>
                  <p className="text-red-100">{userDetails.user?.email}</p>
                  <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-lg text-xs font-semibold ${
                    userDetails.user?.role === 'admin' ? 'bg-white/20 text-white' :
                    userDetails.user?.role === 'instructor' ? 'bg-purple-400/30 text-white' :
                    'bg-blue-400/30 text-white'
                  }`}>
                    {userDetails.user?.role === 'admin' && <Crown className="w-3.5 h-3.5" />}
                    {userDetails.user?.role === 'instructor' && <Star className="w-3.5 h-3.5" />}
                    {userDetails.user?.role === 'user' && <User className="w-3.5 h-3.5" />}
                    <span className="capitalize">{userDetails.user?.role}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 -mt-4 px-6 relative z-10">
              <div className="bg-white rounded-2xl p-4 text-center shadow-lg border border-gray-100 mx-1 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userDetails.examResults?.length || 0}</div>
                <div className="text-xs text-gray-500 font-medium">Exams Taken</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-lg border border-gray-100 mx-1 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userDetails.certificates?.length || 0}</div>
                <div className="text-xs text-gray-500 font-medium">Certificates</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-lg border border-gray-100 mx-1 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userDetails.achievements?.length || 0}</div>
                <div className="text-xs text-gray-500 font-medium">Achievements</div>
              </div>
            </div>
            
            {/* Content sections */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[45vh]">
              {/* Exam History */}
              {userDetails.examResults?.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Exam History
                  </h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {userDetails.examResults.map((result, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {result.score}%
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{result.exam?.title || 'Unknown Exam'}</p>
                            <p className="text-xs text-gray-500">{new Date(result.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {userDetails.certificates?.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                  <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-500" />
                    Certificates Earned
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    {userDetails.certificates.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-emerald-100 hover:shadow-sm transition-all">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900 text-sm block truncate">{cert.skillName}</span>
                          <span className="text-xs text-gray-500">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {userDetails.achievements?.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-100">
                  <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Achievements Unlocked
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {userDetails.achievements.map((ach, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-white text-amber-800 px-3 py-2 rounded-xl text-sm font-medium border border-amber-200 shadow-sm hover:shadow-md transition-all">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        {ach.achievement?.title || ach.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Empty state */}
              {!userDetails.examResults?.length && !userDetails.certificates?.length && !userDetails.achievements?.length && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No activity recorded yet</p>
                  <p className="text-sm text-gray-400">This user hasn't taken any exams or earned achievements</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL - Enhanced */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Reset Password</h3>
                    <p className="text-sm text-amber-100">Change user credentials</p>
                  </div>
                </div>
                <button onClick={() => { setShowPasswordModal(false); setNewPassword(''); setSelectedItem(null); }} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* User Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Resetting password for</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {selectedItem?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedItem?.name}</p>
                    <p className="text-sm text-gray-500">{selectedItem?.email}</p>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    minLength={6}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex-1 h-1.5 rounded-full ${newPassword.length >= 2 ? 'bg-red-400' : 'bg-gray-200'}`}></div>
                  <div className={`flex-1 h-1.5 rounded-full ${newPassword.length >= 4 ? 'bg-amber-400' : 'bg-gray-200'}`}></div>
                  <div className={`flex-1 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Minimum 6 characters required
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowPasswordModal(false); setNewPassword(''); setSelectedItem(null); }}
                  className="flex-1 px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={newPassword.length < 6}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                  <Key className="w-5 h-5" />
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
