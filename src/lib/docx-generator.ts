import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    VerticalAlign,
    ShadingType,
    Header,
    ImageRun,
  } from "docx";
  import { saveAs } from "file-saver";
  
  // Fungsi format wilayah
  const formatWilayah = (nama: string): string => {
    const namaUpper = nama.trim().toUpperCase();
    return (namaUpper === "PONTIANAK" || namaUpper === "SINGKAWANG")
      ? `KOTA ${namaUpper}`
      : `KABUPATEN ${namaUpper}`;
  };
  
  const toProperCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  interface SegmenInfo {
    id_segmen: string;
    subsegmen: string;
    nama_kecamatan: string | null;
  }
  
  interface GeneratorData {
    nama_pencacah: string | null;
    nama_provinsi: string | null;
    nama_kabupaten: string | null;
    nama_kepala_bps: string | null;
    nip_kepala_bps: string | null;
    listSegmen: SegmenInfo[];
    alasan: string;
    nama_pengawas: string;
    nip_pengawas: string;
    bulan: string;
    tahun: number;
  }
  
  export const generateBeritaAcaraDocx = async (data: GeneratorData) => {
    const kabupatenNameOnly = data.nama_kabupaten?.split("] ")[1] ?? data.nama_kabupaten ?? "";
    const wilayahFormatted = formatWilayah(kabupatenNameOnly);
    const provinsiFormatted = data.nama_provinsi ?? "-";
    const kabupatenFormatted = data.nama_kabupaten ?? "-";
  
    const noBorder = {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    };
  
    let logoBuffer: ArrayBuffer | undefined;
    try {
      const response = await fetch("/logo-bps.png");
      if (!response.ok) throw new Error("Logo tidak ditemukan");
      logoBuffer = await response.arrayBuffer();
    } catch (error) {
      console.error("Gagal memuat logo BPS:", error);
    }
  
    const segmenTableRows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Kecamatan", bold: true })] })],
            shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "ID Segmen", bold: true })] })],
            shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Subsegmen", bold: true })] })],
            shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
      ...data.listSegmen.map(
        (segmen) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(segmen.nama_kecamatan ?? "-")], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph(segmen.id_segmen)], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph(segmen.subsegmen)], verticalAlign: VerticalAlign.CENTER }),
            ],
          })
      ),
    ];
  
    const doc = new Document({
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  columnWidths: [1000, 7500],
                  borders: noBorder,
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: logoBuffer
                            ? [
                                new Paragraph({
                                  children: [
                                    new ImageRun({
                                      data: logoBuffer,
                                      transformation: { width: 75, height: 50 },
                                      type: "png",
                                    }),
                                  ],
                                  alignment: AlignmentType.CENTER,
                                }),
                              ]
                            : [new Paragraph("")],
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "BADAN PUSAT STATISTIK",
                                  bold: true,
                                  italics: true,
                                  font: "Arial",
                                  size: 24,
                                }),
                              ],
                            }),
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: wilayahFormatted,
                                  bold: true,
                                  italics: true,
                                  font: "Arial",
                                  size: 24,
                                }),
                              ],
                            }),
                          ],
                          verticalAlign: VerticalAlign.CENTER,
                        }),
                      ],
                    }),
                  ],
                }),
                new Paragraph({
                  border: {
                    bottom: { color: "000000", space: 1, style: "single", size: 6 },
                  },
                }),
              ],
            }),
          },
          properties: {},
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "BERITA ACARA", bold: true, underline: {}, size: 28 })],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `\tBerikut kami sampaikan daftar sampel segmen KSA (Padi) pada bulan ${data.bulan} ${data.tahun} yang tidak dapat dilakukan pengamatan dengan identitas sebagai berikut:`,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: noBorder,
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ width: { size: "20%", type: WidthType.PERCENTAGE }, children: [new Paragraph("Provinsi")] }),
                    new TableCell({ children: [new Paragraph(`: ${provinsiFormatted}`)] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Kabupaten/Kota")] }),
                    new TableCell({ children: [new Paragraph(`: ${kabupatenFormatted}`)] }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "Dengan rincian segmen sebagai berikut:" }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              columnWidths: [4000, 3000, 2000],
              rows: segmenTableRows,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `\tPengamatan tidak dapat dilakukan sampai hari terakhir masa pendataan KSA bulan ${data.bulan} ${data.tahun} dengan alasan ${data.alasan}.`,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "\tDemikian Berita Acara ini dibuat dengan sebenarnya." })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
  
            // Tanda tangan
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              columnWidths: [45, 10, 45],
              borders: noBorder,
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [] }),
                    new TableCell({ children: [] }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          text: `${toProperCase(kabupatenNameOnly || "Pontianak")}, ${new Date().toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}`,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, text: "Pengawas" })] }),
                    new TableCell({ children: [] }),
                    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, text: "Pencacah" })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(""), new Paragraph(""), new Paragraph("")] }),
                    new TableCell({ children: [] }),
                    new TableCell({ children: [new Paragraph(""), new Paragraph(""), new Paragraph("")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ text: `(${toProperCase(data.nama_pengawas)})`, bold: true, underline: {} })
                          ],
                        }),
                      ],
                    }),
                    new TableCell({ children: [] }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ text: `(${toProperCase(data.nama_pencacah || '')})`, bold: true, underline: {} })
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                // NIP hanya untuk pengawas
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          text: `NIP. ${data.nip_pengawas || "....................."}`,
                        }),
                      ],
                    }),
                    new TableCell({ children: [] }),
                    new TableCell({ children: [] }), // Kosong, tidak ada NIP petugas
                  ],
                }),
                // Kosong pemisah
                new TableRow({ children: [new TableCell({ children: [new Paragraph("")] }), new TableCell({ children: [] }), new TableCell({ children: [] })] }),
                // Kepala BPS
                new TableRow({
                  children: [
                    new TableCell({ children: [] }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, text: "Kepala Badan Pusat Statistik" }),
                        new Paragraph({ alignment: AlignmentType.CENTER, text: `Kabupaten ${toProperCase(kabupatenNameOnly)}` }),
                      ],
                    }),
                    new TableCell({ children: [] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(""), new Paragraph(""), new Paragraph("")] }),
                    new TableCell({ children: [] }),
                    new TableCell({ children: [new Paragraph(""), new Paragraph(""), new Paragraph("")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [] }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ text: `(${data.nama_kepala_bps || ""})`, bold: true, underline: {} })],
                        }),
                      ],
                    }),
                    new TableCell({ children: [] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [] }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          text: `NIP. ${data.nip_kepala_bps || ""}`,
                        }),
                      ],
                    }),
                    new TableCell({ children: [] }),
                  ],
                }),
              ],
              
            }),
          ],
        },
      ],
    });
  
    const blob = await Packer.toBlob(doc);
    console.log("Dokumen Word berhasil dibuat.");
    saveAs(blob, `BA_Nonrespon_${data.nama_pencacah?.replace(/\s+/g, "_")}_${data.bulan}_${data.tahun}.docx`);
  };
  