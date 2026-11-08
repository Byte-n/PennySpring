import {
  addExcludedPackage,
  filterInstalledApps,
  mergeExcludedPackages,
  toggleExcludedPackage,
} from '../../src/features/quickBookDraft/excludedApps';
import type { QuickBookInstalledApp } from '../../src/features/quickBookDraft/native';

const APPS: QuickBookInstalledApp[] = [
  {
    packageName: 'com.example.game',
    label: '示例游戏',
    icon: 'data:image/png;base64,AAAA',
  },
  {
    packageName: 'com.example.video',
    label: 'Example Video',
    icon: '',
  },
];

describe('filterInstalledApps', () => {
  it('returns all apps for a blank query', () => {
    expect(filterInstalledApps(APPS, '  ')).toEqual(APPS);
  });

  it('matches labels and package names case-insensitively', () => {
    expect(filterInstalledApps(APPS, '游戏')).toEqual([APPS[0]]);
    expect(filterInstalledApps(APPS, 'VIDEO')).toEqual([APPS[1]]);
    expect(filterInstalledApps(APPS, 'example.game')).toEqual([APPS[0]]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterInstalledApps(APPS, '没有这个应用')).toEqual([]);
  });
});

describe('toggleExcludedPackage', () => {
  it('adds and removes a package without mutating the source list', () => {
    const source = ['com.example.game'];
    const added = toggleExcludedPackage(source, 'com.example.video', true);

    expect(added).toEqual(['com.example.game', 'com.example.video']);
    expect(source).toEqual(['com.example.game']);

    expect(toggleExcludedPackage(added, 'com.example.game', false)).toEqual([
      'com.example.video',
    ]);
  });

  it('keeps a single entry when adding a package twice', () => {
    const packages = toggleExcludedPackage([], 'com.example.game', true);

    expect(toggleExcludedPackage(packages, 'com.example.game', true)).toEqual([
      'com.example.game',
    ]);
  });
});

describe('addExcludedPackage', () => {
  it('appends a trimmed package without mutating the source list', () => {
    const source = ['com.example.game'];

    expect(addExcludedPackage(source, ' com.example.video ')).toEqual([
      'com.example.game',
      'com.example.video',
    ]);
    expect(source).toEqual(['com.example.game']);
  });

  it('ignores blank and duplicate package names', () => {
    expect(addExcludedPackage(['com.example.game'], '  ')).toEqual([
      'com.example.game',
    ]);
    expect(
      addExcludedPackage(['com.example.game'], 'com.example.game'),
    ).toEqual(['com.example.game']);
  });
});

describe('mergeExcludedPackages', () => {
  it('appends native-only packages after the local list', () => {
    expect(
      mergeExcludedPackages(
        ['com.example.game'],
        ['com.example.video', 'com.example.shop'],
      ),
    ).toEqual(['com.example.game', 'com.example.video', 'com.example.shop']);
  });

  it('keeps a single entry for packages present on both sides', () => {
    expect(
      mergeExcludedPackages(
        ['com.example.game', 'com.example.video'],
        ['com.example.video', 'com.example.shop'],
      ),
    ).toEqual(['com.example.game', 'com.example.video', 'com.example.shop']);
  });
});
