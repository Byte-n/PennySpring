import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
} from '@pennyspring/data';

import { ASSET_CLASSIFICATION_TREE } from '../src/constants/assetClassificationTree';
import type { AssetClassificationValue } from '../src/constants/assetClassificationTree';

jest.mock('../src/assets/asset-icons/capital-account/cash_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/capital-account/asset_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/shared/bank_card_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/credit-card/credit_card_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock(
  '../src/assets/asset-icons/credit-card/ant_credit_pay_circle.svg',
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

jest.mock(
  '../src/assets/asset-icons/credit-card/credit_card_other_circle.svg',
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

jest.mock(
  '../src/assets/asset-icons/stored-value-card/phone_charge_circle.svg',
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

jest.mock(
  '../src/assets/asset-icons/stored-value-card/bus_card_circle.svg',
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

jest.mock(
  '../src/assets/asset-icons/stored-value-card/meal_card_circle.svg',
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

jest.mock(
  '../src/assets/asset-icons/stored-value-card/member_card_circle.svg',
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

jest.mock(
  '../src/assets/asset-icons/stored-value-card/deposit_circle.svg',
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

jest.mock(
  '../src/assets/asset-icons/stored-value-card/rechargeable_card_circle.svg',
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

jest.mock('../src/assets/asset-icons/investment/stock_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/investment/fund_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/investment/financial_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/debt/borrow_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/debt/lend_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/wallet/wechat_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/wallet/alipay_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/wallet/douyin_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/credit-pay/jingdong_circle.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock(
  '../src/assets/asset-icons/credit-pay/douyin_month_circle.svg',
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

jest.mock('../src/assets/asset-icons/bank/bank_zg.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_zs.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_gs.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_ny.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_js.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_jt.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_yz.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_hx.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_bj.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_ms.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_gd.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_zx.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_gf.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_pf.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/assets/asset-icons/bank/bank_xy.svg', () => ({
  __esModule: true,
  default: () => null,
}));

function flattenChildren(
  nodes: ReadonlyArray<{
    children?: readonly unknown[];
  }>,
): unknown[] {
  return nodes.flatMap(node => [
    ...(node.children ?? []),
    ...flattenChildren(
      (node.children ?? []) as ReadonlyArray<{ children?: readonly unknown[] }>,
    ),
  ]);
}

describe('ASSET_CLASSIFICATION_TREE', () => {
  it('keeps asset type order from the mapping document', () => {
    expect(ASSET_CLASSIFICATION_TREE.map(node => node.value)).toEqual([
      ASSET_TYPE.capitalAccount,
      ASSET_TYPE.creditCard,
      ASSET_TYPE.storedValueCard,
      ASSET_TYPE.investment,
      ASSET_TYPE.debt,
    ]);
  });

  it('uses constants for values and exposes label and icon on every node', () => {
    const assetTypeValues = new Set(ASSET_TYPE.values());
    const classificationValues = new Set(ASSET_CLASSIFICATION.values());
    const childNodes = flattenChildren(ASSET_CLASSIFICATION_TREE) as Array<{
      icon: unknown;
      label: string;
      value: AssetClassificationValue;
    }>;

    for (const node of ASSET_CLASSIFICATION_TREE) {
      expect(assetTypeValues.has(node.value)).toBe(true);
      expect(node.label).toBe(ASSET_TYPE.label(node.value));
      expect(typeof node.icon).toBe('function');
    }

    for (const node of childNodes) {
      expect(classificationValues.has(node.value)).toBe(true);
      expect(node.label).toBe(ASSET_CLASSIFICATION.label(node.value));
      expect(typeof node.icon).toBe('function');
    }
  });

  it('exposes documented capital account hierarchy', () => {
    const capitalAccount = ASSET_CLASSIFICATION_TREE[0];
    const debitCard = capitalAccount.children?.find(
      node => node.value === ASSET_CLASSIFICATION.debitCard,
    );
    const onlineWallet = capitalAccount.children?.find(
      node => node.value === ASSET_CLASSIFICATION.onlineWallet,
    );

    expect(capitalAccount.children?.map(node => node.value)).toEqual([
      ASSET_CLASSIFICATION.cash,
      ASSET_CLASSIFICATION.debitCard,
      ASSET_CLASSIFICATION.onlineWallet,
      ASSET_CLASSIFICATION.otherCapital,
    ]);
    expect(debitCard?.children).toHaveLength(15);
    expect(onlineWallet?.children?.map(node => node.value)).toEqual([
      ASSET_CLASSIFICATION.wechat,
      ASSET_CLASSIFICATION.alipay,
      ASSET_CLASSIFICATION.douyin,
    ]);
  });

  it('exposes documented credit card hierarchy', () => {
    const creditCardType = ASSET_CLASSIFICATION_TREE[1];
    const creditCard = creditCardType.children?.find(
      node => node.value === ASSET_CLASSIFICATION.creditCard,
    );
    const creditPay = creditCardType.children?.find(
      node => node.value === ASSET_CLASSIFICATION.creditPay,
    );

    expect(creditCardType.children?.map(node => node.value)).toEqual([
      ASSET_CLASSIFICATION.creditCard,
      ASSET_CLASSIFICATION.creditPay,
      ASSET_CLASSIFICATION.otherCreditCard,
    ]);
    expect(creditCard?.children).toHaveLength(15);
    expect(creditPay?.children?.map(node => node.value)).toEqual([
      ASSET_CLASSIFICATION.antCreditPay,
      ASSET_CLASSIFICATION.jdIous,
      ASSET_CLASSIFICATION.douyinMonth,
    ]);
  });

  it('exposes documented leaf asset categories', () => {
    expect(ASSET_CLASSIFICATION_TREE[2].children?.map(node => node.value)).toEqual([
      ASSET_CLASSIFICATION.phoneCharge,
      ASSET_CLASSIFICATION.busCard,
      ASSET_CLASSIFICATION.mealCard,
      ASSET_CLASSIFICATION.memberCard,
      ASSET_CLASSIFICATION.deposit,
      ASSET_CLASSIFICATION.otherTopUp,
    ]);
    expect(ASSET_CLASSIFICATION_TREE[3].children?.map(node => node.value)).toEqual([
      ASSET_CLASSIFICATION.stock,
      ASSET_CLASSIFICATION.fund,
      ASSET_CLASSIFICATION.otherInvestmentFinancial,
    ]);
    expect(ASSET_CLASSIFICATION_TREE[4].children?.map(node => node.value)).toEqual([
      ASSET_CLASSIFICATION.borrow,
      ASSET_CLASSIFICATION.lend,
    ]);
  });
});
