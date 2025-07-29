# Fitur PIN Manual untuk KPI Homepage - Technical Analysis & Implementation

## 🎯 **Overview Fitur PIN**

Fitur PIN memungkinkan user untuk "menyematkan" kegiatan tertentu di bagian atas dashboard secara manual, menimpa sorting berdasarkan persentase yang sudah ada.

## 🔧 **Technical Architecture**

### **1. Data Storage Strategy**

#### **Option A: Server-Side Storage (Recommended)**
```typescript
// Database Table: user_kpi_pins
interface UserKpiPin {
  id: string;
  user_id: string;  // FK to auth.users
  kpi_id: string;   // 'padi', 'palawija', 'ksa', etc
  pin_order: number; // Order of pinned items (1 = highest)
  created_at: timestamp;
  updated_at: timestamp;
}
```

**Advantages:**
- ✅ Sync across all devices
- ✅ Persistent data
- ✅ Admin visibility & management
- ✅ Backup & recovery

#### **Option B: Local Storage**
```typescript
// localStorage: user-kpi-pins
interface LocalKpiPins {
  userId: string;
  pins: Array<{
    kpiId: string;
    order: number;
    pinnedAt: timestamp;
  }>;
}
```

**Advantages:**
- ✅ No server calls
- ✅ Instant response
- ❌ No cross-device sync
- ❌ Lost on cache clear

### **2. User Permission Levels**

#### **Individual User Pins (Recommended)**
```typescript
// Each user has their own pins
const userPins = await getUserKpiPins(userId);
```

**Pros:**
- ✅ Personal workspace customization
- ✅ No conflicts between users
- ✅ Individual workflow optimization

#### **Role-Based Pins**
```typescript
// Pins based on user role
const rolePins = await getRoleKpiPins(userRole);
```

**Pros:**
- ✅ Consistent experience per role
- ✅ Admin can set priorities
- ❌ Less personal customization

### **3. Sorting Logic Enhancement**

#### **Current Logic**
```typescript
const sortedKpiCards = React.useMemo(() => {
  return kpiCards.sort((a, b) => {
    const aValue = a.percentage ?? 101;
    const bValue = b.percentage ?? 101;
    return aValue - bValue; // Ascending by percentage
  });
}, [dependencies]);
```

#### **Enhanced Logic with PIN**
```typescript
const sortedKpiCards = React.useMemo(() => {
  const pinnedItems = kpiCards.filter(card => 
    userPins.some(pin => pin.kpiId === card.id)
  ).sort((a, b) => {
    const aPinOrder = userPins.find(pin => pin.kpiId === a.id)?.order ?? 999;
    const bPinOrder = userPins.find(pin => pin.kpiId === b.id)?.order ?? 999;
    return aPinOrder - bPinOrder;
  });
  
  const unpinnedItems = kpiCards.filter(card => 
    !userPins.some(pin => pin.kpiId === card.id)
  ).sort((a, b) => {
    const aValue = a.percentage ?? 101;
    const bValue = b.percentage ?? 101;
    return aValue - bValue;
  });
  
  return [...pinnedItems, ...unpinnedItems];
}, [kpiCards, userPins]);
```

## 🎨 **UI/UX Implementation**

### **1. PIN Button Component**
```typescript
interface PinButtonProps {
  kpiId: string;
  isPinned: boolean;
  onTogglePin: (kpiId: string) => void;
  disabled?: boolean;
}

const PinButton: React.FC<PinButtonProps> = ({ 
  kpiId, 
  isPinned, 
  onTogglePin,
  disabled 
}) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => onTogglePin(kpiId)}
    disabled={disabled}
    className={cn(
      "h-8 w-8 transition-all duration-200",
      isPinned 
        ? "text-amber-500 hover:text-amber-600" 
        : "text-muted-foreground hover:text-foreground"
    )}
    title={isPinned ? "Unpin dari atas" : "Pin ke atas"}
  >
    <Pin className={cn("h-4 w-4", isPinned && "fill-current")} />
  </Button>
);
```

