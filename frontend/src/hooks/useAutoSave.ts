import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => void | Promise<void>;
  interval?: number; // Auto-save interval in milliseconds
  debounceDelay?: number; // Debounce delay for changes in milliseconds
  enabled?: boolean;
}

export function useAutoSave({
  data,
  onSave,
  debounceDelay = 3000, // Default: 3 seconds
  enabled = true,
}: UseAutoSaveOptions) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const previousDataRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const onSaveRef = useRef(onSave);
  const isInitializedRef = useRef(false);

  // Update onSave ref when it changes
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Initialize on mount - store initial data
  useEffect(() => {
    if (!isInitializedRef.current && data) {
      const initialData = JSON.stringify(data);
      lastSavedDataRef.current = initialData;
      previousDataRef.current = initialData;
      isInitializedRef.current = true;
      console.log('[AutoSave] Initialized with initial data');
    }
  }, [data]); // Only run once on mount

  // Force save function - only saves if data changed
  const forceSave = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (isSavingRef.current) {
      console.log('[AutoSave] Already saving, skipping force save');
      return;
    }

    const currentData = JSON.stringify(data);

    // Only save if data has actually changed from last save
    if (currentData !== lastSavedDataRef.current) {
      console.log('[AutoSave] Force save - data changed');
      isSavingRef.current = true;
      try {
        await onSaveRef.current(data);
        lastSavedDataRef.current = currentData;
        previousDataRef.current = currentData;
      } catch (error) {
        console.error('[AutoSave] Force save failed:', error);
      } finally {
        isSavingRef.current = false;
      }
    } else {
      console.log('[AutoSave] Force save - no changes detected');
    }
  }, [data]);

  // Handle data changes with debounce
  useEffect(() => {
    // Don't do anything if not enabled or not initialized
    if (!enabled || !isInitializedRef.current) {
      return;
    }

    const currentData = JSON.stringify(data);

    // Compare with previous data to detect changes
    if (currentData === previousDataRef.current) {
      // No change from previous render, don't set up timer
      return;
    }

    // Data changed from previous render
    previousDataRef.current = currentData;

    // Check if this change is different from last saved data
    if (currentData === lastSavedDataRef.current) {
      // Data matches last saved, no need to save again
      console.log('[AutoSave] Data matches last saved, skipping');
      return;
    }

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set up new debounce timer for actual save
    console.log('[AutoSave] Data changed, setting up debounce timer');
    debounceTimerRef.current = setTimeout(async () => {
      if (isSavingRef.current) {
        console.log('[AutoSave] Already saving, skipping debounced save');
        return;
      }

      // Final check before saving
      const latestData = JSON.stringify(data);
      if (latestData !== lastSavedDataRef.current) {
        console.log('[AutoSave] Debounced save - executing');
        isSavingRef.current = true;
        try {
          await onSaveRef.current(data);
          lastSavedDataRef.current = latestData;
        } catch (error) {
          console.error('[AutoSave] Debounced save failed:', error);
        } finally {
          isSavingRef.current = false;
        }
      } else {
        console.log('[AutoSave] Debounced save - data already saved');
      }
    }, debounceDelay);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [data, enabled, debounceDelay]);

  // NO INTERVAL TIMER AT ALL - removed completely

  return {
    forceSave,
    isSaving: isSavingRef.current,
  };
}
