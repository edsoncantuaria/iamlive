import WidgetKit
import SwiftUI

private let appGroupId = "group.com.estouvivo.mobile"
private let snapshotKey = "widget_snapshot"

struct Snapshot: Decodable {
  let title: String
  let subtitle: String
  let line1: String
  let accent: String
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> SimpleEntry {
    SimpleEntry(date: Date(), title: "Estou Vivo!", line1: "00d 00h 00m", subtitle: "Próximo limite")
  }

  func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
    completion(loadEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    let entry = loadEntry()
    let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date().addingTimeInterval(900)
    let timeline = Timeline(entries: [entry], policy: .after(next))
    completion(timeline)
  }

  private func loadEntry() -> SimpleEntry {
    guard let defaults = UserDefaults(suiteName: appGroupId),
          let json = defaults.string(forKey: snapshotKey),
          let data = json.data(using: .utf8),
          let snap = try? JSONDecoder().decode(Snapshot.self, from: data) else {
      return SimpleEntry(date: Date(), title: "Estou Vivo!", line1: "—", subtitle: "Abra o app")
    }
    return SimpleEntry(
      date: Date(),
      title: snap.title,
      line1: snap.line1,
      subtitle: snap.subtitle
    )
  }
}

struct SimpleEntry: TimelineEntry {
  let date: Date
  let title: String
  let line1: String
  let subtitle: String
}

struct EstouVivoWidgetEntryView: View {
  var entry: Provider.Entry

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(entry.title)
        .font(.caption)
        .foregroundColor(.secondary)
      Text(entry.line1)
        .font(.system(.title2, design: .rounded))
        .fontWeight(.bold)
        .foregroundColor(.primary)
      Text(entry.subtitle)
        .font(.caption2)
        .foregroundColor(.secondary)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .padding()
    .background(Color(red: 0.98, green: 0.97, blue: 0.99))
  }
}

struct EstouVivoWidget: Widget {
  let kind: String = "EstouVivoWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      EstouVivoWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Estou Vivo!")
    .description("Contagem até o próximo check-in.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct EstouVivoWidgetBundle: WidgetBundle {
  var body: some Widget {
    EstouVivoWidget()
  }
}
