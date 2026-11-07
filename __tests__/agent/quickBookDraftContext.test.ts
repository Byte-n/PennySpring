import {
  buildQuickBookDraftSystemPrompt,
  buildQuickBookDraftUserMessage,
} from '../../src/agent/projection/quickBookDraftContext';

const PRESET = { assetId: 0, typeId: 0 };

describe('buildQuickBookDraftSystemPrompt', () => {
  it('拼接角色、系统约束与默认规则', () => {
    const prompt = buildQuickBookDraftSystemPrompt({
      bookName: '家庭账本',
      today: '2026-11-07',
      preset: PRESET,
    });

    expect(prompt).toContain('【角色】');
    expect(prompt).toContain('只生成草稿，不写入账本');
    expect(prompt).toContain('【系统说明】');
    expect(prompt).toContain('saveRecordDrafts');
    expect(prompt).toContain('每张图片最多拆分为 20 笔');
    expect(prompt).toContain('typeId、assetId、intoAssetId 必须来自');
    expect(prompt).toContain('分类拿不准时留空');
    expect(prompt).toContain('日期不明确按今天');
    const rulesSection = prompt.split('【规则】')[1] ?? '';
    expect(rulesSection).not.toContain('typeId');
    expect(rulesSection).not.toContain('items');
    expect(rulesSection).not.toContain('summary');
    expect(rulesSection).not.toContain('warnings');
  });

  it('用用户自定义规则替换默认规则，但系统约束不可移除', () => {
    const prompt = buildQuickBookDraftSystemPrompt({
      bookName: '家庭账本',
      today: '2026-11-07',
      preset: PRESET,
      rules: '1. 类型无法判断时选择语义最接近的类型。',
    });

    expect(prompt).toContain('1. 类型无法判断时选择语义最接近的类型。');
    expect(prompt).not.toContain('分类拿不准时留空');
    expect(prompt).toContain('金额无法确定时不要猜测');
    expect(prompt).toContain('不要查询已有记录');
  });

  it('规则留空时回退到默认规则', () => {
    const prompt = buildQuickBookDraftSystemPrompt({
      bookName: '家庭账本',
      today: '2026-11-07',
      preset: PRESET,
      rules: '',
    });

    expect(prompt).toContain('分类拿不准时留空');
  });
});

describe('buildQuickBookDraftUserMessage', () => {
  it('只下发本轮锁定信息与提交要求，不重复可调规则', () => {
    const message = buildQuickBookDraftUserMessage({
      bookName: '家庭账本',
      preset: { assetId: 3, typeId: 0 },
    });

    expect(message).toContain('家庭账本');
    expect(message).toContain('资产 id 3');
    expect(message).toContain('saveRecordDrafts');
    expect(message).not.toContain('金额或类型无法确定时留空');
  });
});
