"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from "react";
import { updateAvatar, removeAvatar } from "@/app/actions/account";

const DISPLAY_SIZE = 240;
const OUTPUT_SIZE = 512;

interface Offset {
  x: number;
  y: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Impossible de lire cette image."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Impossible de lire ce fichier."));
    reader.readAsDataURL(file);
  });
}

function coverScale(img: HTMLImageElement, size: number) {
  return Math.max(size / img.width, size / img.height);
}

function clampOffset(offset: Offset, img: HTMLImageElement, scale: number, size: number): Offset {
  const maxX = Math.max(0, (img.width * scale - size) / 2);
  const maxY = Math.max(0, (img.height * scale - size) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  };
}

function draw(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  scale: number,
  offset: Offset,
  size: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2 + offset.x, size / 2 + offset.y);
  ctx.scale(scale, scale);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}

export function AvatarUploadForm({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startOffset: Offset } | null>(null);

  function redraw(nextScale: number, nextOffset: Offset, img: HTMLImageElement | null = image) {
    if (!img || !canvasRef.current) return;
    draw(canvasRef.current, img, nextScale, nextOffset, DISPLAY_SIZE);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    try {
      const img = await loadImage(file);
      const initialScale = coverScale(img, DISPLAY_SIZE);
      setImage(img);
      setMinScale(initialScale);
      setScale(initialScale);
      setOffset({ x: 0, y: 0 });
      requestAnimationFrame(() => redraw(initialScale, { x: 0, y: 0 }, img));
    } catch {
      setError("Impossible de charger cette image.");
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!image) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, startOffset: offset };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!image || !dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    const next = clampOffset(
      { x: dragRef.current.startOffset.x + dx, y: dragRef.current.startOffset.y + dy },
      image,
      scale,
      DISPLAY_SIZE
    );
    setOffset(next);
    redraw(scale, next);
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleZoomChange(event: ChangeEvent<HTMLInputElement>) {
    if (!image) return;
    const nextScale = Number(event.target.value);
    const nextOffset = clampOffset(offset, image, nextScale, DISPLAY_SIZE);
    setScale(nextScale);
    setOffset(nextOffset);
    redraw(nextScale, nextOffset);
  }

  function cancelCrop() {
    setImage(null);
    setError(null);
  }

  async function handleSave() {
    if (!image) return;
    setPending(true);
    setError(null);
    try {
      const outputCanvas = document.createElement("canvas");
      const ratio = OUTPUT_SIZE / DISPLAY_SIZE;
      draw(
        outputCanvas,
        image,
        scale * ratio,
        { x: offset.x * ratio, y: offset.y * ratio },
        OUTPUT_SIZE
      );
      const dataUrl = outputCanvas.toDataURL("image/jpeg", 0.85);

      const formData = new FormData();
      formData.set("avatar", dataUrl);
      const result = await updateAvatar(undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setImage(null);
      }
    } finally {
      setPending(false);
    }
  }

  if (image) {
    return (
      <div className="space-y-3">
        <canvas
          ref={canvasRef}
          width={DISPLAY_SIZE}
          height={DISPLAY_SIZE}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="mx-auto touch-none cursor-move rounded-lg border border-border"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Zoom</span>
          <input
            type="range"
            min={minScale}
            max={minScale * 3}
            step={0.001}
            value={scale}
            onChange={handleZoomChange}
            className="flex-1"
          />
        </div>
        <p className="text-center text-xs text-zinc-500">Glisse l&apos;image pour la repositionner.</p>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={cancelCrop}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:border-accent"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="h-24 w-24 rounded-full object-cover" />
      ) : (
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-background text-2xl font-semibold text-zinc-400">
          {name.charAt(0)}
        </span>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-border px-3.5 py-1.5 text-sm font-medium hover:border-accent"
        >
          {avatarUrl ? "Changer la photo" : "Ajouter une photo"}
        </button>
        {avatarUrl && (
          <form action={removeAvatar}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3.5 py-1.5 text-sm text-red-600 hover:border-red-600"
            >
              Retirer
            </button>
          </form>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
