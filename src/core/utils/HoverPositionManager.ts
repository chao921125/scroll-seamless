import { ScrollDirection } from '../../types';
import { DirectionHandler } from './DirectionHandler';
import { PositionCalculator } from './PositionCalculator';

/**
 * 滚动状态接口 - 与 ScrollEngine 中的接口保持一致
 */
interface ScrollState {
  content1: HTMLElement;
  content2: HTMLElement;
  position: number;
  animationId: string | null;
}

/**
 * 位置快照接口 - 用于记录精确的位置信息
 */
interface PositionSnapshot {
  logicalPosition: number;        // 逻辑位置（state.position）
  transformPosition: number;      // 实际变换位置
  content1Transform: string;      // content1 的变换字符串
  content2Transform: string;      // content2 的变换字符串
  timestamp: number;              // 快照时间戳
  direction: ScrollDirection;     // 滚动方向
  // 扩展信息
  animationId: string | null;     // 动画 ID
  reason: string;                 // 快照原因
  performanceTimestamp: number;   // 高精度时间戳
  animationFrame: number | null;  // 动画帧 ID
  positionDifference: number;     // 逻辑位置与变换位置的差异
  content1Visible: boolean;       // content1 是否可见
  content2Visible: boolean;       // content2 是否可见
  containerSize: number;          // 容器尺寸
}

/**
 * 位置连续性验证结果
 */
interface PositionContinuityResult {
  isValid: boolean;
  positionDifference: number;
  transformDifference: number;
  issues: string[];
  warnings?: string[];
  timeDifference?: number;
  performanceTimeDifference?: number;
  containerSizeDifference?: number;
  positionSyncDifference?: number;
}

/**
 * 悬停位置管理器
 * 专门处理悬停时的精确位置管理，确保暂停和恢复时位置的连续性
 */
export class HoverPositionManager {
  private static readonly POSITION_TOLERANCE = 0.5; // 位置容差（像素）
  private static readonly TRANSFORM_TOLERANCE = 0.1; // 变换容差（像素）
  
  /**
   * 使用 transform matrix 精确捕获当前位置
   * @param state 滚动状态
   * @param direction 滚动方向
   * @returns 当前精确位置，如果无法获取则返回 null
   */
  public static captureCurrentPosition(
    state: ScrollState, 
    direction: ScrollDirection
  ): number | null {
    try {
      // 验证输入参数
      if (!state || !state.content1) {
        return null;
      }

      const config = DirectionHandler.getDirectionConfig(direction);
      const computedStyle = getComputedStyle(state.content1);
      const transform = computedStyle.transform;
      
      // 如果没有变换，返回 0
      if (!transform || transform === 'none' || transform.trim() === '') {
        return 0;
      }
      
      // 尝试多种解析方法
      let currentPosition = this.parseTransformPosition(transform, config.isHorizontal);
      
      // 如果解析失败，尝试备用方法
      if (currentPosition === null) {
        currentPosition = this.parseTransformFallback(transform, config.isHorizontal);
      }
      
      // 最终回退到逻辑位置
      if (currentPosition === null) {
        console.warn('All transform parsing methods failed, using logical position');
        return state.position;
      }
      
      // 验证位置的合理性
      if (!isFinite(currentPosition)) {
        console.warn('Invalid transform position detected:', currentPosition);
        return state.position;
      }
      
      return currentPosition;
    } catch (error) {
      console.error('Failed to capture current position:', error);
      return state?.position ?? null;
    }
  }

