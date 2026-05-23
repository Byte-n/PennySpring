import React from 'react';
import { Skeleton, Text } from '@pennyspring/ui';

export const skeletonLoadingSwitchDemoTitle = 'Loading switch';

export function SkeletonLoadingSwitchDemo() {
  return (
    <>
      <Skeleton loading={false}>
        <Text color="description">Content rendered when loading is false.</Text>
      </Skeleton>
    </>
  );
}

export default SkeletonLoadingSwitchDemo;
