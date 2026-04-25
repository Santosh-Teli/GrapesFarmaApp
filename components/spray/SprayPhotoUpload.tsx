"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Camera, Upload, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createSprayPhoto, deleteSprayPhoto } from "@/lib/supabase/db";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import type { SprayPhoto } from "@/types";

// ─── Image compression helper ──────────────────────────────────────────────────
async function compressImage(file: File, maxPx = 1280, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        const ratio = Math.min(maxPx / width, maxPx / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob!), "image/webp", quality);
    };
    img.src = url;
  });
}

// ─── Upload Zone (Before / After) ─────────────────────────────────────────────
interface UploadZoneProps {
  type: "BEFORE" | "AFTER";
  photos: SprayPhoto[];
  sprayRecordId: string;
  onUploaded: (photo: SprayPhoto) => void;
  onDeleted: (id: string) => void;
}

function UploadZone({ type, photos, sprayRecordId, onUploaded, onDeleted }: UploadZoneProps) {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const typePhotos = photos.filter((p) => p.photoType === type);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !user) return;
    if (typePhotos.length + files.length > 3) {
      toast.error("Maximum 3 photos per zone allowed.");
      return;
    }
    setUploading(true);
    const supabase = getSupabaseClient() as any;
    for (const file of files) {
      try {
        const blob = await compressImage(file);
        const path = `${user.id}/${sprayRecordId}/${type}_${Date.now()}.webp`;
        const { error: upErr } = await supabase.storage.from("spray-photos").upload(path, blob, { contentType: "image/webp" });
        if (upErr) { toast.error(`Upload failed: ${upErr.message}`); continue; }
        const { data: { publicUrl } } = supabase.storage.from("spray-photos").getPublicUrl(path);
        const saved = await createSprayPhoto({
          userId: user.id,
          sprayRecordId,
          photoUrl: publicUrl,
          photoType: type,
          storagePath: path,
          fileSizeBytes: blob.size,
        });
        if (saved) onUploaded(saved);
      } catch {
        toast.error("Failed to process image.");
      }
    }
    setUploading(false);
    e.target.value = "";
  }, [user, sprayRecordId, type, typePhotos.length, onUploaded]);

  const handleDelete = async (photo: SprayPhoto) => {
    try {
      await deleteSprayPhoto(photo.id, photo.storagePath);
      onDeleted(photo.id);
      toast.success("Photo removed.");
    } catch {
      toast.error("Failed to delete photo.");
    }
  };

  const color = type === "BEFORE" ? "blue" : "green";

  return (
    <div className="flex-1 space-y-3">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-${color}-50 border border-${color}-200`}>
        <Camera className={`h-4 w-4 text-${color}-600`} />
        <span className={`text-sm font-semibold text-${color}-700`}>{type === "BEFORE" ? "Before Spray" : "After Spray"}</span>
        <Badge className={`ml-auto bg-${color}-100 text-${color}-700 border-${color}-300 text-xs`}>
          {typePhotos.length}/3
        </Badge>
      </div>

      {/* Photo thumbnails */}
      <div className="grid grid-cols-3 gap-2">
        {typePhotos.map((photo) => (
          <div key={photo.id} className="relative aspect-square group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <img src={photo.photoUrl} alt={`${type} spray`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleDelete(photo)}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}

        {typePhotos.length < 3 && (
          <label className={`aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${uploading ? "border-gray-300 bg-gray-50" : `border-${color}-300 hover:border-${color}-500 hover:bg-${color}-50`}`}>
            {uploading ? (
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className={`h-5 w-5 text-${color}-400`} />
                <span className={`text-[10px] font-medium text-${color}-400`}>Add Photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleFile}
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
interface LightboxProps {
  photos: SprayPhoto[];
  startIndex: number;
  onClose: () => void;
}

function Lightbox({ photos, startIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIndex);
  const photo = photos[idx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <a href={photo.photoUrl} download target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
        </a>
        <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <button
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-colors"
          onClick={() => setIdx((i) => i - 1)}
          disabled={idx === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <motion.img
          key={idx}
          src={photo.photoUrl}
          alt="Spray photo"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="max-h-[75vh] max-w-[80vw] rounded-xl object-contain shadow-2xl"
        />

        <button
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-colors"
          onClick={() => setIdx((i) => i + 1)}
          disabled={idx === photos.length - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-4 text-white/60 text-sm">
        {photo.photoType} — {idx + 1} / {photos.length}
      </p>
    </motion.div>
  );
}

// ─── Photo Gallery ─────────────────────────────────────────────────────────────
interface SprayPhotoGalleryProps {
  photos: SprayPhoto[];
}

export function SprayPhotoGallery({ photos }: SprayPhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) return (
    <p className="text-sm text-gray-400 text-center py-6">No photos attached to this spray record.</p>
  );

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            whileHover={{ scale: 1.03 }}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-gray-200 bg-gray-50"
            onClick={() => setLightboxIndex(i)}
          >
            <img src={photo.photoUrl} alt={photo.photoType} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <Badge className={`absolute bottom-2 left-2 text-[10px] ${photo.photoType === "BEFORE" ? "bg-blue-500" : "bg-green-500"} text-white border-0`}>
              {photo.photoType}
            </Badge>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox photos={photos} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Export: SprayPhotoUpload ────────────────────────────────────────────
interface SprayPhotoUploadProps {
  sprayRecordId: string;
  initialPhotos?: SprayPhoto[];
}

export function SprayPhotoUpload({ sprayRecordId, initialPhotos = [] }: SprayPhotoUploadProps) {
  const [photos, setPhotos] = useState<SprayPhoto[]>(initialPhotos);

  const handleUploaded = (photo: SprayPhoto) => setPhotos((prev) => [...prev, photo]);
  const handleDeleted = (id: string) => setPhotos((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <UploadZone type="BEFORE" photos={photos} sprayRecordId={sprayRecordId} onUploaded={handleUploaded} onDeleted={handleDeleted} />
        <UploadZone type="AFTER" photos={photos} sprayRecordId={sprayRecordId} onUploaded={handleUploaded} onDeleted={handleDeleted} />
      </div>

      {photos.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">All Photos</p>
          <SprayPhotoGallery photos={photos} />
        </div>
      )}
    </div>
  );
}
