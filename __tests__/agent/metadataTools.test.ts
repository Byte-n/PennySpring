import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
  VISIBILITY,
  type AssetRow,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';

import { escapeTableCell } from '../../src/agent/projection/metadata';
import { projectAssetList } from '../../src/agent/tools/listAssets';
import { projectTagList } from '../../src/agent/tools/listTags';
import { projectTypeList } from '../../src/agent/tools/listTypes';

function typeRow(
  overrides: Partial<TypeRow> & Pick<TypeRow, 'id' | 'name' | 'typeCategory'>,
): TypeRow {
  return {
    booksId: 1,
    parentId: 0,
    icon: '',
    isSystem: SYSTEM_STATUS.custom,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
    sort: 1,
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as TypeRow;
}

function tagRow(
  overrides: Partial<TagRow> & Pick<TagRow, 'id' | 'name'>,
): TagRow {
  return {
    booksId: 1,
    invisible: VISIBILITY.visible,
    icon: '',
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as TagRow;
}

function assetRow(
  overrides: Partial<AssetRow> & Pick<AssetRow, 'id' | 'name'>,
): AssetRow {
  return {
    booksId: 1,
    balance: 0,
    totalAmount: 0,
    billingDate: 0,
    repaymentDate: 0,
    type: ASSET_TYPE.capitalAccount,
    classification: ASSET_CLASSIFICATION.cash,
    invisible: VISIBILITY.visible,
    openBank: '',
    cardNo: '',
    remark: '',
    sort: 1,
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as AssetRow;
}

describe('escapeTableCell', () => {
  it('escapes table separators and line breaks', () => {
    expect(escapeTableCell('外卖|堂食\n夜宵')).toBe('外卖\\|堂食<br>夜宵');
  });
});

describe('projectTypeList', () => {
  const types = [
    typeRow({
      id: 1,
      name: '餐饮',
      typeCategory: RECORD_TYPE_CATEGORY.expense,
    }),
    typeRow({
      id: 2,
      name: '三餐',
      parentId: 1,
      typeCategory: RECORD_TYPE_CATEGORY.expense,
    }),
    typeRow({
      id: 3,
      name: '外卖|堂食\n夜宵',
      parentId: 1,
      typeCategory: RECORD_TYPE_CATEGORY.expense,
    }),
    typeRow({
      id: 4,
      name: '薪资',
      typeCategory: RECORD_TYPE_CATEGORY.income,
    }),
    typeRow({
      id: 5,
      name: '帐户互转',
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
    }),
  ];

  it('renders category sections with parent markers and escaped cells', () => {
    const output = projectTypeList(types, {});

    expect(output).toContain('## 支出');
    expect(output).toContain('| 1 | 餐饮（父类） |  |');
    expect(output).toContain('| 2 | 三餐 | 餐饮 |');
    expect(output).toContain('| 3 | 外卖\\|堂食<br>夜宵 | 餐饮 |');
    expect(output).toContain('## 收入');
    expect(output).toContain('| 4 | 薪资 |  |');
    expect(output).toContain('## 转账');
    expect(output).toContain('| 5 | 帐户互转 |  |');
  });

  it('filters by category and keyword', () => {
    const byCategory = projectTypeList(types, { category: 'income' });
    expect(byCategory).toContain('## 收入');
    expect(byCategory).not.toContain('## 支出');

    const byKeyword = projectTypeList(types, { keyword: '三餐' });
    expect(byKeyword).toContain('| 2 | 三餐 | 餐饮 |');
    expect(byKeyword).not.toContain('| 1 | 餐饮（父类） |  |');
  });

  it('marks absorption income as unsupported', () => {
    const output = projectTypeList(
      [
        typeRow({
          id: 6,
          name: '退还',
          typeCategory: RECORD_TYPE_CATEGORY.income,
          specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
        }),
      ],
      { category: 'income' },
    );

    expect(output).toContain('退还（退款吸收，暂不支持）');
  });

  it('returns an empty message when there are no types', () => {
    expect(projectTypeList([], {})).toBe('当前账本没有可用类型。');
  });
});

describe('projectTagList', () => {
  it('renders visible tags sorted by id and escapes separators', () => {
    const output = projectTagList(
      [
        tagRow({ id: 2, name: '朋友|同事' }),
        tagRow({ id: 1, name: '报销' }),
        tagRow({
          id: 3,
          name: '隐藏',
          invisible: VISIBILITY.hidden,
        }),
      ],
      {},
    );

    expect(output).toContain('| 1 | 报销 |');
    expect(output).toContain('| 2 | 朋友\\|同事 |');
    expect(output).not.toContain('隐藏');
  });

  it('returns an empty message when there are no visible tags', () => {
    expect(projectTagList([], {})).toBe('当前账本没有可用标签。');
  });
});

describe('projectAssetList', () => {
  it('renders visible assets with type and classification labels', () => {
    const output = projectAssetList([
      assetRow({ id: 2, name: '招行卡', sort: 2 }),
      assetRow({
        id: 1,
        name: '信用卡',
        type: ASSET_TYPE.creditCard,
        classification: ASSET_CLASSIFICATION.creditCard,
        sort: 1,
      }),
      assetRow({
        id: 3,
        name: '隐藏资产',
        invisible: VISIBILITY.hidden,
      }),
    ]);

    expect(output).toContain('| 1 | 信用卡 | 信用卡 | 信用卡 |');
    expect(output).toContain('| 2 | 招行卡 | 资金账户 | 现金 |');
    expect(output).not.toContain('隐藏资产');
  });

  it('returns an empty message when there are no visible assets', () => {
    expect(projectAssetList([])).toBe('当前账本没有可用资产。');
  });
});
