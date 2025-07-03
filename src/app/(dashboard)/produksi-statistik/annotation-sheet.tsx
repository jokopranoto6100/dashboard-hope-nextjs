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
    await onSubmit(newComment);
    setNewComment("");
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Diskusi dan fenomena yang tercatat untuk titik data ini. Tambahkan komentar Anda di bawah.</SheetDescription>
        </SheetHeader>
        <Separator />
        <ScrollArea className="flex-1 pr-6 -mr-6">
          <div className="space-y-6">
            {annotations && annotations.length > 0 ? (
              annotations.map((anno) => (
                <div key={anno.id} className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback>{anno.user_fullname?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm flex-1">
                    <p className="font-semibold">{anno.user_fullname || 'Pengguna Anonim'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(anno.created_at)}</p>
                    <p className="mt-1 whitespace-pre-wrap">{anno.komentar}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground py-8">Belum ada anotasi.</p>
            )}
          </div>
        </ScrollArea>
        {user && (
          <SheetFooter className="mt-auto pt-4 border-t">
            <div className="w-full grid gap-2">
              <Textarea
                placeholder="Tambahkan komentar Anda..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}