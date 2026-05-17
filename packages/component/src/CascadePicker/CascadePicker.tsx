import React, { useMemo } from 'react';
import { Picker } from '../Picker';
import type {
  PickerColumn,
  PickerColumnItemData,
  PickerValue,
} from '../Picker';
import type {
  CascadePickerChangeParams,
  CascadePickerOkParams,
  CascadePickerOption,
  CascadePickerProps,
} from './types';

function toPickerColumn<TData>(
  options: Array<CascadePickerOption<TData>>,
): PickerColumn {
  return options.map(option => ({
    labelText: option.labelText,
    label: option.label,
    value: option.value,
    disabled: option.disabled,
  }));
}

function findChildOptions<TData>(
  options: Array<CascadePickerOption<TData>>,
  parentValue: PickerValue,
): Array<CascadePickerOption<TData>> | undefined {
  const parent = options.find(option => option.value === parentValue);
  return parent?.children;
}

function getOptionsForPath<TData>(
  options: Array<CascadePickerOption<TData>>,
  path: PickerValue[],
): Array<Array<CascadePickerOption<TData>>> {
  const layers: Array<Array<CascadePickerOption<TData>>> = [];
  let currentOptions: Array<CascadePickerOption<TData>> | undefined = options;

  for (let index = 0; index < path.length; index += 1) {
    if (!currentOptions || currentOptions.length === 0) {
      return layers;
    }

    layers.push(currentOptions);
    const selectedValue = path[index];
    const nextOptions: Array<CascadePickerOption<TData>> | undefined = findChildOptions(
      currentOptions,
      selectedValue,
    );

    if (!nextOptions || nextOptions.length === 0) {
      return layers;
    }

    currentOptions = nextOptions;
  }

  if (currentOptions && currentOptions.length > 0) {
    layers.push(currentOptions);
  }

  return layers;
}

function optionsToColumns<TData>(
  options: Array<CascadePickerOption<TData>>,
  path: PickerValue[],
): PickerColumn[] {
  const layers = getOptionsForPath(options, path);
  return layers.map(toPickerColumn);
}

function findNodeByPath<TData>(
  options: Array<CascadePickerOption<TData>>,
  path: PickerValue[],
): CascadePickerOption<TData> | undefined {
  let currentOptions: Array<CascadePickerOption<TData>> | undefined = options;
  let node: CascadePickerOption<TData> | undefined;

  for (const value of path) {
    if (!currentOptions) {
      return undefined;
    }

    node = currentOptions.find(option => option.value === value);

    if (!node) {
      return undefined;
    }

    currentOptions = node.children;
  }

  return node;
}

function getPathOptions<TData>(
  options: Array<CascadePickerOption<TData>>,
  path: PickerValue[],
): Array<CascadePickerOption<TData>> {
  const result: Array<CascadePickerOption<TData>> = [];
  let currentOptions: Array<CascadePickerOption<TData>> | undefined = options;

  for (const value of path) {
    if (!currentOptions) {
      break;
    }

    const node: CascadePickerOption<TData> | undefined = currentOptions.find(
      option => option.value === value,
    );

    if (!node) {
      break;
    }

    result.push(node);
    currentOptions = node.children;
  }

  return result;
}

function completePathFromColumn<TData>(
  options: Array<CascadePickerOption<TData>>,
  previousValue: PickerValue[],
  columnIndex: number,
  nextValue: PickerValue,
): PickerValue[] {
  const prefix = previousValue.slice(0, columnIndex);
  const path: PickerValue[] = [...prefix, nextValue];
  let currentNode = findNodeByPath(options, path);

  while (currentNode?.children && currentNode.children.length > 0) {
    const firstEnabled = currentNode.children.find(child => !child.disabled);

    if (!firstEnabled) {
      break;
    }

    path.push(firstEnabled.value);
    currentNode = firstEnabled;
  }

  return path;
}

