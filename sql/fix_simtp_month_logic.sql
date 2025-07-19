-- Fix SIMTP month logic: change from upload month to data month
-- This script corrects the month field to represent data period instead of upload period

-- Update monthly data (STP_BULANAN)
-- For July uploads (month=7), change to June data (month=6)
UPDATE simtp_uploads 
SET month = CASE 
    WHEN month = 1 THEN 12    -- January upload = December data of previous year
    ELSE month - 1            -- Other months = previous month data
    END,
    year = CASE 
    WHEN month = 1 THEN year - 1  -- January upload = previous year for December data
    ELSE year                     -- Other months = same year
    END
WHERE file_type = 'STP_BULANAN'
  AND year = 2025 
  AND month = 7;  -- Update July uploads to June data

-- Verify the changes
SELECT 
    kabupaten_kode,
    file_type,
    year,
    month,
    file_name,
    uploaded_at
FROM simtp_uploads 
WHERE file_type = 'STP_BULANAN' 
  AND year = 2025 
ORDER BY kabupaten_kode, month;
