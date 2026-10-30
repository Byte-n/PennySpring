interface ApprovalToolCallPartLike {
  type: string;
  approval?: { approved?: boolean };
}

interface ApprovalMessageLike {
  parts: readonly ApprovalToolCallPartLike[];
}

export function hasPendingToolApproval(
  messages: readonly ApprovalMessageLike[],
): boolean {
  return messages.some(message =>
    message.parts.some(
      part =>
        part.type === 'tool-call' &&
        part.approval !== undefined &&
        part.approval.approved === undefined,
    ),
  );
}
