import React from 'react';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import { CircleIcon } from 'phosphor-react-native';
import { useTheme } from '@pennyspring/theme';
import { Button } from '../../Button';
import { Column } from '../../Column';
import { Icon } from '../../Icon';
import { Popup } from '../../Popup';
import { Row } from '../../Row';
import { Spacer } from '../../Spacer';
import { Tabs } from '../../Tabs';
import { Text } from '../../Text';
import { renderTextNode } from '../../shares/node';
import { useListPickerStyles } from '../style';
import type { ComponentSize } from '../../shares/types';
import type { TabsItem } from '../../Tabs';
import type { ListPickerCascaderStyles } from '../types';
import type {
  ListPickerCascaderOption,
  ListPickerCascaderPopupConfig,
  ListPickerCascaderValue,
} from '../types';

const DEFAULT_POSITION = 'bottom';

interface ListPickerCascaderPopupProps<TData> {
  activeLevel: number;
  closeText?: string;
  disabled?: boolean;
  empty?: React.ReactNode;
  emptyText?: string;
  headerText?: string;
  loading?: boolean;
  loadingText?: string;
  onChangeActiveLevel: (level: number) => void;
  onOptionPress: (
    option: ListPickerCascaderOption<TData>,
    optionIndex: number,
  ) => void;
  onRequestClose: () => void;
  open: boolean;
  options: Array<ListPickerCascaderOption<TData>>;
  popupProps?: ListPickerCascaderPopupConfig;
  readonly?: boolean;
  renderOptionLabel?: (
    option: ListPickerCascaderOption<TData>,
    level: number,
    optionIndex: number,
  ) => React.ReactNode;
  selectedValue?: ListPickerCascaderValue;
  size: ComponentSize;
  styles?: ListPickerCascaderStyles;
  tabItems: Array<TabsItem>;
}

function resolveTextSize(
  size: ComponentSize,
): React.ComponentProps<typeof Text>['size'] {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
}

