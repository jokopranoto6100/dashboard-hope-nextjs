-- Create user_kpi_pins table for PIN functionality
CREATE TABLE user_kpi_pins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kpi_id TEXT NOT NULL,
  pin_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique pin per user per KPI
  UNIQUE(user_id, kpi_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_kpi_pins_user_id ON user_kpi_pins(user_id);
CREATE INDEX idx_user_kpi_pins_order ON user_kpi_pins(user_id, pin_order);

-- Enable RLS
ALTER TABLE user_kpi_pins ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own pins
CREATE POLICY "Users can manage their own pins" ON user_kpi_pins
  FOR ALL USING (auth.uid() = user_id);

-- Function: Get user pins
CREATE OR REPLACE FUNCTION get_user_kpi_pins(p_user_id UUID)
RETURNS TABLE(kpi_id TEXT, pin_order INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ukp.kpi_id, ukp.pin_order
  FROM user_kpi_pins ukp
  WHERE ukp.user_id = p_user_id
  ORDER BY ukp.pin_order ASC;
END;
$$;

-- Function: Toggle pin with smart ordering
CREATE OR REPLACE FUNCTION toggle_kpi_pin(
  p_user_id UUID,
  p_kpi_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pin_exists BOOLEAN;
  next_order INTEGER;
  pin_count INTEGER;
  result JSONB;
BEGIN
  -- Check if pin exists
  SELECT EXISTS(
    SELECT 1 FROM user_kpi_pins 
    WHERE user_id = p_user_id AND kpi_id = p_kpi_id
  ) INTO pin_exists;
  
  -- Get current pin count
  SELECT COUNT(*) INTO pin_count
  FROM user_kpi_pins 
  WHERE user_id = p_user_id;
  
  IF pin_exists THEN
    -- Remove pin
    DELETE FROM user_kpi_pins 
    WHERE user_id = p_user_id AND kpi_id = p_kpi_id;
    
    -- Reorder remaining pins
    WITH numbered_pins AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY pin_order) as new_order
      FROM user_kpi_pins 
      WHERE user_id = p_user_id
    )
    UPDATE user_kpi_pins 
    SET pin_order = numbered_pins.new_order,
        updated_at = NOW()
    FROM numbered_pins
    WHERE user_kpi_pins.id = numbered_pins.id;
    
    result := jsonb_build_object(
      'success', true,
      'action', 'unpinned',
      'kpi_id', p_kpi_id,
      'message', 'KPI berhasil di-unpin'
    );
  ELSE
    -- Check pin limit (max 3)
    IF pin_count >= 3 THEN
      result := jsonb_build_object(
        'success', false,
        'action', 'limit_reached',
        'message', 'Maksimal 3 KPI yang bisa di-pin'
      );
    ELSE
      -- Add pin
      SELECT COALESCE(MAX(pin_order), 0) + 1 INTO next_order
      FROM user_kpi_pins WHERE user_id = p_user_id;
      
      INSERT INTO user_kpi_pins (user_id, kpi_id, pin_order)
      VALUES (p_user_id, p_kpi_id, next_order);
      
      result := jsonb_build_object(
        'success', true,
        'action', 'pinned',
        'kpi_id', p_kpi_id,
        'pin_order', next_order,
        'message', 'KPI berhasil di-pin'
      );
    END IF;
  END IF;
  
  RETURN result;
END;
$$;

-- Function: Reorder pins (for future drag & drop)
CREATE OR REPLACE FUNCTION reorder_kpi_pins(
  p_user_id UUID,
  p_pin_orders JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pin_item JSONB;
BEGIN
  -- Update pin orders based on provided array
  FOR pin_item IN SELECT * FROM jsonb_array_elements(p_pin_orders)
  LOOP
    UPDATE user_kpi_pins 
    SET pin_order = (pin_item->>'order')::INTEGER,
        updated_at = NOW()
    WHERE user_id = p_user_id 
      AND kpi_id = pin_item->>'kpi_id';
  END LOOP;
  
  RETURN TRUE;
END;
$$;
