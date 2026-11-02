import { FloatingActionGroup } from '@pennyspring/ui';
import { useTheme } from '@pennyspring/ui';
import { SparkleIcon } from 'phosphor-react-native';

import { useAgentLauncher } from './AgentLauncherContext';

export function AgentFloatingEntry() {
  const { token } = useTheme();
  const { openAgent } = useAgentLauncher();

  // 让出首页动作网格的展开区域，避免书签与菜单重叠。
  const fabOffset = token.paddingLG + token.controlHeight * 3 + token.paddingXS;

  return (
    <FloatingActionGroup
      actions={[
        {
          key: 'agent',
          label: 'AI 助手',
          icon: SparkleIcon,
          onPress: openAgent,
        },
      ]}
      draggable
      offset={{ y: fabOffset }}
      placement="bottomRight"
      snapToEdge
    />
  );
}
