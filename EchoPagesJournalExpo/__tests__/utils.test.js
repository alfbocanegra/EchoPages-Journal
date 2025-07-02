describe('Utility Functions', () => {
  describe('Date Utilities', () => {
    it('should format dates correctly', () => {
      const formatDate = dateString => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      expect(formatDate('2025-06-01')).toBe('2025-06-01');
      expect(formatDate('2025-12-25')).toBe('2025-12-25');
    });

    it("should get today's date in correct format", () => {
      const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      };

      const today = getTodayDate();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(today).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should validate date strings', () => {
      const isValidDate = dateString => {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
      };

      expect(isValidDate('2025-06-01')).toBe(true);
      expect(isValidDate('2025-13-01')).toBe(false); // Invalid month
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('Search and Filter Utilities', () => {
    const mockEntries = [
      {
        id: '1',
        title: 'Morning Reflections',
        content: 'Today I reflected on gratitude and health...',
        tags: ['gratitude', 'health'],
        mood: '😊',
        date: '2025-06-01',
      },
      {
        id: '2',
        title: 'Work Stress',
        content: 'Work was stressful, but I found time to relax.',
        tags: ['work', 'stress'],
        mood: '😌',
        date: '2025-06-02',
      },
      {
        id: '3',
        title: 'Creative Writing',
        content: 'Started working on a new story about adventure.',
        tags: ['creative', 'writing'],
        mood: '🎨',
        date: '2025-06-03',
      },
    ];

    it('should search entries by title and content', () => {
      const searchEntries = (entries, query) => {
        const lowerQuery = query.toLowerCase();
        return entries.filter(
          entry =>
            entry.title.toLowerCase().includes(lowerQuery) ||
            entry.content.toLowerCase().includes(lowerQuery)
        );
      };

      expect(searchEntries(mockEntries, 'reflections')).toHaveLength(1);
      expect(searchEntries(mockEntries, 'work')).toHaveLength(2); // "Work Stress" title and "Work was stressful" content
      expect(searchEntries(mockEntries, 'creative')).toHaveLength(1);
      expect(searchEntries(mockEntries, 'nonexistent')).toHaveLength(0);
    });

    it('should filter entries by tags', () => {
      const filterByTags = (entries, tags) => {
        return entries.filter(entry => tags.some(tag => entry.tags.includes(tag)));
      };

      expect(filterByTags(mockEntries, ['gratitude'])).toHaveLength(1);
      expect(filterByTags(mockEntries, ['work'])).toHaveLength(1);
      expect(filterByTags(mockEntries, ['gratitude', 'work'])).toHaveLength(2);
      expect(filterByTags(mockEntries, ['nonexistent'])).toHaveLength(0);
    });

    it('should filter entries by mood', () => {
      const filterByMood = (entries, mood) => {
        return entries.filter(entry => entry.mood === mood);
      };

      expect(filterByMood(mockEntries, '😊')).toHaveLength(1);
      expect(filterByMood(mockEntries, '😌')).toHaveLength(1);
      expect(filterByMood(mockEntries, '🎨')).toHaveLength(1);
      expect(filterByMood(mockEntries, '😢')).toHaveLength(0);
    });

    it('should filter entries by date range', () => {
      const filterByDateRange = (entries, startDate, endDate) => {
        return entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return entryDate >= start && entryDate <= end;
        });
      };

      expect(filterByDateRange(mockEntries, '2025-06-01', '2025-06-02')).toHaveLength(2);
      expect(filterByDateRange(mockEntries, '2025-06-02', '2025-06-03')).toHaveLength(2);
      expect(filterByDateRange(mockEntries, '2025-06-01', '2025-06-03')).toHaveLength(3);
      expect(filterByDateRange(mockEntries, '2025-06-04', '2025-06-05')).toHaveLength(0);
    });
  });

  describe('Data Processing Utilities', () => {
    it('should sort entries by date (newest first)', () => {
      const sortEntriesByDate = (entries, ascending = false) => {
        return [...entries].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return ascending ? dateA - dateB : dateB - dateA;
        });
      };

      const entries = [
        { id: '1', date: '2025-06-01', title: 'First' },
        { id: '2', date: '2025-06-03', title: 'Third' },
        { id: '3', date: '2025-06-02', title: 'Second' },
      ];

      const sortedDesc = sortEntriesByDate(entries, false);
      expect(sortedDesc[0].title).toBe('Third');
      expect(sortedDesc[1].title).toBe('Second');
      expect(sortedDesc[2].title).toBe('First');

      const sortedAsc = sortEntriesByDate(entries, true);
      expect(sortedAsc[0].title).toBe('First');
      expect(sortedAsc[1].title).toBe('Second');
      expect(sortedAsc[2].title).toBe('Third');
    });

    it('should group entries by month', () => {
      const groupEntriesByMonth = entries => {
        const groups = {};
        entries.forEach(entry => {
          const month = entry.date.substring(0, 7); // YYYY-MM
          if (!groups[month]) {
            groups[month] = [];
          }
          groups[month].push(entry);
        });
        return groups;
      };

      const entries = [
        { id: '1', date: '2025-06-01', title: 'June 1' },
        { id: '2', date: '2025-06-15', title: 'June 15' },
        { id: '3', date: '2025-07-01', title: 'July 1' },
      ];

      const grouped = groupEntriesByMonth(entries);
      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['2025-06']).toHaveLength(2);
      expect(grouped['2025-07']).toHaveLength(1);
    });

    it('should extract unique tags from entries', () => {
      const extractUniqueTags = entries => {
        const allTags = entries.flatMap(entry => entry.tags || []);
        return [...new Set(allTags)].sort();
      };

      const entries = [
        { tags: ['gratitude', 'health'] },
        { tags: ['work', 'stress'] },
        { tags: ['gratitude', 'work'] },
      ];

      const uniqueTags = extractUniqueTags(entries);
      expect(uniqueTags).toEqual(['gratitude', 'health', 'stress', 'work']);
    });

    it('should count entries by mood', () => {
      const countEntriesByMood = entries => {
        const counts = {};
        entries.forEach(entry => {
          counts[entry.mood] = (counts[entry.mood] || 0) + 1;
        });
        return counts;
      };

      const entries = [{ mood: '😊' }, { mood: '😌' }, { mood: '😊' }, { mood: '🎨' }];

      const moodCounts = countEntriesByMood(entries);
      expect(moodCounts['😊']).toBe(2);
      expect(moodCounts['😌']).toBe(1);
      expect(moodCounts['🎨']).toBe(1);
    });
  });

  describe('Text Processing Utilities', () => {
    it('should truncate text correctly', () => {
      const truncateText = (text, maxLength, suffix = '...') => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
      };

      expect(truncateText('Short text', 20)).toBe('Short text');
      expect(truncateText('This is a very long text that needs to be truncated', 20)).toBe(
        'This is a very lo...'
      );
      expect(truncateText('Long text', 5)).toBe('Lo...');
    });

    it('should extract hashtags from text', () => {
      const extractHashtags = text => {
        const hashtagRegex = /#(\w+)/g;
        const matches = text.match(hashtagRegex);
        return matches ? matches.map(tag => tag.substring(1)) : [];
      };

      expect(extractHashtags('Today was #amazing and #productive')).toEqual([
        'amazing',
        'productive',
      ]);
      expect(extractHashtags('No hashtags here')).toEqual([]);
      expect(extractHashtags('#single')).toEqual(['single']);
    });

    it('should generate entry preview', () => {
      const generatePreview = (content, maxLength = 100) => {
        const cleanContent = content.replace(/\s+/g, ' ').trim();
        if (cleanContent.length <= maxLength) return cleanContent;
        return cleanContent.substring(0, maxLength) + '...';
      };

      const shortContent = 'Short content';
      const longContent =
        'This is a very long content that should be truncated to create a preview. It contains multiple sentences and should be cut off at the appropriate length.';

      expect(generatePreview(shortContent)).toBe('Short content');
      expect(generatePreview(longContent, 50)).toBe(
        'This is a very long content that should be truncat...'
      );
    });
  });

  describe('Validation Utilities', () => {
    it('should validate entry data', () => {
      const validateEntry = entry => {
        const errors = [];

        if (!entry.title || entry.title.trim() === '') {
          errors.push('Title is required');
        }

        if (!entry.content || entry.content.trim() === '') {
          errors.push('Content is required');
        }

        if (!entry.date) {
          errors.push('Date is required');
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
          errors.push('Date must be in YYYY-MM-DD format');
        }

        if (entry.title && entry.title.length > 100) {
          errors.push('Title must be 100 characters or less');
        }

        return errors;
      };

      const validEntry = {
        title: 'Valid Entry',
        content: 'Valid content',
        date: '2025-06-01',
      };

      const invalidEntry = {
        title: '',
        content: '',
        date: 'invalid-date',
      };

      expect(validateEntry(validEntry)).toEqual([]);
      expect(validateEntry(invalidEntry)).toContain('Title is required');
      expect(validateEntry(invalidEntry)).toContain('Content is required');
      expect(validateEntry(invalidEntry)).toContain('Date must be in YYYY-MM-DD format');
    });

    it('should sanitize user input', () => {
      const sanitizeInput = input => {
        return input
          .trim()
          .replace(/[<>]/g, '') // Remove potential HTML tags
          .replace(/\s+/g, ' '); // Normalize whitespace
      };

      expect(sanitizeInput('  Hello World  ')).toBe('Hello World');
      expect(sanitizeInput('Hello<script>alert("xss")</script>World')).toBe(
        'Helloscriptalert("xss")/scriptWorld'
      );
      expect(sanitizeInput('Multiple    spaces')).toBe('Multiple spaces');
    });
  });
});
