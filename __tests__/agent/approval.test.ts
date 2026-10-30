import { hasPendingToolApproval } from '../../src/agent/ui/approval';

describe('hasPendingToolApproval', () => {
  it('returns true when a tool call is waiting for an approval decision', () => {
    expect(
      hasPendingToolApproval([
        {
          parts: [
            {
              type: 'tool-call',
              approval: { approved: undefined },
            },
          ],
        },
      ]),
    ).toBe(true);
  });

  it('returns false after the approval is answered', () => {
    expect(
      hasPendingToolApproval([
        {
          parts: [
            {
              type: 'tool-call',
              approval: { approved: true },
            },
            {
              type: 'tool-call',
              approval: { approved: false },
            },
          ],
        },
      ]),
    ).toBe(false);
  });

  it('ignores text parts and tool calls without approvals', () => {
    expect(
      hasPendingToolApproval([
        { parts: [{ type: 'text' }] },
        { parts: [{ type: 'tool-call' }] },
      ]),
    ).toBe(false);
  });
});
