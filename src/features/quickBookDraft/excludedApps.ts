import type { QuickBookInstalledApp } from './native';

export function filterInstalledApps(
  apps: readonly QuickBookInstalledApp[],
  query: string,
): QuickBookInstalledApp[] {
  const keyword = query.trim().toLocaleLowerCase();
  if (keyword === '') {
    return [...apps];
  }
  return apps.filter(
    app =>
      app.label.toLocaleLowerCase().includes(keyword) ||
      app.packageName.toLocaleLowerCase().includes(keyword),
  );
}

export function toggleExcludedPackage(
  packages: readonly string[],
  packageName: string,
  selected: boolean,
): string[] {
  if (selected) {
    return packages.includes(packageName)
      ? [...packages]
      : [...packages, packageName];
  }
  return packages.filter(pkg => pkg !== packageName);
}
