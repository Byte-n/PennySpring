import React, { useMemo } from 'react';
import { Pressable, TextInput } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';
import type { CalculatorInputProps, CalculatorInputStyles } from './types';

type Operator = '+' | '-' | '×' | '/';
type EvaluationOperator = '+' | '-' | '*' | '/';
type Token = number | Operator | '(' | ')';
type CalculatorKeyRole = 'digit' | 'decimal' | 'operator' | 'clear' | 'backspace' | 'paren';

interface CalculatorKeyConfig {
  label: string;
  accessibilityLabel: string;
  role: CalculatorKeyRole;
  value?: string;
}

interface CalculatorInputStyleOptions {
  disabled: boolean;
}

interface CalculatorInputResult {
  display: string;
  value: number | null;
}

interface NumberParseResult {
  nextIndex: number;
  value: number;
}

interface SizeConfig {
  keyHeight: (token: AliasToken) => number;
  okKeyHeight: (token: AliasToken) => number;
}

const EXPRESSION_PLACEHOLDER = '0';
const EMPTY_TEXT = '';
const ZERO_TEXT = '0';
const DECIMAL_POINT = '.';
const OK_KEY_LABEL = '=';
const OK_KEY_ROW_SPAN = 2;
const KEYPAD_TOP_ROW_COUNT = 3;
const MAX_FRACTION_DIGITS = 10;
const KEYPAD_HIT_SLOP = 4;
const DIVIDE_BY_ZERO = 0;

const SIZE_CONFIG: SizeConfig = {
  keyHeight: token => token.controlHeightLG,
  okKeyHeight: token => token.controlHeightLG * OK_KEY_ROW_SPAN + token.sizeXS,
};

const KEY_ROWS: readonly (readonly CalculatorKeyConfig[])[] = [
  [
    { label: 'C', accessibilityLabel: '清空', role: 'clear' },
    { label: '/', accessibilityLabel: '除', role: 'operator', value: '/' },
    { label: '×', accessibilityLabel: '乘', role: 'operator', value: '×' },
    { label: EMPTY_TEXT, accessibilityLabel: '退格', role: 'backspace' },
  ],
  [
    { label: '7', accessibilityLabel: '数字 7', role: 'digit', value: '7' },
    { label: '8', accessibilityLabel: '数字 8', role: 'digit', value: '8' },
    { label: '9', accessibilityLabel: '数字 9', role: 'digit', value: '9' },
    { label: '-', accessibilityLabel: '减', role: 'operator', value: '-' },
  ],
  [
    { label: '4', accessibilityLabel: '数字 4', role: 'digit', value: '4' },
    { label: '5', accessibilityLabel: '数字 5', role: 'digit', value: '5' },
    { label: '6', accessibilityLabel: '数字 6', role: 'digit', value: '6' },
    { label: '+', accessibilityLabel: '加', role: 'operator', value: '+' },
  ],
  [
    { label: '1', accessibilityLabel: '数字 1', role: 'digit', value: '1' },
    { label: '2', accessibilityLabel: '数字 2', role: 'digit', value: '2' },
    { label: '3', accessibilityLabel: '数字 3', role: 'digit', value: '3' },
  ],
  [
    { label: '()', accessibilityLabel: '括号', role: 'paren' },
    { label: '0', accessibilityLabel: '数字 0', role: 'digit', value: '0' },
    { label: '.', accessibilityLabel: '小数点', role: 'decimal', value: '.' },
  ],
];

