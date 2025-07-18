// Lokasi: src/app/(dashboard)/produksi-statistik/annotation-sheet.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Tipe data untuk anotasi (pastikan sama dengan di client)
import { Annotation } from "@/lib/types";

interface AnnotationSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  annotations: Annotation[];
  title: string;
  onSubmit: (comment: string) => Promise<void>;
  selectedPoint?: {
    bulan?: number | null;
    kode_wilayah?: string | null;
  };
}

export function AnnotationSheet({ isOpen, onOpenChange, annotations, title, onSubmit, selectedPoint }: AnnotationSheetProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimisticAnnotations, setOptimisticAnnotations] = useState<Annotation[]>([]);

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast.error("Komentar tidak boleh kosong.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Create optimistic annotation
    const optimisticAnnotation: Annotation = {
      id: `temp-${Date.now()}`,
      komentar: newComment.trim(),
      created_at: new Date().toISOString(),
      user_fullname: user?.user_metadata?.full_name || user?.email || 'Anda',
      // These won't be used for display but needed for type safety
      user_id: user?.id || '',
      id_indikator: 0,
      tahun: 0,
      bulan: null,
      kode_wilayah: null
    };
    
    // Add optimistic annotation immediately
    setOptimisticAnnotations(prev => [optimisticAnnotation, ...prev]);
    
    try {
      await onSubmit(newComment);
      setNewComment("");
      toast.success("Komentar berhasil dikirim!");
      
      // Don't remove optimistic annotation here - let useEffect handle it
      // when real annotations are updated
      
    } catch (error) {
      console.error('Error submitting annotation:', error);
      toast.error("Gagal mengirim komentar.");
      
      // Remove optimistic annotation on error
      setOptimisticAnnotations(prev => 
        prev.filter(ann => ann.id !== optimisticAnnotation.id)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Handle keyboard shortcut untuk submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Reset optimistic annotations when sheet is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewComment("");
      setIsSubmitting(false);
      setOptimisticAnnotations([]); // Clear optimistic annotations
    }
    onOpenChange(open);
  };

  // Filter annotations based on selected point (bulan + kode_wilayah)
  const filteredAnnotations = annotations.filter(annotation => {
    // If no selectedPoint, show all annotations
    if (!selectedPoint) return true;
    
    // Match both bulan and kode_wilayah if they exist
    const bulanMatch = selectedPoint.bulan === undefined || 
                      selectedPoint.bulan === null || 
                      annotation.bulan === selectedPoint.bulan;
                      
    const wilayahMatch = selectedPoint.kode_wilayah === undefined || 
                        selectedPoint.kode_wilayah === null || 
                        annotation.kode_wilayah === selectedPoint.kode_wilayah;
    
    return bulanMatch && wilayahMatch;
  });

  // Merge real annotations with optimistic ones
  const displayAnnotations = [
    ...optimisticAnnotations,
    ...filteredAnnotations
  ];

  // Clean up optimistic annotations when real annotations update
  useEffect(() => {
    if (filteredAnnotations && filteredAnnotations.length > 0 && optimisticAnnotations.length > 0) {
      // Check if any optimistic annotation has a matching real annotation
      // by comparing content and recent timing
      const newOptimistic = optimisticAnnotations.filter(optAnnotation => {
        // Check if there's a real annotation with same content created recently
        const matchingReal = filteredAnnotations.find(realAnnotation => {
          const realTime = new Date(realAnnotation.created_at).getTime();
          const optTime = new Date(optAnnotation.created_at).getTime();
          const timeDiff = Math.abs(realTime - optTime);
          
          // Same content and created within 10 seconds of each other
          return realAnnotation.komentar.trim() === optAnnotation.komentar.trim() && 
                 timeDiff < 10000;
        });
        
        // Keep optimistic annotation only if no matching real annotation found
        return !matchingReal;
      });
      
      // Update optimistic annotations if any were matched/removed
      if (newOptimistic.length !== optimisticAnnotations.length) {
        setOptimisticAnnotations(newOptimistic);
      }
    }
  }, [filteredAnnotations, optimisticAnnotations]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md md:max-w-lg h-full p-4 sm:p-6">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-base sm:text-lg leading-tight">{title}</SheetTitle>
          <SheetDescription className="text-sm">
            Diskusi dan fenomena yang tercatat untuk titik data ini. Tambahkan komentar Anda di bawah.
          </SheetDescription>
        </SheetHeader>
        
        <Separator className="flex-shrink-0" />
        
        {/* Container scrollable dengan height yang tepat */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-2 sm:pr-4">
            <div className="space-y-3 sm:space-y-4 py-4">
              {displayAnnotations && displayAnnotations.length > 0 ? (
                displayAnnotations
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((anno) => (
                  <div key={anno.id} className="flex items-start gap-2 sm:gap-3">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {anno.user_fullname?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <p className="font-semibold text-xs sm:text-sm truncate">
                          {anno.user_fullname || 'Pengguna Anonim'}
                        </p>
                        <p className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDate(anno.created_at)}
                        </p>
                      </div>
                      <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed">
                        {anno.komentar}
                      </p>
                      {/* Type-safe check untuk temporary annotations */}
                      {typeof anno.id === 'string' && anno.id.startsWith('temp-') && (
                        <span className="text-xs text-blue-500 italic mt-1 block">• Mengirim...</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-xs sm:text-sm text-center text-muted-foreground">
                    Belum ada anotasi untuk titik data ini.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Form tetap di bawah, tidak terdorong */}
          {user && (
            <div className="flex-shrink-0 pt-3 sm:pt-4 border-t bg-background">
              <div className="space-y-2 sm:space-y-3">
                <Textarea
                  placeholder="Tambahkan komentar Anda... (Ctrl/Cmd + Enter untuk kirim)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                  rows={2}
                  className="resize-none text-sm"
                />
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !newComment.trim()}
                  className="w-full"
                  size="sm"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}