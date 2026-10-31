import { FloatingActionGroup } from '@pennyspring/ui';
import { useTheme } from '@pennyspring/ui';
import { SparkleIcon } from 'phosphor-react-native';

import { useAgentLauncher } from './AgentLauncherContext';

export function AgentFloatingEntry() {
  const { token } = useTheme();
  const { openAgent } = useAgentLauncher();

  const fabOffset =
    token.paddingLG + token.controlHeight * 2 + token.paddingXS * 2;

  return (
    <FloatingActionGroup
      actions={[
        {
          key: 'agent',
          icon: SparkleIcon,
          onPress: openAgent,
          buttonProps: { type: 'primary' },
        },
      ]}
      offset={{ y: fabOffset }}
      placement="bottomRight"
    />
  );
}
