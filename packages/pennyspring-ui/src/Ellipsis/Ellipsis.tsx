import type { ComponentSize } from '../shares/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text as MeasurementText, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import { Text } from '../Text';
import type { TextSize } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { TextLayoutEventData } from 'react-native';
import type {
  EllipsisDirection,
  EllipsisProps,
} from './types';

const ELLIPSIS_TEXT = '...';

const TEXT_SIZE_MAP: Record<ComponentSize, TextSize> = {
  small: 'sm',
  normal: 'md',
  large: 'lg',
};

interface StyleOptions {
  size: ComponentSize;
}

interface SizeConfig {
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

const SIZE_CONFIG: Record<ComponentSize, SizeConfig> = {
  small: {
    fontSize: t => t.fontSizeSM,
    lineHeight: t => t.lineHeightSM,
  },
  normal: {
    fontSize: t => t.fontSize,
    lineHeight: t => t.lineHeight,
  },
  large: {
    fontSize: t => t.fontSizeLG,
    lineHeight: t => t.lineHeightLG,
  },
};

const useStyles = createUseSheetStyle(
  (token, { size }: StyleOptions) => {
    const config = SIZE_CONFIG[size];

    return {
      content: {
        fontFamily: token.fontFamily,
        fontSize: config.fontSize(token),
        lineHeight: config.lineHeight(token),
        color: token.colorText,
      },
      action: {
        color: token.colorPrimary,
        fontFamily: token.fontFamily,
        fontSize: config.fontSize(token),
        lineHeight: config.lineHeight(token),
      },
      measure: {
        position: 'absolute',
        opacity: 0,
        pointerEvents: 'none',
      },
    };
  },
);

function getCollapsedText(
  content: string,
  direction: EllipsisDirection,
  chars: number,
): string {
  if (direction === 'end') {
    return content.slice(0, chars) + ELLIPSIS_TEXT;
  }

  if (direction === 'start') {
    return ELLIPSIS_TEXT + content.slice(content.length - chars);
  }

  return (
    content.slice(0, chars) +
    ELLIPSIS_TEXT +
    content.slice(content.length - chars)
  );
}

function getMeasuredCollapsedText(
  content: string,
  direction: EllipsisDirection,
  chars: number,
  expandText?: string,
): string {
  const collapsedText = getCollapsedText(content, direction, chars);

  if (!expandText) {
    return collapsedText;
  }

  if (direction === 'start') {
    return expandText + collapsedText;
  }

  return collapsedText + expandText;
}

type MeasurementStatus = 'measuring' | 'searching' | 'done';

interface HiddenMeasurementTextProps {
  children: string;
  onTextLayout: (event: { nativeEvent: TextLayoutEventData }) => void;
  style: ReturnType<typeof useStyles>['content'];
}

function HiddenMeasurementText({
  children,
  onTextLayout,
  style,
}: HiddenMeasurementTextProps) {
  return (
    <MeasurementText
      onTextLayout={onTextLayout}
      style={style}
    >
      {children}
    </MeasurementText>
  );
}

export function Ellipsis({
  content,
  direction = 'end',
  rows = 1,
  expandText,
  collapseText,
  defaultOpen,
  open,
  onOpenChange,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpand,
  size = 'normal',
  styles: stylesProp,
  style,
  'data-testid': testId,
}: EllipsisProps) {
  const styles = useStyles({ size });
  const safeRows = Math.max(1, Math.floor(rows));
  const textSize = TEXT_SIZE_MAP[size];
  const mergedDefaultOpen = defaultOpen ?? defaultExpanded;
  const mergedOpen = open ?? expandedProp;
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);
      onExpand?.(nextOpen);
    },
    [onOpenChange, onExpand],
  );

  const [expanded, setExpanded] = useControllableValue(
    mergedDefaultOpen,
    mergedOpen,
    handleOpenChange,
  );

  // Measurement state
  const [status, setStatus] = useState<MeasurementStatus>('done');
  const [maxChars, setMaxChars] = useState(0);
  const [searchLow, setSearchLow] = useState(0);
  const [searchHigh, setSearchHigh] = useState(0);
  const searchRangeRef = useRef<[number, number]>([0, 0]);

  const midIndex = Math.ceil((searchLow + searchHigh) / 2);

  // Reset measurement when content, rows, or direction change
  useEffect(() => {
    if (content) {
      setStatus('measuring');
      setMaxChars(0);
      setSearchLow(0);
      setSearchHigh(0);
    }
  }, [content, safeRows, direction]);

  // Handle full content text layout - check if truncation needed
  const handleFullTextLayout = useCallback(
    (e: { nativeEvent: TextLayoutEventData }) => {
      if (status !== 'measuring') return;
      const lineCount = e.nativeEvent.lines.length;

      if (lineCount <= safeRows) {
        setMaxChars(content.length);
        setStatus('done');
      } else {
        const half = direction === 'middle'
          ? Math.ceil(content.length / 2)
          : content.length;
        searchRangeRef.current = [0, half];
        setSearchLow(0);
        setSearchHigh(half);
        setStatus('searching');
      }
    },
    [status, safeRows, direction, content.length],
  );

  // Handle search candidate text layout
  const handleSearchTextLayout = useCallback(
    (e: { nativeEvent: TextLayoutEventData }) => {
      if (status !== 'searching') return;
      const lineCount = e.nativeEvent.lines.length;
      const [low, high] = searchRangeRef.current;
      const mid = Math.ceil((low + high) / 2);

      if (lineCount > safeRows) {
        searchRangeRef.current = [low, mid];
        setSearchLow(low);
        setSearchHigh(mid);
      } else {
        searchRangeRef.current = [mid, high];
        setSearchLow(mid);
        setSearchHigh(high);
      }
    },
    [status, safeRows],
  );

  // Binary search convergence
  useEffect(() => {
    if (status !== 'searching') return;

    if (searchHigh - searchLow <= 1) {
      setMaxChars(searchLow);
      setStatus('done');
    }
  }, [status, searchLow, searchHigh]);

  // Expand/collapse handlers
  const handleExpand = useCallback(() => {
    setExpanded(true);
  }, [setExpanded]);

  const handleCollapse = useCallback(() => {
    setExpanded(false);
  }, [setExpanded]);

  // Build display text
  const totalChars = direction === 'middle' ? maxChars * 2 : maxChars;
  const isTruncated = status === 'done' && totalChars < content.length;
  const needsTruncation = isTruncated && !expanded;

  const displayText = React.useMemo(() => {
    if (!needsTruncation) return content;

    return getCollapsedText(content, direction, maxChars);
  }, [needsTruncation, content, maxChars, direction]);

  // When expanded, show full content immediately
  const showContent = expanded || status === 'done';

  // Build content text node
  const contentNode = showContent ? (
    <Text
      data-testid={testId ? `${testId}-text` : undefined}
      size={textSize}
    >
      {needsTruncation ? displayText : content}
    </Text>
  ) : null;

  // Build action nodes
  const actionStyle = [styles.action, stylesProp?.action];
  const expandNode =
    expandText && isTruncated && !expanded ? (
      <Pressable
        onPress={handleExpand}
        data-testid={testId ? `${testId}-expand` : undefined}
      >
        <Text style={actionStyle}>{expandText}</Text>
      </Pressable>
    ) : null;

  const collapseNode =
    collapseText && isTruncated && expanded ? (
      <Pressable
        onPress={handleCollapse}
        data-testid={testId ? `${testId}-collapse` : undefined}
      >
        <Text style={actionStyle}>{collapseText}</Text>
      </Pressable>
    ) : null;

  // Search candidate text for measurement
  const searchCandidate = React.useMemo(() => {
    return getMeasuredCollapsedText(content, direction, midIndex, expandText);
  }, [content, midIndex, direction, expandText]);

  return (
    <View style={style} data-testid={testId}>
      {/* Measurement view: full content */}
      {status === 'measuring' && (
        <View style={styles.measure} key="measure-full">
          <HiddenMeasurementText
            style={styles.content}
            onTextLayout={handleFullTextLayout}
          >
            {content}
          </HiddenMeasurementText>
        </View>
      )}

      {/* Measurement view: search candidate */}
      {status === 'searching' && (
        <View style={styles.measure} key={`search-${midIndex}`}>
          <HiddenMeasurementText
            style={styles.content}
            onTextLayout={handleSearchTextLayout}
          >
            {searchCandidate}
          </HiddenMeasurementText>
        </View>
      )}

      {/* Display */}
      {showContent && (
        <>
          {direction === 'start' ? (
            <>
              {expandNode}
              {collapseNode}
              {contentNode}
            </>
          ) : (
            <>
              {contentNode}
              {expandNode}
              {collapseNode}
            </>
          )}
        </>
      )}
    </View>
  );
}
