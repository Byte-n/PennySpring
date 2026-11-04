import { FileSystem } from 'react-native-file-access';

const FILE_URI_PREFIX = 'file://';

/** 把草稿图片 URI 转成 FileSystem 可用的本地路径；非本地路径返回 null。 */
export function toDraftLocalPath(uri: string): string | null {
  if (uri.startsWith(FILE_URI_PREFIX)) {
    return decodeURIComponent(uri.slice(FILE_URI_PREFIX.length));
  }
  if (uri.startsWith('/')) {
    return uri;
  }
  return null;
}

async function deleteOne(uri: string): Promise<void> {
  try {
    const localPath = toDraftLocalPath(uri);
    if (localPath === null) {
      return;
    }
    if (await FileSystem.exists(localPath)) {
      await FileSystem.unlink(localPath);
    }
  } catch {
    // 草稿文件可能已被系统清理；删除失败不阻断丢弃/完成流程。
  }
}

/** 删除草稿截图文件；不存在的文件静默忽略。 */
export async function deleteDraftImageFiles(
  imagePaths: readonly string[],
): Promise<void> {
  await Promise.all(imagePaths.map(deleteOne));
}
