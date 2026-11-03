import Darwin
import Foundation
import Network
import React
import Security
import UIKit

@objc(LanTransfer)
class LanTransfer: NSObject, RCTBridgeModule, NetServiceBrowserDelegate, NetServiceDelegate {
  private struct Peer {
    let id: String
    let name: String
    let platform: String
    let nonce: String
    let host: String
    let port: Int
    let lastSeen: Double
  }

  private struct Envelope {
    let id: String
    let body: String
    let receivedAt: Double
  }

  private let queue = DispatchQueue(label: "com.pennyspring.lantransfer")
  private let stateLock = NSLock()
  private let serviceType = "_pennyspring._tcp."
  private let servicePrefix = "PennySpring-"
  private let peerTTL: Double = 15

  private var listener: NWListener?
  private var connections: [NWConnection] = []
  private var timeoutWorkItem: DispatchWorkItem?
  private var didResolveStart = false

  private var sessionId = ""
  private var sessionName = ""
  private var sessionNonce = ""
  private var sessionPort: UInt16 = 0

  private var peers: [String: Peer] = [:]
  private var messages: [Envelope] = []
  private var messageSequence = 0
  private var state = "idle"
  private var errorText = ""
  private var servedAt: Double = 0

  private var packageURL: URL?
  private var packageToken = ""

  private var browser: NetServiceBrowser?
  private var publishedService: NetService?
  private var resolvingServices: [String: NetService] = [:]

