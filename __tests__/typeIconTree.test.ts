import { ICON } from '@pennyspring/data';

import { TYPE_ICON_TREE } from '../src/constants/typeIconTree';
import type { IconValue } from '../src/constants/typeIconTree';

const EXPECTED_GROUPS = [
  { key: 'income', label: '收入', count: 18 },
  { key: 'transfer', label: '转账', count: 8 },
  { key: 'money-management', label: '理财', count: 7 },
  { key: 'dining', label: '餐饮', count: 14 },
  { key: 'daily', label: '日常', count: 10 },
  { key: 'shopping', label: '购物', count: 9 },
  { key: 'dress', label: '服饰', count: 8 },
  { key: 'digital', label: '数码', count: 4 },
  { key: 'entertainment', label: '娱乐', count: 10 },
  { key: 'family', label: '家庭', count: 5 },
  { key: 'parenting', label: '育儿', count: 10 },
  { key: 'car', label: '汽车', count: 13 },
  { key: 'interpersonal', label: '人情', count: 4 },
  { key: 'traffic', label: '交通', count: 8 },
  { key: 'housing', label: '住房', count: 4 },
  { key: 'medical', label: '医疗', count: 7 },
  { key: 'campus', label: '校园', count: 6 },
  { key: 'tenement', label: '物业', count: 6 },
  { key: 'other', label: '其它', count: 1 },
] as const;

const EXPECTED_VALUES_BY_GROUP = {
  "income": [
    ICON.salary,
    ICON.bonus,
    ICON.royalty,
    ICON.refund,
    ICON.reimburse,
    ICON.investment,
    ICON.providentFund,
    ICON.medicare,
    ICON.alimony,
    ICON.pocketMoney,
    ICON.luckyMoney,
    ICON.convertPayment,
    ICON.windfall,
    ICON.rent,
    ICON.taxRebate,
    ICON.dividend,
    ICON.scholarship,
    ICON.benefit,
  ],
  "transfer": [
    ICON.accountTransfer,
    ICON.creditCardPayment,
    ICON.withdrawals,
    ICON.deposit,
    ICON.borrow,
    ICON.lend,
    ICON.repayment,
    ICON.proceeds,
  ],
  "money-management": [
    ICON.stock,
    ICON.fund,
    ICON.moneyManagement,
    ICON.gold,
    ICON.bond,
    ICON.forex,
    ICON.charge,
  ],
  "dining": [
    ICON.dining,
    ICON.threeMeals,
    ICON.breakfast,
    ICON.lunch,
    ICON.dinner,
    ICON.supper,
    ICON.takeaway,
    ICON.foodIngredient,
    ICON.fruit,
    ICON.dessert,
    ICON.snacks,
    ICON.drinks,
    ICON.at,
    ICON.ats,
  ],
  "daily": [
    ICON.dailyNecessities,
    ICON.kitchenDailyNecessities,
    ICON.communication,
    ICON.callCharge,
    ICON.netFee,
    ICON.life,
    ICON.clean,
    ICON.haircut,
    ICON.bath,
    ICON.express,
  ],
  "shopping": [
    ICON.shopping,
    ICON.digitalProduct,
    ICON.daily,
    ICON.electricalAppliance,
    ICON.clothes,
    ICON.furniture,
    ICON.beauty,
    ICON.bodyHair,
    ICON.souvenir,
  ],
  "dress": [
    ICON.hat,
    ICON.coat,
    ICON.pants,
    ICON.underwear,
    ICON.bag,
    ICON.shoes,
    ICON.socks,
    ICON.accessories,
  ],
  "digital": [
    ICON.mobilePhone,
    ICON.mobilePhoneAccessories,
    ICON.member,
    ICON.camera,
  ],
  "entertainment": [
    ICON.amusement,
    ICON.game,
    ICON.party,
    ICON.movie,
    ICON.sing,
    ICON.show,
    ICON.travel,
    ICON.tickets,
    ICON.excursionFare,
    ICON.sport,
  ],
  "family": [
    ICON.family,
    ICON.parent,
    ICON.love,
    ICON.child,
    ICON.pet,
  ],
  "parenting": [
    ICON.parenting,
    ICON.milkPowder,
    ICON.feeder,
    ICON.supplementaryFood,
    ICON.diapers,
    ICON.kids,
    ICON.toy,
    ICON.earlyEducation,
    ICON.familyTrip,
    ICON.vaccination,
  ],
  "car": [
    ICON.car,
    ICON.refuel,
    ICON.carCharge,
    ICON.parking,
    ICON.toll,
    ICON.autoParts,
    ICON.repair,
    ICON.carMaintenance,
    ICON.carWash,
    ICON.illegal,
    ICON.carInsurance,
    ICON.carInspection,
    ICON.carLoan,
  ],
  "interpersonal": [
    ICON.interpersonal,
    ICON.cashGift,
    ICON.gift,
    ICON.treat,
  ],
  "traffic": [
    ICON.traffic,
    ICON.bus,
    ICON.subway,
    ICON.train,
    ICON.plane,
    ICON.taxi,
    ICON.ship,
    ICON.bicycle,
  ],
  "housing": [
    ICON.housing,
    ICON.houseRent,
    ICON.houseLoan,
    ICON.hotel,
  ],
  "medical": [
    ICON.medical,
    ICON.medkit,
    ICON.registration,
    ICON.diagnose,
    ICON.drug,
    ICON.hospitalization,
    ICON.hygiene,
  ],
  "campus": [
    ICON.booksEducation,
    ICON.study,
    ICON.stationery,
    ICON.exam,
    ICON.books,
    ICON.training,
  ],
  "tenement": [
    ICON.waterRate,
    ICON.electricity,
    ICON.gasCharge,
    ICON.garbageFee,
    ICON.propertyCosts,
    ICON.heatingFee,
  ],
  "other": [
    ICON.other,
  ],
} as const;

describe('TYPE_ICON_TREE', () => {
    it('keeps icon order within every group', () => {
    for (const group of TYPE_ICON_TREE) {
      expect(group.children.map(icon => icon.value)).toEqual(
        EXPECTED_VALUES_BY_GROUP[group.key as keyof typeof EXPECTED_VALUES_BY_GROUP],
      );
    }
  });

    it('keeps duplicate source-svg rows as distinct semantic nodes', () => {
    const income = TYPE_ICON_TREE.find(group => group.key === 'income');
    const moneyManagement = TYPE_ICON_TREE.find(group => group.key === 'money-management');

    expect(income?.children.some(node => node.value === ICON.investment)).toBe(true);
    expect(moneyManagement?.children.some(node => node.value === ICON.stock)).toBe(true);
    expect(ICON.investment).not.toBe(ICON.stock);
  });
});
