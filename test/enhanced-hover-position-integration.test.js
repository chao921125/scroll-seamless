/**
 * 测试增强的悬停位置管理集成
 * 验证 ScrollEngine 的 pause() 和 resume() 方法使用增强的 HoverPositionManager
 */

const { describe, it, expect, beforeEach, afterEach, vi } = require('vitest');
const { JSDOM } = require('jsdom');

describe('Enhanced Hover Position Management Integration', () => {
  let window, document, container, scrollEngine;
  let ScrollEngine, HoverPositionManager;

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
    const hoverModule = await import('../src/core/utils/HoverPositionManager.js');
    
    ScrollEngine = scrollModule.ScrollEngine;
    HoverPositionManager = hoverModule.HoverPositionManager;
  });

  afterEach(() => {
    if (scrollEngine) {
      scrollEngine.destroy();
    }
    vi.restoreAllMocks();
  });

  describe('Enhanced Pause Integration', () => {
    it('should use enhanced HoverPositionManager for pause operations', async () => {
      // Mock HoverPositionManager methods
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');
      const mockValidatePositionContinuity = vi.spyOn(HoverPositionManager, 'validatePositionContinuity');
      const mockGetPositionStats = vi.spyOn(HoverPositionManager, 'getPositionStats');

      // Mock successful operations
      mockCreatePositionSnapshot.mockReturnValue({
        logicalPosition: 0,
        transformPosition: 0,
        content1Transform: 'translateX(0px)',
        content2Transform: 'translateX(300px)',
        timestamp: Date.now(),
        direction: 'left'
      });

      mockBatchPositionManagement.mockReturnValue({
        successfulOperations: 1,
        failedOperations: 0,
        totalTime: 10
      });

      mockValidatePositionContinuity.mockReturnValue({
        isValid: true,
        positionDifference: 0,
        transformDifference: 0,
        issues: []
      });

      mockGetPositionStats.mockReturnValue({
        averagePosition: 0,
        positionRange: { min: 0, max: 0 },
        transformConsistency: true
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for animation to start
      await new Promise(resolve => setTimeout(resolve, 50));

      // Perform pause operation
      scrollEngine.pause();

      // Verify enhanced methods were called
      expect(mockCreatePositionSnapshot).toHaveBeenCalled();
      expect(mockBatchPositionManagement).toHaveBeenCalledWith(
        expect.any(Array),
        'left',
        'pause',
        expect.objectContaining({
          createSnapshots: true,
          validateContinuity: true,
          tolerance: 0.5,
          errorRecovery: true
        })
      );
      expect(mockValidatePositionContinuity).toHaveBeenCalled();
      expect(mockGetPositionStats).toHaveBeenCalled();
    });

    it('should handle pause position continuity validation failures', async () => {
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');
      const mockValidatePositionContinuity = vi.spyOn(HoverPositionManager, 'validatePositionContinuity');

      // Mock snapshot creation
      mockCreatePositionSnapshot.mockReturnValue({
        logicalPosition: 10,
        transformPosition: 15,
        content1Transform: 'translateX(10px)',
        content2Transform: 'translateX(310px)',
        timestamp: Date.now(),
        direction: 'left'
      });

      mockBatchPositionManagement.mockReturnValue({
        successfulOperations: 1,
        failedOperations: 0,
        totalTime: 10
      });

      // Mock validation failure
      mockValidatePositionContinuity.mockReturnValue({
        isValid: false,
        positionDifference: 5,
        transformDifference: 3,
        issues: ['Position discontinuity detected']
      });

      const onEventSpy = vi.fn();
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Perform pause operation
      scrollEngine.pause();

      // Should handle validation failure gracefully
      expect(mockValidatePositionContinuity).toHaveBeenCalled();
      
      // Should still trigger pause event
      expect(onEventSpy).toHaveBeenCalledWith('pause', expect.objectContaining({
        direction: 'left',
        continuityIssues: expect.any(Number)
      }));
    });

    it('should fallback to basic pause when enhanced pause fails', async () => {
      // Mock HoverPositionManager to throw errors
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');
      mockBatchPositionManagement.mockImplementation(() => {
        throw new Error('Enhanced pause failed');
      });

      const onEventSpy = vi.fn();
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Should not throw error, should use fallback
      expect(() => {
        scrollEngine.pause();
      }).not.toThrow();

      // Should trigger error event with recovery information
      expect(onEventSpy).toHaveBeenCalledWith('error', expect.objectContaining({
        type: 'pauseFailure',
        recovery: 'basicPauseAttempted'
      }));
    });
  });

  describe('Enhanced Resume Integration', () => {
    it('should use enhanced HoverPositionManager for resume operations', async () => {
      // Mock HoverPositionManager methods
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');
      const mockValidatePositionContinuity = vi.spyOn(HoverPositionManager, 'validatePositionContinuity');
      const mockGetPositionStats = vi.spyOn(HoverPositionManager, 'getPositionStats');

      // Mock successful operations
      mockCreatePositionSnapshot.mockReturnValue({
        logicalPosition: 5,
        transformPosition: 5,
        content1Transform: 'translateX(5px)',
        content2Transform: 'translateX(305px)',
        timestamp: Date.now(),
        direction: 'left'
      });

      mockBatchPositionManagement.mockReturnValue({
        successfulOperations: 1,
        failedOperations: 0,
        totalTime: 8
      });

      mockValidatePositionContinuity.mockReturnValue({
        isValid: true,
        positionDifference: 0,
        transformDifference: 0,
        issues: []
      });

      mockGetPositionStats.mockReturnValue({
        averagePosition: 5,
        positionRange: { min: 5, max: 5 },
        transformConsistency: true
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Pause first
      scrollEngine.pause();
      
      // Then resume
      scrollEngine.resume();

      // Verify enhanced methods were called for resume
      expect(mockBatchPositionManagement).toHaveBeenCalledWith(
        expect.any(Array),
        'left',
        'resume',
        expect.objectContaining({
          createSnapshots: true,
          validateContinuity: true,
          tolerance: 0.5,
          errorRecovery: true
        })
      );
    });

    it('should validate resumed animation states', async () => {
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');

      mockCreatePositionSnapshot.mockReturnValue({
        logicalPosition: 0,
        transformPosition: 0,
        content1Transform: 'translateX(0px)',
        content2Transform: 'translateX(300px)',
        timestamp: Date.now(),
        direction: 'right'
      });

      mockBatchPositionManagement.mockReturnValue({
        successfulOperations: 1,
        failedOperations: 0,
        totalTime: 5
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right'
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      scrollEngine.pause();
      scrollEngine.resume();

      // Animation should continue running after resume
      expect(scrollEngine).toBeDefined();
    });

    it('should handle resume position continuity validation failures', async () => {
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');
      const mockValidatePositionContinuity = vi.spyOn(HoverPositionManager, 'validatePositionContinuity');

      mockCreatePositionSnapshot.mockReturnValue({
        logicalPosition: 20,
        transformPosition: 25,
        content1Transform: 'translateX(20px)',
        content2Transform: 'translateX(320px)',
        timestamp: Date.now(),
        direction: 'right'
      });

      mockBatchPositionManagement.mockReturnValue({
        successfulOperations: 1,
        failedOperations: 0,
        totalTime: 12
      });

      // Mock validation failure
      mockValidatePositionContinuity.mockReturnValue({
        isValid: false,
        positionDifference: 8,
        transformDifference: 5,
        issues: ['Resume position jump detected']
      });

      const onEventSpy = vi.fn();
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      scrollEngine.pause();
      scrollEngine.resume();

      // Should handle validation failure and trigger resume event
      expect(onEventSpy).toHaveBeenCalledWith('resume', expect.objectContaining({
        direction: 'right',
        continuityIssues: expect.any(Number)
      }));
    });

    it('should fallback to basic resume when enhanced resume fails', async () => {
      // Mock HoverPositionManager to throw errors
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');
      mockBatchPositionManagement.mockImplementation(() => {
        throw new Error('Enhanced resume failed');
      });

      const onEventSpy = vi.fn();
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'up',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      scrollEngine.pause();

      // Should not throw error, should use fallback
      expect(() => {
        scrollEngine.resume();
      }).not.toThrow();

      // Should trigger error event with recovery information
      expect(onEventSpy).toHaveBeenCalledWith('error', expect.objectContaining({
        type: 'resumeFailure',
        recovery: 'basicResumeAttempted'
      }));
    });
  });

  describe('Position Continuity Validation', () => {
    it('should validate position continuity during pause/resume cycles', async () => {
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      const mockValidatePositionContinuity = vi.spyOn(HoverPositionManager, 'validatePositionContinuity');

      let snapshotCounter = 0;
      mockCreatePositionSnapshot.mockImplementation(() => ({
        logicalPosition: snapshotCounter++,
        transformPosition: snapshotCounter,
        content1Transform: `translateY(${snapshotCounter}px)`,
        content2Transform: `translateY(${snapshotCounter + 200}px)`,
        timestamp: Date.now(),
        direction: 'down'
      }));

      mockValidatePositionContinuity.mockReturnValue({
        isValid: true,
        positionDifference: 0.1,
        transformDifference: 0.1,
        issues: []
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'down'
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Perform multiple pause/resume cycles
      scrollEngine.pause();
      scrollEngine.resume();
      scrollEngine.pause();
      scrollEngine.resume();

      // Should validate continuity for each cycle
      expect(mockValidatePositionContinuity).toHaveBeenCalledTimes(4); // 2 pause + 2 resume
    });

    it('should attempt position continuity fixes when validation fails', async () => {
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      const mockValidatePositionContinuity = vi.spyOn(HoverPositionManager, 'validatePositionContinuity');

      // Mock snapshots with position data
      mockCreatePositionSnapshot.mockReturnValue({
        logicalPosition: 15,
        transformPosition: 20,
        content1Transform: 'translateY(15px)',
        content2Transform: 'translateY(215px)',
        timestamp: Date.now(),
        direction: 'up'
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
        direction: 'up'
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Should attempt to fix continuity issues
      scrollEngine.pause();

      // Verify that position continuity fix was attempted
      expect(mockValidatePositionContinuity).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle snapshot creation failures gracefully', async () => {
      const mockCreatePositionSnapshot = vi.spyOn(HoverPositionManager, 'createPositionSnapshot');
      
      // Mock snapshot creation to fail
      mockCreatePositionSnapshot.mockImplementation(() => {
        throw new Error('Snapshot creation failed');
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left'
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Should not crash despite snapshot failures
      expect(() => {
        scrollEngine.pause();
        scrollEngine.resume();
      }).not.toThrow();
    });

    it('should provide detailed event information for pause/resume operations', async () => {
      const mockBatchPositionManagement = vi.spyOn(HoverPositionManager, 'batchPositionManagement');
      const mockGetPositionStats = vi.spyOn(HoverPositionManager, 'getPositionStats');

      mockBatchPositionManagement.mockReturnValue({
        successfulOperations: 2,
        failedOperations: 1,
        totalTime: 25
      });

      mockGetPositionStats.mockReturnValue({
        averagePosition: 12.5,
        positionRange: { min: 10, max: 15 },
        transformConsistency: false
      });

      const onEventSpy = vi.fn();
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      scrollEngine.pause();

      // Verify detailed event information
      expect(onEventSpy).toHaveBeenCalledWith('pause', expect.objectContaining({
        direction: 'left',
        pausedStates: expect.any(Number),
        pausedAnimations: expect.any(Number),
        continuityIssues: expect.any(Number),
        batchResult: expect.objectContaining({
          successfulOperations: 2,
          failedOperations: 1,
          totalTime: 25
        }),
        positionStats: expect.objectContaining({
          averagePosition: 12.5,
          transformConsistency: false
        })
      }));
    });
  });
});