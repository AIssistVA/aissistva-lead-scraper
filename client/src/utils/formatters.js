import numeral from 'numeral';

export const formatCurrency = (value, currency = 'USD') => {
  if (!value && value !== 0) return '-';
  
  const formatted = numeral(value).format('$0,0');
  return formatted;
};

export const formatNumber = (value) => {
  if (!value && value !== 0) return '-';
  
  return numeral(value).format('0,0');
};

export const formatPercentage = (value, decimals = 1) => {
  if (!value && value !== 0) return '-';
  
  return numeral(value / 100).format(`0.${'0'.repeat(decimals)}%`);
};

export const formatDate = (date) => {
  if (!date) return '-';
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date) => {
  if (!date) return '-';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '-';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '-';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatScore = (score) => {
  if (!score && score !== 0) return '-';
  
  return Math.round(score);
};

export const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const getScoreBadgeColor = (score) => {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  if (score >= 40) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};