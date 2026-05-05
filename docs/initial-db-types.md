# 初始化数据库分类

## 处理规则说明

本文档只描述新增记录和统计展示时的业务处理，不包含数据库迁移逻辑。

- ：新增记录按 `amount + charge - concessions` 计算；非信用卡资产余额减少，信用卡资产已用额度增加；可标记为可报销。日汇总和柱状图按 `finalAmount` 统计，饼图按原始计算金额统计。
- ：新增记录按 `amount - charge` 计算；保存时优惠清零、不可报销；非信用卡资产余额增加，信用卡资产已用额度减少。日汇总和柱状图按 `finalAmount` 统计，饼图按原始计算金额统计。
- ：源资产按 `amount + charge - concessions` 扣减或增加信用卡已用额度，目标资产按 `amount` 增加或减少信用卡已用额度；统计时不计入收入，只将 `charge - concessions` 计入支出。
- 退款/报销吸收：被关联支出记录的 `finalAmount` 置为 `0`；退款/报销记录的 `finalAmount = 收入记录金额 - 被吸收支出金额`。因此日汇总和柱状图会体现吸收效果，饼图和导出金额不会体现吸收效果。

## 支出

### 餐饮

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 餐饮 | `vector_type_dining_24` |  |
| 三餐 | `vector_type_three_meals_24` |  |
| 夜宵 | `vector_type_supper_24` |  |
| 柴米油盐 | `vector_type_kitchen_daily_necessities_24` |  |
| 食材 | `vector_type_food_ingredient_24` |  |

### 烟酒零食

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 烟酒零食 | `vector_type_ats_24` |  |
| 水果 | `vector_type_fruit_24` |  |
| 甜点 | `vector_type_dessert_24` |  |
| 零食 | `vector_type_snacks_24` |  |
| 饮料 | `vector_type_drinks_24` |  |
| 烟酒 | `vector_type_at_24` |  |

### 购物

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 购物 | `vector_type_shopping_24` |  |
| 数码 | `vector_type_digital_product_24` |  |
| 日用 | `vector_type_daily_necessities_24` |  |
| 电器 | `vector_type_electrical_appliance_24` |  |
| 美妆 | `vector_type_beauty_24` |  |
| 鞋服 | `vector_type_clothes_24` |  |
| 饰品 | `vector_type_accessories_24` |  |

### 住房

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 住房 | `vector_type_housing_24` |  |
| 房租 | `vector_type_house_rent_24` |  |
| 房贷 | `vector_type_house_loan_24` |  |

### 交通

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 交通 | `vector_type_traffic_24` |  |
| 公交 | `vector_type_bus_24` |  |
| 地铁 | `vector_type_subway_24` |  |
| 打车 | `vector_type_taxi_24` |  |
| 火车 | `vector_type_train_24` |  |
| 飞机 | `vector_type_plane_24` |  |

### 娱乐

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 娱乐 | `vector_type_amusement_24` |  |
| 游戏 | `vector_type_game_24` |  |
| 聚会 | `vector_type_party_24` |  |
| 宠物 | `vector_type_pet_24` |  |
| K歌 | `vector_type_sing_24` |  |
| 电影 | `vector_type_movie_24` |  |
| 演出 | `vector_type_show_24` |  |

### 生活

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 生活 | `vector_type_life_24` |  |
| 水费 | `vector_type_water_rate_24` |  |
| 电费 | `vector_type_electricity_24` |  |
| 燃气费 | `vector_type_gas_charge_24` |  |
| 垃圾费 | `vector_type_garbage_fee_24` |  |
| 物业费 | `vector_type_property_costs_24` |  |
| 取暖费 | `vector_type_heating_fee_24` |  |

### 文教

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 文教 | `vector_type_books_education_24` |  |
| 学费 | `vector_type_study_24` |  |
| 文具 | `vector_type_stationery_24` |  |
| 考试 | `vector_type_exam_24` |  |
| 培训 | `vector_type_training_24` |  |
| 书籍 | `vector_type_books_24` |  |

### 汽车

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 汽车 | `vector_type_car_24` |  |
| 停车 | `vector_type_parking_24` |  |
| 加油 | `vector_type_refuel_24` |  |
| 充电 | `vector_type_car_charge_24` |  |
| 保养 | `vector_type_car_maintenance_24` |  |
| 洗车 | `vector_type_car_wash_24` |  |
| 维修 | `vector_type_repair_24` |  |
| 违章 | `vector_type_illegal_24` |  |
| 车险 | `vector_type_car_insurance_24` |  |
| 车检 | `vector_type_car_inspection_24` |  |
| 车贷 | `vector_type_car_loan_24` |  |

### 通讯

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 通讯 | `vector_type_communication_24` |  |
| 话费 | `vector_type_call_charge_24` |  |
| 网费 | `vector_type_net_fee_24` |  |

### 育儿

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 育儿 | `vector_type_parenting_24` |  |
| 奶粉 | `vector_type_milk_powder_24` |  |
| 辅食 | `vector_type_supplementary_food_24` |  |
| 洗护 | `vector_type_body_hair_24` |  |
| 玩具 | `vector_type_toy_24` |  |
| 童装 | `vector_type_kids_24` |  |

### 人际关系

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 人际关系 | `vector_type_interpersonal_24` |  |
| 礼金 | `vector_type_cash_gift_24` |  |
| 礼品 | `vector_type_gift_24` |  |
| 请客 | `vector_type_treat_24` |  |

### 医疗

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 医疗 | `vector_type_medical_24` |  |
| 挂号 | `vector_type_registration_24` |  |
| 看诊 | `vector_type_diagnose_24` |  |
| 药品 | `vector_type_drug_24` |  |
| 住院 | `vector_type_hospitalization_24` |  |
| 保健 | `vector_type_hygiene_24` |  |

### 旅行

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 旅行 | `vector_type_travel_24` |  |
| 团费 | `vector_type_excursion_fare_24` |  |
| 门票 | `vector_type_tickets_24` |  |
| 纪念品 | `vector_type_souvenir_24` |  |
| 酒店 | `vector_type_hotel_24` |  |

### 其它

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 其它 | `vector_type_other_24` |  |

## 收入

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 报销 | `vector_type_reimburse_24` | 固定特殊分类；需要关联可报销支出；按退款/报销吸收规则处理 |
| 退款 | `vector_type_refund_24` | 固定特殊分类；需要关联普通支出；按退款/报销吸收规则处理 |
| 薪资 | `vector_type_salary_24` |  |
| 奖金 | `vector_type_bonus_24` |  |
| 投资 | `vector_type_investment_24` |  |
| 外快 | `vector_type_windfall_24` |  |
| 其它 | `vector_type_other_24` |  |

## 转账

| 名称   | 图标 | 特殊逻辑                    |
|------| - |-------------------------|
| 账户互转 | `vector_type_account_transfer_24` |                         |
| 还信用卡 | `vector_type_credit_card_payment_24` | 固定特殊分类；关联资产只能选择信用卡账户； |
| 取款   | `vector_type_withdrawals_24` |                         |
| 存款   | `vector_type_deposit_24` |                         |
| 债务   |  |                         |
| 其他   | `vector_type_other_24` |                         |

### 债务

| 名称 | 图标 | 特殊逻辑 |
| --- | --- | --- |
| 借入 | `vector_type_borrow_24` | 债务借入                    |
| 借出 | `vector_type_lend_24` | 债务借出                    |
| 还款 | `vector_type_repayment_24` | 债务还款                    |
| 收款 | `vector_type_type_proceeds_24` | 债务收款                    |
