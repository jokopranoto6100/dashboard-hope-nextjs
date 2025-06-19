// src/app/(dashboard)/crawling-fasih/_actions.ts
'use server';

import { z } from 'zod';

// Tipe data untuk mempermudah (tidak berubah)
export interface SurveyPeriod {
  id: string;
  name: string;
}
export interface FasihDataRow {
  id_assignment: string;
  code_identity: string;
  [key: string]: any;
}

// Skema Zod (tidak berubah)
const getPeriodsSchema = z.object({
  surveyId: z.string().min(1, 'ID Survei wajib diisi'),
  cookie: z.string().min(1, 'Cookie wajib diisi'),
  xsrfToken: z.string().min(1, 'XSRF Token wajib diisi'),
});

const crawlSchema = getPeriodsSchema.extend({
  surveyPeriodId: z.string().min(1, 'Periode Survei harus dipilih'),
  kdprov: z.string().min(2, 'Kode Provinsi minimal 2 digit.'),
  kdkab: z.string().optional().transform(e => e === "" ? undefined : e),
});

// Template Request Body yang sudah divalidasi
const baseAssignmentRequestBody = {
    draw: 1,
    columns: [
        { data: "id", name: "", searchable: true, orderable: false, search: { value: "", regex: false } },
        { data: "codeIdentity", name: "", searchable: true, orderable: false, search: { value: "", regex: false } },
        { data: "data1", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
        { data: "data2", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
        { data: "data3", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
        { data: "data4", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
        { data: "data5", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
        { data: "data6", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
        { data: "data7", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
        { data: "data8", name: "", searchable: true, orderable: true, search: { value: "", regex: false } }
    ],
    order: [{ column: 0, dir: "asc" }],
    search: { value: "", regex: false },
    start: 0,
    length: 100,
    assignmentExtraParam: {
        region1Id: null, region2Id: null, region3Id: null, region4Id: null,
        region5Id: null, region6Id: null, region7Id: null, region8Id: null,
        region9Id: null, region10Id: null, surveyPeriodId: null,
        assignmentErrorStatusType: -1, assignmentStatusAlias: null,
        data1: null, data2: null, data3: null, data4: null, data5: null,
        data6: null, data7: null, data8: null, data9: null, data10: null,
        userIdResponsibility: null, currentUserId: null, regionId: null
    }
};


/**
 * Server Action #1: Mengambil Konfigurasi Awal (Periode & Wilayah)
 */
export async function getInitialConfig(formData: FormData): Promise<{
  periods?: SurveyPeriod[];
  provinceId?: string;
  districtIdMap?: { [key: string]: string };
  error?: string;
}> {
  const validatedFields = getPeriodsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { error: 'Input tidak valid.' };
  
  const { surveyId, cookie, xsrfToken } = validatedFields.data;
  const kdprov = "61"; // Asumsi Kalbar
  const headers = { 'Cookie': cookie, 'X-XSRF-TOKEN': xsrfToken };

  try {
    // 1. Ambil Detail Survei (termasuk periode)
    const surveyUrl = `https://fasih-sm.bps.go.id/survey/api/v1/surveys/${surveyId}`;
    const surveyResponse = await fetch(surveyUrl, { headers });
    if (!surveyResponse.ok) throw new Error(`Gagal mengambil detail survei (Status: ${surveyResponse.status})`);
    const surveyData = await surveyResponse.json();
    if (!surveyData.success) throw new Error('Respons detail survei tidak berhasil.');

    const periods: SurveyPeriod[] = surveyData.data?.surveyPeriods?.map((p: any) => ({ id: p.id, name: p.name })) || [];
    const regionGroupId = surveyData.data.regionGroupId;
    if (!regionGroupId) throw new Error('regionGroupId tidak ditemukan.');

    // 2. Ambil ID Provinsi
    const provUrl = `https://fasih-sm.bps.go.id/region/api/v1/region/level1?groupId=${regionGroupId}`;
    const provResponse = await fetch(provUrl, { headers });
    const provData = await provResponse.json();
    const province = provData.data.find((p: any) => p.fullCode === kdprov);
    if (!province) throw new Error(`Provinsi dengan kode ${kdprov} tidak ditemukan.`);
    const provinceId = province.id;
    
    // 3. Ambil Peta ID Kabupaten
    const kabUrl = `https://fasih-sm.bps.go.id/region/api/v1/region/level2?groupId=${regionGroupId}&level1FullCode=${kdprov}`;
    const kabResponse = await fetch(kabUrl, { headers });
    const kabData = await kabResponse.json();
    const districtIdMap = kabData.data.reduce((acc: any, curr: any) => {
        acc[curr.fullCode] = curr.id;
        return acc;
    }, {});

    return { periods, provinceId, districtIdMap };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Kesalahan tidak diketahui' };
  }
}


/**
 * Server Action #2: Melakukan crawling untuk SATU wilayah saja
 */
export async function crawlSingleDistrict(
  auth: { cookie: string; xsrfToken: string },
  params: {
    surveyPeriodId: string;
    provinceId: string;
    districtId: string;
    districtBpsCode: string;
  }
): Promise<{ data?: FasihDataRow[]; error?: string }> {
  const headers = { 
    'Content-Type': 'application/json;charset=utf-8',
    'Cookie': auth.cookie,
    'X-XSRF-TOKEN': auth.xsrfToken,
  };

  try {
    let allAssignments: any[] = [];
    let start = 0;
    const length = 1000; // Bisa diubah jika mau batch lebih kecil/besar

    while (true) {
      const assignmentListUrl = "https://fasih-sm.bps.go.id/analytic/api/v2/assignment/datatable-all-user-survey-periode";
      const assignmentBody = JSON.parse(JSON.stringify(baseAssignmentRequestBody));
      assignmentBody.start = start;
      assignmentBody.length = length;
      assignmentBody.assignmentExtraParam.surveyPeriodId = params.surveyPeriodId;
      assignmentBody.assignmentExtraParam.region1Id = params.provinceId;
      assignmentBody.assignmentExtraParam.region2Id = params.districtId;

      const listResponse = await fetch(assignmentListUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(assignmentBody),
      });

      if (!listResponse.ok)
        throw new Error(`Gagal mengambil daftar assignment untuk wilayah ${params.districtBpsCode} (status: ${listResponse.status})`);

      const listData = await listResponse.json();
      const assignmentsOnPage = listData.searchData || [];
      allAssignments.push(...assignmentsOnPage);

      if (assignmentsOnPage.length < length) {
        // Sudah sampai data terakhir
        break;
      }
      start += length;
    }

    const districtCrawledData: FasihDataRow[] = [];
    for (const assignment of allAssignments) {
      const detailUrl = `https://fasih-sm.bps.go.id/assignment-general/api/assignment/get-by-id-with-data-for-scm?id=${assignment.id}`;
      const detailResponse = await fetch(detailUrl, { headers });
      if (detailResponse.ok) {
        const detailDataRaw = await detailResponse.json();
        if (detailDataRaw.data && detailDataRaw.data.data) {
          const answers: { dataKey: string, answer: any }[] = JSON.parse(detailDataRaw.data.data).answers;
          const flatData: FasihDataRow = answers.reduce((acc, curr) => {
            acc[curr.dataKey] = curr.answer;
            return acc;
          }, {} as any);
          flatData.id_assignment = assignment.id;
          flatData.code_identity = assignment.codeIdentity;
          districtCrawledData.push(flatData);
        }
      }
    }
    return { data: districtCrawledData };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui' };
  }
}