function normalizeCascadeValue<TData>(
  options: Array<CascadePickerOption<TData>>,
  value: PickerValue[],
): PickerValue[] {
  const normalized: PickerValue[] = [];
  let currentOptions: Array<CascadePickerOption<TData>> | undefined = options;

  for (const item of value) {
    if (!currentOptions) {
      break;
    }

    const node: CascadePickerOption<TData> | undefined = currentOptions.find(
      option => option.value === item,
    );

    normalized.push(item);

    if (!node) {
      break;
    }

    currentOptions = node.children;
  }

  return normalized;
}

function buildOkParams<TData>(
  options: Array<CascadePickerOption<TData>>,
  value: PickerValue[],
): CascadePickerOkParams<TData> {
  const path = getPathOptions(options, value);

  return {
    path,
    items: value.map((_, index) => path[index]),
  };
}

function buildChangeParams<TData>(
  options: Array<CascadePickerOption<TData>>,
  nextValue: PickerValue[],
  columnIndex: number,
  itemIndex: number,
): CascadePickerChangeParams<TData> {
  const path = getPathOptions(options, nextValue);
  const changedItem = path[columnIndex] ?? path[path.length - 1];

  return {
    columnIndex,
    itemIndex,
    value: nextValue[columnIndex] ?? changedItem?.value ?? '',
    item: changedItem!,
    path,
    items: nextValue.map((_, index) => path[index]),
  };
}

export function CascadePicker<TData = unknown>(props: CascadePickerProps<TData>) {
  const { options, renderLabel } = props;
  const providedValue = props.value ?? props.defaultValue;
  const draftValue = useMemo(
    () => (providedValue ? normalizeCascadeValue(options, providedValue) : []),
    [options, providedValue],
  );

  const columns = useMemo(() => optionsToColumns(options, draftValue), [options, draftValue]);

  const pickerValue = props.value
    ? normalizeCascadeValue(options, props.value)
    : undefined;
  const defaultPickerValue = props.defaultValue
    ? normalizeCascadeValue(options, props.defaultValue)
    : undefined;

  const layerOptionsForLabel = useMemo(
    () => getOptionsForPath(options, draftValue),
    [options, draftValue],
  );

  const pickerRenderLabel = renderLabel
    ? (item: PickerColumnItemData, columnIndex: number, itemIndex: number) => {
        const layer = layerOptionsForLabel[columnIndex];
        const originalOption = layer?.[itemIndex];

        if (!originalOption) {
          return item.label ?? item.labelText;
        }

        return renderLabel(originalOption);
      }
    : undefined;

  return (
    <Picker
      columns={columns}
      defaultOpen={props.defaultOpen}
      defaultValue={defaultPickerValue}
      disabled={props.disabled}
      onCancel={props.onCancel}
      onChange={(_nextPickerValue, pickerParams) => {
        if (pickerParams.reason === 'clear') {
          return;
        }

        const nextValue = completePathFromColumn(
          options,
          draftValue,
          pickerParams.columnIndex,
          pickerParams.value,
        );
        props.onChange?.(
          nextValue,
          buildChangeParams(
            options,
            nextValue,
            pickerParams.columnIndex,
            pickerParams.itemIndex,
          ),
        );
      }}
      onOk={nextPickerValue => {
        const nextValue = normalizeCascadeValue(options, nextPickerValue);
        props.onOk?.(nextValue, buildOkParams(options, nextValue));
      }}
      onOpenChange={props.onOpenChange}
      open={props.open}
      placeholder={props.placeholder}
      popupProps={{
        cancel: props.cancel,
        cancelText: props.cancelText,
        empty: props.empty,
        emptyText: props.emptyText,
        loading: props.loading,
        loadingIndicator: props.loadingIndicator,
        loadingIndicatorText: props.loadingIndicatorText,
        ok: props.ok,
        okDisabled: props.okDisabled,
        okText: props.okText,
        renderLabel: pickerRenderLabel,
        styles: props.styles,
        title: props.title,
        titleText: props.titleText,
      }}
      style={props.style}
      triggerStyle={props.styles?.trigger}
      value={pickerValue}
    >
      {props.children}
    </Picker>
  );
}
