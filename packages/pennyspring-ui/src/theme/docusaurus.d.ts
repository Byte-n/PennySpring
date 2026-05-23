declare module '@docusaurus/BrowserOnly' {
  import type { ReactNode } from 'react';

  export default function BrowserOnly(props: {
    children: () => ReactNode;
    fallback?: ReactNode;
  }): ReactNode;
}

declare module '@docusaurus/useDocusaurusContext' {
  export default function useDocusaurusContext(): {
    siteConfig: {
      customFields?: Record<string, unknown>;
    };
  };
}

declare module '@docusaurus/useIsBrowser' {
  export default function useIsBrowser(): boolean;
}

declare module '@theme-original/MDXComponents' {
  import type { MDXComponentsObject } from '@theme/MDXComponents';

  const MDXComponents: MDXComponentsObject;
  export default MDXComponents;
}
