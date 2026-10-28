// react-native-sherpa-onnx 会在模型路径工具中静态引用该包，但只有下载 / TTS 路径会真正调用。
// 该包的 TurboModule spec 使用了 RN 0.85 codegen 不支持的 ArrayBuffer，无法参与构建；
// 本项目只加载内置 assets 模型，走不到这些函数，因此用显式失败的占位实现替代。
const UNAVAILABLE = '未接入文件系统模块，该能力不可用';

export const DocumentDirectoryPath = '';

export function exists(): Promise<boolean> {
  return Promise.reject(new Error(UNAVAILABLE));
}

export function readDir(): Promise<never> {
  return Promise.reject(new Error(UNAVAILABLE));
}

export function stat(): Promise<never> {
  return Promise.reject(new Error(UNAVAILABLE));
}

export function unlink(): Promise<never> {
  return Promise.reject(new Error(UNAVAILABLE));
}
