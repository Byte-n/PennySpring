import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import {
  useBookKey,
  useBookStore,
  useCurrentBookId,
} from '../src/stores/bookStore';

function Probe({ onRender }: { onRender?: () => void }): React.ReactElement {
  const bookId = useCurrentBookId();
  const bookKey = useBookKey();
  onRender?.();
  return <Text>{`${bookId ?? 'null'}|${bookKey ?? 'null'}`}</Text>;
}

function renderIdentity(): string {
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<Probe />);
  });
  return renderer!.root.findByType(Text).props.children;
}

function renderIdentityRenderer(
  onRender: () => void,
): TestRenderer.ReactTestRenderer {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<Probe onRender={onRender} />);
  });
  return renderer;
}

describe('当前账本身份', () => {
  afterEach(() => {
    act(() => {
      useBookStore.setState({
        currentBook: null,
        currentBookRef: null,
        initStatus: 'idle',
      });
    });
  });

  test('exposes id and key from the ref before metadata is loaded', () => {
    act(() => {
      useBookStore.setState({
        currentBook: null,
        currentBookRef: {
          kind: 'remote',
          serverUrl: 'http://example.com',
          bookId: 5,
        },
        initStatus: 'loading',
      });
    });

    expect(renderIdentity()).toBe('5|remote:http://example.com:5');
  });

  test('returns null identity when no book ref is selected', () => {
    act(() => {
      useBookStore.setState({
        currentBook: null,
        currentBookRef: null,
        initStatus: 'success',
      });
    });

    expect(renderIdentity()).toBe('null|null');
  });

  test('does not rerender consumers when metadata resolves for the same ref', () => {
    act(() => {
      useBookStore.setState({
        currentBook: null,
        currentBookRef: { kind: 'local', id: 3 },
        initStatus: 'loading',
      });
    });

    let renderCount = 0;
    const renderer = renderIdentityRenderer(() => {
      renderCount += 1;
    });
    expect(renderCount).toBe(1);

    act(() => {
      useBookStore.setState({
        currentBook: {
          kind: 'local',
          id: 3,
          name: '家庭账本',
          description: '',
          background: '',
          createdTime: 0,
          updatedTime: 0,
        },
        initStatus: 'success',
      });
    });

    expect(renderCount).toBe(1);
    expect(renderer.root.findByType(Text).props.children).toBe('3|local:3');
  });

  test('changes identity when the selected book changes', () => {
    act(() => {
      useBookStore.setState({
        currentBook: null,
        currentBookRef: { kind: 'local', id: 3 },
        initStatus: 'success',
      });
    });

    let renderCount = 0;
    const renderer = renderIdentityRenderer(() => {
      renderCount += 1;
    });
    expect(renderer.root.findByType(Text).props.children).toBe('3|local:3');

    act(() => {
      useBookStore.setState({
        currentBookRef: {
          kind: 'remote',
          serverUrl: 'http://example.com',
          bookId: 8,
        },
        initStatus: 'loading',
      });
    });

    expect(renderCount).toBe(2);
    expect(renderer.root.findByType(Text).props.children).toBe(
      '8|remote:http://example.com:8',
    );
  });
});