const useStyles = createUseSheetStyle(
  (token, { disabled }: CalculatorInputStyleOptions) => ({
    display: {
      minHeight: token.controlHeightLG + token.controlHeightSM,
      paddingHorizontal: token.controlPaddingHorizontal,
      paddingVertical: token.paddingSM,
      borderWidth: token.lineWidth,
      borderRadius: token.borderRadius,
      borderColor: disabled ? token.colorBorderDisabled : token.colorBorder,
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorBgContainer,
      justifyContent: 'center',
    },
    input: {
      padding: 0,
      margin: 0,
      fontFamily: token.fontFamilyCode,
      fontSize: token.fontSizeXL,
      lineHeight: token.lineHeightXL,
      color: disabled ? token.colorTextDisabled : token.colorTextHeading,
      textAlign: 'right',
    } as TextStyle,
    result: {
      minHeight: token.lineHeight,
      color: disabled ? token.colorTextDisabled : token.colorTextSecondary,
      fontFamily: token.fontFamilyCode,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      textAlign: 'right',
    } as TextStyle,
    key: {
      flex: 1,
      minHeight: SIZE_CONFIG.keyHeight(token),
      borderRadius: token.borderRadius,
      borderWidth: token.lineWidth,
      borderColor: disabled ? token.colorBorderDisabled : token.colorBorder,
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorBgContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keyPressed: {
      backgroundColor: token.colorBgTextActive,
      borderColor: token.colorPrimaryBorder,
    },
    operatorKey: {
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorFillQuaternary,
    },
    keyText: {
      color: disabled ? token.colorTextDisabled : token.colorText,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      fontWeight: String(token.fontWeightMedium) as TextStyle['fontWeight'],
    },
    mutedKeyText: {
      color: disabled ? token.colorTextDisabled : token.colorTextSecondary,
    },
    okKey: {
      minHeight: SIZE_CONFIG.okKeyHeight(token),
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorPrimary,
      borderColor: disabled ? token.colorBorderDisabled : token.colorPrimary,
    },
    okKeyPressed: {
      backgroundColor: token.colorPrimaryActive,
      borderColor: token.colorPrimaryActive,
    },
    okKeyUnavailable: {
      backgroundColor: token.colorBgContainerDisabled,
      borderColor: token.colorBorderDisabled,
    },
    okKeyText: {
      color: disabled ? token.colorTextDisabled : token.colorTextLightSolid,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      fontWeight: String(token.fontWeightMedium) as TextStyle['fontWeight'],
    },
    okKeyTextUnavailable: {
      color: token.colorTextDisabled,
    },
    leftPad: {
      width: '75%'
    },
    backspaceIcon: {
      color: disabled ? token.colorTextDisabled : token.colorTextSecondary,
      fontSize: token.fontSizeXL,
    },
  }),
);

function isOperator(value: string): value is Operator {
  return value === '+' || value === '-' || value === '×' || value === '/';
}

function isDigit(value: string): boolean {
  return value >= '0' && value <= '9';
}

function getLastNumberSegment(expression: string): string {
  let index = expression.length - 1;

  while (index >= 0) {
    const char = expression[index];

    if (isOperator(char)) {
      break;
    }

    index -= 1;
  }

  return expression.slice(index + 1);
}

function appendDigit(expression: string, digit: string): string {
  const segment = getLastNumberSegment(expression);

  if (segment === ZERO_TEXT && digit === ZERO_TEXT) {
    return expression;
  }

  if (segment === ZERO_TEXT && digit !== ZERO_TEXT) {
    return `${expression.slice(0, -1)}${digit}`;
  }

  return `${expression}${digit}`;
}

function appendDecimal(expression: string): string {
  const segment = getLastNumberSegment(expression);

  if (segment.includes(DECIMAL_POINT)) {
    return expression;
  }

  if (expression.length === 0 || isOperator(expression[expression.length - 1])) {
    return `${expression}0.`;
  }

  return `${expression}.`;
}

function appendOperator(expression: string, operator: Operator): string {
  if (expression.length === 0) {
    return operator === '-' ? operator : expression;
  }

  const lastChar = expression[expression.length - 1];

  if (isOperator(lastChar)) {
    return `${expression.slice(0, -1)}${operator}`;
  }

  return `${expression}${operator}`;
}

function countChar(str: string, char: string): number {
  let count = 0;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === char) {
      count += 1;
    }
  }

  return count;
}

function appendParen(expression: string): string {
  const openCount = countChar(expression, '(');
  const closeCount = countChar(expression, ')');
  const lastChar = expression[expression.length - 1];

  if (
    expression.length === 0
    || lastChar === '('
    || isOperator(lastChar)
  ) {
    return `${expression}(`;
  }

  if (openCount > closeCount) {
    return `${expression})`;
  }

  return `${expression}(`;
}

function parseNumber(
  expression: string,
  startIndex: number,
): NumberParseResult | null {
  let index = startIndex;
  let hasDigit = false;
  let hasDecimalPoint = false;

  if (expression[index] === '-') {
    index += 1;
  }

  while (index < expression.length) {
    const char = expression[index];

    if (isDigit(char)) {
      hasDigit = true;
      index += 1;
      continue;
    }

    if (char === DECIMAL_POINT && !hasDecimalPoint) {
      hasDecimalPoint = true;
      index += 1;
      continue;
    }

    break;
  }

  if (!hasDigit) {
    return null;
  }

  const rawNumber = expression.slice(startIndex, index);
  const value = Number(rawNumber);

  if (!Number.isFinite(value)) {
    return null;
  }

  return {
    nextIndex: index,
    value,
  };
}

