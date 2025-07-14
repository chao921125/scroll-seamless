// 方向类型
import type { ScrollDirection } from '../types';

export const legalDirections = ['left', 'right', 'up', 'down'] as const;

export function getLegalDirection(direction: string): ScrollDirection {
  return (legalDirections.includes(direction as ScrollDirection) ? direction : 'left') as ScrollDirection;
}

export function getContentTransform(
  direction: ScrollDirection,
  position: number,
  totalLength: number,
  isSecondContent: boolean
): string {
  if (direction === 'left') {
    return `translateX(${-position + (isSecondContent ? totalLength : 0)}px)`;
  } else if (direction === 'right') {
    return `translateX(${-position - (isSecondContent ? totalLength : 0)}px)`;
  } else if (direction === 'up') {
    return `translateY(${-position + (isSecondContent ? totalLength : 0)}px)`;
  } else if (direction === 'down') {
    return `translateY(${-position - (isSecondContent ? totalLength : 0)}px)`;
  }
  return '';
}

export function getNextPosition(
  direction: ScrollDirection,
  position: number,
  step: number,
  totalLength: number
): number {
  if (direction === 'left' || direction === 'up') {
    position += step;
    if (position >= totalLength) position = 0;
  } else if (direction === 'right' || direction === 'down') {
    position -= step;
    if (position <= -totalLength) position = 0;
  }
  return position;
}

export function getContentStyle(direction: ScrollDirection): React.CSSProperties {
  if (direction === 'left' || direction === 'right') {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      display: 'inline-block',
      whiteSpace: 'nowrap',
      verticalAlign: 'top',
    };
  }
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'block',
    whiteSpace: 'normal',
  };
}

export function fireEvent(
  handler: ((event: string, payload?: any) => void) | undefined,
  event: string,
  payload?: any
) {
  if (typeof handler === 'function') {
    handler(event, payload);
  }
}

export function getRenderData<T>(data: T[], direction: ScrollDirection): T[] {
  if (direction === 'right' || direction === 'down') {
    return data.slice().reverse();
  }
  return data;
} 