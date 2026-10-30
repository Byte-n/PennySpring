import type {
  FormItemRule,
  FormItemRules,
  FormValidateTrigger,
} from '../types.ts';
import type { StandardSchemaV1 } from '@tanstack/react-form';

export interface NormalizedFieldValidators {
  onChange?: unknown;
  onChangeAsync?: unknown;
  onChangeListenTo?: string[];
  onBlur?: unknown;
  onBlurAsync?: unknown;
  onSubmit?: unknown;
  onSubmitAsync?: unknown;
}

export interface NormalizeRulesOptions {
  dependencies?: readonly string[];
  required?: boolean;
  requiredMessage?: string;
  revalidateOnChangeAfterSubmit?: boolean;
  asyncDebounceMs?: number;
}

interface RuntimeFieldApi {
  name: string;
  form: { state: { values: unknown } };
}

interface RuntimeValidatorProps {
  value: unknown;
  fieldApi: RuntimeFieldApi;
}

type RuleTrigger = 'change' | 'blur' | 'submit';

type RunnableRule<TValue, TValues extends object> = (
  value: TValue,
  context: { values: TValues; name: string },
) => string | undefined | Promise<string | undefined>;

interface CachedRuleResult {
  value: unknown;
  result: unknown;
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

function isStandardSchema(
  rule: FormItemRule<unknown, object>,
): rule is StandardSchemaV1<unknown> {
  return (
    typeof rule === 'object' &&
    rule !== null &&
    '~standard' in rule
  );
}

function getSchemaErrorMessage(result: unknown): string | undefined {
  if (
    typeof result !== 'object' ||
    result === null ||
    !('issues' in result) ||
    !Array.isArray(result.issues)
  ) {
    return undefined;
  }

  for (const issue of result.issues) {
    if (
      typeof issue === 'object' &&
      issue !== null &&
      'message' in issue &&
      typeof issue.message === 'string' &&
      issue.message !== ''
    ) {
      return issue.message;
    }
  }

  return undefined;
}

function runStandardSchema(
  rule: StandardSchemaV1<unknown>,
  value: unknown,
): unknown {
  const result = rule['~standard'].validate(value);

  if (isPromiseLike(result)) {
    return result.then(getSchemaErrorMessage);
  }

  return getSchemaErrorMessage(result);
}

function runRule<TValue, TValues extends object>(
  rule: FormItemRule<TValue, TValues>,
  value: unknown,
  context: { values: TValues; name: string },
): unknown {
  if (typeof rule === 'function') {
    return rule(value as TValue, context);
  }

  return runStandardSchema(rule as StandardSchemaV1<unknown>, value);
}

function createCompositeRule<TValue, TValues extends object>(
  rules: readonly FormItemRule<TValue, TValues>[],
): (value: TValue, context: { values: TValues; name: string }) =>
  string | undefined | Promise<string | undefined> {
  return (value, context) => {
    let index = 0;

    const runFrom = (): unknown => {
      for (; index < rules.length; index += 1) {
        const result = runRule(rules[index], value, context);

        if (isPromiseLike(result)) {
          return result.then(resolved => {
            if (resolved !== undefined) {
              return resolved;
            }

            return runFrom();
          });
        }

        if (result !== undefined) {
          return result;
        }
      }

      return undefined;
    };

    return runFrom() as string | undefined | Promise<string | undefined>;
  };
}

function createRuleRunner<TValue, TValues extends object>(
  rule: (value: TValue, context: { values: TValues; name: string }) => string | undefined | Promise<string | undefined>,
  name: string,
) {
  let cached: CachedRuleResult | null = null;

  function run(value: unknown, fieldApi: RuntimeFieldApi): unknown {
    return rule(value as TValue, {
      values: fieldApi.form.state.values as TValues,
      name,
    });
  }

  return {
    sync(props: RuntimeValidatorProps): unknown {
      const result = run(props.value, props.fieldApi);

      cached = { value: props.value, result };

      return isPromiseLike(result) ? undefined : result;
    },
    async(props: RuntimeValidatorProps): Promise<unknown> | unknown {
      if (cached !== null && Object.is(cached.value, props.value)) {
        const { result } = cached;

        cached = null;

        return result;
      }

      return run(props.value, props.fieldApi);
    },
  };
}

function attachRule(
  validators: NormalizedFieldValidators,
  trigger: RuleTrigger,
  runner: ReturnType<typeof createRuleRunner>,
): void {
  if (trigger === 'change') {
    validators.onChange = runner.sync;
    validators.onChangeAsync = runner.async;
    return;
  }

  if (trigger === 'blur') {
    validators.onBlur = runner.sync;
    validators.onBlurAsync = runner.async;
    return;
  }

  validators.onSubmit = runner.sync;
  validators.onSubmitAsync = runner.async;
}

const DEFAULT_REQUIRED_MESSAGE = '该字段为必填项';

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

function createRequiredRule<TValue>(message: string) {
  return (value: TValue): string | undefined =>
    isEmptyValue(value) ? message : undefined;
}

function resolveRules<TValue, TValues extends object>(
  rules: FormItemRules<TValue, TValues> | undefined,
  options: NormalizeRulesOptions,
): FormItemRule<TValue, TValues>[] {
  if (rules !== undefined) {
    return (
      Array.isArray(rules) ? [...rules] : [rules]
    ) as FormItemRule<TValue, TValues>[];
  }

  if (options.required !== true) {
    return [];
  }

  return [
    createRequiredRule<TValue>(
      options.requiredMessage ?? DEFAULT_REQUIRED_MESSAGE,
    ),
  ];
}

function attachDebouncedRules<TValue, TValues extends object>(
  rules: readonly FormItemRule<TValue, TValues>[],
  baseValidators: NormalizedFieldValidators,
  shouldValidateOnChange: boolean,
  shouldValidateOnBlur: boolean,
  name: string,
): NormalizedFieldValidators {
  const validators: NormalizedFieldValidators = { ...baseValidators };
  const rule = (rules.length === 1
    ? rules[0]
    : createCompositeRule(rules)) as FormItemRule<TValue, TValues>;
  const asyncValidator =
    rules.length === 1 && isStandardSchema(rule as FormItemRule<unknown, object>)
      ? (rule as StandardSchemaV1<unknown>)
      : createRuleRunner(rule as RunnableRule<TValue, TValues>, name).async;

  if (shouldValidateOnChange) {
    validators.onChangeAsync = asyncValidator;
  }

  if (shouldValidateOnBlur) {
    validators.onBlurAsync = asyncValidator;
  }

  validators.onSubmitAsync = asyncValidator;

  return validators;
}

export function normalizeRules<TValue, TValues extends object>(
  rules: FormItemRules<TValue, TValues> | undefined,
  triggers: FormValidateTrigger[],
  name: string,
  options: NormalizeRulesOptions = {},
): NormalizedFieldValidators {
  const resolvedRules = resolveRules(rules, options);

  if (resolvedRules.length === 0) {
    return {};
  }

  const dependencies = options.dependencies ?? [];
  const shouldValidateOnChange =
    triggers.includes('onChange') ||
    options.revalidateOnChangeAfterSubmit === true ||
    dependencies.length > 0;
  const shouldValidateOnBlur = triggers.includes('onBlur');
  const baseValidators: NormalizedFieldValidators =
    dependencies.length > 0 ? { onChangeListenTo: [...dependencies] } : {};

  if ((options.asyncDebounceMs ?? 0) > 0) {
    return attachDebouncedRules(
      resolvedRules,
      baseValidators,
      shouldValidateOnChange,
      shouldValidateOnBlur,
      name,
    );
  }

  const singleRule = resolvedRules.length === 1 ? resolvedRules[0] : null;

  if (
    singleRule !== null &&
    isStandardSchema(singleRule as FormItemRule<unknown, object>)
  ) {
    const validators: NormalizedFieldValidators = {
      ...baseValidators,
      onSubmit: singleRule,
    };

    if (shouldValidateOnChange) {
      validators.onChange = singleRule;
    }

    if (shouldValidateOnBlur) {
      validators.onBlur = singleRule;
    }

    return validators;
  }

  const rule = (singleRule ??
    createCompositeRule(resolvedRules)) as RunnableRule<TValue, TValues>;
  const runner = createRuleRunner(rule, name);
  const validators: NormalizedFieldValidators = { ...baseValidators };

  attachRule(validators, 'submit', runner);

  if (shouldValidateOnChange) {
    attachRule(validators, 'change', runner);
  }

  if (shouldValidateOnBlur) {
    attachRule(validators, 'blur', runner);
  }

  return validators;
}