### **2. Card Header Enhancement**
```typescript
// Update existing card components
const PadiSummaryCard = ({ ..., onTogglePin, isPinned }) => (
  <Card className={cn("...", isPinned && "ring-2 ring-amber-500/20")}>
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Existing header content */}
        {isPinned && (
          <Badge variant="secondary" className="text-xs">
            <Pin className="h-3 w-3 mr-1 fill-amber-500" />
            Pinned
          </Badge>
        )}
      </div>
      <PinButton 
        kpiId="padi"
        isPinned={isPinned}
        onTogglePin={onTogglePin}
      />
    </CardHeader>
    {/* Rest of card */}
  </Card>
);
```

## 💾 **Database Implementation**

### **1. Supabase Table Schema**
```sql
-- Create user_kpi_pins table
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

-- Create index for performance
CREATE INDEX idx_user_kpi_pins_user_id ON user_kpi_pins(user_id);
CREATE INDEX idx_user_kpi_pins_order ON user_kpi_pins(user_id, pin_order);

-- RLS Policies
ALTER TABLE user_kpi_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pins" ON user_kpi_pins
  FOR ALL USING (auth.uid() = user_id);
```

### **2. Supabase Functions**
```sql
-- Get user pins
CREATE OR REPLACE FUNCTION get_user_kpi_pins(p_user_id UUID)
RETURNS TABLE(kpi_id TEXT, pin_order INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT ukp.kpi_id, ukp.pin_order
  FROM user_kpi_pins ukp
  WHERE ukp.user_id = p_user_id
  ORDER BY ukp.pin_order ASC;
END;
$$;

-- Toggle pin
CREATE OR REPLACE FUNCTION toggle_kpi_pin(
  p_user_id UUID,
  p_kpi_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  pin_exists BOOLEAN;
  next_order INTEGER;
BEGIN
  -- Check if pin exists
  SELECT EXISTS(
    SELECT 1 FROM user_kpi_pins 
    WHERE user_id = p_user_id AND kpi_id = p_kpi_id
  ) INTO pin_exists;
  
  IF pin_exists THEN
    -- Remove pin
    DELETE FROM user_kpi_pins 
    WHERE user_id = p_user_id AND kpi_id = p_kpi_id;
    
    -- Reorder remaining pins
    UPDATE user_kpi_pins 
    SET pin_order = ROW_NUMBER() OVER (ORDER BY pin_order)
    WHERE user_id = p_user_id;
    
    RETURN FALSE;
  ELSE
    -- Add pin
    SELECT COALESCE(MAX(pin_order), 0) + 1 INTO next_order
    FROM user_kpi_pins WHERE user_id = p_user_id;
    
    INSERT INTO user_kpi_pins (user_id, kpi_id, pin_order)
    VALUES (p_user_id, p_kpi_id, next_order);
    
    RETURN TRUE;
  END IF;
END;
$$;
```

## 🔄 **React Hooks Implementation**

### **1. Custom Hook for PIN Management**
```typescript
// hooks/useKpiPins.ts
export function useKpiPins() {
  const { userData } = useAuth();
  const [pins, setPins] = useState<UserKpiPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user pins
  const fetchPins = useCallback(async () => {
    if (!userData?.id) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_kpi_pins', { p_user_id: userData.id });
      
      if (error) throw error;
      setPins(data || []);
    } catch (error) {
      console.error('Error fetching pins:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData?.id]);

  // Toggle pin
  const togglePin = useCallback(async (kpiId: string) => {
    if (!userData?.id) return;
    
    try {
      const { data, error } = await supabase
        .rpc('toggle_kpi_pin', { 
          p_user_id: userData.id, 
          p_kpi_id: kpiId 
        });
      
      if (error) throw error;
      
      // Refresh pins
      await fetchPins();
      
      return data; // Boolean indicating if pinned or unpinned
    } catch (error) {
      console.error('Error toggling pin:', error);
      throw error;
    }
  }, [userData?.id, fetchPins]);

  // Check if KPI is pinned
  const isPinned = useCallback((kpiId: string) => {
    return pins.some(pin => pin.kpi_id === kpiId);
  }, [pins]);

  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  return {
    pins,
    isLoading,
    togglePin,
    isPinned,
    refetch: fetchPins
  };
}
```

