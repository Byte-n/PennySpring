import Darwin
import Foundation
import Network
import React

@objc(LanTransfer)
class LanTransfer: NSObject, RCTBridgeModule {
  private let queue = DispatchQueue(label: "com.pennyspring.lantransfer")
  private let stateLock = NSLock()

  private var listener: NWListener?
  private var connections: [NWConnection] = []
  private var timeoutWorkItem: DispatchWorkItem?
  private var token = ""
  private var fileURL: URL?
  private var fileName = ""
  private var state = "idle"
  private var errorText = ""
  private var servedAt: Double = 0
  private var didResolveStart = false

  static func moduleName() -> String! {
    "LanTransfer"
  }

  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc func startServer(
    _ token: String,
    fileUri: String,
    fileName: String,
    timeoutMs: Double,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard token.count == 6, token.allSatisfy({ $0.isNumber }) else {
      reject("E_INVALID_TOKEN", "传输口令必须是 6 位数字", nil)
      return
    }

    let url: URL
    if fileUri.hasPrefix("file://"), let parsed = URL(string: fileUri) {
      url = parsed
    } else if fileUri.hasPrefix("/") {
      url = URL(fileURLWithPath: fileUri)
    } else {
      reject("E_INVALID_FILE", "待发送的备份文件路径不正确", nil)
      return
    }

    guard FileManager.default.fileExists(atPath: url.path) else {
      reject("E_INVALID_FILE", "待发送的备份文件不存在", nil)
      return
    }

    let timeout = min(
      max(timeoutMs / 1000, 60),
      30 * 60
    )

    queue.async {
      self.stopInternal()
      self.token = token
      self.fileURL = url
      self.fileName = fileName
      self.setState("waiting")
      self.didResolveStart = false

      do {
        let listener = try NWListener(using: .tcp, on: .any)
        self.listener = listener
        listener.stateUpdateHandler = { [weak self] listenerState in
          guard let self else { return }
          switch listenerState {
          case .ready:
            guard !self.didResolveStart else { return }
            self.didResolveStart = true
            let port = listener.port?.rawValue ?? 0
            resolve([
              "port": Int(port),
              "urls": self.localAddresses(port: port),
            ])
            self.scheduleTimeout(seconds: timeout)
          case .failed(let error):
            if !self.didResolveStart {
              self.didResolveStart = true
              reject("E_START_SERVER", error.localizedDescription, error)
            }
            self.setError(error.localizedDescription)
            self.stopListener()
          default:
            break
          }
        }
        listener.newConnectionHandler = { [weak self] connection in
          self?.accept(connection)
        }
        listener.start(queue: self.queue)
      } catch {
        if !self.didResolveStart {
          self.didResolveStart = true
          reject("E_START_SERVER", error.localizedDescription, error)
        }
        self.setError(error.localizedDescription)
        self.stopListener()
      }
    }
  }

  @objc func stopServer(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async {
      self.stopInternal()
      resolve(nil)
    }
  }

  @objc func getStatus(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    stateLock.lock()
    let snapshot = (state, errorText, servedAt)
    stateLock.unlock()
    resolve([
      "state": snapshot.0,
      "error": snapshot.1,
      "servedAt": snapshot.2,
    ])
  }

  private func accept(_ connection: NWConnection) {
    guard getState() == "waiting" else {
      connection.cancel()
      return
    }
    connections.append(connection)
    connection.start(queue: queue)
    receiveRequest(connection, accumulated: Data())
  }

  private func receiveRequest(
    _ connection: NWConnection,
    accumulated: Data
  ) {
    connection.receive(minimumIncompleteLength: 1, maximumLength: 8192) {
      [weak self] data, _, isComplete, error in
      guard let self else { return }

      var buffer = accumulated
      if let data {
        buffer.append(data)
      }
      if buffer.count > 8192 {
        self.sendText(connection, status: "431 Request Header Fields Too Large", message: "请求头过大")
        return
      }
      if buffer.range(of: Data("\r\n\r\n".utf8)) != nil {
        self.handleRequest(connection, request: buffer)
        return
      }
      if isComplete || error != nil {
        self.close(connection)
        return
      }
      self.receiveRequest(connection, accumulated: buffer)
    }
  }

  private func handleRequest(_ connection: NWConnection, request: Data) {
    guard let requestText = String(data: request, encoding: .isoLatin1),
      let requestLine = requestText.components(separatedBy: "\r\n").first
    else {
      sendText(connection, status: "400 Bad Request", message: "请求格式不正确")
      return
    }

    let parts = requestLine.split(separator: " ")
    guard parts.count >= 2, parts[0] == "GET" else {
      sendText(connection, status: "405 Method Not Allowed", message: "仅支持 GET")
      return
    }

    let target = String(parts[1])
    let targetParts = target.split(separator: "?", maxSplits: 1)
    let path = String(targetParts[0])
    guard path == "/package" else {
      sendText(connection, status: "404 Not Found", message: "未找到传输内容")
      return
    }

    let query = targetParts.count > 1 ? String(targetParts[1]) : ""
    let providedToken =
      query
      .split(separator: "&")
      .first(where: { $0.hasPrefix("token=") })
      .map { String($0.dropFirst("token=".count)) }
      .flatMap { $0.removingPercentEncoding }

    guard providedToken == token else {
      sendText(connection, status: "403 Forbidden", message: "传输口令不正确")
      return
    }

    guard let fileURL else {
      sendText(connection, status: "500 Internal Server Error", message: "待发送文件不存在")
      return
    }

    sendFile(connection, fileURL: fileURL)
  }

