import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

Font.register({
  family: "Helvetica",
  fonts: [],
})

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 56,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
    borderBottomStyle: "solid",
    paddingBottom: 20,
    marginBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  agencyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  certLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#9ca3af",
    marginBottom: 8,
    marginTop: 20,
  },
  metaRow: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 28,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    padding: "8 12",
    borderRadius: 4,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#6b7280",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    padding: "8 12",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    borderBottomStyle: "solid",
  },
  tableCell: {
    fontSize: 10,
    flex: 1,
  },
  tableCellFormat: {
    fontSize: 9,
    color: "#6b7280",
    width: 70,
  },
  tableCellStatus: {
    fontSize: 9,
    width: 60,
    textAlign: "right",
  },
  verified: {
    color: "#059669",
    fontFamily: "Helvetica-Bold",
  },
  pending: {
    color: "#9ca3af",
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    marginVertical: 28,
  },
  certIdBlock: {
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    padding: "12 16",
    marginBottom: 24,
  },
  certIdLabel: {
    fontSize: 8,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  certId: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    bottom: 36,
    left: 56,
    right: 56,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
})

export type CertificateData = {
  certificateId: string
  agencyName: string
  projectName: string
  clientName: string
  signedOffAt: string
  deliverables: Array<{
    title: string
    required_format: string | null
    is_verified: boolean
  }>
}

export function HnadoverCertificateDocument({ data }: { data: CertificateData }) {
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(data.signedOffAt))

  return (
    <Document title={`Handover Certificate — ${data.projectName}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.agencyName}>{data.agencyName}</Text>
          <Text style={styles.certLabel}>Handover Certificate</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{data.projectName}</Text>
        <Text style={styles.subtitle}>Project Handover — Certified Closing</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Client</Text>
            <Text style={styles.metaValue}>{data.clientName}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Agency</Text>
            <Text style={styles.metaValue}>{data.agencyName}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Date of Sign-off</Text>
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* Deliverables */}
        <Text style={styles.sectionLabel}>Deliverables</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Asset</Text>
          <Text style={[styles.tableHeaderText, { width: 70 }]}>Format</Text>
          <Text style={[styles.tableHeaderText, { width: 60, textAlign: "right" }]}>Status</Text>
        </View>
        {data.deliverables.map((d, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCell}>{d.title}</Text>
            <Text style={styles.tableCellFormat}>{d.required_format ?? "—"}</Text>
            <Text style={[styles.tableCellStatus, d.is_verified ? styles.verified : styles.pending]}>
              {d.is_verified ? "Verified" : "Pending"}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Certificate ID */}
        <View style={styles.certIdBlock}>
          <Text style={styles.certIdLabel}>Certificate ID</Text>
          <Text style={styles.certId}>{data.certificateId}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This certificate confirms that all listed assets were reviewed and signed off by {data.clientName}.
          </Text>
          <Text style={styles.footerText}>Generated by Ceal</Text>
        </View>
      </Page>
    </Document>
  )
}