### **2. Enhanced Homepage Implementation**
```typescript
// app/(dashboard)/page.tsx
export default function Homepage() {
  // Existing hooks...
  const { pins, togglePin, isPinned, isLoading: pinsLoading } = useKpiPins();

  // Enhanced sorting with pins
  const sortedKpiCards = React.useMemo(() => {
    if (pinsLoading) return []; // Wait for pins to load
    
    const kpiCards = [
      { id: 'padi', percentage: padiTotals?.persentase },
      { id: 'palawija', percentage: palawijaTotals?.persentase },
      // ... other cards
    ];
    
    // Separate pinned and unpinned
    const pinnedCards = kpiCards.filter(card => isPinned(card.id));
    const unpinnedCards = kpiCards.filter(card => !isPinned(card.id));
    
    // Sort pinned by pin order
    pinnedCards.sort((a, b) => {
      const aPinOrder = pins.find(pin => pin.kpi_id === a.id)?.pin_order ?? 999;
      const bPinOrder = pins.find(pin => pin.kpi_id === b.id)?.pin_order ?? 999;
      return aPinOrder - bPinOrder;
    });
    
    // Sort unpinned by percentage (existing logic)
    unpinnedCards.sort((a, b) => {
      const aValue = a.percentage ?? 101;
      const bValue = b.percentage ?? 101;
      return aValue - bValue;
    });
    
    return [...pinnedCards, ...unpinnedCards];
  }, [pins, isPinned, pinsLoading, padiTotals, /* other dependencies */]);

  // Handle pin toggle with optimistic updates
  const handleTogglePin = useCallback(async (kpiId: string) => {
    try {
      await togglePin(kpiId);
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  }, [togglePin]);

  // Rest of component...
}
```

## 🎨 **Enhanced Card Components**

### **1. Update Card Props Interface**
```typescript
interface SummaryCardProps {
  // Existing props...
  isPinned?: boolean;
  onTogglePin?: (kpiId: string) => void;
  pinDisabled?: boolean;
}
```

### **2. Visual Indicators**
```typescript
// Enhanced card styling
const cardClassName = cn(
  "transition-all duration-200",
  isPinned && [
    "ring-2 ring-amber-500/20",
    "shadow-amber-500/10 shadow-lg",
    "border-amber-500/30"
  ]
);
```

## 🚀 **Implementation Phases**

### **Phase 1: Core Infrastructure**
1. ✅ Create database table & functions
2. ✅ Implement useKpiPins hook
3. ✅ Basic toggle functionality

### **Phase 2: UI Enhancement**
1. ✅ Add PIN buttons to cards
2. ✅ Visual indicators for pinned items
3. ✅ Sorting logic integration

### **Phase 3: UX Polish**
1. ✅ Drag & drop reordering
2. ✅ Animations & transitions
3. ✅ Toast notifications
4. ✅ Loading states

### **Phase 4: Advanced Features**
1. ✅ Pin limits (max 3 pinned items)
2. ✅ Bulk pin operations
3. ✅ Pin sharing between team members
4. ✅ Analytics on pin usage

## 📊 **User Experience Flow**

### **1. Default State**
- Cards sorted by percentage (current behavior)
- PIN icon visible on hover
- No visual distinction

### **2. Pinned State**
- Pinned cards at top with visual indicators
- Badge showing "Pinned" status
- Subtle ring/shadow highlighting
- PIN icon filled/colored

### **3. Interaction Flow**
```
User hovers card → PIN button appears
User clicks PIN → Optimistic update
Server responds → Confirm/revert
Cards reorder → Smooth animation
```

## 🎯 **Recommended Implementation**

**Storage**: Server-side (Supabase) for cross-device sync  
**Permissions**: Individual user pins  
**UI**: Subtle indicators with hover interactions  
**Limits**: Max 3 pinned items  
**Animation**: Smooth reordering transitions  

This approach provides excellent UX while maintaining performance and data consistency across all user devices.

---

**Total Implementation Time**: ~2-3 days for core features + 1-2 days for polish