  static func moduleName() -> String! {
    "LanTransfer"
  }

  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc func startSession(
    _ timeoutMs: Double,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let timeout = min(max(timeoutMs / 1000, 60), 60 * 60)

    queue.async {
      self.stopInternal()
      self.sessionId = self.randomHex(8)
      self.sessionName = self.deviceName()
      self.sessionNonce = self.randomHex(16)
      self.didResolveStart = false
      self.setState("serving")

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
            self.sessionPort = port
            resolve([
              "id": self.sessionId,
              "name": self.sessionName,
              "platform": "ios",
              "nonce": self.sessionNonce,
              "host": self.localHost(),
              "port": Int(port),
              "urls": self.localAddresses(port: port),
            ])
            self.publishService(port: port)
            self.startBrowser()
            self.scheduleTimeout(seconds: timeout)
          case .failed(let error):
            if !self.didResolveStart {
              self.didResolveStart = true
              reject("E_START_SESSION", error.localizedDescription, error)
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
          reject("E_START_SESSION", error.localizedDescription, error)
        }
        self.setError(error.localizedDescription)
        self.stopListener()
      }
    }
  }

  @objc func stopSession(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    queue.async {
      self.stopInternal()
      resolve(nil)
    }
  }

  @objc func getNearby(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    let now = Date().timeIntervalSince1970 * 1000
    stateLock.lock()
    let snapshot = peers.values.filter { now - $0.lastSeen <= peerTTL * 1000 }
    stateLock.unlock()

    resolve(
      snapshot.map { peer in
        [
          "id": peer.id,
          "name": peer.name,
          "platform": peer.platform,
          "nonce": peer.nonce,
          "host": peer.host,
          "port": peer.port,
        ]
      }
    )
  }

  @objc func getMessages(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    stateLock.lock()
    let snapshot = messages
    stateLock.unlock()

    resolve(
      snapshot.map { message in
        [
          "id": message.id,
          "body": message.body,
          "receivedAt": message.receivedAt,
        ]
      }
    )
  }

  @objc func clearMessages(
    _ ids: [String],
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    let removing = Set(ids)
    stateLock.lock()
    messages.removeAll { removing.contains($0.id) }
    stateLock.unlock()
    resolve(nil)
  }

  @objc func setPackage(
    _ fileUri: String,
    fileName: String,
    token: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard !fileName.isEmpty else {
      reject("E_PACKAGE", "备份文件名不能为空", nil)
      return
    }

    let url: URL
    if fileUri.hasPrefix("file://"), let parsed = URL(string: fileUri) {
      url = parsed
    } else if fileUri.hasPrefix("/") {
      url = URL(fileURLWithPath: fileUri)
    } else {
      reject("E_PACKAGE", "待发送的备份文件路径不正确", nil)
      return
    }

    guard FileManager.default.fileExists(atPath: url.path) else {
      reject("E_PACKAGE", "待发送的备份文件不存在", nil)
      return
    }

    stateLock.lock()
    packageURL = url
    packageToken = token
    stateLock.unlock()
    resolve(nil)
  }

  @objc func getStatus(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
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

  @objc func randomToken(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    resolve(randomHex(16))
  }

  private func accept(_ connection: NWConnection) {
    guard getState() == "serving" else {
      connection.cancel()
      return
    }
    connections.append(connection)
    connection.start(queue: queue)
    receiveRequest(connection, accumulated: Data())
  }

  private func receiveRequest(_ connection: NWConnection, accumulated: Data) {
    connection.receive(minimumIncompleteLength: 1, maximumLength: 8192) {
      [weak self] data, _, isComplete, error in
      guard let self else { return }

      var buffer = accumulated
      if let data {
        buffer.append(data)
      }

      guard let headerRange = buffer.range(of: Data("\r\n\r\n".utf8)) else {
        if buffer.count > 8192 {
          self.sendText(connection, status: "431 Request Header Fields Too Large", message: "请求头过大")
          return
        }
        if isComplete || error != nil {
          self.close(connection)
          return
        }
        self.receiveRequest(connection, accumulated: buffer)
        return
      }

      let headerData = buffer.subdata(in: 0..<headerRange.lowerBound)
      let headerText = String(data: headerData, encoding: .isoLatin1) ?? ""
      let contentLength = self.contentLength(from: headerText)
      if contentLength > 64 * 1024 {
        self.sendText(connection, status: "413 Payload Too Large", message: "请求体过大")
        return
      }

      let bodyStart = headerRange.upperBound
      let body = buffer.subdata(in: bodyStart..<buffer.count)
      if body.count < contentLength {
        if isComplete || error != nil {
          self.close(connection)
          return
        }
        self.receiveRequest(connection, accumulated: buffer)
        return
      }

      self.handleRequest(
        connection,
        headerText: headerText,
        body: body.prefix(contentLength)
      )
    }
  }

  private func contentLength(from headerText: String) -> Int {
    for line in headerText.components(separatedBy: "\r\n") {
      let parts = line.split(separator: ":", maxSplits: 1)
      if parts.count == 2,
        parts[0].trimmingCharacters(in: .whitespaces).lowercased() == "content-length"
      {
        return Int(parts[1].trimmingCharacters(in: .whitespaces)) ?? 0
      }
    }
    return 0
  }

  private func handleRequest(
    _ connection: NWConnection,
    headerText: String,
    body: Data
  ) {
    guard let requestLine = headerText.components(separatedBy: "\r\n").first else {
      sendText(connection, status: "400 Bad Request", message: "请求格式不正确")
      return
    }

    let parts = requestLine.split(separator: " ")
    guard parts.count >= 2 else {
      sendText(connection, status: "400 Bad Request", message: "请求格式不正确")
      return
    }

    let method = String(parts[0]).uppercased()
    let target = String(parts[1])
    let targetParts = target.split(separator: "?", maxSplits: 1)
    let path = String(targetParts[0])

    if method == "OPTIONS" {
      sendText(connection, status: "204 No Content", message: "")
      return
    }

    if method == "GET", path == "/health" {
      sendJSON(
        connection, status: "200 OK",
        object: [
          "id": sessionId,
          "name": sessionName,
          "platform": "ios",
          "nonce": sessionNonce,
          "port": Int(sessionPort),
        ])
      return
    }

    if method == "POST", path == "/message" {
      guard let text = String(data: body, encoding: .utf8), !text.isEmpty else {
        sendText(connection, status: "400 Bad Request", message: "消息不能为空")
        return
      }

      stateLock.lock()
      if messages.count >= 100 {
        stateLock.unlock()
        sendText(connection, status: "503 Service Unavailable", message: "消息队列已满")
        return
      }
      messageSequence += 1
      let message = Envelope(
        id: "m-\(messageSequence)-\(Int(Date().timeIntervalSince1970 * 1000))",
        body: text,
        receivedAt: Date().timeIntervalSince1970 * 1000
      )
      messages.append(message)
      stateLock.unlock()

      sendJSON(connection, status: "200 OK", object: ["ok": true])
      return
    }

    if method == "GET", path == "/package" {
      servePackage(connection, target: target)
      return
    }

    sendText(connection, status: "404 Not Found", message: "未找到传输内容")
  }

  private func servePackage(_ connection: NWConnection, target: String) {
    let query = target.split(separator: "?", maxSplits: 1).dropFirst().first.map(String.init) ?? ""
    let token =
      query
      .split(separator: "&")
      .first(where: { $0.hasPrefix("token=") })
      .map { String($0.dropFirst("token=".count)) }
      .flatMap { $0.removingPercentEncoding }

    stateLock.lock()
    let currentToken = packageToken
    let currentURL = packageURL
    stateLock.unlock()

    guard let token, !token.isEmpty, token == currentToken else {
      sendText(connection, status: "403 Forbidden", message: "传输会话已失效")
      return
    }

    guard let currentURL else {
      sendText(connection, status: "404 Not Found", message: "没有待发送的文件")
      return
    }

    sendFile(connection, fileURL: currentURL)
  }

  private func sendFile(_ connection: NWConnection, fileURL: URL) {
    let attributes = try? FileManager.default.attributesOfItem(atPath: fileURL.path)
    let length = (attributes?[.size] as? NSNumber)?.int64Value ?? 0
    guard let handle = try? FileHandle(forReadingFrom: fileURL) else {
      sendText(connection, status: "500 Internal Server Error", message: "无法读取待发送文件")
      return
    }

    let headers = [
      "HTTP/1.1 200 OK",
      "Content-Type: application/zip",
      "Content-Length: \(length)",
      "Content-Disposition: attachment; filename=\"pennyspring-backup.psb\"",
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

  private func sendJSON(
    _ connection: NWConnection,
    status: String,
    object: [String: Any]
  ) {
    guard
      let data = try? JSONSerialization.data(withJSONObject: object),
      let text = String(data: data, encoding: .utf8)
    else {
      sendText(connection, status: "500 Internal Server Error", message: "响应生成失败")
      return
    }

    let headers = [
      "HTTP/1.1 \(status)",
      "Content-Type: application/json; charset=utf-8",
      "Content-Length: \(data.count)",
      "Connection: close",
      "",
      "",
    ].joined(separator: "\r\n")

    connection.send(
      content: headers.data(using: .isoLatin1),
      completion: .contentProcessed { [weak self] _ in
        connection.send(
          content: data,
          contentContext: .defaultMessage,
          isComplete: true,
          completion: .contentProcessed { _ in
            self?.close(connection)
          }
        )
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
        connection.send(
          content: body,
          contentContext: .defaultMessage,
          isComplete: true,
          completion: .contentProcessed { _ in
            self?.close(connection)
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
      if self.getState() == "serving" {
        self.setError("局域网会话已超时")
        self.stopListener()
      }
    }
    timeoutWorkItem = workItem
    queue.asyncAfter(deadline: .now() + seconds, execute: workItem)
  }

  private func markServed() {
    stateLock.lock()
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
    messages.removeAll()
    peers.removeAll()
    packageURL = nil
    packageToken = ""
    messageSequence = 0
    stateLock.unlock()

    DispatchQueue.main.async {
      self.browser?.stop()
      self.browser = nil
      self.publishedService?.stop()
      self.publishedService = nil
      self.resolvingServices.removeAll()
    }
  }

  private func publishService(port: UInt16) {
    DispatchQueue.main.async {
      let service = NetService(
        domain: "local.",
        type: self.serviceType,
        name: "\(self.servicePrefix)\(self.sessionId)",
        port: Int32(port)
      )
      let txt: [String: Data] = [
        "id": Data(self.sessionId.utf8),
        "name": Data(self.sessionName.utf8),
        "platform": Data("ios".utf8),
        "nonce": Data(self.sessionNonce.utf8),
      ]
      service.setTXTRecord(NetService.data(fromTXTRecord: txt))
      service.delegate = self
      service.publish()
      self.publishedService = service
    }
  }

  private func startBrowser() {
    DispatchQueue.main.async {
      let browser = NetServiceBrowser()
      browser.delegate = self
      self.browser = browser
      browser.searchForServices(ofType: self.serviceType, inDomain: "local.")
    }
  }

  func netServiceBrowser(
    _ browser: NetServiceBrowser,
    didFind service: NetService,
    moreComing _: Bool
  ) {
    guard service.name.hasPrefix(servicePrefix) else { return }
    service.delegate = self
    resolvingServices[service.name] = service
    service.resolve(withTimeout: 4)
  }

  func netServiceBrowser(
    _ browser: NetServiceBrowser,
    didRemove service: NetService,
    moreComing _: Bool
  ) {
    let id = service.name.replacingOccurrences(of: servicePrefix, with: "")
    resolvingServices.removeValue(forKey: service.name)
    stateLock.lock()
    peers.removeValue(forKey: id)
    stateLock.unlock()
  }

  func netServiceDidResolveAddress(_ sender: NetService) {
    defer { resolvingServices.removeValue(forKey: sender.name) }
    guard getState() == "serving" else { return }

    let id = sender.name.replacingOccurrences(of: servicePrefix, with: "")
    guard id != sessionId, sender.port > 0 else { return }
    guard let address = ipv4Address(from: sender.addresses) else { return }

    var txt: [String: String] = [:]
    if let data = sender.txtRecordData() {
      let dictionary = NetService.dictionary(fromTXTRecord: data)
      for (key, value) in dictionary {
        if let text = String(data: value, encoding: .utf8) {
          txt[key] = text
        }
      }
    }

    let nonce = txt["nonce"] ?? ""
    guard !nonce.isEmpty else { return }

    let peer = Peer(
      id: id,
      name: txt["name"] ?? "附近设备",
      platform: txt["platform"] ?? "ios",
      nonce: nonce,
      host: address,
      port: sender.port,
      lastSeen: Date().timeIntervalSince1970 * 1000
    )

    stateLock.lock()
    peers[id] = peer
    stateLock.unlock()
  }

  func netService(_ sender: NetService, didNotResolve errorDict: [String: NSNumber]) {
    resolvingServices.removeValue(forKey: sender.name)
  }

  private func ipv4Address(from addresses: [Data]?) -> String? {
    guard let addresses else { return nil }

    for data in addresses {
      var host = [CChar](repeating: 0, count: Int(NI_MAXHOST))
      let result = data.withUnsafeBytes { (raw: UnsafeRawBufferPointer) -> Int32 in
        guard let base = raw.baseAddress else { return -1 }
        let sockaddrPointer = base.assumingMemoryBound(to: sockaddr.self)
        guard sockaddrPointer.pointee.sa_family == UInt8(AF_INET) else {
          return -1
        }
        let length = socklen_t(sockaddrPointer.pointee.sa_len)
        return getnameinfo(
          sockaddrPointer,
          length,
          &host,
          socklen_t(host.count),
          nil,
          0,
          NI_NUMERICHOST
        )
      }
      if result == 0 {
        let address = String(cString: host)
        if !address.isEmpty {
          return address
        }
      }
    }
    return nil
  }

  private func deviceName() -> String {
    let name = UIDevice.current.name.trimmingCharacters(in: .whitespacesAndNewlines)
    return name.isEmpty ? "iPhone" : name
  }

  private func randomHex(_ byteCount: Int) -> String {
    var bytes = [UInt8](repeating: 0, count: byteCount)
    let status = bytes.withUnsafeMutableBytes { buffer in
      SecRandomCopyBytes(kSecRandomDefault, byteCount, buffer.baseAddress!)
    }
    if status != errSecSuccess {
      for index in 0..<byteCount {
        bytes[index] = UInt8.random(in: 0...255)
      }
    }
    return bytes.map { String(format: "%02x", $0) }.joined()
  }

  private func localHost() -> String {
    localAddresses(port: sessionPort).first?
      .replacingOccurrences(of: "http://", with: "")
      .components(separatedBy: ":")
      .first ?? "127.0.0.1"
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
