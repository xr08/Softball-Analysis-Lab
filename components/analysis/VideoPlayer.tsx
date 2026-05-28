import { RefObject } from "react";

type VideoPlayerProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  videoUrl: string | null;
  selectedFileName: string;
  onSelectFile: (file: File | null) => void;
};

export function VideoPlayer({
  videoRef,
  videoUrl,
  selectedFileName,
  onSelectFile
}: VideoPlayerProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Video</h2>

      <label className="mb-3 flex w-full flex-col gap-1 text-sm text-slate-700">
        Select local MP4 file
        <input
          type="file"
          accept="video/mp4"
          onChange={(event) => onSelectFile(event.target.files?.[0] ?? null)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </label>

      {selectedFileName ? (
        <p className="mb-3 text-sm text-slate-600">Selected: {selectedFileName}</p>
      ) : null}

      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full rounded-md border border-slate-200 bg-black"
        />
      ) : (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
          Select a local MP4 to begin tagging.
        </div>
      )}
    </section>
  );
}
