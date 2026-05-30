import React from 'react'
import TestRenderer from 'react-test-renderer'
import { SelectList } from '../src/ui/SelectList'
import { PromptFrame } from '../src/ui/components'

jest.mock('ink', () => {
  const ReactRuntime = require('react')

  return {
    Box: ({ children, ...props }: { children?: React.ReactNode }) => ReactRuntime.createElement('box', props, children),
    Text: ({ children, ...props }: { children?: React.ReactNode }) => ReactRuntime.createElement('text', props, children),
    useInput: jest.fn(),
    useStdin: () => ({ stdin: null, setRawMode: jest.fn() }),
  }
})

function collectText(node: unknown): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return ''
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(collectText).join('')
  }
  if (typeof node === 'object' && 'children' in node) {
    return collectText((node as { children?: unknown }).children)
  }

  return ''
}

function findNodeByProp(node: unknown, key: string, value: unknown): unknown {
  if (node === null || typeof node !== 'object') {
    return null
  }

  const maybeNode = node as { props?: Record<string, unknown>; children?: unknown }
  if (maybeNode.props?.[key] === value) {
    return node
  }
  if (Array.isArray(maybeNode.children)) {
    for (const child of maybeNode.children) {
      const found = findNodeByProp(child, key, value)
      if (found) {
        return found
      }
    }
  }

  return null
}

describe('adb-tui terminal UI', () => {
  test('renders prompt frame with brand header, rounded border and hint text', () => {
    let tree: TestRenderer.ReactTestRenderer | undefined
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    try {
      TestRenderer.act(() => {
        tree = TestRenderer.create(
          <PromptFrame title="主菜单" hint="操作：↑/↓ 切换，Enter 确认，ESC 返回">
            <SelectList
              items={[
                { label: '设备列表', value: 'devices' },
                { label: '退出', value: 'quit' },
              ]}
              onSelect={() => undefined}
            />
          </PromptFrame>,
        )
      })
    } finally {
      consoleError.mockRestore()
    }

    const json = tree?.toJSON()
    const frame = collectText(json)

    expect(findNodeByProp(json, 'borderStyle', 'round')).not.toBeNull()
    expect(frame).toContain('ADB-TUI')
    expect(frame).toContain('Android 调试工具')
    expect(frame).toContain('主菜单')
    expect(frame).toContain('操作：↑/↓ 切换，Enter 确认，ESC 返回')
    expect(frame).toContain('›●设备列表')
    expect(frame).toContain(' ○退出')
  })
})