export function ListPickerCascaderPopup<TData>({
  activeLevel,
  closeText,
  disabled,
  empty,
  emptyText,
  headerText,
  loading,
  loadingText,
  onChangeActiveLevel,
  onOptionPress,
  onRequestClose,
  open,
  options,
  popupProps,
  readonly,
  renderOptionLabel,
  selectedValue,
  size,
  styles,
  tabItems,
}: ListPickerCascaderPopupProps<TData>) {
  const { token } = useTheme();
  const tokenStyles = useListPickerStyles({ size });
  const isInteractive = !disabled && !readonly && !loading;
  const {
    style: popupStyle,
    styles: popupStyles,
    position,
    keyboardAvoiding,
    ...popupRestProps
  } = popupProps ?? {};
  const headerNode =
    headerText !== undefined || closeText !== undefined ? (
      <Row style={tokenStyles.header} testID="list-picker-cascader-header">
        {headerText !== undefined ? (
          <Text
            color="heading"
            size={resolveTextSize(size)}
            style={tokenStyles.headerText}
            weight="strong"
          >
            {headerText}
          </Text>
        ) : (
          <Spacer />
        )}
        {closeText !== undefined ? (
          <Button
            onPress={onRequestClose}
            size={size}
            style={tokenStyles.footerButton}
            type="text"
          >
            {closeText}
          </Button>
        ) : null}
      </Row>
    ) : undefined;

  function renderOption(
    option: ListPickerCascaderOption<TData>,
    optionIndex: number,
  ) {
    const isSelected = selectedValue?.[activeLevel] === option.value;
    const optionDisabled = option.disabled === true || !isInteractive;
    const customLabel = renderOptionLabel?.(option, activeLevel, optionIndex);
    const labelContent =
      customLabel !== undefined
        ? customLabel
        : (option.label ?? option.labelText);
    const textColor = optionDisabled
      ? 'disabled'
      : isSelected
        ? 'primaryText'
        : 'default';

    return (
      <Pressable
        disabled={optionDisabled}
        key={String(option.value)}
        onPress={() => onOptionPress(option, optionIndex)}
        style={({ pressed }) => [
          tokenStyles.option,
          styles?.option,
          pressed && !optionDisabled ? tokenStyles.optionPressed : null,
          isSelected ? tokenStyles.optionSelected : null,
          optionDisabled ? tokenStyles.optionDisabled : null,
        ]}
        testID={`list-picker-cascader-option-${activeLevel}-${optionIndex}`}
      >
        <Row align="center" justify="center" style={tokenStyles.marker}>
          <Icon
            color={
              optionDisabled
                ? 'textDisabled'
                : isSelected
                  ? 'primaryText'
                  : 'textQuaternary'
            }
            icon={isSelected ? 'check' : CircleIcon}
            size={size}
            testID={
              isSelected
                ? 'list-picker-cascader-option-marker-selected'
                : 'list-picker-cascader-option-marker-unselected'
            }
          />
        </Row>
        {option.prefix !== undefined ? (
          <Column style={tokenStyles.optionMeta}>
            {renderTextNode(option.prefix, text => (
              <Text size={resolveTextSize(size)}>{text}</Text>
            ))}
          </Column>
        ) : null}
        <Column style={tokenStyles.optionContent}>
          {renderTextNode(labelContent, text => (
            <Text
              color={textColor}
              size={resolveTextSize(size)}
              style={styles?.optionLabel}
              testID={`list-picker-cascader-option-label-${activeLevel}-${optionIndex}`}
              weight={isSelected ? 'strong' : undefined}
            >
              {text}
            </Text>
          ))}
          {renderTextNode(
            option.description ?? option.descriptionText,
            text => (
              <Text
                color="description"
                size={resolveTextSize(size)}
                style={tokenStyles.optionDescription}
              >
                {text}
              </Text>
            ),
          )}
        </Column>
        {option.suffix !== undefined ? (
          <Column style={tokenStyles.optionMeta}>
            {renderTextNode(option.suffix, text => (
              <Text size={resolveTextSize(size)}>{text}</Text>
            ))}
          </Column>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Popup.FloatingPanel
      {...popupRestProps}
      bodyScrollable={false}
      footer={null}
      header={headerNode}
      keyboardAvoiding={keyboardAvoiding ?? true}
      onCancel={onRequestClose}
      open={open}
      position={position ?? DEFAULT_POSITION}
      size={size}
      style={[tokenStyles.popup, popupStyle, styles?.popup]}
      styles={{
        ...popupStyles,
        content: [
          tokenStyles.cascaderFloatingPanelContent,
          popupStyles?.content,
        ],
        panelBody: [tokenStyles.panelBody, popupStyles?.panelBody],
      }}
    >
      <Column testID="list-picker-cascader-popup" style={tokenStyles.popupRoot}>
        <Column style={[tokenStyles.popupContent, tokenStyles.cascaderPanel]}>
          <Tabs
            block
            items={tabItems}
            layout="scroll"
            onChange={nextLevel => onChangeActiveLevel(Number(nextLevel))}
            size={size}
            styles={styles?.tabs}
            value={activeLevel}
          />
          {loading === true ? (
            <Column
              align="center"
              style={[tokenStyles.cascaderLoading, styles?.loading]}
              testID="list-picker-cascader-loading"
            >
              {loadingText !== undefined ? (
                <Text color="description">{loadingText}</Text>
              ) : (
                <ActivityIndicator color={token.colorTextTertiary} />
              )}
            </Column>
          ) : options.length > 0 ? (
            <FlatList
              contentContainerStyle={tokenStyles.cascaderListContent}
              data={options}
              keyExtractor={option => String(option.value)}
              nestedScrollEnabled
              renderItem={({ item, index }) => renderOption(item, index)}
              scrollEnabled
              showsVerticalScrollIndicator={false}
              style={[tokenStyles.cascaderList]}
              testID="list-picker-cascader-list"
            />
          ) : (
            <Column
              align="center"
              style={[tokenStyles.cascaderEmpty, styles?.empty]}
              testID="list-picker-cascader-empty"
            >
              {renderTextNode(empty ?? emptyText, text => (
                <Text color="description">{text}</Text>
              ))}
            </Column>
          )}
        </Column>
      </Column>
    </Popup.FloatingPanel>
  );
}
