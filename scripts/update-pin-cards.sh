#!/bin/bash

# Script untuk update semua summary card components dengan PIN functionality
# Update PalawijaSummaryCard, KsaSummaryCard, KsaJagungSummaryCard, SimtpSummaryCard

echo "🚀 Updating summary cards with PIN functionality..."

# Function to update a card component
update_card() {
    local file_path="$1"
    local card_name="$2"
    local kpi_id="$3"
    local emoji="$4"
    local title="$5"
    
    echo "📝 Updating $card_name..."
    
    # Backup original file
    cp "$file_path" "$file_path.backup"
    
    # Update imports
    sed -i '' 's/import { Clock, AlertTriangle } from "lucide-react";/import { Clock, AlertTriangle, Pin } from "lucide-react";/' "$file_path"
    sed -i '' '/import { getStatusVisuals } from/a\
import { PinButton } from "@/components/ui/pin-button";\
import { cn } from "@/lib/utils";
' "$file_path"
    
    # Update interface
    sed -i '' '/isHighlighted\?: boolean;/a\
  // PIN props\
  isPinned?: boolean;\
  pinOrder?: number | null;\
  onTogglePin?: (kpiId: string) => Promise<void>;\
  canPinMore?: boolean;
' "$file_path"
    
    echo "✅ $card_name updated successfully!"
}

# Update each card
update_card \
    "/Users/jokopranoto/Documents/Project/dashboard-hope-nextjs/src/app/(dashboard)/_components/homepage/PalawijaSummaryCard.tsx" \
    "PalawijaSummaryCard" \
    "palawija" \
    "🌽" \
    "Ubinan Palawija"

update_card \
    "/Users/jokopranoto/Documents/Project/dashboard-hope-nextjs/src/app/(dashboard)/_components/homepage/KsaSummaryCard.tsx" \
    "KsaSummaryCard" \
    "ksa" \
    "📊" \
    "KSA Padi"

update_card \
    "/Users/jokopranoto/Documents/Project/dashboard-hope-nextjs/src/app/(dashboard)/_components/homepage/KsaJagungSummaryCard.tsx" \
    "KsaJagungSummaryCard" \
    "ksa-jagung" \
    "🌽" \
    "KSA Jagung"

update_card \
    "/Users/jokopranoto/Documents/Project/dashboard-hope-nextjs/src/app/(dashboard)/_components/homepage/SimtpSummaryCard.tsx" \
    "SimtpSummaryCard" \
    "simtp" \
    "📋" \
    "SIMTP"

echo "🎉 All summary cards updated with PIN functionality!"
echo "💡 Next: Run the development server to test the PIN feature"
