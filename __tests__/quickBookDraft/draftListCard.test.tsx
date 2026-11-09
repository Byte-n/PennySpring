import React from 'react';
import { Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import {
  QUICK_BOOK_DRAFT_SOURCE,
  QUICK_BOOK_DRAFT_STATUS,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  type AssetRow,
  type DraftItem,
  type QuickBookDraftRow,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';
import { ThemeProvider } from '@pennyspring/ui';

import { DraftListCard } from '../../src/screens/home/tabs/draft/DraftListCard';
import { DraftTypePicker } from '../../src/screens/home/tabs/draft/DraftTypePicker';

jest.mock('../../src/features/quickBookDraft/draftProgress', () => ({
  useQuickBookDraftProgress: () => ({ parts: [], updatedTime: 0 }),
}));

const NOW = new Date(2026, 10, 4, 12, 34).getTime();

function createType(overrides: Partial<TypeRow> = {}): TypeRow {
  return {
    id: 11,
    booksId: 1,
    parentId: 0,
    name: '交通',
    icon: '',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    isSystem: 'custom',
    specialBehavior: '',
    sort: 1,
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  };
}

const CHILD_TYPE = createType({ id: 12, parentId: 11, name: '打车' });
const INCOME_TYPE = createType({
  id: 13,
  booksId: 1,
  name: '报销到账',
  typeCategory: RECORD_TYPE_CATEGORY.income,
  specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption,
});
const TYPES = [createType(), CHILD_TYPE, INCOME_TYPE];
const TAGS: TagRow[] = [
  {
    id: 1,
    booksId: 1,
    name: '出差',
    invisible: 'visible',
    icon: '',
    createdTime: 0,
    updatedTime: 0,
  },
  {
    id: 2,
    booksId: 1,
    name: '公司',
    invisible: 'visible',
    icon: '',
    createdTime: 0,
    updatedTime: 0,
  },
  {
    id: 3,
    booksId: 1,
    name: '可报销',
    invisible: 'visible',
    icon: '',
    createdTime: 0,
    updatedTime: 0,
  },
];

function createItem(overrides: Partial<DraftItem> = {}): DraftItem {
  return {
    status: 'pending',
    recordId: 0,
    typeId: 12,
    typeName: '打车',
    amountCents: 2400,
    recordTime: NOW,
    remark: '团队加班晚餐',
    assetId: 0,
    assetName: '微信',
    intoAssetId: 0,
    intoAssetName: '',
    chargeCents: 0,
    tagIds: [1, 2, 3],
    reimbursable: false,
    attachImage: true,
    warnings: [],
    ...overrides,
  };
}

function createDraft(items: DraftItem[]): QuickBookDraftRow {
  return {
    id: 'draft-1',
    booksId: 1,
    status: QUICK_BOOK_DRAFT_STATUS.pending,
    source: QUICK_BOOK_DRAFT_SOURCE.floatingCapture,
    imagePath: 'file:///tmp/draft.jpg',
    attachImage: false,
    items,
    preset: { assetId: 0, typeId: 0 },
    agentProviderId: 0,
    agentModelId: '',
    agentSummary: '识别到 2 笔支出，其中 1 笔金额待确认',
    errorText: '',
    confirmedCount: 1,
    recordIds: [88],
    createdTime: NOW,
    updatedTime: NOW,
    confirmedAt: 0,
  };
}

function renderCard(items: DraftItem[]): TestRenderer.ReactTestRenderer {
  const typeMap = new Map(TYPES.map(type => [type.id, type]));
  const tagMap = new Map(TAGS.map(tag => [tag.id, tag]));
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <ThemeProvider>
        <DraftListCard
          assetMap={new Map<number, AssetRow>()}
          bookName="日常账本"
          confirmingItemIndex={null}
          draft={createDraft(items)}
          isBookMissing={false}
          isBusy={false}
          isRetrying={false}
          onConfirm={jest.fn()}
          onDiscard={jest.fn()}
          onEdit={jest.fn()}
          onEditAmount={jest.fn()}
          onEditTags={jest.fn()}
          onEditTime={jest.fn()}
          onEditType={jest.fn()}
          onRetry={jest.fn()}
          onToggleAttach={jest.fn()}
          tagMap={tagMap}
          typeMap={typeMap}
        />
      </ThemeProvider>,
    );
  });
  return renderer!;
}

function collectTexts(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(RNText)
    .map(node => node.props.children)
    .filter((child): child is string => typeof child === 'string');
}

describe('DraftListCard', () => {
  it('shows compact item fields, tag overflow and totals', () => {
    const renderer = renderCard([
      createItem({
        status: 'confirmed',
        recordId: 88,
        typeId: 12,
        tagIds: [1],
      }),
      createItem({
        amountCents: null,
        typeId: 12,
        tagIds: [1, 2, 3],
        attachImage: false,
        warnings: ['小票金额被遮挡'],
      }),
    ]);

    const texts = collectTexts(renderer);

    expect(texts).toContain('交通 / 打车');
    expect(texts).toContain('出差');
    expect(texts).toContain('公司');
    expect(texts).toContain('+1');
    expect(texts).toContain('已记账');
    expect(texts).toContain('已带图');
    expect(texts).toContain('支出合计');
    expect(texts).toContain('¥24.00');
    expect(texts).toContain('另有 1 笔金额待确认');
    expect(texts).toContain('小票金额被遮挡');
  });

  it('shows category tabs and parent types in the type picker', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <DraftTypePicker
            onCancel={jest.fn()}
            onSelect={jest.fn()}
            open
            types={TYPES}
            value={0}
          />
        </ThemeProvider>,
      );
    });

    const texts = collectTexts(renderer!);

    expect(texts).toContain('选择类型');
    expect(texts).toContain('支出');
    expect(texts).toContain('收入');
    expect(texts).toContain('转账');
    expect(texts).toContain('交通');
  });

  it('routes absorption income to the related-expense edit action', () => {
    const renderer = renderCard([
      createItem({
        typeId: INCOME_TYPE.id,
        amountCents: 32000,
        tagIds: [1],
        attachImage: false,
      }),
    ]);

    const texts = collectTexts(renderer);

    expect(texts).toContain('报销到账');
    expect(texts).toContain('需关联支出');
    expect(texts).toContain('去关联');
    expect(texts).toContain('退款/报销类收入必须关联一笔支出');
  });
});
