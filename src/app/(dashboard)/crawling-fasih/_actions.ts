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
  [key: string]: string | number | boolean | null;
}

interface SurveyPeriodData {
  id: string;
  name: string;
}

interface ProvinceData {
  fullCode: string;
  name: string;
  id: string;
}

interface DistrictData {
  fullCode: string;
  name: string;
  id: string;
}

interface AssignmentData {
  id: string;
  codeIdentity: string;
  [key: string]: string | number | boolean | null;
}

// Skema Zod (tidak berubah)
const getPeriodsSchema = z.object({
  surveyId: z.string().min(1, 'ID Survei wajib diisi'),
  cookie: z.string().min(1, 'Cookie wajib diisi'),
  xsrfToken: z.string().min(1, 'XSRF Token wajib diisi'),
});

// Note: crawlSchema extends getPeriodsSchema

// Template Request Body (tidak berubah)
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
  console.log('[ACTION] Memulai getInitialConfig...');
  const validatedFields = getPeriodsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    console.error('[ERROR] Input tidak valid:', validatedFields.error.flatten().fieldErrors);
    return { error: 'Input tidak valid.' };
  }
  
  const { surveyId, cookie, xsrfToken } = validatedFields.data;
  const kdprov = "61"; // Asumsi Kalbar
  const headers = { 'Cookie': cookie, 'X-XSRF-TOKEN': xsrfToken };

  try {
    // 1. Ambil Detail Survei (termasuk periode)
    const surveyUrl = `https://fasih-sm.bps.go.id/survey/api/v1/surveys/${surveyId}`;
    console.log(`[FETCH 1] Mencoba mengambil detail survei dari: ${surveyUrl}`);
    console.log(`[FETCH 1] Headers: Cookie-length=${cookie.length}, XSRF-TOKEN-length=${xsrfToken.length}`);
    const surveyResponse = await fetch(surveyUrl, { headers });
    console.log(`[FETCH 1] [STATUS] ${surveyResponse.status} ${surveyResponse.statusText}`);

    if (!surveyResponse.ok) {
        const errorText = await surveyResponse.text();
        console.error(`[FETCH 1] [ERROR] Gagal mengambil detail survei. Body:`, errorText);
        throw new Error(`Gagal mengambil detail survei (Status: ${surveyResponse.status})`);
    }
    const surveyData = await surveyResponse.json();
    console.log('[FETCH 1] [SUCCESS] Berhasil mendapatkan detail survei.');
    if (!surveyData.success) throw new Error('Respons detail survei tidak berhasil.');

    const periods: SurveyPeriod[] = surveyData.data?.surveyPeriods?.map((p: SurveyPeriodData) => ({ id: p.id, name: p.name })) || [];
    const regionGroupId = surveyData.data.regionGroupId;
    console.log(`[INFO] Ditemukan ${periods.length} periode. regionGroupId: ${regionGroupId}`);
    if (!regionGroupId) throw new Error('regionGroupId tidak ditemukan.');

    // 2. Ambil ID Provinsi
    const provUrl = `https://fasih-sm.bps.go.id/region/api/v1/region/level1?groupId=${regionGroupId}`;
    console.log(`[FETCH 2] Mencoba mengambil ID Provinsi dari: ${provUrl}`);
    const provResponse = await fetch(provUrl, { headers });
    console.log(`[FETCH 2] [STATUS] ${provResponse.status} ${provResponse.statusText}`);
    if (!provResponse.ok) throw new Error(`Gagal mengambil data provinsi (Status: ${provResponse.status})`);
    const provData = await provResponse.json();
    const province = provData.data.find((p: ProvinceData) => p.fullCode === kdprov);
    if (!province) throw new Error(`Provinsi dengan kode ${kdprov} tidak ditemukan.`);
    const provinceId = province.id;
    console.log(`[INFO] Ditemukan ID Provinsi untuk ${kdprov}: ${provinceId}`);
    
    // 3. Ambil Peta ID Kabupaten
    const kabUrl = `https://fasih-sm.bps.go.id/region/api/v1/region/level2?groupId=${regionGroupId}&level1FullCode=${kdprov}`;
    console.log(`[FETCH 3] Mencoba mengambil ID Kabupaten dari: ${kabUrl}`);
    const kabResponse = await fetch(kabUrl, { headers });
    console.log(`[FETCH 3] [STATUS] ${kabResponse.status} ${kabResponse.statusText}`);
    if (!kabResponse.ok) throw new Error(`Gagal mengambil data kabupaten (Status: ${kabResponse.status})`);
    const kabData = await kabResponse.json();
    const districtIdMap = kabData.data.reduce((acc: Record<string, string>, curr: DistrictData) => {
        acc[curr.fullCode] = curr.id;
        return acc;
    }, {});
    console.log(`[INFO] Ditemukan ${Object.keys(districtIdMap).length} pemetaan ID kabupaten.`);

    console.log('[SUCCESS] getInitialConfig selesai dengan sukses.');
    return { periods, provinceId, districtIdMap };
  } catch (error) {
    console.error('[FATAL] Terjadi kesalahan fatal di getInitialConfig:', error);
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
  console.log(`\n[ACTION] Memulai crawlSingleDistrict untuk wilayah: ${params.districtBpsCode}`);
  const headers = { 
    'Content-Type': 'application/json;charset=utf-8',
    'Cookie': auth.cookie,
    'X-XSRF-TOKEN': auth.xsrfToken,
  };

  try {
    const allAssignments: AssignmentData[] = [];
    let start = 0;
    const length = 1000;

    console.log('[INFO] Memulai loop pengambilan daftar assignment...');
    while (true) {
      const assignmentListUrl = "https://fasih-sm.bps.go.id/analytic/api/v2/assignment/datatable-all-user-survey-periode";
      const assignmentBody = JSON.parse(JSON.stringify(baseAssignmentRequestBody));
      assignmentBody.start = start;
      assignmentBody.length = length;
      assignmentBody.assignmentExtraParam.surveyPeriodId = params.surveyPeriodId;
      assignmentBody.assignmentExtraParam.region1Id = params.provinceId;
      assignmentBody.assignmentExtraParam.region2Id = params.districtId;
      
      console.log(`[FETCH-ASSIGNMENT] Mencoba mengambil batch assignment. Start: ${start}, Length: ${length}`);
      const listResponse = await fetch(assignmentListUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(assignmentBody),
      });
      console.log(`[FETCH-ASSIGNMENT] [STATUS] ${listResponse.status} ${listResponse.statusText}`);

      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.error(`[FETCH-ASSIGNMENT] [ERROR] Gagal. Body:`, errorText);
        throw new Error(`Gagal mengambil daftar assignment untuk wilayah ${params.districtBpsCode} (status: ${listResponse.status})`);
      }

      const listData = await listResponse.json();
      const assignmentsOnPage = listData.searchData || [];
      console.log(`[FETCH-ASSIGNMENT] [SUCCESS] Ditemukan ${assignmentsOnPage.length} assignment di halaman ini.`);
      allAssignments.push(...assignmentsOnPage);

      if (assignmentsOnPage.length < length) {
        console.log('[INFO] Mencapai halaman terakhir dari daftar assignment. Mengakhiri loop.');
        break;
      }
      start += length;
    }

    console.log(`[INFO] Total ${allAssignments.length} assignment ditemukan untuk wilayah ${params.districtBpsCode}. Memulai pengambilan detail...`);
    const districtCrawledData: FasihDataRow[] = [];
    for (const [index, assignment] of allAssignments.entries()) {
      const detailUrl = `https://fasih-sm.bps.go.id/assignment-general/api/assignment/get-by-id-with-data-for-scm?id=${assignment.id}`;
      // Log hanya untuk item pertama, terakhir, dan setiap item ke-50 untuk mengurangi noise
      if (index === 0 || index === allAssignments.length - 1 || (index + 1) % 50 === 0) {
        console.log(`[FETCH-DETAIL] Mengambil detail untuk assignment #${index + 1}/${allAssignments.length} (ID: ${assignment.id})`);
      }
      const detailResponse = await fetch(detailUrl, { headers });
      
      if (detailResponse.ok) {
        const detailDataRaw = await detailResponse.json();
        if (detailDataRaw.data && detailDataRaw.data.data) {
          const answers: { dataKey: string, answer: string | number | boolean | null }[] = JSON.parse(detailDataRaw.data.data).answers;
          const flatData = answers.reduce((acc, curr) => {
            acc[curr.dataKey] = curr.answer;
            return acc;
          }, {} as Record<string, string | number | boolean | null>) as FasihDataRow;
          flatData.id_assignment = assignment.id;
          flatData.code_identity = assignment.codeIdentity;
          districtCrawledData.push(flatData);
        }
      } else {
        console.warn(`[WARN] Gagal mengambil detail untuk assignment ID ${assignment.id}. Status: ${detailResponse.status}. Melanjutkan ke item berikutnya.`);
      }
    }
    console.log(`[SUCCESS] crawlSingleDistrict untuk wilayah ${params.districtBpsCode} selesai. Total data berhasil di-crawl: ${districtCrawledData.length}`);
    return { data: districtCrawledData };
  } catch (error) {
    console.error(`[FATAL] Terjadi kesalahan fatal di crawlSingleDistrict untuk wilayah ${params.districtBpsCode}:`, error);
    return { error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui' };
  }
}