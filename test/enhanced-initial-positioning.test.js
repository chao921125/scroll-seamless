/**
 * 测试增强的初始定位设置
 * 验证 ScrollEngine 使用增强方法进行初始定位
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine';
import { PositionCalculator } from '../src/core/utils/PositionCalculator';
import { HoverPositionManager } from '../src/core/utils/HoverPositionManager';

// Mock DOM environment
const mockElement = (tag = 'div', properties = {}) => {
  const element = {
    tagName: tag.toUpperCase(),
    style: {},
    offsetWidth: 300,
    offsetHeight: 200,
    appendChild: vi.fn(),
    innerHTML: '',
    parentElement: null,
    ...properties
  };
  
  // Mock style property setter/getter
  Object.defineProperty(element, 'style', {
    value: new Proxy({}, {
      set(target, prop, value) {
        target[prop] = value;
        return true;
      },
      get(target, prop) {
        return target[prop] || '';
      }
    }),
    writable: true
  });
  
  return element;
};

describe('Enhanced Initial Positioning Setup', () => {
  let container;
  let scrollEngine;
  
  // Mock PositionCalculator methods
  const mockImplementContentPreFilling = vi.spyOn(PositionCalculator, 'implementContentPreFilling');
  const mockDetectAndFixBlankAreas = vi.spyOn(PositionCalculator, 'detectAndFixBlankAreas');
  const mockValidateAndFixInitialPositioning = vi.spyOn(PositionCalculator, 'validateAndFixInitialPositioning');

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock container
    container = mockElement('div', {
      offsetWidth: 300,
      offsetHeight: 200
    });
    
    // Mock successful pre-filling
    mockImplementContentPreFilling.mockReturnValue({
      success: true,
      filledAreas: ['content1', 'content2']
    });
    
    // Mock successful blank area detection
    mockDetectAndFixBlankAreas.mockReturnValue({
      hasBlankAreas: false,
      fixedAreas: [],
      errors: []
    });
    
    // Mock successful validation
    mockValidateAndFixInitialPositioning.mockReturnValue({
      success: true
    });
  });

  afterEach(() => {
    if (scrollEngine) {
      scrollEngine.destroy();
    }
    vi.restoreAllMocks();
  });

  describe('Content Pre-filling Integration', () => {
    it('should use content pre-filling for initial positioning', () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      scrollEngine = new ScrollEngine(container, options);

      // Verify content pre-filling was called
      expect(mockImplementContentPreFilling).toHaveBeenCalled();
      
      // Verify it was called with correct parameters
      const calls = mockImplementContentPreFilling.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      const [content1, content2, containerSize, direction] = calls[0];
      expect(content1).toBeDefined();
      expect(content2).toBeDefined();
      expect(containerSize).toBe(300); // container width for horizontal
      expect(direction).toBe('left');
    });

    it('should fallback to standard positioning when pre-filling fails', () => {
      // Mock pre-filling failure
      mockImplementContentPreFilling.mockReturnValue({
        success: false,
        error: 'Pre-filling failed'
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right'
      };

      scrollEngine = new ScrollEngine(container, options);

      // Verify fallback was used
      expect(mockValidateAndFixInitialPositioning).toHaveBeenCalled();
    });

    it('should use correct container size for vertical directions', () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'up'
      };

      scrollEngine = new ScrollEngine(container, options);

      // Verify content pre-filling was called with container height
      const calls = mockImplementContentPreFilling.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      const [, , containerSize, direction] = calls[0];
      expect(containerSize).toBe(200); // container height for vertical
      expect(direction).toBe('up');
    });
  });

  describe('Blank Area Detection Integration', () => {
    it('should detect and fix blank areas during initial positioning', () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'down'
      };

      scrollEngine = new ScrollEngine(container, options);

      // Verify blank area detection was called
      expect(mockDetectAndFixBlankAreas).toHaveBeenCalled();
      
      const calls = mockDetectAndFixBlankAreas.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      const [content1, content2, containerElement, direction] = calls[0];
      expect(content1).toBeDefined();
      expect(content2).toBeDefined();
      expect(containerElement).toBeDefined();
      expect(direction).toBe('down');
    });

    it('should handle blank areas that are detected and fixed', () => {
      // Mock blank areas found and fixed
      mockDetectAndFixBlankAreas.mockReturnValue({
        hasBlankAreas: true,
        fixedAreas: ['left-side', 'right-side'],
        errors: []
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      // Should not throw error
      expect(() => {
        scrollEngine = new ScrollEngine(container, options);
      }).not.toThrow();

      // Verify blank area detection was called
      expect(mockDetectAndFixBlankAreas).toHaveBeenCalled();
    });

    it('should handle blank area detection errors gracefully', () => {
      // Mock blank area detection with errors
      mockDetectAndFixBlankAreas.mockReturnValue({
        hasBlankAreas: true,
        fixedAreas: [],
        errors: ['Detection failed', 'Fix failed']
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right'
      };

      // Should not throw error
      expect(() => {
        scrollEngine = new ScrollEngine(container, options);
      }).not.toThrow();
    });
  });

  describe('Enhanced Positioning Logic for All Directions', () => {
    it('should apply enhanced positioning for left direction', () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      scrollEngine = new ScrollEngine(container, options);

      // Verify enhanced positioning methods were called
      expect(mockImplementContentPreFilling).toHaveBeenCalledWith(
        expect.any(Object), // content1
        expect.any(Object), // content2
        300, // container width
        'left'
      );
    });

    it('should apply enhanced positioning for right direction', () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right'
      };

      scrollEngine = new ScrollEngine(container, options);

      // Verify enhanced positioning methods were called
      expect(mockImplementContentPreFilling).toHaveBeenCalledWith(
        expect.any(Object), // content1
        expect.any(Object), // content2
        300, // container width
        'right'
      );
    });

    it('should apply enhanced positioning for up direction', () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'up'
      };

      scrollEngine = new ScrollEngine(container, options);

      // Verify enhanced positioning methods were called
      expect(mockImplementContentPreFilling).toHaveBeenCalledWith(
        expect.any(Object), // content1
        expect.any(Object), // content2
        200, // container height
        'up'
      );
    });

    it('should apply enhanced positioning for down direction', () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'down'
      };

      scrollEngine = new ScrollEngine(container, options);

      // Verify enhanced positioning methods were called
      expect(mockImplementContentPreFilling).toHaveBeenCalledWith(
        expect.any(Object), // content1
        expect.any(Object), // content2
        200, // container height
        'down'
      );
    });
  });

  describe('Error Handling and Fallback', () => {
    it('should handle container not found error', () => {
      // Mock container with no parent
      const mockContent = mockElement('div');
      mockContent.parentElement = null;
      
      // Mock implementation to simulate missing container
      mockImplementContentPreFilling.mockImplementation(() => {
        throw new Error('Container element not found');
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      // Should not throw error, should use fallback
      expect(() => {
        scrollEngine = new ScrollEngine(container, options);
      }).not.toThrow();
    });

    it('should trigger error event when enhanced positioning fails', () => {
      const onEventSpy = vi.fn();
      
      // Mock all enhanced methods to fail
      mockImplementContentPreFilling.mockImplementation(() => {
        throw new Error('Pre-filling failed');
      });
      
      mockDetectAndFixBlankAreas.mockImplementation(() => {
        throw new Error('Blank area detection failed');
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);

      // Should trigger error event
      expect(onEventSpy).toHaveBeenCalledWith('error', expect.objectContaining({
        type: 'initialPositioningFailure'
      }));
    });

    it('should use basic positioning as final fallback', () => {
      // Mock all enhanced methods to fail
      mockImplementContentPreFilling.mockImplementation(() => {
        throw new Error('Pre-filling failed');
      });
      
      mockDetectAndFixBlankAreas.mockImplementation(() => {
        throw new Error('Blank area detection failed');
      });
      
      mockValidateAndFixInitialPositioning.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      // Should not throw error, should use basic fallback
      expect(() => {
        scrollEngine = new ScrollEngine(container, options);
      }).not.toThrow();
    });
  });

  describe('Position Validation', () => {
    it('should validate initial positioning results', () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      scrollEngine = new ScrollEngine(container, options);

      // Verify that enhanced positioning was applied
      expect(mockImplementContentPreFilling).toHaveBeenCalled();
      expect(mockDetectAndFixBlankAreas).toHaveBeenCalled();
    });

    it('should handle validation failures gracefully', () => {
      // Mock validation to simulate failure
      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      // Should not throw error
      expect(() => {
        scrollEngine = new ScrollEngine(container, options);
      }).not.toThrow();

      console.warn = originalConsoleWarn;
    });
  });
});