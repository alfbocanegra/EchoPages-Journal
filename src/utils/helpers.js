import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
} from 'date-fns';

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format date for display
export const formatDate = dateString => {
  const date = new Date(dateString);

  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE, h:mm a');
  } else if (isThisMonth(date)) {
    return format(date, 'MMM d, h:mm a');
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

// Format relative time
export const formatRelativeTime = dateString => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

// Get preview text from content
export const getPreviewText = (content, maxLength = 150) => {
  if (!content) return '';
  const cleanContent = content.replace(/\n/g, ' ').trim();
  if (cleanContent.length <= maxLength) return cleanContent;
  return cleanContent.substring(0, maxLength) + '...';
};

// Check if string is empty or whitespace
export const isEmptyOrWhitespace = str => {
  return !str || !str.trim();
};

// Get mood emoji
export const getMoodEmoji = mood => {
  const moodEmojis = {
    'very-happy': '😄',
    happy: '😊',
    excited: '🤩',
    grateful: '🙏',
    love: '❤️',
    neutral: '😐',
    anxious: '😰',
    sad: '😢',
    'very-sad': '😭',
    angry: '😠',
  };
  return moodEmojis[mood] || '😐';
};

// Get mood color
export const getMoodColor = mood => {
  const moodColors = {
    'very-happy': '#FFD700',
    happy: '#FFA500',
    excited: '#FF69B4',
    grateful: '#32CD32',
    love: '#FF1493',
    neutral: '#808080',
    anxious: '#FFA500',
    sad: '#4169E1',
    'very-sad': '#000080',
    angry: '#DC143C',
  };
  return moodColors[mood] || '#808080';
};

// Get greeting based on time of day
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Get random writing prompt
export const getRandomWritingPrompt = () => {
  const prompts = [
    'What made you smile today?',
    'Describe a moment when you felt truly grateful.',
    "What's something new you learned recently?",
    'Write about a person who has influenced your life.',
    "What are three things you're looking forward to?",
    'Describe your ideal day from start to finish.',
    "What's a challenge you've overcome recently?",
    'Write about a place that makes you feel peaceful.',
    "What's something you'd like to tell your future self?",
    'Describe a random act of kindness you witnessed or performed.',
    "What's a goal you're working towards and why is it important?",
    'Write about a memory that always makes you laugh.',
    "What's something you've been putting off that you'd like to do?",
    "Describe how you've grown as a person this year.",
    "What's a book, movie, or song that has impacted you recently?",
    "Write about a tradition or ritual that's meaningful to you.",
    "What's something you're curious about right now?",
    'Describe a moment when you felt proud of yourself.',
    "What's a lesson you've learned from a mistake?",
    'Write about something beautiful you noticed today.',
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
};

// Calculate reading time
export const calculateReadingTime = text => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes);
};

// Get color from string (for tags)
export const getColorFromString = str => {
  const colors = [
    '#6366F1', // Indigo
    '#EC4899', // Pink
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#3B82F6', // Blue
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Validate email
export const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format file size
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get initials from name
export const getInitials = name => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// Capitalize first letter
export const capitalizeFirst = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Generate random color
export const generateRandomColor = () => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
