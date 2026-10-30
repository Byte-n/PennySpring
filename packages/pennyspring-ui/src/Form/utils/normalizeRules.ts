import type { FormItemRule, FormValidateTrigger } from '../types.ts';

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

function resolveRule<TValue, TValues extends object>(
  rules: FormItemRule<TValue, TValues> | undefined,
  options: NormalizeRulesOptions,
): FormItemRule<TValue, TValues> | undefined {
  if (rules !== undefined) {
    return rules;
  }

  if (options.required !== true) {
    return undefined;
  }

  return createRequiredRule<TValue>(
    options.requiredMessage ?? DEFAULT_REQUIRED_MESSAGE,
  );
}

export function normalizeRules<TValue, TValues extends object>(
  rules: FormItemRule<TValue, TValues> | undefined,
  triggers: FormValidateTrigger[],
  name: string,
  options: NormalizeRulesOptions = {},
): NormalizedFieldValidators {
  const resolvedRule = resolveRule(rules, options);

  if (resolvedRule === undefined) {
    return {};
  }

  const dependencies = options.dependencies ?? [];
  const shouldValidateOnChange =
    triggers.includes('onChange') ||
    options.revalidateOnChangeAfterSubmit === true ||
    dependencies.length > 0;
  const baseValidators: NormalizedFieldValidators =
    dependencies.length > 0 ? { onChangeListenTo: [...dependencies] } : {};

  if (typeof resolvedRule !== 'function') {
    const validators: NormalizedFieldValidators = {
      ...baseValidators,
      onSubmit: resolvedRule,
    };

    if (shouldValidateOnChange) {
      validators.onChange = resolvedRule;
    }

    if (triggers.includes('onBlur')) {
      validators.onBlur = resolvedRule;
    }

    return validators;
  }

  const validators: NormalizedFieldValidators = { ...baseValidators };

  attachRule(validators, 'submit', createRuleRunner(resolvedRule, name));

  if (shouldValidateOnChange) {
    attachRule(validators, 'change', createRuleRunner(resolvedRule, name));
  }

  if (triggers.includes('onBlur')) {
    attachRule(validators, 'blur', createRuleRunner(resolvedRule, name));
  }

  return validators;
}
