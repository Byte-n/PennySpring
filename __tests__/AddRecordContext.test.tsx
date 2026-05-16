import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AddRecordProvider, useAddRecordContext } from '../src/screens/addRecord/AddRecordContext';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: (fn: Function) => () => {
    const token = new Proxy({}, { get: () => 0 });
    return fn(token, {});
  },
}));

describe('AddRecordContext', () => {
  test('provides default state', () => {
    let ctx: ReturnType<typeof useAddRecordContext> | undefined;

    act(() => {
      renderer.create(
        <AddRecordProvider>
          <CaptureContext onCapture={(v) => { ctx = v; }} />
        </AddRecordProvider>
      );
    });

    expect(ctx!.amount).toBe(0);
    expect(ctx!.remark).toBe('');
    expect(ctx!.tags).toEqual([]);
    expect(ctx!.images).toEqual([]);
    expect(ctx!.recordTime).toBeGreaterThan(0);
  });

  test('setAmount updates amount', () => {
    let ctx: ReturnType<typeof useAddRecordContext> | undefined;

    act(() => {
      renderer.create(
        <AddRecordProvider>
          <CaptureContext onCapture={(v) => { ctx = v; }} />
        </AddRecordProvider>
      );
    });

    act(() => {
      ctx!.setAmount(12345);
    });

    expect(ctx!.amount).toBe(12345);
  });

  test('setRemark updates remark', () => {
    let ctx: ReturnType<typeof useAddRecordContext> | undefined;

    act(() => {
      renderer.create(
        <AddRecordProvider>
          <CaptureContext onCapture={(v) => { ctx = v; }} />
        </AddRecordProvider>
      );
    });

    act(() => {
      ctx!.setRemark('test remark');
    });

    expect(ctx!.remark).toBe('test remark');
  });

  test('setRecordTime updates recordTime', () => {
    let ctx: ReturnType<typeof useAddRecordContext> | undefined;
    const newTime = 1700000000000;

    act(() => {
      renderer.create(
        <AddRecordProvider>
          <CaptureContext onCapture={(v) => { ctx = v; }} />
        </AddRecordProvider>
      );
    });

    act(() => {
      ctx!.setRecordTime(newTime);
    });

    expect(ctx!.recordTime).toBe(newTime);
  });

  test('setTags updates tags', () => {
    let ctx: ReturnType<typeof useAddRecordContext> | undefined;

    act(() => {
      renderer.create(
        <AddRecordProvider>
          <CaptureContext onCapture={(v) => { ctx = v; }} />
        </AddRecordProvider>
      );
    });

    act(() => {
      ctx!.setTags([1, 2, 3]);
    });

    expect(ctx!.tags).toEqual([1, 2, 3]);
  });

  test('setImages updates images', () => {
    let ctx: ReturnType<typeof useAddRecordContext> | undefined;

    act(() => {
      renderer.create(
        <AddRecordProvider>
          <CaptureContext onCapture={(v) => { ctx = v; }} />
        </AddRecordProvider>
      );
    });

    act(() => {
      ctx!.setImages(['img1.jpg', 'img2.jpg']);
    });

    expect(ctx!.images).toEqual(['img1.jpg', 'img2.jpg']);
  });

  test('throws when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      act(() => {
        renderer.create(<CaptureContext onCapture={() => {}} />);
      });
    }).toThrow('useAddRecordContext must be used within AddRecordProvider');

    consoleError.mockRestore();
  });
});

function CaptureContext({ onCapture }: { onCapture: (v: ReturnType<typeof useAddRecordContext>) => void }) {
  const value = useAddRecordContext();
  onCapture(value);
  return null;
}