  /**
   * 解析变换位置 - 主要方法
   * @param transform 变换字符串
   * @param isHorizontal 是否为水平方向
   * @returns 解析的位置值，失败返回 null
   */
  private static parseTransformPosition(transform: string, isHorizontal: boolean): number | null {
    try {
      // 方法1: 使用 DOMMatrix 解析
      const matrix = new DOMMatrix(transform);
      const position = isHorizontal ? matrix.m41 : matrix.m42;
      
      if (isFinite(position)) {
        return position;
      }
    } catch (error) {
      // DOMMatrix 解析失败，继续尝试其他方法
    }
    
    // 方法2: 解析 translateX/translateY 格式
    const translatePattern = isHorizontal 
      ? /translateX\(([^)]+)\)/
      : /translateY\(([^)]+)\)/;
    
    const translateMatch = transform.match(translatePattern);
    if (translateMatch) {
      const value = parseFloat(translateMatch[1]);
      if (isFinite(value)) {
        return value;
      }
    }
    
    // 方法3: 解析 translate 格式
    const translateGenericPattern = /translate\(([^,)]+)(?:,\s*([^)]+))?\)/;
    const genericMatch = transform.match(translateGenericPattern);
    if (genericMatch) {
      const xValue = parseFloat(genericMatch[1]);
      const yValue = genericMatch[2] ? parseFloat(genericMatch[2]) : 0;
      
      const value = isHorizontal ? xValue : yValue;
      if (isFinite(value)) {
        return value;
      }
    }
    
    return null;
  }

  /**
   * 解析变换位置 - 备用方法
   * @param transform 变换字符串
   * @param isHorizontal 是否为水平方向
   * @returns 解析的位置值，失败返回 null
   */
  private static parseTransformFallback(transform: string, isHorizontal: boolean): number | null {
    try {
      // 方法1: 解析 matrix 格式 matrix(a, b, c, d, tx, ty)
      const matrixPattern = /matrix\(([^)]+)\)/;
      const matrixMatch = transform.match(matrixPattern);
      if (matrixMatch) {
        const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
        if (values.length >= 6) {
          const position = isHorizontal ? values[4] : values[5]; // tx or ty
          if (isFinite(position)) {
            return position;
          }
        }
      }
      
      // 方法2: 解析 matrix3d 格式 matrix3d(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44)
      const matrix3dPattern = /matrix3d\(([^)]+)\)/;
      const matrix3dMatch = transform.match(matrix3dPattern);
      if (matrix3dMatch) {
        const values = matrix3dMatch[1].split(',').map(v => parseFloat(v.trim()));
        if (values.length >= 16) {
          const position = isHorizontal ? values[12] : values[13]; // m41 or m42
          if (isFinite(position)) {
            return position;
          }
        }
      }
      
      // 方法3: 解析 translate3d 格式
      const translate3dPattern = /translate3d\(([^,)]+),\s*([^,)]+),\s*([^)]+)\)/;
      const translate3dMatch = transform.match(translate3dPattern);
      if (translate3dMatch) {
        const xValue = parseFloat(translate3dMatch[1]);
        const yValue = parseFloat(translate3dMatch[2]);
        
        const value = isHorizontal ? xValue : yValue;
        if (isFinite(value)) {
          return value;
        }
      }
      
    } catch (error) {
      console.warn('Transform fallback parsing failed:', error);
    }
    
    return null;
  }

  /**
   * 创建位置快照
   * @param state 滚动状态
   * @param direction 滚动方向
   * @param metadata 可选的元数据
   * @returns 位置快照
   */
  public static createPositionSnapshot(
    state: ScrollState,
    direction: ScrollDirection,
    metadata?: {
      reason?: string;
      animationFrame?: number;
      performanceTimestamp?: number;
    }
  ): PositionSnapshot {
    const transformPosition = this.captureCurrentPosition(state, direction) ?? state.position;
    
    // 获取更详细的状态信息
    const snapshot: PositionSnapshot = {
      logicalPosition: state.position,
      transformPosition,
      content1Transform: state.content1.style.transform || 'none',
      content2Transform: state.content2.style.transform || 'none',
      timestamp: Date.now(),
      direction,
      // 扩展信息
      animationId: state.animationId,
      reason: metadata?.reason || 'manual',
      performanceTimestamp: metadata?.performanceTimestamp || performance.now(),
      animationFrame: metadata?.animationFrame || null,
      // 计算位置差异
      positionDifference: Math.abs(transformPosition - state.position),
      // 内容元素状态
      content1Visible: this.isElementVisible(state.content1),
      content2Visible: this.isElementVisible(state.content2),
      // 容器信息
      containerSize: this.getContainerSize(state.content1, direction)
    };
    
    return snapshot;
  }

  /**
   * 检查元素是否可见
   * @param element DOM 元素
   * @returns 是否可见
   */
  private static isElementVisible(element: HTMLElement): boolean {
    try {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取容器尺寸
   * @param element DOM 元素
   * @param direction 滚动方向
   * @returns 容器尺寸
   */
  private static getContainerSize(element: HTMLElement, direction: ScrollDirection): number {
    try {
      const config = DirectionHandler.getDirectionConfig(direction);
      const size = config.isHorizontal ? element.offsetWidth : element.offsetHeight;
      return typeof size === 'number' ? size : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 在当前位置暂停，确保位置完全冻结
   * @param state 滚动状态
   * @param direction 滚动方向
   * @param options 暂停选项
   */
  public static pauseAtCurrentPosition(
    state: ScrollState, 
    direction: ScrollDirection,
    options?: {
      createSnapshot?: boolean;
      verifyFreeze?: boolean;
      maxRetries?: number;
      tolerance?: number;
    }
  ): PositionSnapshot | null {
    const opts = {
      createSnapshot: true,
      verifyFreeze: true,
      maxRetries: 3,
      tolerance: this.TRANSFORM_TOLERANCE,
      ...options
    };

    let pauseSnapshot: PositionSnapshot | null = null;

    try {
      // 1. 创建暂停前的快照（如果需要）
      if (opts.createSnapshot) {
        pauseSnapshot = this.createPositionSnapshot(state, direction, {
          reason: 'pause-before',
          performanceTimestamp: performance.now()
        });
      }

      // 2. 捕获当前精确位置
      const currentPosition = this.captureCurrentPosition(state, direction);
      if (currentPosition === null) {
        console.warn('Unable to capture current position, using logical position');
        // 如果无法捕获位置，使用逻辑位置继续
        const fallbackPosition = state.position;
        const contentSize = PositionCalculator.getContentSize(state.content1, direction);
        this.applyPreciseTransforms(state, fallbackPosition, contentSize, direction);
        
        if (opts.createSnapshot) {
          return this.createPositionSnapshot(state, direction, {
            reason: 'pause-after',
            performanceTimestamp: performance.now()
          });
        }
        return null;
      }
      
      // 3. 同步逻辑位置与实际位置
      const positionDifference = Math.abs(state.position - currentPosition);
      if (positionDifference > opts.tolerance) {
        console.info(`Synchronizing position: logical=${state.position}, actual=${currentPosition}, diff=${positionDifference.toFixed(2)}px`);
        state.position = currentPosition;
      }
      
      // 4. 获取内容尺寸用于变换计算
      const contentSize = PositionCalculator.getContentSize(state.content1, direction);
      
      // 5. 应用精确的变换，确保位置冻结
      let retryCount = 0;
      let isPositionFrozen = false;
      
      while (retryCount <= opts.maxRetries && !isPositionFrozen) {
        // 应用变换
        this.applyPreciseTransforms(state, currentPosition, contentSize, direction);
        
        if (opts.verifyFreeze) {
          // 验证位置是否真正冻结
          isPositionFrozen = this.verifyPositionFreeze(state, direction, currentPosition, opts.tolerance);
          
          if (!isPositionFrozen && retryCount < opts.maxRetries) {
            console.warn(`Position freeze verification failed (attempt ${retryCount + 1}/${opts.maxRetries + 1}), retrying...`);
            retryCount++;
            
            // 在重试前稍微调整位置以避免浮点精度问题
            const adjustedPosition = Math.round(currentPosition * 100) / 100;
            this.applyPreciseTransforms(state, adjustedPosition, contentSize, direction);
          }
        } else {
          isPositionFrozen = true; // 如果不需要验证，认为成功
        }
        
        if (!opts.verifyFreeze) break;
      }
      
      if (!isPositionFrozen) {
        console.error(`Failed to freeze position after ${opts.maxRetries + 1} attempts`);
        // 使用回退策略
        this.fallbackPausePosition(state, direction);
      }

      // 6. 创建暂停后的快照（如果需要）
      if (opts.createSnapshot) {
        const afterSnapshot = this.createPositionSnapshot(state, direction, {
          reason: 'pause-after',
          performanceTimestamp: performance.now()
        });

        // 验证暂停前后的连续性
        if (pauseSnapshot) {
          const continuityResult = this.validatePositionContinuity(pauseSnapshot, afterSnapshot, opts.tolerance);
          if (!continuityResult.isValid) {
            console.warn('Position continuity issues detected during pause:', continuityResult.issues);
          }
        }

        return afterSnapshot;
      }
      
      return null;
      
    } catch (error) {
      console.error('Failed to pause at current position:', error);
      // 回退策略：使用逻辑位置
      this.fallbackPausePosition(state, direction);
      return pauseSnapshot;
    }
  }

  /**
   * 验证位置是否真正冻结
   * @param state 滚动状态
   * @param direction 滚动方向
   * @param expectedPosition 期望的位置
   * @param tolerance 容差
   * @returns 是否冻结
   */
  private static verifyPositionFreeze(
    state: ScrollState,
    direction: ScrollDirection,
    expectedPosition: number,
    tolerance: number
  ): boolean {
    try {
      // 多次采样验证位置稳定性
      const samples: number[] = [];
      const sampleCount = 3;
      
      for (let i = 0; i < sampleCount; i++) {
        const currentPosition = this.captureCurrentPosition(state, direction);
        if (currentPosition !== null) {
          samples.push(currentPosition);
        }
        
        // 小延迟以确保DOM更新完成
        if (i < sampleCount - 1) {
          // 使用同步方式进行微小延迟
          const start = performance.now();
          while (performance.now() - start < 1) {
            // 忙等待1ms
          }
        }
      }
      
      if (samples.length === 0) {
        console.warn('No position samples captured during freeze verification');
        return false;
      }
      
      // 检查所有样本是否都在容差范围内
      const allSamplesValid = samples.every(sample => 
        Math.abs(sample - expectedPosition) <= tolerance
      );
      
      // 检查样本之间的稳定性
      const maxVariation = Math.max(...samples) - Math.min(...samples);
      const isStable = maxVariation <= tolerance;
      
      if (!allSamplesValid) {
        console.warn(`Position samples not within tolerance: expected=${expectedPosition}, samples=[${samples.join(', ')}], tolerance=${tolerance}`);
      }
      
      if (!isStable) {
        console.warn(`Position not stable: variation=${maxVariation.toFixed(2)}px, tolerance=${tolerance}`);
      }
      
      return allSamplesValid && isStable;
      
    } catch (error) {
      console.error('Position freeze verification failed:', error);
      return false;
    }
  }

  /**
   * 从暂停位置精确恢复，避免位置跳跃
   * @param state 滚动状态
   * @param direction 滚动方向
   * @param options 恢复选项
   */
  public static resumeFromPausedPosition(
    state: ScrollState, 
    direction: ScrollDirection,
    options?: {
      createSnapshot?: boolean;
      validateContinuity?: boolean;
      tolerance?: number;
      preResumeSnapshot?: PositionSnapshot;
    }
  ): PositionSnapshot | null {
    const opts = {
      createSnapshot: true,
      validateContinuity: true,
      tolerance: this.POSITION_TOLERANCE,
      ...options
    };

    let resumeSnapshot: PositionSnapshot | null = null;

    try {
      // 1. 创建恢复前的快照（如果需要）
      if (opts.createSnapshot) {
        resumeSnapshot = this.createPositionSnapshot(state, direction, {
          reason: 'resume-before',
          performanceTimestamp: performance.now()
        });
      }

      // 2. 验证当前位置状态
      const currentTransformPosition = this.captureCurrentPosition(state, direction);
      if (currentTransformPosition === null) {
        console.warn('Unable to verify current transform position, using logical position');
        // 继续使用逻辑位置
      } else {
        // 3. 确保逻辑位置与变换位置同步
        const positionDifference = Math.abs(currentTransformPosition - state.position);
        if (positionDifference > opts.tolerance) {
          console.info(`Synchronizing position before resume: logical=${state.position}, actual=${currentTransformPosition}, diff=${positionDifference.toFixed(2)}px`);
          state.position = currentTransformPosition;
        }
      }
      
      // 4. 验证变换状态的一致性
      const contentSize = PositionCalculator.getContentSize(state.content1, direction);
      this.validateTransformConsistency(state, contentSize, direction);
      
      // 5. 准备无缝恢复的变换
      const resumePosition = currentTransformPosition ?? state.position;
      this.prepareSeamlessResumeTransforms(state, resumePosition, contentSize, direction);
      
      // 6. 验证恢复后的位置准确性
      const verificationPosition = this.captureCurrentPosition(state, direction);
      if (verificationPosition !== null) {
        const verificationDifference = Math.abs(verificationPosition - resumePosition);
        if (verificationDifference > opts.tolerance) {
          console.warn(`Resume position verification failed: expected=${resumePosition}, actual=${verificationPosition}, diff=${verificationDifference.toFixed(2)}px`);
          // 重新应用变换
          this.prepareSeamlessResumeTransforms(state, resumePosition, contentSize, direction);
        }
      }

      // 7. 创建恢复后的快照并验证连续性
      if (opts.createSnapshot) {
        const afterSnapshot = this.createPositionSnapshot(state, direction, {
          reason: 'resume-after',
          performanceTimestamp: performance.now()
        });

        // 验证恢复前后的连续性
        if (opts.validateContinuity && resumeSnapshot) {
          const continuityResult = this.validatePositionContinuity(resumeSnapshot, afterSnapshot, opts.tolerance);
          if (!continuityResult.isValid) {
            console.warn('Position continuity issues detected during resume:', continuityResult.issues);
          }
        }

        // 如果提供了暂停前的快照，验证暂停-恢复的整体连续性
        if (opts.validateContinuity && opts.preResumeSnapshot) {
          const overallContinuityResult = this.validatePositionContinuity(opts.preResumeSnapshot, afterSnapshot, opts.tolerance * 2); // 更宽松的容差
          if (!overallContinuityResult.isValid) {
            console.warn('Overall pause-resume continuity issues detected:', overallContinuityResult.issues);
          } else {
            console.info('Seamless resume completed successfully');
          }
        }

        return afterSnapshot;
      }
      
      return null;
      
    } catch (error) {
      console.error('Failed to resume from paused position:', error);
      // 回退策略：重置变换状态
      this.fallbackResumePosition(state, direction);
      return resumeSnapshot;
    }
  }

  /**
   * 准备无缝恢复的变换
   * @param state 滚动状态
   * @param resumePosition 恢复位置
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   */
  private static prepareSeamlessResumeTransforms(
    state: ScrollState,
    resumePosition: number,
    contentSize: number,
    direction: ScrollDirection
  ): void {
    try {
      const config = DirectionHandler.getDirectionConfig(direction);
      
      // 计算两个内容元素的精确位置
      let content1Position = resumePosition;
      let content2Position: number;
      
      // 根据方向计算第二个内容元素的位置
      if (config.isReverse) {
        // 对于 right 和 down 方向
        content2Position = resumePosition + contentSize;
      } else {
        // 对于 left 和 up 方向
        content2Position = resumePosition - contentSize;
      }
      
      // 应用精确的变换
      const transform1 = `${config.transformProperty}(${content1Position}px)`;
      const transform2 = `${config.transformProperty}(${content2Position}px)`;
      
      state.content1.style.transform = transform1;
      state.content2.style.transform = transform2;
      
      // 确保逻辑位置与应用的变换位置一致
      state.position = content1Position;
      
    } catch (error) {
      console.error('Failed to prepare seamless resume transforms:', error);
      // 回退到基本变换应用
      this.applyPreciseTransforms(state, resumePosition, contentSize, direction);
    }
  }

  /**
   * 验证暂停-恢复周期的完整性
   * @param pauseSnapshot 暂停时的快照
   * @param resumeSnapshot 恢复时的快照
   * @param tolerance 容差
   * @returns 验证结果
   */
  public static validatePauseResumeCycle(
    pauseSnapshot: PositionSnapshot,
    resumeSnapshot: PositionSnapshot,
    tolerance: number = this.POSITION_TOLERANCE
  ): {
    isValid: boolean;
    positionDrift: number;
    transformDrift: number;
    timePaused: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // 计算位置漂移
    const positionDrift = Math.abs(resumeSnapshot.logicalPosition - pauseSnapshot.logicalPosition);
    const transformDrift = Math.abs(resumeSnapshot.transformPosition - pauseSnapshot.transformPosition);
    const timePaused = resumeSnapshot.timestamp - pauseSnapshot.timestamp;
    
    // 检查位置漂移
    if (positionDrift > tolerance) {
      issues.push(`Logical position drift detected: ${positionDrift.toFixed(2)}px`);
      recommendations.push('Review pause position capture accuracy');
    }
    
    if (transformDrift > tolerance) {
      issues.push(`Transform position drift detected: ${transformDrift.toFixed(2)}px`);
      recommendations.push('Review transform application consistency');
    }
    
    // 检查方向一致性
    if (pauseSnapshot.direction !== resumeSnapshot.direction) {
      issues.push(`Direction changed during pause: ${pauseSnapshot.direction} -> ${resumeSnapshot.direction}`);
      recommendations.push('Ensure direction remains constant during pause-resume cycle');
    }
    
    // 检查时间合理性
    if (timePaused < 0) {
      issues.push(`Invalid pause duration: ${timePaused}ms`);
    } else if (timePaused > 60000) { // 超过1分钟
      recommendations.push('Long pause duration detected, consider position recalibration');
    }
    
    // 检查容器尺寸变化
    const sizeChange = Math.abs(resumeSnapshot.containerSize - pauseSnapshot.containerSize);
    if (sizeChange > 1) {
      issues.push(`Container size changed during pause: ${sizeChange.toFixed(2)}px`);
      recommendations.push('Handle container resize during pause');
    }
    
    return {
      isValid: issues.length === 0,
      positionDrift,
      transformDrift,
      timePaused,
      issues,
      recommendations
    };
  }

  /**
   * 验证位置连续性，确保暂停前后位置一致
   * @param beforeSnapshot 暂停前的位置快照
   * @param afterSnapshot 暂停后的位置快照
   * @param tolerance 容差值
   * @returns 验证结果
   */
  public static validatePositionContinuity(
    beforeSnapshot: PositionSnapshot,
    afterSnapshot: PositionSnapshot,
    tolerance: number = this.POSITION_TOLERANCE
  ): PositionContinuityResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    
    // 验证逻辑位置连续性
    const positionDifference = Math.abs(
      afterSnapshot.logicalPosition - beforeSnapshot.logicalPosition
    );
    
    // 验证变换位置连续性
    const transformDifference = Math.abs(
      afterSnapshot.transformPosition - beforeSnapshot.transformPosition
    );
    
    // 检查位置跳跃
    if (positionDifference > tolerance) {
      issues.push(`Logical position jump detected: ${positionDifference.toFixed(2)}px`);
    }
    
    if (transformDifference > tolerance) {
      issues.push(`Transform position jump detected: ${transformDifference.toFixed(2)}px`);
    }
    
    // 检查方向一致性
    if (beforeSnapshot.direction !== afterSnapshot.direction) {
      issues.push(`Direction changed during pause: ${beforeSnapshot.direction} -> ${afterSnapshot.direction}`);
    }
    
    // 检查时间合理性
    const timeDifference = afterSnapshot.timestamp - beforeSnapshot.timestamp;
    if (timeDifference < 0) {
      issues.push(`Invalid timestamp sequence: ${timeDifference}ms`);
    }
    
    // 检查动画状态一致性
    if (beforeSnapshot.animationId !== afterSnapshot.animationId) {
      warnings.push(`Animation ID changed: ${beforeSnapshot.animationId} -> ${afterSnapshot.animationId}`);
    }
    
    // 检查元素可见性变化
    if (beforeSnapshot.content1Visible !== afterSnapshot.content1Visible) {
      warnings.push(`Content1 visibility changed: ${beforeSnapshot.content1Visible} -> ${afterSnapshot.content1Visible}`);
    }
    
    if (beforeSnapshot.content2Visible !== afterSnapshot.content2Visible) {
      warnings.push(`Content2 visibility changed: ${beforeSnapshot.content2Visible} -> ${afterSnapshot.content2Visible}`);
    }
    
    // 检查容器尺寸变化
    const containerSizeDifference = Math.abs(afterSnapshot.containerSize - beforeSnapshot.containerSize);
    if (containerSizeDifference > 1) { // 1px 容差
      warnings.push(`Container size changed: ${containerSizeDifference.toFixed(2)}px`);
    }
    
    // 检查位置差异变化（逻辑位置与变换位置的同步性）
    const beforePositionSync = beforeSnapshot.positionDifference;
    const afterPositionSync = afterSnapshot.positionDifference;
    const syncDifference = Math.abs(afterPositionSync - beforePositionSync);
    
    if (syncDifference > tolerance) {
      warnings.push(`Position synchronization changed: ${syncDifference.toFixed(2)}px`);
    }
    
    // 检查性能时间戳合理性
    const performanceTimeDifference = afterSnapshot.performanceTimestamp - beforeSnapshot.performanceTimestamp;
    if (performanceTimeDifference < 0) {
      issues.push(`Invalid performance timestamp sequence: ${performanceTimeDifference.toFixed(2)}ms`);
    }
    
    return {
      isValid: issues.length === 0,
      positionDifference,
      transformDifference,
      issues,
      warnings,
      timeDifference,
      performanceTimeDifference,
      containerSizeDifference,
      positionSyncDifference: syncDifference
    };
  }

  /**
   * 批量验证位置快照序列的连续性
   * @param snapshots 位置快照数组
   * @param tolerance 容差值
   * @returns 批量验证结果
   */
  public static validateSnapshotSequence(
    snapshots: PositionSnapshot[],
    tolerance: number = this.POSITION_TOLERANCE
  ): {
    isValid: boolean;
    totalSnapshots: number;
    validTransitions: number;
    invalidTransitions: Array<{
      index: number;
      result: PositionContinuityResult;
    }>;
    summary: {
      maxPositionJump: number;
      maxTransformJump: number;
      totalTimeDifference: number;
      averageTimeBetweenSnapshots: number;
    };
  } {
    if (snapshots.length < 2) {
      return {
        isValid: true,
        totalSnapshots: snapshots.length,
        validTransitions: 0,
        invalidTransitions: [],
        summary: {
          maxPositionJump: 0,
          maxTransformJump: 0,
          totalTimeDifference: 0,
          averageTimeBetweenSnapshots: 0
        }
      };
    }
    
    const invalidTransitions: Array<{ index: number; result: PositionContinuityResult }> = [];
    let maxPositionJump = 0;
    let maxTransformJump = 0;
    let totalTimeDifference = 0;
    
    for (let i = 1; i < snapshots.length; i++) {
      const result = this.validatePositionContinuity(snapshots[i - 1], snapshots[i], tolerance);
      
      if (!result.isValid) {
        invalidTransitions.push({ index: i, result });
      }
      
      maxPositionJump = Math.max(maxPositionJump, result.positionDifference);
      maxTransformJump = Math.max(maxTransformJump, result.transformDifference);
      totalTimeDifference += result.timeDifference || 0;
    }
    
    const validTransitions = snapshots.length - 1 - invalidTransitions.length;
    const averageTimeBetweenSnapshots = totalTimeDifference / (snapshots.length - 1);
    
    return {
      isValid: invalidTransitions.length === 0,
      totalSnapshots: snapshots.length,
      validTransitions,
      invalidTransitions,
      summary: {
        maxPositionJump,
        maxTransformJump,
        totalTimeDifference,
        averageTimeBetweenSnapshots
      }
    };
  }

  /**
   * 创建快照比较报告
   * @param beforeSnapshot 之前的快照
   * @param afterSnapshot 之后的快照
   * @returns 比较报告
   */
  public static createSnapshotComparisonReport(
    beforeSnapshot: PositionSnapshot,
    afterSnapshot: PositionSnapshot
  ): {
    summary: string;
    details: {
      positionChange: number;
      transformChange: number;
      timeElapsed: number;
      directionChanged: boolean;
      visibilityChanged: boolean;
      sizeChanged: boolean;
    };
    recommendations: string[];
  } {
    const continuityResult = this.validatePositionContinuity(beforeSnapshot, afterSnapshot);
    const recommendations: string[] = [];
    
    // 生成建议 - 使用更宽松的阈值来避免对正常小幅变化的误报
    const recommendationPositionThreshold = this.POSITION_TOLERANCE * 2; // 1.0px
    const recommendationTransformThreshold = this.TRANSFORM_TOLERANCE * 5; // 0.5px
    
    if (continuityResult.positionDifference > recommendationPositionThreshold) {
      recommendations.push('Consider adjusting position synchronization logic');
    }
    
    if (continuityResult.transformDifference > recommendationTransformThreshold) {
      recommendations.push('Review transform application accuracy');
    }
    
    if (continuityResult.issues.length > 0) {
      recommendations.push('Address critical position continuity issues');
    }
    
    if (continuityResult.warnings && continuityResult.warnings.length > 0) {
      recommendations.push('Monitor warning conditions for potential issues');
    }
    
    const details = {
      positionChange: afterSnapshot.logicalPosition - beforeSnapshot.logicalPosition,
      transformChange: afterSnapshot.transformPosition - beforeSnapshot.transformPosition,
      timeElapsed: afterSnapshot.timestamp - beforeSnapshot.timestamp,
      directionChanged: beforeSnapshot.direction !== afterSnapshot.direction,
      visibilityChanged: beforeSnapshot.content1Visible !== afterSnapshot.content1Visible ||
                        beforeSnapshot.content2Visible !== afterSnapshot.content2Visible,
      sizeChanged: Math.abs(afterSnapshot.containerSize - beforeSnapshot.containerSize) > 1
    };
    
    const summary = `Position continuity ${continuityResult.isValid ? 'VALID' : 'INVALID'}: ` +
      `${continuityResult.issues.length} issues, ${continuityResult.warnings?.length || 0} warnings`;
    
    return {
      summary,
      details,
      recommendations
    };
  }

  /**
   * 应用精确的变换，确保位置冻结
   * @param state 滚动状态
   * @param position 目标位置
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   */
  private static applyPreciseTransforms(
    state: ScrollState,
    position: number,
    contentSize: number,
    direction: ScrollDirection
  ): void {
    try {
      const config = DirectionHandler.getDirectionConfig(direction);
      
      // 计算两个内容元素的位置
      let content1Position = position;
      let content2Position = position - contentSize;
      
      // 处理位置归一化，确保无缝循环
      if (config.isReverse) {
        // 对于 right 和 down 方向，需要调整计算逻辑
        if (direction === 'right') {
          content2Position = position + contentSize;
        } else if (direction === 'down') {
          content2Position = position + contentSize;
        }
      }
      
      // 应用变换
      const transform1 = `${config.transformProperty}(${content1Position}px)`;
      const transform2 = `${config.transformProperty}(${content2Position}px)`;
      
      state.content1.style.transform = transform1;
      state.content2.style.transform = transform2;
    } catch (error) {
      console.error('Failed to apply precise transforms:', error);
      // 回退策略：使用基本变换
      try {
        DirectionHandler.applyTransform(state.content1, position, direction);
        DirectionHandler.applyTransform(state.content2, position, direction);
      } catch (fallbackError) {
        console.error('Fallback transform application failed:', fallbackError);
      }
    }
  }

  /**
   * 验证变换一致性
   * @param state 滚动状态
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   */
  private static validateTransformConsistency(
    state: ScrollState,
    contentSize: number,
    direction: ScrollDirection
  ): void {
    const currentPosition = this.captureCurrentPosition(state, direction);
    if (currentPosition === null) return;
    
    // 如果位置不一致，重新应用变换
    if (Math.abs(currentPosition - state.position) > this.TRANSFORM_TOLERANCE) {
      console.warn('Transform inconsistency detected, correcting...');
      this.applyPreciseTransforms(state, state.position, contentSize, direction);
    }
  }

  /**
   * 回退暂停位置策略
   * @param state 滚动状态
   * @param direction 滚动方向
   */
  private static fallbackPausePosition(
    state: ScrollState,
    direction: ScrollDirection
  ): void {
    try {
      const contentSize = PositionCalculator.getContentSize(state.content1, direction);
      this.applyPreciseTransforms(state, state.position, contentSize, direction);
    } catch (error) {
      console.error('Fallback pause position failed:', error);
      // 最后的回退策略：直接设置基本变换
      try {
        const isHorizontal = direction === 'left' || direction === 'right';
        const transformProperty = isHorizontal ? 'translateX' : 'translateY';
        state.content1.style.transform = `${transformProperty}(${state.position}px)`;
        state.content2.style.transform = `${transformProperty}(${state.position - 100}px)`;
      } catch (finalError) {
        console.error('Final fallback failed:', finalError);
      }
    }
  }

  /**
   * 回退恢复位置策略
   * @param state 滚动状态
   * @param direction 滚动方向
   */
  private static fallbackResumePosition(
    state: ScrollState,
    direction: ScrollDirection
  ): void {
    try {
      // 重置变换状态
      DirectionHandler.applyTransform(state.content1, state.position, direction);
      DirectionHandler.applyTransform(state.content2, state.position, direction);
    } catch (error) {
      console.error('Fallback resume position failed:', error);
      // 最后的回退策略：直接设置基本变换
      try {
        const isHorizontal = direction === 'left' || direction === 'right';
        const transformProperty = isHorizontal ? 'translateX' : 'translateY';
        state.content1.style.transform = `${transformProperty}(${state.position}px)`;
        state.content2.style.transform = `${transformProperty}(${state.position - 100}px)`;
      } catch (finalError) {
        console.error('Final fallback failed:', finalError);
      }
    }
  }

  /**
   * 批量位置管理 - 用于处理多个状态的位置管理
   * @param states 滚动状态数组
   * @param direction 滚动方向
   * @param operation 操作类型
   * @param options 批量操作选项
   */
  public static batchPositionManagement(
    states: ScrollState[],
    direction: ScrollDirection,
    operation: 'pause' | 'resume',
    options?: {
      continueOnError?: boolean;
      createSnapshots?: boolean;
      validateContinuity?: boolean;
      tolerance?: number;
      maxConcurrency?: number;
      timeout?: number;
    }
  ): {
    results: Array<{
      index: number;
      success: boolean;
      error: string | null;
      snapshot?: PositionSnapshot;
      executionTime?: number;
    }>;
    summary: {
      totalStates: number;
      successCount: number;
      failureCount: number;
      averageExecutionTime: number;
      totalExecutionTime: number;
    };
    continuityIssues: Array<{
      stateIndex: number;
      issues: string[];
    }>;
  } {
    const opts = {
      continueOnError: true,
      createSnapshots: false,
      validateContinuity: false,
      tolerance: this.POSITION_TOLERANCE,
      maxConcurrency: 10,
      timeout: 5000,
      ...options
    };

    const startTime = performance.now();
    const results: Array<{
      index: number;
      success: boolean;
      error: string | null;
      snapshot?: PositionSnapshot;
      executionTime?: number;
    }> = [];
    const continuityIssues: Array<{ stateIndex: number; issues: string[] }> = [];

    // 处理批量操作 - 同步处理每个状态
    const processState = (state: ScrollState, index: number) => {
      const operationStartTime = performance.now();
      
      try {
        // 验证状态有效性
        if (!state || !state.content1 || !state.content2) {
          throw new Error(`Invalid state at index ${index}: missing required elements`);
        }

        let snapshot: PositionSnapshot | null = null;
        
        if (operation === 'pause') {
          snapshot = this.pauseAtCurrentPosition(state, direction, {
            createSnapshot: opts.createSnapshots,
            tolerance: opts.tolerance
          });
        } else {
          snapshot = this.resumeFromPausedPosition(state, direction, {
            createSnapshot: opts.createSnapshots,
            validateContinuity: opts.validateContinuity,
            tolerance: opts.tolerance
          });
        }
        
        const executionTime = performance.now() - operationStartTime;
        
        return {
          index,
          success: true,
          error: null,
          snapshot: snapshot || undefined,
          executionTime
        };
      } catch (error) {
        const executionTime = performance.now() - operationStartTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        console.error(`Batch ${operation} failed for state ${index}:`, error);
        
        return {
          index,
          success: false,
          error: errorMessage,
          executionTime
        };
      }
    };

    // 同步处理所有状态
    for (let i = 0; i < states.length; i++) {
      const result = processState(states[i], i);
      results.push(result);
      
      // 如果不继续处理错误且遇到错误，则停止
      if (!opts.continueOnError && !result.success) {
        console.warn(`Stopping batch operation at index ${i} due to error`);
        break;
      }
    }

    // 验证连续性（如果启用）
    if (opts.validateContinuity && opts.createSnapshots) {
      for (let i = 0; i < results.length - 1; i++) {
        const currentResult = results[i];
        const nextResult = results[i + 1];
        
        if (currentResult.success && nextResult.success && 
            currentResult.snapshot && nextResult.snapshot) {
          const continuityResult = this.validatePositionContinuity(
            currentResult.snapshot,
            nextResult.snapshot,
            opts.tolerance
          );
          
          if (!continuityResult.isValid) {
            continuityIssues.push({
              stateIndex: i,
              issues: continuityResult.issues
            });
          }
        }
      }
    }

    const totalExecutionTime = performance.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    const averageExecutionTime = results.length > 0 ? 
      results.reduce((sum, r) => sum + (r.executionTime || 0), 0) / results.length : 0;

    // 记录批量操作结果
    if (failureCount > 0) {
      const failures = results.filter(r => !r.success);
      console.warn(`Batch ${operation} had ${failureCount} failures out of ${results.length} operations:`, failures);
    } else {
      console.info(`Batch ${operation} completed successfully for all ${results.length} states in ${totalExecutionTime.toFixed(2)}ms`);
    }

    if (continuityIssues.length > 0) {
      console.warn(`Batch ${operation} detected ${continuityIssues.length} continuity issues:`, continuityIssues);
    }

    return {
      results,
      summary: {
        totalStates: states.length,
        successCount,
        failureCount,
        averageExecutionTime,
        totalExecutionTime
      },
      continuityIssues
    };
  }

  /**
   * 批量创建位置快照
   * @param states 滚动状态数组
   * @param direction 滚动方向
   * @param reason 快照原因
   * @returns 快照数组和统计信息
   */
  public static batchCreateSnapshots(
    states: ScrollState[],
    direction: ScrollDirection,
    reason: string = 'batch-snapshot'
  ): {
    snapshots: PositionSnapshot[];
    stats: {
      totalSnapshots: number;
      validSnapshots: number;
      averagePosition: number;
      positionVariance: number;
      timeRange: { min: number; max: number };
    };
  } {
    const snapshots: PositionSnapshot[] = [];
    const startTime = performance.now();
    
    for (let i = 0; i < states.length; i++) {
      try {
        const snapshot = this.createPositionSnapshot(states[i], direction, {
          reason: `${reason}-${i}`,
          performanceTimestamp: performance.now()
        });
        snapshots.push(snapshot);
      } catch (error) {
        console.error(`Failed to create snapshot for state ${i}:`, error);
      }
    }
    
    // 计算统计信息
    const validSnapshots = snapshots.length;
    const positions = snapshots.map(s => s.logicalPosition);
    const averagePosition = positions.length > 0 ? 
      positions.reduce((sum, pos) => sum + pos, 0) / positions.length : 0;
    
    // 计算位置方差
    const positionVariance = positions.length > 0 ? 
      positions.reduce((sum, pos) => sum + Math.pow(pos - averagePosition, 2), 0) / positions.length : 0;
    
    const timestamps = snapshots.map(s => s.performanceTimestamp);
    const timeRange = timestamps.length > 0 ? {
      min: Math.min(...timestamps),
      max: Math.max(...timestamps)
    } : { min: 0, max: 0 };
    
    return {
      snapshots,
      stats: {
        totalSnapshots: states.length,
        validSnapshots,
        averagePosition,
        positionVariance,
        timeRange
      }
    };
  }

  /**
   * 批量验证位置连续性
   * @param snapshots 位置快照数组
   * @param tolerance 容差
   * @returns 验证结果
   */
  public static batchValidatePositionContinuity(
    snapshots: PositionSnapshot[],
    tolerance: number = this.POSITION_TOLERANCE
  ): {
    overallValid: boolean;
    validTransitions: number;
    invalidTransitions: Array<{
      fromIndex: number;
      toIndex: number;
      issues: string[];
      positionDifference: number;
      transformDifference: number;
    }>;
    statistics: {
      maxPositionJump: number;
      maxTransformJump: number;
      averagePositionDifference: number;
      averageTransformDifference: number;
    };
  } {
    if (snapshots.length < 2) {
      return {
        overallValid: true,
        validTransitions: 0,
        invalidTransitions: [],
        statistics: {
          maxPositionJump: 0,
          maxTransformJump: 0,
          averagePositionDifference: 0,
          averageTransformDifference: 0
        }
      };
    }
    
    const invalidTransitions: Array<{
      fromIndex: number;
      toIndex: number;
      issues: string[];
      positionDifference: number;
      transformDifference: number;
    }> = [];
    
    let maxPositionJump = 0;
    let maxTransformJump = 0;
    let totalPositionDifference = 0;
    let totalTransformDifference = 0;
    
    for (let i = 1; i < snapshots.length; i++) {
      const result = this.validatePositionContinuity(snapshots[i - 1], snapshots[i], tolerance);
      
      maxPositionJump = Math.max(maxPositionJump, result.positionDifference);
      maxTransformJump = Math.max(maxTransformJump, result.transformDifference);
      totalPositionDifference += result.positionDifference;
      totalTransformDifference += result.transformDifference;
      
      if (!result.isValid) {
        invalidTransitions.push({
          fromIndex: i - 1,
          toIndex: i,
          issues: result.issues,
          positionDifference: result.positionDifference,
          transformDifference: result.transformDifference
        });
      }
    }
    
    const validTransitions = snapshots.length - 1 - invalidTransitions.length;
    const averagePositionDifference = totalPositionDifference / (snapshots.length - 1);
    const averageTransformDifference = totalTransformDifference / (snapshots.length - 1);
    
    return {
      overallValid: invalidTransitions.length === 0,
      validTransitions,
      invalidTransitions,
      statistics: {
        maxPositionJump,
        maxTransformJump,
        averagePositionDifference,
        averageTransformDifference
      }
    };
  }

  /**
   * 获取位置管理统计信息
   * @param states 滚动状态数组
   * @param direction 滚动方向
   * @param options 统计选项
   * @returns 详细统计信息
   */
  public static getPositionStats(
    states: ScrollState[],
    direction: ScrollDirection,
    options?: {
      includeTransformAnalysis?: boolean;
      includePerformanceMetrics?: boolean;
      includeSynchronizationAnalysis?: boolean;
    }
  ): {
    totalStates: number;
    validPositions: number;
    averagePosition: number;
    positionRange: { min: number; max: number };
    positionVariance: number;
    standardDeviation: number;
    transformAnalysis?: {
      validTransforms: number;
      averageTransformPosition: number;
      transformRange: { min: number; max: number };
      transformVariance: number;
    };
    synchronizationAnalysis?: {
      synchronizedStates: number;
      averageSyncDifference: number;
      maxSyncDifference: number;
      outOfSyncStates: Array<{
        index: number;
        logicalPosition: number;
        transformPosition: number;
        difference: number;
      }>;
    };
    performanceMetrics?: {
      captureTime: number;
      averageCaptureTimePerState: number;
      slowestCaptures: Array<{
        index: number;
        captureTime: number;
      }>;
    };
    healthScore: number; // 0-100 分数，表示整体位置管理健康度
  } {
    const opts = {
      includeTransformAnalysis: true,
      includePerformanceMetrics: true,
      includeSynchronizationAnalysis: true,
      ...options
    };

    const startTime = performance.now();
    const positionData: Array<{
      index: number;
      logicalPosition: number;
      transformPosition: number | null;
      captureTime: number;
    }> = [];

    // 收集位置数据
    for (let i = 0; i < states.length; i++) {
      const captureStartTime = performance.now();
      const transformPosition = this.captureCurrentPosition(states[i], direction);
      const captureTime = performance.now() - captureStartTime;
      
      positionData.push({
        index: i,
        logicalPosition: states[i].position,
        transformPosition,
        captureTime
      });
    }

    const totalCaptureTime = performance.now() - startTime;
    
    // 基本统计
    const validPositions = positionData.filter(d => d.transformPosition !== null);
    const positions = validPositions.map(d => d.transformPosition!);
    const logicalPositions = positionData.map(d => d.logicalPosition);
    
    const averagePosition = positions.length > 0 ? 
      positions.reduce((sum, pos) => sum + pos, 0) / positions.length : 0;
    
    const positionRange = positions.length > 0 ? {
      min: Math.min(...positions),
      max: Math.max(...positions)
    } : { min: 0, max: 0 };
    
    // 计算方差和标准差
    const positionVariance = positions.length > 0 ? 
      positions.reduce((sum, pos) => sum + Math.pow(pos - averagePosition, 2), 0) / positions.length : 0;
    const standardDeviation = Math.sqrt(positionVariance);

    // 变换分析
    let transformAnalysis;
    if (opts.includeTransformAnalysis) {
      const validTransforms = validPositions.length;
      const averageTransformPosition = averagePosition;
      const transformRange = positionRange;
      const transformVariance = positionVariance;
      
      transformAnalysis = {
        validTransforms,
        averageTransformPosition,
        transformRange,
        transformVariance
      };
    }

    // 同步分析
    let synchronizationAnalysis;
    if (opts.includeSynchronizationAnalysis) {
      const syncData = positionData
        .filter(d => d.transformPosition !== null)
        .map(d => ({
          ...d,
          difference: Math.abs(d.logicalPosition - d.transformPosition!)
        }));
      
      const synchronizedStates = syncData.filter(d => d.difference <= this.POSITION_TOLERANCE).length;
      const averageSyncDifference = syncData.length > 0 ? 
        syncData.reduce((sum, d) => sum + d.difference, 0) / syncData.length : 0;
      const maxSyncDifference = syncData.length > 0 ? 
        Math.max(...syncData.map(d => d.difference)) : 0;
      
      const outOfSyncStates = syncData
        .filter(d => d.difference > this.POSITION_TOLERANCE)
        .map(d => ({
          index: d.index,
          logicalPosition: d.logicalPosition,
          transformPosition: d.transformPosition!,
          difference: d.difference
        }));
      
      synchronizationAnalysis = {
        synchronizedStates,
        averageSyncDifference,
        maxSyncDifference,
        outOfSyncStates
      };
    }

    // 性能指标
    let performanceMetrics;
    if (opts.includePerformanceMetrics) {
      const averageCaptureTimePerState = totalCaptureTime / states.length;
      const slowestCaptures = positionData
        .sort((a, b) => b.captureTime - a.captureTime)
        .slice(0, Math.min(5, states.length))
        .map(d => ({
          index: d.index,
          captureTime: d.captureTime
        }));
      
      performanceMetrics = {
        captureTime: totalCaptureTime,
        averageCaptureTimePerState,
        slowestCaptures
      };
    }

    // 计算健康度分数 (0-100)
    let healthScore = 100;
    
    // 位置有效性 (30%)
    const positionValidityScore = (validPositions.length / states.length) * 30;
    
    // 同步性 (40%)
    const syncScore = synchronizationAnalysis ? 
      (synchronizationAnalysis.synchronizedStates / validPositions.length) * 40 : 40;
    
    // 性能 (20%)
    const performanceScore = performanceMetrics ? 
      Math.max(0, 20 - (performanceMetrics.averageCaptureTimePerState * 2)) : 20;
    
    // 稳定性 (10%) - 基于标准差
    const stabilityScore = Math.max(0, 10 - (standardDeviation / 10));
    
    healthScore = positionValidityScore + syncScore + performanceScore + stabilityScore;
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      totalStates: states.length,
      validPositions: validPositions.length,
      averagePosition,
      positionRange,
      positionVariance,
      standardDeviation,
      transformAnalysis,
      synchronizationAnalysis,
      performanceMetrics,
      healthScore
    };
  }

  /**
   * 监控位置管理健康状态
   * @param states 滚动状态数组
   * @param direction 滚动方向
   * @returns 健康状态报告
   */
  public static monitorPositionHealth(
    states: ScrollState[],
    direction: ScrollDirection
  ): {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    issues: string[];
    recommendations: string[];
    stats: ReturnType<typeof HoverPositionManager.getPositionStats>;
  } {
    const stats = this.getPositionStats(states, direction);
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // 检查各种健康指标
    if (stats.validPositions < stats.totalStates * 0.9) {
      issues.push(`Low position capture rate: ${stats.validPositions}/${stats.totalStates}`);
      recommendations.push('Check DOM element validity and transform parsing');
    }
    
    if (stats.synchronizationAnalysis && stats.synchronizationAnalysis.outOfSyncStates.length > 0) {
      issues.push(`${stats.synchronizationAnalysis.outOfSyncStates.length} states out of sync`);
      recommendations.push('Run position synchronization for out-of-sync states');
    }
    
    if (stats.performanceMetrics && stats.performanceMetrics.averageCaptureTimePerState > 5) {
      issues.push(`Slow position capture: ${stats.performanceMetrics.averageCaptureTimePerState.toFixed(2)}ms avg`);
      recommendations.push('Optimize position capture performance');
    }
    
    if (stats.standardDeviation > 50) {
      issues.push(`High position variance: σ=${stats.standardDeviation.toFixed(2)}`);
      recommendations.push('Investigate position calculation consistency');
    }
    
    // 确定状态
    let status: 'healthy' | 'warning' | 'critical';
    if (stats.healthScore >= 80) {
      status = 'healthy';
    } else if (stats.healthScore >= 60) {
      status = 'warning';
    } else {
      status = 'critical';
    }
    
    return {
      status,
      score: stats.healthScore,
      issues,
      recommendations,
      stats
    };
  }
}