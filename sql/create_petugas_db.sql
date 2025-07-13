-- Create petugas_db table
CREATE TABLE public.petugas_db (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  nama_petugas TEXT NOT NULL,
  email_petugas TEXT NOT NULL,
  satker_id TEXT NOT NULL, -- Link ke kabupaten (kdkab)
  jabatan TEXT NULL,
  no_hp TEXT NULL,
  status TEXT NOT NULL DEFAULT 'aktif', -- aktif/non-aktif
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT petugas_db_pkey PRIMARY KEY (id),
  CONSTRAINT petugas_db_email_satker_unique UNIQUE (email_petugas, satker_id)
);

-- Create index for faster queries
CREATE INDEX idx_petugas_db_satker_id ON public.petugas_db(satker_id);
CREATE INDEX idx_petugas_db_status ON public.petugas_db(status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_petugas_db_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_petugas_db_updated_at_trigger
    BEFORE UPDATE ON public.petugas_db
    FOR EACH ROW
    EXECUTE FUNCTION update_petugas_db_updated_at();

-- Insert some sample data (optional)
-- INSERT INTO public.petugas_db (nama_petugas, email_petugas, satker_id, jabatan) VALUES
-- ('Ahmad Fauzi', 'ahmad.fauzi@bps.go.id', '6104', 'Statistisi Ahli Muda'),
-- ('Siti Nurhaliza', 'siti.nurhaliza@bps.go.id', '6104', 'Statistisi Terampil'),
-- ('Budi Santoso', 'budi.santoso@bps.go.id', '6171', 'Statistisi Ahli Muda');
