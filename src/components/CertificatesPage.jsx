import { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Download, 
  Share2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Star,
  Filter,
  Search,
  Eye,
  ExternalLink,
  Loader2,
  X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CertificatesPage({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewCertificate, setPreviewCertificate] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    fetchCertificates();
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/certificates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }
      
      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expiring': return <Clock className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCertificateStatus = (certificate) => {
    if (certificate.status === 'expired' || certificate.status === 'revoked') return 'expired';
    if (certificate.expiryDate) {
      const expiry = new Date(certificate.expiryDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) return 'expired';
      if (daysUntilExpiry < 30) return 'expiring';
    }
    return 'active';
  };

  // Create a demo certificate for testing
  const createDemoCertificate = async () => {
    try {
      setCreatingDemo(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/certificates/demo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create demo certificate');
      }
      
      const data = await response.json();
      if (data.success) {
        // Refresh certificates list
        await fetchCertificates();
      }
    } catch (err) {
      console.error('Error creating demo certificate:', err);
      alert('Failed to create demo certificate. Please try again.');
    } finally {
      setCreatingDemo(false);
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const skillTitle = cert.skill?.title || cert.skillName || '';
    const matchesSearch = skillTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const certStatus = getCertificateStatus(cert);
    const matchesStatus = filterStatus === 'all' || certStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    switch (sortBy) {
      case 'date': return new Date(b.issuedDate || b.createdAt) - new Date(a.issuedDate || a.createdAt);
      case 'score': return (b.score || 0) - (a.score || 0);
      case 'title': return (a.skill?.title || a.skillName || '').localeCompare(b.skill?.title || b.skillName || '');
      default: return 0;
    }
  });

  const stats = [
    { label: 'Total Certificates', value: certificates.length, icon: Award, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active', value: certificates.filter(c => getCertificateStatus(c) === 'active').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Expiring Soon', value: certificates.filter(c => getCertificateStatus(c) === 'expiring').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Average Score', value: certificates.length > 0 ? Math.round(certificates.reduce((sum, c) => sum + (c.score || 0), 0) / certificates.length) + '%' : '0%', icon: Star, color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  // Generate certificate as downloadable image
  const downloadCertificate = async (certificate) => {
    try {
      const skillTitle = certificate.skill?.title || certificate.skillName || 'Course';
      const userName = certificate.user?.name || currentUser?.name || 'Student';
      const issueDate = new Date(certificate.issuedDate || certificate.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const credentialId = certificate.certificateId || certificate._id;
      const score = certificate.score || 0;

      // Create canvas for certificate
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Certificate dimensions (A4 landscape at 150 DPI)
      canvas.width = 1754;
      canvas.height = 1240;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1e1b4b');
      gradient.addColorStop(0.5, '#312e81');
      gradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Decorative border
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      
      // Inner border
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      // Corner decorations
      const cornerSize = 80;
      ctx.fillStyle = '#c4b5fd';
      
      // Top left corner
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.lineTo(40 + cornerSize, 40);
      ctx.lineTo(40, 40 + cornerSize);
      ctx.closePath();
      ctx.fill();
      
      // Top right corner
      ctx.beginPath();
      ctx.moveTo(canvas.width - 40, 40);
      ctx.lineTo(canvas.width - 40 - cornerSize, 40);
      ctx.lineTo(canvas.width - 40, 40 + cornerSize);
      ctx.closePath();
      ctx.fill();
      
      // Bottom left corner
      ctx.beginPath();
      ctx.moveTo(40, canvas.height - 40);
      ctx.lineTo(40 + cornerSize, canvas.height - 40);
      ctx.lineTo(40, canvas.height - 40 - cornerSize);
      ctx.closePath();
      ctx.fill();
      
      // Bottom right corner
      ctx.beginPath();
      ctx.moveTo(canvas.width - 40, canvas.height - 40);
      ctx.lineTo(canvas.width - 40 - cornerSize, canvas.height - 40);
      ctx.lineTo(canvas.width - 40, canvas.height - 40 - cornerSize);
      ctx.closePath();
      ctx.fill();

      // Skillexa Logo
      ctx.fillStyle = '#c4b5fd';
      ctx.font = 'bold 48px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SKILLEXA', canvas.width / 2, 140);

      // Tagline
      ctx.fillStyle = '#a78bfa';
      ctx.font = '20px Arial, sans-serif';
      ctx.fillText('Empowering Skills, Enabling Success', canvas.width / 2, 175);

      // Certificate title
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 56px Georgia, serif';
      ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 280);

      // Decorative line
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 300, 310);
      ctx.lineTo(canvas.width / 2 + 300, 310);
      ctx.stroke();

      // "This is to certify that"
      ctx.fillStyle = '#e0e7ff';
      ctx.font = '28px Georgia, serif';
      ctx.fillText('This is to certify that', canvas.width / 2, 390);

      // Recipient name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px Georgia, serif';
      ctx.fillText(userName, canvas.width / 2, 480);

      // Underline for name
      const nameWidth = ctx.measureText(userName).width;
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - nameWidth / 2 - 20, 500);
      ctx.lineTo(canvas.width / 2 + nameWidth / 2 + 20, 500);
      ctx.stroke();

      // "has successfully completed"
      ctx.fillStyle = '#e0e7ff';
      ctx.font = '28px Georgia, serif';
      ctx.fillText('has successfully completed the assessment for', canvas.width / 2, 570);

      // Course name
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 48px Georgia, serif';
      ctx.fillText(skillTitle, canvas.width / 2, 650);

      // Score
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.fillText(`Score: ${score}%`, canvas.width / 2, 720);

      // Achievement level
      let achievementLevel = 'Completed';
      if (score >= 90) achievementLevel = 'Excellence';
      else if (score >= 80) achievementLevel = 'Distinction';
      else if (score >= 70) achievementLevel = 'Merit';
      
      ctx.fillStyle = '#c4b5fd';
      ctx.font = '24px Arial, sans-serif';
      ctx.fillText(`Achievement Level: ${achievementLevel}`, canvas.width / 2, 760);

      // Award seal
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 880, 70, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Seal inner circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 880, 55, 0, Math.PI * 2);
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Seal text
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('VERIFIED', canvas.width / 2, 875);
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('SKILLEXA', canvas.width / 2, 895);

      // Issue date and credential ID
      ctx.fillStyle = '#a78bfa';
      ctx.font = '20px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Issue Date: ${issueDate}`, 120, 1100);
      
      ctx.textAlign = 'right';
      ctx.fillText(`Credential ID: ${credentialId}`, canvas.width - 120, 1100);

      // Verification URL
      ctx.textAlign = 'center';
      ctx.fillStyle = '#818cf8';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(`Verify at: skillexa.com/verify/${credentialId}`, canvas.width / 2, 1140);

      // Footer
      ctx.fillStyle = '#6366f1';
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText('© Skillexa - Your Gateway to Professional Skills', canvas.width / 2, 1180);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Skillexa-Certificate-${skillTitle.replace(/\s+/g, '-')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          throw new Error('Failed to create image blob');
        }
      }, 'image/png', 1.0);

    } catch (err) {
      console.error('Error generating certificate:', err);
      alert('Failed to generate certificate. Please try again.');
    }
  };

  // Preview certificate modal
  const CertificatePreview = ({ certificate, onClose }) => {
    const skillTitle = certificate.skill?.title || certificate.skillName || 'Course';
    const userName = certificate.user?.name || currentUser?.name || 'Student';
    const issueDate = new Date(certificate.issuedDate || certificate.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const credentialId = certificate.certificateId || certificate._id;
    const score = certificate.score || 0;

    let achievementLevel = 'Completed';
    if (score >= 90) achievementLevel = 'Excellence';
    else if (score >= 80) achievementLevel = 'Distinction';
    else if (score >= 70) achievementLevel = 'Merit';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Certificate Preview</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Certificate Preview */}
          <div className="p-8">
            <div 
              ref={certificateRef}
              className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 p-8 rounded-lg border-4 border-violet-300 relative"
              style={{ aspectRatio: '1.414/1' }}
            >
              {/* Inner border */}
              <div className="absolute inset-4 border-2 border-violet-400 rounded pointer-events-none"></div>
              
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-violet-300"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-violet-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-violet-300"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-violet-300"></div>

              <div className="text-center relative z-10">
                {/* Logo */}
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-violet-300 tracking-wider">SKILLEXA</h1>
                  <p className="text-violet-400 text-sm">Empowering Skills, Enabling Success</p>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 font-serif">
                  CERTIFICATE OF ACHIEVEMENT
                </h2>
                <div className="w-48 h-0.5 bg-yellow-400 mx-auto mb-6"></div>

                {/* Body */}
                <p className="text-indigo-200 mb-2">This is to certify that</p>
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 font-serif">{userName}</h3>
                <div className="w-64 h-0.5 bg-violet-400 mx-auto mb-4"></div>
                
                <p className="text-indigo-200 mb-2">has successfully completed the assessment for</p>
                <h4 className="text-xl md:text-2xl font-bold text-yellow-400 mb-4">{skillTitle}</h4>

                {/* Score */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-green-400">Score: {score}%</span>
                  <p className="text-violet-300 text-sm">Achievement Level: {achievementLevel}</p>
                </div>

                {/* Seal */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-400 flex items-center justify-center border-4 border-yellow-500">
                  <div className="text-center">
                    <p className="text-indigo-950 font-bold text-xs">VERIFIED</p>
                    <p className="text-indigo-950 text-xs">SKILLEXA</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between text-violet-400 text-xs mt-4">
                  <span>Issue Date: {issueDate}</span>
                  <span>ID: {credentialId}</span>
                </div>
                <p className="text-indigo-400 text-xs mt-2">Verify at: skillexa.com/verify/{credentialId}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 p-4 border-t justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => downloadCertificate(certificate)}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Certificate
            </button>
          </div>
        </div>
      </div>
    );
  };

  const shareCertificate = async (certificate) => {
    const skillTitle = certificate.skill?.title || certificate.skillName || 'Course';
    const credentialId = certificate.certificateId || certificate._id;
    const shareUrl = `${window.location.origin}/verify/${credentialId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Skillexa Certificate - ${skillTitle}`,
          text: `I just earned a certificate in ${skillTitle} from Skillexa!`,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your certificates...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Award className="w-8 h-8 text-violet-600" />
                  My Certificates
                </h1>
                <p className="text-gray-600 mt-1">View and download your earned certifications from Skillexa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {error ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading certificates</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchCertificates}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Try Again
            </button>
          </div>
        ) : sortedCertificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {certificates.length === 0 ? 'No certificates yet' : 'No certificates found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {certificates.length === 0 
                ? 'Complete exams to earn your first certificate!'
                : 'Try adjusting your search criteria or filters'
              }
            </p>
            {certificates.length === 0 && (
              <button 
                onClick={createDemoCertificate}
                disabled={creatingDemo}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {creatingDemo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    Create Demo Certificate
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedCertificates.map((certificate) => {
              const skillTitle = certificate.skill?.title || certificate.skillName || 'Untitled Course';
              const status = getCertificateStatus(certificate);
              const issueDate = certificate.issuedDate || certificate.createdAt;
              const score = certificate.score || 0;

              return (
                <div key={certificate._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Certificate Header with Gradient */}
                  <div className="h-48 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 relative overflow-hidden p-6">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-violet-400 opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-violet-400 opacity-50"></div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-violet-300 font-bold text-lg tracking-wider">SKILLEXA</h3>
                          <p className="text-violet-400 text-xs">Certificate of Achievement</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} flex items-center gap-1`}>
                            {getStatusIcon(status)}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-yellow-400 font-bold text-xl mb-1">{skillTitle}</h4>
                        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                          Score: {score}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Issue Date:
                        </span>
                        <span className="font-medium">{new Date(issueDate).toLocaleDateString()}</span>
                      </div>
                      {certificate.expiryDate && (
                        <div className="flex items-center justify-between">
                          <span>Expires:</span>
                          <span className="font-medium">{new Date(certificate.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Credential ID:</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {certificate.certificateId || certificate._id}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => downloadCertificate(certificate)}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button 
                        onClick={() => shareCertificate(certificate)}
                        className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Share Certificate"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => setPreviewCertificate(certificate)}
                        className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Preview Certificate"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => window.open(`/verify/${certificate.certificateId || certificate._id}`, '_blank')}
                        className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Verify Certificate"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Preview Modal */}
      {previewCertificate && (
        <CertificatePreview 
          certificate={previewCertificate} 
          onClose={() => setPreviewCertificate(null)} 
        />
      )}
    </div>
  );
}