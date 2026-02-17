import { useState, useEffect } from 'react';
import type { TimeRange } from '../lib/timeUtils';

const STORAGE_KEY = 'ai-summit-availability';

interface StoredAvailability {
  ranges: TimeRange[];
  remember: boolean;
}

/**
 * Hook to manage user availability ranges with localStorage persistence
 * Follows the same pattern as useSchedule()
 */
export function useAvailability() {
  const [ranges, setRanges] = useState<TimeRange[]>([]);
  const [rememberAvailability, setRememberAvailability] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredAvailability = JSON.parse(stored);
        setRanges(data.ranges || []);
        setRememberAvailability(data.remember ?? true);
      }
    } catch (error) {
      console.error('Failed to load availability from localStorage:', error);
    }
  }, []);

  // Save to localStorage when ranges or remember setting changes
  useEffect(() => {
    try {
      if (rememberAvailability) {
        const data: StoredAvailability = {
          ranges,
          remember: rememberAvailability,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        // If remember is disabled, clear storage
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save availability to localStorage:', error);
    }
  }, [ranges, rememberAvailability]);

  /**
   * Add a new time range
   * Validates that start < end and checks for duplicates
   */
  const addTimeRange = (startTime: string, endTime: string) => {
    // Validate that start is before end
    if (startTime >= endTime) {
      console.warn('Start time must be before end time');
      return;
    }

    // Check for duplicates
    const isDuplicate = ranges.some(
      (r) => r.startTime === startTime && r.endTime === endTime
    );

    if (isDuplicate) {
      console.warn('This time range already exists');
      return;
    }

    // Generate unique ID
    const id = `range-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newRange: TimeRange = {
      id,
      startTime,
      endTime,
    };

    setRanges((prev) => [...prev, newRange]);
  };

  /**
   * Remove a time range by ID
   */
  const removeTimeRange = (id: string) => {
    setRanges((prev) => prev.filter((r) => r.id !== id));
  };

  /**
   * Clear all time ranges
   */
  const clearAllRanges = () => {
    setRanges([]);
  };

  /**
   * Toggle the remember availability setting
   * If disabled, clears localStorage
   */
  const toggleRemember = () => {
    setRememberAvailability((prev) => {
      const newValue = !prev;
      if (!newValue) {
        // If disabling remember, clear storage immediately
        localStorage.removeItem(STORAGE_KEY);
      }
      return newValue;
    });
  };

  return {
    ranges,
    rememberAvailability,
    addTimeRange,
    removeTimeRange,
    clearAllRanges,
    toggleRemember,
  };
}
