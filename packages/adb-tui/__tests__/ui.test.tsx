import React from 'react';
import TestRenderer from 'react-test-renderer';
import { SelectList } from '../src/ui/SelectList';
import { PromptFrame, TextField } from '../src/ui/components';
import { PairPanel } from '../src/ui/PairPanel';
import type { AdbClient } from '../src/adb';

jest.mock('ink', () => {
  // @ts-ignore
  const ReactRuntime = require('react');

  return {
    Box: ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactRuntime.createElement('box', props, children),
    Text: ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactRuntime.createElement('text', props, children),
    useInput: jest.fn(),
    useStdin: () => ({ stdin: null, setRawMode: jest.fn() }),
  };
});

function collectText(node: unknown): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(collectText).join('');
  }
  if (typeof node === 'object' && 'children' in node) {
    return collectText((node as { children?: unknown }).children);
  }

  return '';
}

function findNodeByProp(node: unknown, key: string, value: unknown): unknown {
  if (node === null || typeof node !== 'object') {
    return null;
  }

  const maybeNode = node as {
    props?: Record<string, unknown>;
    children?: unknown;
  };
  if (maybeNode.props?.[key] === value) {
    return node;
  }
  if (Array.isArray(maybeNode.children)) {
    for (const child of maybeNode.children) {
      const found = findNodeByProp(child, key, value);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

async function renderAsync(
  element: React.ReactElement,
): Promise<TestRenderer.ReactTestRenderer> {
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  try {
    let tree!: TestRenderer.ReactTestRenderer;
    await TestRenderer.act(async () => {
      tree = TestRenderer.create(element);
    });
    return tree;
  } finally {
    consoleError.mockRestore();
  }
}

describe('adb-tui terminal UI', () => {
  test('renders prompt frame with brand header, rounded border and hint text', () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      TestRenderer.act(() => {
        tree = TestRenderer.create(
          <PromptFrame
            title="主菜单"
            hint="操作：↑/↓ 切换，Enter 确认，ESC 返回"
          >
            <SelectList
              items={[
                { label: '设备列表', value: 'devices' },
                { label: '退出', value: 'quit' },
              ]}
              onSelect={() => undefined}
            />
          </PromptFrame>,
        );
      });
    } finally {
      consoleError.mockRestore();
    }

    const json = tree?.toJSON();
    const frame = collectText(json);

    expect(findNodeByProp(json, 'borderStyle', 'round')).not.toBeNull();
    expect(frame).toContain('ADB-TUI');
    expect(frame).toContain('Android 调试工具');
    expect(frame).toContain('主菜单');
    expect(frame).toContain('操作：↑/↓ 切换，Enter 确认，ESC 返回');
    expect(frame).toContain('›●设备列表');
    expect(frame).toContain(' ○退出');
  });

  test('shows pairing guidance instead of connect services when no pairing service is found', async () => {
    const client = {
      scanMdns: async () => ({
        pairing: [],
        connect: [
          { host: '192.168.1.4', port: 43189, type: 'connect' as const },
        ],
      }),
    } as unknown as AdbClient;

    const tree = await renderAsync(
      <PairPanel client={client} onBack={() => undefined} />,
    );
    const text = collectText(tree.toJSON());

    expect(text).toContain('未发现配对服务');
    expect(text).toContain('使用配对码配对设备');
    expect(text).not.toContain('192.168.1.4:43189');
  });

  test('renders adb error suggestion below the error message', () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      TestRenderer.act(() => {
        tree = TestRenderer.create(
          <TextField
            title="无线配对 · 输入配对码"
            error="error: protocol fault (couldn't read status message)"
            errorSuggestion="配对失败，请检查配对码与配对端口是否正确。"
            onSubmit={() => undefined}
          />,
        );
      });
    } finally {
      consoleError.mockRestore();
    }

    const text = collectText(tree?.toJSON());
    expect(text).toContain(
      "错误：error: protocol fault (couldn't read status message)",
    );
    expect(text).toContain('建议：配对失败，请检查配对码与配对端口是否正确。');
  });
});
