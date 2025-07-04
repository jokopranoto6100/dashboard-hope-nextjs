// Lokasi: src/app/(dashboard)/produksi-statistik/annotation-sheet.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
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
}

export function AnnotationSheet({ isOpen, onOpenChange, annotations, title, onSubmit }: AnnotationSheetProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast.error("Komentar tidak boleh kosong.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(newComment);
      setNewComment(""); // ✅ Reset form setelah sukses
      toast.success("Komentar berhasil dikirim!"); // ✅ Konfirmasi visual
      
    } catch (error) {
      console.error('Error submitting annotation:', error);
      toast.error("Gagal mengirim komentar.");
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

  // ✅ Reset form ketika sheet ditutup
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewComment("");
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Diskusi dan fenomena yang tercatat untuk titik data ini. Tambahkan komentar Anda di bawah.
          </SheetDescription>
        </SheetHeader>
        
        <Separator className="flex-shrink-0" />
        
        {/* ✅ PERBAIKI: Container scrollable dengan height yang tepat */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              {annotations && annotations.length > 0 ? (
                annotations
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((anno) => (
                  <div key={anno.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {anno.user_fullname?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">
                          {anno.user_fullname || 'Pengguna Anonim'}
                        </p>
                        <p className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDate(anno.created_at)}
                        </p>
                      </div>
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {anno.komentar}
                      </p>
                      {/* ✅ Type-safe check untuk temporary annotations */}
                      {typeof anno.id === 'string' && anno.id.startsWith('temp-') && (
                        <span className="text-xs text-blue-500 italic mt-1 block">• Mengirim...</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-center text-muted-foreground">
                    Belum ada anotasi untuk titik data ini.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* ✅ PERBAIKI: Form tetap di bawah, tidak terdorong */}
          {user && (
            <div className="flex-shrink-0 pt-4 border-t bg-background">
              <div className="space-y-3">
                <Textarea
                  placeholder="Tambahkan komentar Anda... (Ctrl/Cmd + Enter untuk kirim)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                  rows={3}
                  className="resize-none"
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