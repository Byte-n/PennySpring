import type { Api } from '@pennyspring/api';
import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  VISIBILITY,
  type AssetRow,
} from '@pennyspring/api';
import { z } from 'zod';

import {
  limitTableRowsByTokens,
  renderMarkdownTable,
} from '../projection/metadata';
import { createAgentTool } from './createAgentTool';

export const LIST_ASSETS_TOOL_NAME = 'listAssets';

export const LIST_ASSETS_TOOL_DESCRIPTION =
  '列出当前账本可用的资产，返回精简 markdown 表格（id、名称、类型、分类）。创建转账记录前用它获取转出和转入资产 id。';

export interface ListAssetsToolDeps {
  api: Api;
  booksId: number;
}

function assetTypeLabel(asset: AssetRow): string {
  return ASSET_TYPE.label(asset.type) || asset.type;
}

function assetClassificationLabel(asset: AssetRow): string {
  return (
    ASSET_CLASSIFICATION.label(asset.classification) || asset.classification
  );
}

export function projectAssetList(assets: readonly AssetRow[]): string {
  const visibleAssets = assets
    .filter(asset => asset.invisible !== VISIBILITY.hidden)
    .sort((left, right) => left.sort - right.sort || left.id - right.id);
  if (visibleAssets.length === 0) {
    return '当前账本没有可用资产。';
  }

  const rows = visibleAssets.map(asset => [
    String(asset.id),
    asset.name,
    assetTypeLabel(asset),
    assetClassificationLabel(asset),
  ]);
  const limited = limitTableRowsByTokens(['id', '名称', '类型', '分类'], rows);
  const table = renderMarkdownTable(
    ['id', '名称', '类型', '分类'],
    limited.rows,
  );
  const truncated = limited.truncated
    ? `\n\n（已截断，仅显示前 ${limited.rows.length} 条）`
    : '';
  return `${table}${truncated}`;
}

export function createListAssetsTool(deps: ListAssetsToolDeps) {
  return createAgentTool({
    name: LIST_ASSETS_TOOL_NAME,
    description: LIST_ASSETS_TOOL_DESCRIPTION,
    inputSchema: z.object({}).default({}),
    execute: async () => {
      const assets = await deps.api.asset.getByBook(deps.booksId);
      return projectAssetList(assets);
    },
  });
}
