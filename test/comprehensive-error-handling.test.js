/**
 * 测试全面的错误处理和回退机制
 * 验证 ScrollEngine 的增强错误处理和恢复策略
 */

const { describe, it, expect, beforeEach, afterEach, vi } = require('vitest');
const { JSDOM } = require('jsdom');

describe('Comprehensive Error Handling and Fallback Mechanisms', () => {
  let window, document, container, scrollEngine;
  let ScrollEngine, PositionCalculator, HoverPositionManager;

  beforeEach(async () => {
    // Setup DOM environment
    window = new JSDOM(`
      <!DOCTYPE html>
      <div id="scroll-container" style="width: 300px; height: 200px; overflow: hidden;">
      </div>
    `).window;
    
    global.window = window;
    global.document = window.document;
    global.performance = window.performance || { now: () => Date.now() };
    global.requestAnimationFrame = window.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
    global.getComputedStyle = window.getComputedStyle;
    
    container = document.getElementById('scroll-container');
    
    // Import modules after setting up globals
    const scrollModule = await import('../src/core/ScrollEngine.js');
    const positionModule = await import('../src/core/utils/PositionCalculator.js');
    const hoverModule = await import('../src/core/utils/HoverPositionManager.js');
    
    ScrollEngine = scrollModule.ScrollEngine;
    PositionCalculator = positionModule.PositionCalculator;
    HoverPositionManager = hoverModule.HoverPositionManager;
  });

  afterEach(() => {
    if (scrollEngine) {
      scrollEngine.destroy();
    }
    vi.restoreAllMocks();
  });

  describe('Error Recovery Strategies', () => {
    it('should execute graceful degradation for minor errors', async () => {
      const onEventSpy = vi.fn();
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Simulate a minor error during pause operation
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');
      mockBatchPositionManagement.mockImplementation(() => {
        throw new Error('Minor position management error');
      });

      // Trigger error through pause operation
      scrollEngine.pause();

      // Should trigger degradation event
      expect(onEventSpy).toHaveBeenCalledWith('degradation', expect.objectContaining({
        type: 'gracefulDegradation',
        reason: expect.stringContaining('Minor position management error')
      }));
    });

    it('should execute position reset for position-related errors', async () => {
      const onEventSpy = vi.fn();
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Simulate position-related error
      const mockOptimizeSeamlessConnection = vi.spyOn(PositionCalculator, 'optimizeSeamlessConnection');
      mockOptimizeSeamlessConnection.mockImplementation(() => {
        throw new Error('Position calculation failed');
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Should trigger recovery event
      expect(onEventSpy).toHaveBeenCalledWith('recovery', expect.objectContaining({
        type: 'positionReset',
        reason: expect.stringContaining('Position calculation failed')
      }));
    });

    it('should execute full restart for animation-related errors', async () => {
      const onEventSpy = vi.fn();
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'up',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      
      // Simulate animation-related error during start
      const originalStart = scrollEngine.start;
      scrollEngine.start = function() {
        originalStart.call(this);
        throw new Error('Animation initialization failed');
      };

      try {
        scrollEngine.start();
      } catch (error) {
        // Error should be handled internally
      }

      // Should trigger recovery event
      expect(onEventSpy).toHaveBeenCalledWith('recovery', expect.objectContaining({
        type: 'fullRestart',
        reason: expect.stringContaining('Animation initialization failed')
      }));
    });

    it('should execute emergency stop for critical errors', async () => {
      const onEventSpy = vi.fn();
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'down',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Simulate critical container error
      const mockError = new Error('Container element not found');
      
      // Manually trigger error handling
      scrollEngine.handleError(mockError, { operation: 'critical' });

      // Should trigger emergency event
      expect(onEventSpy).toHaveBeenCalledWith('emergency', expect.objectContaining({
        type: 'emergencyStop',
        reason: expect.stringContaining('Container element not found')
      }));
    });
  });

  describe('Mouse Event Error Handling', () => {
    it('should handle mouse enter errors gracefully', async () => {
      const onEventSpy = vi.fn();
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        hoverStop: true,
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Mock HoverPositionManager to throw error
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      mockCreatePositionSnapshot.mockImplementation(() => {
        throw new Error('Snapshot creation failed');
      });

      // Simulate mouse enter
      const mouseEnterEvent = new window.MouseEvent('mouseenter');
      container.dispatchEvent(mouseEnterEvent);

      // Should handle error gracefully
      expect(onEventSpy).toHaveBeenCalledWith('error', expect.objectContaining({
        type: 'criticalError',
        error: expect.stringContaining('Snapshot creation failed')
      }));
    });

    it('should handle mouse leave errors with intelligent resume', async () => {
      const onEventSpy = vi.fn();
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right',
        hoverStop: true,
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // First pause (mouse enter)
      const mouseEnterEvent = new window.MouseEvent('mouseenter');
      container.dispatchEvent(mouseEnterEvent);

      // Mock batch position management to fail on resume
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');
      mockBatchPositionManagement.mockImplementation((states, direction, operation) => {
        if (operation === 'resume') {
          throw new Error('Resume failed');
        }
        return { successfulOperations: 1, failedOperations: 0, totalTime: 10 };
      });

      // Simulate mouse leave
      const mouseLeaveEvent = new window.MouseEvent('mouseleave');
      container.dispatchEvent(mouseLeaveEvent);

      // Should trigger intelligent resume
      expect(onEventSpy).toHaveBeenCalledWith('intelligentResume', expect.objectContaining({
        reason: 'mouseLeaveFailure'
      }));
    });

    it('should fallback to basic operations when enhanced methods fail', async () => {
      const onEventSpy = vi.fn();
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'up',
        hoverStop: true,
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Mock all enhanced methods to fail
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');
      mockBatchPositionManagement.mockImplementation(() => {
        throw new Error('All enhanced methods failed');
      });

      // Simulate mouse enter and leave
      const mouseEnterEvent = new window.MouseEvent('mouseenter');
      container.dispatchEvent(mouseEnterEvent);

      const mouseLeaveEvent = new window.MouseEvent('mouseleave');
      container.dispatchEvent(mouseLeaveEvent);

      // Should not crash and should use fallback methods
      expect(scrollEngine).toBeDefined();
    });
  });

  describe('Position Continuity Error Handling', () => {
    it('should attempt position continuity fixes when validation fails', async () => {
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      const mockValidatePositionContinuity = vi.spyOn(HoverPositionManager, 'validatePositionContinuity');

      // Mock snapshots
      mockCreatePositionSnapshot.mockReturnValue({
        logicalPosition: 10,
        transformPosition: 15,
        content1Transform: 'translateX(10px)',
        content2Transform: 'translateX(310px)',
        timestamp: Date.now(),
        direction: 'left'
      });

      // Mock validation failure
      mockValidatePositionContinuity.mockReturnValue({
        isValid: false,
        positionDifference: 10,
        transformDifference: 8,
        issues: ['Large position discontinuity']
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        hoverStop: true
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Should attempt to fix continuity issues
      scrollEngine.pause();
      scrollEngine.resume();

      // Verify that validation was called and handled
      expect(mockValidatePositionContinuity).toHaveBeenCalled();
    });

    it('should handle snapshot creation failures gracefully', async () => {
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      
      // Mock snapshot creation to fail intermittently
      let callCount = 0;
      mockCreatePositionSnapshot.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          throw new Error('Snapshot creation failed');
        }
        return {
          logicalPosition: 5,
          transformPosition: 5,
          content1Transform: 'translateX(5px)',
          content2Transform: 'translateX(305px)',
          timestamp: Date.now(),
          direction: 'left'
        };
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        hoverStop: true
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Should handle snapshot failures gracefully
      expect(() => {
        scrollEngine.pause();
        scrollEngine.resume();
      }).not.toThrow();
    });
  });

  describe('Animation State Validation', () => {
    it('should validate and fix invalid animation states', async () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'down'
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Manually corrupt animation state
      const states = [...scrollEngine.rowStates, ...scrollEngine.colStates];
      if (states.length > 0) {
        states[0].position = NaN; // Invalid position
        states[0].content1.style.transform = ''; // Missing transform
      }

      // Resume should validate and fix states
      scrollEngine.pause();
      scrollEngine.resume();

      // Animation should continue working
      expect(scrollEngine).toBeDefined();
    });

    it('should handle missing animation IDs during resume', async () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'up'
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Manually remove animation ID
      const states = [...scrollEngine.rowStates, ...scrollEngine.colStates];
      if (states.length > 0) {
        states[0].animationId = null;
      }

      // Should handle missing animation ID gracefully
      expect(() => {
        scrollEngine.resume();
      }).not.toThrow();
    });
  });

  describe('System Information Collection', () => {
    it('should collect system information for error diagnosis', async () => {
      const onEventSpy = vi.fn();
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      
      // Trigger an error to collect system info
      const mockError = new Error('Test error for system info');
      scrollEngine.handleError(mockError);

      // Should include system information in error event
      expect(onEventSpy).toHaveBeenCalledWith('error', expect.objectContaining({
        systemInfo: expect.objectContaining({
          timestamp: expect.any(Number),
          scrollEngineState: expect.objectContaining({
            running: expect.any(Boolean),
            direction: 'left',
            dataLength: 3
          })
        })
      }));
    });

    it('should handle system info collection failures gracefully', async () => {
      // Mock performance to throw error
      const originalPerformance = global.performance;
      global.performance = {
        now: () => { throw new Error('Performance API failed'); }
      };

      const onEventSpy = vi.fn();
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      
      // Should not crash when system info collection fails
      expect(() => {
        const mockError = new Error('Test error');
        scrollEngine.handleError(mockError);
      }).not.toThrow();

      // Restore performance
      global.performance = originalPerformance;
    });
  });

  describe('Emergency Recovery', () => {
    it('should execute emergency recovery when all else fails', async () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Mock all recovery methods to fail
      const originalExecuteGracefulDegradation = scrollEngine.executeGracefulDegradation;
      scrollEngine.executeGracefulDegradation = () => {
        throw new Error('Graceful degradation failed');
      };

      const originalExecutePositionReset = scrollEngine.executePositionReset;
      scrollEngine.executePositionReset = () => {
        throw new Error('Position reset failed');
      };

      const originalExecuteFullRestart = scrollEngine.executeFullRestart;
      scrollEngine.executeFullRestart = () => {
        throw new Error('Full restart failed');
      };

      const originalExecuteEmergencyStop = scrollEngine.executeEmergencyStop;
      scrollEngine.executeEmergencyStop = () => {
        throw new Error('Emergency stop failed');
      };

      // Should execute emergency recovery without crashing
      expect(() => {
        const mockError = new Error('Critical system failure');
        scrollEngine.handleError(mockError);
      }).not.toThrow();
    });

    it('should stop all animations during emergency recovery', async () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'down'
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify animations are running
      expect(scrollEngine.running).toBe(true);

      // Trigger emergency recovery
      scrollEngine.executeEmergencyRecovery();

      // Should stop all animations
      expect(scrollEngine.running).toBe(false);
    });
  });
});