  private func sendFile(_ connection: NWConnection, fileURL: URL) {
    let attributes = try? FileManager.default.attributesOfItem(atPath: fileURL.path)
    let length = (attributes?[.size] as? NSNumber)?.int64Value ?? 0
    guard let handle = try? FileHandle(forReadingFrom: fileURL) else {
      sendText(connection, status: "500 Internal Server Error", message: "无法读取待发送文件")
      return
    }

    let encodedName = encodeFileName(fileName)
    let headers = [
      "HTTP/1.1 200 OK",
      "Content-Type: application/zip",
      "Content-Length: \(length)",
      "Content-Disposition: attachment; filename=\"pennyspring-backup.psb\"; filename*=UTF-8''\(encodedName)",
      "Connection: close",
      "",
      "",
    ].joined(separator: "\r\n")

    connection.send(
      content: headers.data(using: .isoLatin1),
      completion: .contentProcessed { [weak self] error in
        guard let self else { return }
        if error != nil {
          try? handle.close()
          self.close(connection)
          return
        }
        self.sendNextChunk(connection, handle: handle)
      }
    )
  }

  private func sendNextChunk(_ connection: NWConnection, handle: FileHandle) {
    let data: Data
    do {
      data = try handle.read(upToCount: 64 * 1024) ?? Data()
    } catch {
      try? handle.close()
      setError(error.localizedDescription)
      close(connection)
      return
    }

    if data.isEmpty {
      try? handle.close()
      connection.send(
        content: nil,
        contentContext: .defaultMessage,
        isComplete: true,
        completion: .contentProcessed { [weak self] _ in
          guard let self else { return }
          self.markServed()
          self.close(connection)
          self.stopListener()
        }
      )
      return
    }

    connection.send(
      content: data,
      completion: .contentProcessed { [weak self] error in
        guard let self else { return }
        if error != nil {
          try? handle.close()
          self.setError(error?.localizedDescription ?? "传输中断")
          self.close(connection)
          return
        }
        self.sendNextChunk(connection, handle: handle)
      }
    )
  }

  private func sendText(
    _ connection: NWConnection,
    status: String,
    message: String
  ) {
    let body = Data(message.utf8)
    let headers = [
      "HTTP/1.1 \(status)",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Length: \(body.count)",
      "Connection: close",
      "",
      "",
    ].joined(separator: "\r\n")

    connection.send(
      content: headers.data(using: .isoLatin1),
      completion: .contentProcessed { [weak self] _ in
        guard let self else { return }
        connection.send(
          content: body,
          contentContext: .defaultMessage,
          isComplete: true,
          completion: .contentProcessed { _ in
            self.close(connection)
          }
        )
      }
    )
  }

  private func close(_ connection: NWConnection) {
    connection.cancel()
    connections.removeAll { $0 === connection }
  }

  private func scheduleTimeout(seconds: Double) {
    timeoutWorkItem?.cancel()
    let workItem = DispatchWorkItem { [weak self] in
      guard let self else { return }
      if self.getState() == "waiting" {
        self.setError("等待超时，请重新开始")
        self.stopListener()
      }
    }
    timeoutWorkItem = workItem
    queue.asyncAfter(deadline: .now() + seconds, execute: workItem)
  }

  private func markServed() {
    stateLock.lock()
    state = "served"
    errorText = ""
    servedAt = Date().timeIntervalSince1970 * 1000
    stateLock.unlock()
  }

  private func setState(_ next: String) {
    stateLock.lock()
    state = next
    errorText = ""
    servedAt = 0
    stateLock.unlock()
  }

  private func setError(_ message: String) {
    stateLock.lock()
    state = "error"
    errorText = message
    stateLock.unlock()
  }

  private func getState() -> String {
    stateLock.lock()
    defer { stateLock.unlock() }
    return state
  }

  private func stopListener() {
    timeoutWorkItem?.cancel()
    timeoutWorkItem = nil
    listener?.cancel()
    listener = nil
    connections.forEach { $0.cancel() }
    connections.removeAll()
  }

  private func stopInternal() {
    stopListener()
    stateLock.lock()
    state = "idle"
    errorText = ""
    servedAt = 0
    stateLock.unlock()
  }

  private func encodeFileName(_ name: String) -> String {
    var allowed = CharacterSet.alphanumerics
    allowed.insert(charactersIn: "-._~")
    return name.addingPercentEncoding(withAllowedCharacters: allowed) ?? "backup.psb"
  }

  private func localAddresses(port: UInt16) -> [String] {
    var results: [String] = []
    var ifaddr: UnsafeMutablePointer<ifaddrs>?

    guard getifaddrs(&ifaddr) == 0 else {
      return ["http://127.0.0.1:\(port)"]
    }
    defer { freeifaddrs(ifaddr) }

    var cursor = ifaddr
    while let pointer = cursor {
      let interface = pointer.pointee
      if let address = interface.ifa_addr,
        address.pointee.sa_family == UInt8(AF_INET)
      {
        let flags = Int32(interface.ifa_flags)
        if (flags & IFF_UP) != 0, (flags & IFF_LOOPBACK) == 0 {
          var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
          let length = socklen_t(address.pointee.sa_len)
          if getnameinfo(
            address,
            length,
            &hostname,
            socklen_t(hostname.count),
            nil,
            0,
            NI_NUMERICHOST
          ) == 0 {
            let host = String(cString: hostname)
            if !host.isEmpty && !results.contains(host) {
              results.append(host)
            }
          }
        }
      }
      cursor = interface.ifa_next
    }

    if results.isEmpty {
      results.append("127.0.0.1")
    }
    return results.map { "http://\($0):\(port)" }
  }
}
