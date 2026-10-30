import { execFileSync } from 'node:child_process';
import path from 'node:path';
import {
  COMPONENT_PREVIEW_SECTIONS,
  getComponentDemoPreviewsByComponentId,
} from '../examples/previews/registry';

describe('preview registration', () => {
  it('keeps generated registry, demos, docs and sidebar in sync with preview sources', () => {
    const packageRoot = path.resolve(__dirname, '..');

    expect(() =>
      execFileSync(process.execPath, ['scripts/sync-previews.cjs', '--check'], {
        cwd: packageRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      }),
    ).not.toThrow();
  });

  it('registers at least one demo for every previewed component', () => {
    const previewItems = COMPONENT_PREVIEW_SECTIONS.flatMap(
      section => section.items,
    );

    expect(previewItems.length).toBeGreaterThan(0);

    for (const previewItem of previewItems) {
      expect(
        getComponentDemoPreviewsByComponentId(previewItem.id).length,
      ).toBeGreaterThan(0);
    }
  });
});
