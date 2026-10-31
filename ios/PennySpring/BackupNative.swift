import Foundation
import UIKit
import UniformTypeIdentifiers
import React

@objc(BackupNative)
class BackupNative: NSObject, RCTBridgeModule, UIDocumentPickerDelegate {
  private var pendingResolve: RCTPromiseResolveBlock?
  private var pendingReject: RCTPromiseRejectBlock?

  static func moduleName() -> String! {
    "BackupNative"
  }

  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc func pickDirectory(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      if self.pendingResolve != nil {
        reject("E_BUSY", "目录选择正在进行", nil)
        return
      }
      guard let presenter = self.topViewController() else {
        reject("E_NO_ACTIVITY", "当前没有可用界面", nil)
        return
      }

      self.pendingResolve = resolve
      self.pendingReject = reject
      let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.folder], asCopy: false)
      picker.delegate = self
      picker.allowsMultipleSelection = false
      presenter.present(picker, animated: true)
    }
  }

  @objc func writeFile(
    _ directoryId: String,
    fileName: String,
    base64: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard isValidFileName(fileName) else {
      reject("E_INVALID_FILE", "文件名不正确", nil)
      return
    }
    guard let data = Data(base64Encoded: base64) else {
      reject("E_INVALID_FILE", "备份内容不是有效的 Base64", nil)
      return
    }

    do {
      let (directory, accessed) = try resolveDirectory(directoryId)
      defer { stopAccessing(directory, accessed) }

      let fileURL = directory.appendingPathComponent(fileName)
      try data.write(to: fileURL, options: .atomic)
      resolve(fileURL.absoluteString)
    } catch {
      reject("E_WRITE_FILE", error.localizedDescription, error)
    }
  }

  @objc func listFiles(
    _ directoryId: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let (directory, accessed) = try resolveDirectory(directoryId)
      defer { stopAccessing(directory, accessed) }

      let keys: Set<URLResourceKey> = [
        .isRegularFileKey,
        .fileSizeKey,
        .contentModificationDateKey,
      ]
      let files = try FileManager.default.contentsOfDirectory(
        at: directory,
        includingPropertiesForKeys: Array(keys),
        options: [.skipsHiddenFiles]
      )

      let result: [[String: Any]] = files.compactMap { fileURL in
        guard let values = try? fileURL.resourceValues(forKeys: keys),
              values.isRegularFile == true else {
          return nil
        }
        return [
          "name": fileURL.lastPathComponent,
          "size": values.fileSize ?? 0,
          "lastModified": Int64((values.contentModificationDate ?? .distantPast).timeIntervalSince1970 * 1000),
        ]
      }
      resolve(result)
    } catch {
      reject("E_LIST_FILES", error.localizedDescription, error)
    }
  }

  @objc func deleteFile(
    _ directoryId: String,
    fileName: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard isValidFileName(fileName) else {
      reject("E_INVALID_FILE", "文件名不正确", nil)
      return
    }
    do {
      let (directory, accessed) = try resolveDirectory(directoryId)
      defer { stopAccessing(directory, accessed) }

      let fileURL = directory.appendingPathComponent(fileName)
      guard FileManager.default.fileExists(atPath: fileURL.path) else {
        throw NSError(
          domain: "BackupNative",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "备份文件不存在"]
        )
      }
      try FileManager.default.removeItem(at: fileURL)
      resolve(nil)
    } catch {
      reject("E_DELETE_FILE", error.localizedDescription, error)
    }
  }

  func documentPicker(
    _ controller: UIDocumentPickerViewController,
    didPickDocumentsAt urls: [URL]
  ) {
    guard let resolve = pendingResolve, let reject = pendingReject else {
      return
    }
    pendingResolve = nil
    pendingReject = nil

    guard let directory = urls.first else {
      resolve(nil)
      return
    }

    let accessed = directory.startAccessingSecurityScopedResource()
    defer {
      if accessed {
        directory.stopAccessingSecurityScopedResource()
      }
    }

    do {
      let bookmark = try directory.bookmarkData(
        options: .withSecurityScope,
        includingResourceValuesForKeys: nil,
        relativeTo: nil
      )
      resolve([
        "id": bookmark.base64EncodedString(),
        "label": directory.lastPathComponent,
      ])
    } catch {
      reject("E_PICK_DIRECTORY", error.localizedDescription, error)
    }
  }

  func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
    let resolve = pendingResolve
    pendingResolve = nil
    pendingReject = nil
    resolve?(nil)
  }

  private func resolveDirectory(_ bookmarkBase64: String) throws -> (URL, Bool) {
    guard let data = Data(base64Encoded: bookmarkBase64) else {
      throw NSError(
        domain: "BackupNative",
        code: 2,
        userInfo: [NSLocalizedDescriptionKey: "备份目录授权无效，请重新选择目录"]
      )
    }

    var isStale = false
    let directory = try URL(
      resolvingBookmarkData: data,
      options: [.withSecurityScope, .withoutUI],
      relativeTo: nil,
      bookmarkDataIsStale: &isStale
    )
    let accessed = directory.startAccessingSecurityScopedResource()
    return (directory, accessed)
  }

  private func stopAccessing(_ url: URL, _ accessed: Bool) {
    if accessed {
      url.stopAccessingSecurityScopedResource()
    }
  }

  private func isValidFileName(_ fileName: String) -> Bool {
    !fileName.isEmpty &&
      !fileName.contains("/") &&
      !fileName.contains("\\") &&
      !fileName.contains("..")
  }

  private func topViewController() -> UIViewController? {
    let scenes = UIApplication.shared.connectedScenes
    let windowScene = scenes.first {
      $0.activationState == .foregroundActive
    } as? UIWindowScene
    let window = windowScene?.windows.first { $0.isKeyWindow }
      ?? windowScene?.windows.first

    var controller = window?.rootViewController
    while let presented = controller?.presentedViewController {
      controller = presented
    }
    return controller
  }
}
