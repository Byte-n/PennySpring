import * as schema from '../src/schema';
import * as relations from '../src/relations';
import * as publicApi from '../src';

describe('data package schema exports', () => {
  test('exports all documented business tables', () => {
    expect(Object.keys(schema).sort()).toEqual([
      'assets',
      'books',
      'imageWithRelated',
      'recordWithRecord',
      'records',
      'tagWithRecord',
      'tags',
      'types',
    ]);
  });

  test('exports relation metadata for every table with documented ER edges', () => {
    expect(Object.keys(relations).sort()).toEqual([
      'assetsRelations',
      'booksRelations',
      'imageWithRelatedRelations',
      'recordWithRecordRelations',
      'recordsRelations',
      'tagWithRecordRelations',
      'tagsRelations',
      'typesRelations',
    ]);
  });

  test('exports schema, runtime bootstrap, and table definitions from the package root', () => {
    expect(typeof publicApi.createDatabase).toBe('function');
    expect(typeof publicApi.runMigrations).toBe('function');
    expect(publicApi.schema.books).toBe(schema.books);
    expect(publicApi.schema.booksRelations).toBe(relations.booksRelations);
    expect(publicApi.assets).toBe(schema.assets);
  });

  test('exports RECORD_TYPE_SPECIAL_BEHAVIOR enum with documented values', () => {
    expect(publicApi.RECORD_TYPE_SPECIAL_BEHAVIOR.values()).toEqual([
      '',
      'refund_absorption',
      'reimbursement_absorption',
      'credit_card_payment',
      'debt_borrow',
      'debt_lend',
      'debt_repayment',
      'debt_proceeds',
    ]);
  });

  test('tb_type schema includes specialBehavior column', () => {
    expect(schema.types.specialBehavior).toBeDefined();
    expect(schema.types.specialBehavior.name).toBe('special_behavior');
  });

  test('tb_record schema does not include concessions column', () => {
    expect('concessions' in schema.records).toBe(false);
  });

  test('exports documented enum key constants from the package root', () => {
    expect(publicApi.VISIBILITY.visible).toBe('visible');
    expect(publicApi.SYSTEM_STATUS.custom).toBe('custom');
    expect(publicApi.RECORD_TYPE_CATEGORY.expense).toBe('expense');
    expect(publicApi.REIMBURSABLE.notReimbursable).toBe('none');
    expect(
      publicApi.ASSET_TYPE.option(publicApi.ASSET_TYPE.capitalAccount),
    ).toEqual({
      value: 'capital_account',
      label: '资金账户',
      description: '现金、银行储蓄卡、网络钱包、其它资金',
    });
    expect(publicApi.VISIBILITY.option(publicApi.VISIBILITY.hidden)).toEqual({
      value: 'hidden',
      label: '隐藏',
      description: '不在默认列表中显示',
    });
  });

  test('exports all documented asset classifications without asset types', () => {
    expect(publicApi.ASSET_CLASSIFICATION.values()).toEqual([
      'cash',
      'debit_card',
      'online_wallet',
      'other_capital',
      'credit_card',
      'credit_pay',
      'oth_credit_card',
      'BANK_CARD_ZG',
      'BANK_CARD_ZS',
      'BANK_CARD_GS',
      'BANK_CARD_NY',
      'BANK_CARD_JS',
      'BANK_CARD_JT',
      'BANK_CARD_YZ',
      'BANK_CARD_HX',
      'BANK_CARD_BJ',
      'BANK_CARD_MS',
      'BANK_CARD_GD',
      'BANK_CARD_ZX',
      'BANK_CARD_GF',
      'BANK_CARD_PF',
      'BANK_CARD_XY',
      'ANT_CREDIT_PAY',
      'JD_IOUS',
      'DOUYIN_MONTH',
      'WECHAT',
      'ALIPAY',
      'DOUYIN',
      'PHONE_CHARGE',
      'BUS_CARD',
      'MEAL_CARD',
      'MEMBER_CARD',
      'DEPOSIT',
      'OTHER_TOP_UP',
      'STOCK',
      'FUND',
      'OTHER_INVESTMENT_FINANCIAL',
      'BORROW',
      'LEND',
    ]);

    expect(publicApi.ASSET_CLASSIFICATION.values()).not.toEqual(
      expect.arrayContaining(publicApi.ASSET_TYPE.values()),
    );
    expect(new Set(publicApi.ASSET_CLASSIFICATION.values()).size).toBe(
      publicApi.ASSET_CLASSIFICATION.values().length,
    );
  });

  test('exports type icon semantic constants in documented order', () => {
    expect(publicApi.ICON.values()).toEqual([
      'salary',
      'bonus',
      'royalty',
      'refund',
      'reimburse',
      'investment',
      'provident_fund',
      'medicare',
      'alimony',
      'pocket_money',
      'lucky_money',
      'convert_payment',
      'windfall',
      'rent',
      'tax_rebate',
      'dividend',
      'scholarship',
      'benefit',
      'account_transfer',
      'credit_card_payment',
      'withdrawals',
      'deposit',
      'borrow',
      'lend',
      'repayment',
      'proceeds',
      'stock',
      'fund',
      'money_management',
      'gold',
      'bond',
      'forex',
      'charge',
      'dining',
      'three_meals',
      'breakfast',
      'lunch',
      'dinner',
      'supper',
      'takeaway',
      'food_ingredient',
      'fruit',
      'dessert',
      'snacks',
      'drinks',
      'at',
      'ats',
      'daily_necessities',
      'kitchen_daily_necessities',
      'communication',
      'call_charge',
      'net_fee',
      'life',
      'clean',
      'haircut',
      'bath',
      'express',
      'shopping',
      'digital_product',
      'daily',
      'electrical_appliance',
      'clothes',
      'furniture',
      'beauty',
      'body_hair',
      'souvenir',
      'hat',
      'coat',
      'pants',
      'underwear',
      'bag',
      'shoes',
      'socks',
      'accessories',
      'mobile_phone',
      'mobile_phone_accessories',
      'member',
      'camera',
      'amusement',
      'game',
      'party',
      'movie',
      'sing',
      'show',
      'travel',
      'tickets',
      'excursion_fare',
      'sport',
      'family',
      'parent',
      'love',
      'child',
      'pet',
      'parenting',
      'milk_powder',
      'feeder',
      'supplementary_food',
      'diapers',
      'kids',
      'toy',
      'early_education',
      'family_trip',
      'vaccination',
      'car',
      'refuel',
      'car_charge',
      'parking',
      'toll',
      'auto_parts',
      'repair',
      'car_maintenance',
      'car_wash',
      'illegal',
      'car_insurance',
      'car_inspection',
      'car_loan',
      'interpersonal',
      'cash_gift',
      'gift',
      'treat',
      'traffic',
      'bus',
      'subway',
      'train',
      'plane',
      'taxi',
      'ship',
      'bicycle',
      'housing',
      'house_rent',
      'house_loan',
      'hotel',
      'medical',
      'medkit',
      'registration',
      'diagnose',
      'drug',
      'hospitalization',
      'hygiene',
      'books_education',
      'study',
      'stationery',
      'exam',
      'books',
      'training',
      'water_rate',
      'electricity',
      'gas_charge',
      'garbage_fee',
      'property_costs',
      'heating_fee',
      'other',
    ]);

    expect(publicApi.ICON.option(publicApi.ICON.salary)).toEqual({
      value: 'salary',
      label: '薪资',
    });
    expect(publicApi.ICON.option(publicApi.ICON.stock)).toEqual({
      value: 'stock',
      label: '股票',
    });
    expect(publicApi.ICON.values()).toHaveLength(152);
    expect(publicApi.ICON.descriptions()).toEqual(
      Array.from({ length: 152 }, () => ''),
    );
    expect(publicApi.ICON.values()).not.toEqual(
      expect.arrayContaining([expect.stringContaining('icon/')]),
    );
  });

});