function tokenizeExpression(expression: string): Token[] | null {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (char === '(' || char === ')') {
      tokens.push(char);
      index += 1;
      continue;
    }

    if (isOperator(char)) {
      tokens.push(char);
      index += 1;
      continue;
    }

    const parsedNumber = parseNumber(expression, index);

    if (parsedNumber === null) {
      return null;
    }

    tokens.push(parsedNumber.value);
    index = parsedNumber.nextIndex;
  }

  return tokens.length === 0 ? null : tokens;
}

function applyOperator(
  left: number,
  operator: EvaluationOperator,
  right: number,
): number | null {
  if (operator === '+') {
    return left + right;
  }

  if (operator === '-') {
    return left - right;
  }

  if (operator === '*') {
    return left * right;
  }

  if (right === DIVIDE_BY_ZERO) {
    return null;
  }

  return left / right;
}

function toEvaluationOperator(operator: Operator): EvaluationOperator {
  return operator === '×' ? '*' : operator;
}

function applyPrecedence(tokens: Token[]): Token[] | null {
  const output: Token[] = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];

    if (token === '×' || token === '/') {
      const left = output[output.length - 1];
      const right = tokens[index + 1];

      if (typeof left !== 'number' || typeof right !== 'number') {
        return null;
      }

      const result = applyOperator(left, toEvaluationOperator(token), right);

      if (result === null) {
        return null;
      }

      output[output.length - 1] = result;
      index += 2;
      continue;
    }

    output.push(token);
    index += 1;
  }

  return output;
}

function resolveParentheses(tokens: Token[]): Token[] | null {
  const output: Token[] = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];

    if (token === '(') {
      let depth = 1;
      let end = index + 1;

      while (end < tokens.length && depth > 0) {
        if (tokens[end] === '(') {
          depth += 1;
        } else if (tokens[end] === ')') {
          depth -= 1;
        }

        end += 1;
      }

      if (depth !== 0) {
        return null;
      }

      const inner = tokens.slice(index + 1, end - 1);
      const resolved = resolveParentheses(inner);

      if (resolved === null) {
        return null;
      }

      const value = evaluateFlat(resolved);

      if (value === null) {
        return null;
      }

      output.push(value);
      index = end;
      continue;
    }

    if (token === ')') {
      return null;
    }

    output.push(token);
    index += 1;
  }

  return output;
}

function evaluateFlat(tokens: Token[]): number | null {
  const collapsedTokens = applyPrecedence(tokens);

  if (collapsedTokens === null || typeof collapsedTokens[0] !== 'number') {
    return null;
  }

  let result = collapsedTokens[0];
  let index = 1;

  while (index < collapsedTokens.length) {
    const operator = collapsedTokens[index];
    const right = collapsedTokens[index + 1];

    if (
      typeof operator !== 'string'
      || !isOperator(operator)
      || typeof right !== 'number'
    ) {
      return null;
    }

    const nextResult = applyOperator(
      result,
      toEvaluationOperator(operator),
      right,
    );

    if (nextResult === null) {
      return null;
    }

    result = nextResult;
    index += 2;
  }

  return result;
}

function evaluateTokens(tokens: Token[]): number | null {
  const resolved = resolveParentheses(tokens);

  if (resolved === null) {
    return null;
  }

  return evaluateFlat(resolved);
}

function normalizeResult(value: number): number {
  return Number(value.toFixed(MAX_FRACTION_DIGITS));
}

function evaluateExpression(expression: string): CalculatorInputResult {
  const trimmedExpression = expression.trim();

  if (trimmedExpression.length === 0) {
    return {
      display: EMPTY_TEXT,
      value: null,
    };
  }

  const tokens = tokenizeExpression(trimmedExpression);

  if (tokens === null) {
    return {
      display: EMPTY_TEXT,
      value: null,
    };
  }

  const result = evaluateTokens(tokens);

  if (result === null || !Number.isFinite(result)) {
    return {
      display: EMPTY_TEXT,
      value: null,
    };
  }

  const normalizedResult = normalizeResult(result);

  return {
    display: String(normalizedResult),
    value: normalizedResult,
  };
}

function isMutedKey(key: CalculatorKeyConfig): boolean {
  return key.role === 'operator' || key.role === 'clear' || key.role === 'backspace' || key.role === 'paren';
}

function renderKeyContent(
  key: CalculatorKeyConfig,
  tokenStyles: ReturnType<typeof useStyles>,
  keyTextStyle: CalculatorInputStyles['keyText'],
) {
  if (key.role === 'backspace') {
    return (
      <Icon
        color={tokenStyles.backspaceIcon.color}
        icon="arrow-left"
        size={tokenStyles.backspaceIcon.fontSize}
      />
    );
  }

  return (
    <Text
      style={[
        tokenStyles.keyText,
        isMutedKey(key) ? tokenStyles.mutedKeyText : null,
        keyTextStyle,
      ]}
    >
      {key.label}
    </Text>
  );
}

export function CalculatorInput({
  defaultValue,
  disabled = false,
  onChange,
  onOk,
  placeholder = EXPRESSION_PLACEHOLDER,
  readonly = false,
  style,
  styles,
  value,
}: CalculatorInputProps) {
  const tokenStyles = useStyles({ disabled });
  const { token } = useTheme();
  const [expression = EMPTY_TEXT, setExpression] = useControllableValue(
    defaultValue ?? EMPTY_TEXT,
    value,
    onChange,
  );
  const isReadOnly = disabled || readonly;
  const result = useMemo(() => evaluateExpression(expression), [expression]);
  const canConfirm = !isReadOnly && result.value !== null;

  function updateExpression(nextExpression: string): void {
    if (isReadOnly) {
      return;
    }

    setExpression(nextExpression);
  }

  function handleKeyPress(key: CalculatorKeyConfig): void {
    if (key.role === 'clear') {
      updateExpression(EMPTY_TEXT);
      return;
    }

    if (key.role === 'backspace') {
      updateExpression(expression.slice(0, -1));
      return;
    }

    if (key.role === 'decimal') {
      updateExpression(appendDecimal(expression));
      return;
    }

    if (key.role === 'paren') {
      updateExpression(appendParen(expression));
      return;
    }

    if (key.role === 'operator' && key.value !== undefined) {
      updateExpression(appendOperator(expression, key.value as Operator));
      return;
    }

    if (key.role === 'digit' && key.value !== undefined) {
      updateExpression(appendDigit(expression, key.value));
    }
  }

  function handleOkPress(): void {
    const okResult = result.value;

    if (!canConfirm || okResult === null) {
      return;
    }

    onOk?.({
      expression,
      result: okResult,
    });
  }

  function renderKey(key: CalculatorKeyConfig) {
    const isOperatorKey = key.role === 'operator';

    return (
      <Pressable
        accessibilityLabel={key.accessibilityLabel}
        accessibilityRole="button"
        disabled={isReadOnly}
        hitSlop={KEYPAD_HIT_SLOP}
        key={key.accessibilityLabel}
        onPress={() => {
          handleKeyPress(key);
        }}
        style={({ pressed }) => [
          tokenStyles.key,
          isOperatorKey ? tokenStyles.operatorKey : null,
          pressed && !isReadOnly ? tokenStyles.keyPressed : null,
          styles?.key,
        ]}
      >
        {renderKeyContent(key, tokenStyles, styles?.keyText)}
      </Pressable>
    );
  }

  return (
    <Column gap={token.sizeSM} style={style}>
      <Column gap={token.sizeXXS} style={[tokenStyles.display, styles?.display]}>
        <TextInput
          editable={false}
          placeholder={placeholder}
          placeholderTextColor={token.colorTextPlaceholder}
          style={[tokenStyles.input, styles?.input]}
          value={expression}
        />
        <Text style={[tokenStyles.result, styles?.result]}>
          {result.display}
        </Text>
      </Column>
      <Column gap={token.sizeXS} style={styles?.keypad}>
        {KEY_ROWS.slice(0, KEYPAD_TOP_ROW_COUNT).map(row => (
          <Row
            key={row.map(key => key.accessibilityLabel).join('-')}
            gap={token.sizeXS}
          >
            {row.map(renderKey)}
          </Row>
        ))}
        <Row gap={token.sizeXS}>
          <Column gap={token.sizeXS} style={tokenStyles.leftPad}>
            {KEY_ROWS.slice(KEYPAD_TOP_ROW_COUNT).map(row => (
              <Row
                key={row.map(key => key.accessibilityLabel).join('-')}
                gap={token.sizeXS}
              >
                {row.map(renderKey)}
              </Row>
            ))}
          </Column>
          <Pressable
            accessibilityLabel="确认"
            accessibilityRole="button"
            disabled={!canConfirm}
            onPress={handleOkPress}
            style={({ pressed }) => [
              tokenStyles.key,
              tokenStyles.okKey,
              !canConfirm ? tokenStyles.okKeyUnavailable : null,
              pressed && canConfirm ? tokenStyles.okKeyPressed : null,
              styles?.key,
              styles?.okKey,
            ]}
          >
            <Text
              style={[
                tokenStyles.okKeyText,
                !canConfirm ? tokenStyles.okKeyTextUnavailable : null,
                styles?.keyText,
                styles?.okKeyText,
              ]}
            >
              {OK_KEY_LABEL}
            </Text>
          </Pressable>
        </Row>
      </Column>
    </Column>
  );
}
