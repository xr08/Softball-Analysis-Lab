import { RefObject } from "react";

type VideoPlayerProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  videoUrl: string | null;
  selectedFileName: string | null;
  expectedVideoFileName?: string | null;
  videoMessage?: string;
  onSelectFile: (file: File | null) => void;
};

export function VideoPlayer({
  videoRef,
  videoUrl,
  selectedFileName,
  expectedVideoFileName,
  videoMessage,
  onSelectFile
}: VideoPlayerProps) {
  const isRelinking = !videoUrl && expectedVideoFileName;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-700 bg-[#101720] shadow-2xl shadow-black/30">
      {!videoUrl ? (
        <div className="flex flex-col gap-3 border-b border-slate-700 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Main Video</p>
            <h2 className="mt-1 text-lg font-black text-white">
              {selectedFileName || "Select local MP4 to begin"}
            </h2>
            {videoMessage ? (
              <p className={`mt-1 text-sm font-semibold ${videoMessage.includes("Warning") ? "text-amber-300" : "text-sky-200"}`}>
                {videoMessage}
              </p>
            ) : null}
          </div>

          <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400 lg:min-w-72">
            {isRelinking ? "Reconnect video" : "Video source"}
            <input
              type="file"
              accept="video/mp4"
              onChange={(event) => onSelectFile(event.target.files?.[0] ?? null)}
              className="rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm normal-case tracking-normal text-slate-100 file:mr-3 file:rounded file:border-0 file:bg-orange-500 file:px-2.5 file:py-1 file:text-xs file:font-black file:uppercase file:tracking-wide file:text-slate-950 hover:file:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-2 border-b border-slate-800 bg-slate-950/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 truncate text-xs font-semibold text-slate-400">
            Video: <span className="text-slate-100">{selectedFileName || "Local MP4 selected"}</span>
          </p>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-600 bg-slate-900 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wide text-slate-200 hover:border-sky-400 hover:text-sky-200 focus-within:ring-2 focus-within:ring-orange-400">
            Change Video
            <input
              type="file"
              accept="video/mp4"
              onChange={(event) => onSelectFile(event.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
        </div>
      )}

      {videoUrl ? (
        <div className="bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="aspect-video w-full bg-black"
          />
        </div>
      ) : (
        <div className="flex aspect-video min-h-[320px] items-center justify-center border-t border-slate-900 bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.16),transparent_35%),linear-gradient(135deg,#080d13,#101720_45%,#090d12)] p-6 text-center">
          <div className="max-w-md">
            {isRelinking ? (
              <>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-300">
                  Session restored
                </p>
                <p className="mt-2 text-slate-300">
                  Reconnect the original video file to continue. Expected video:{" "}
                  <span className="font-bold text-white">{expectedVideoFileName}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-300">
                  No video loaded
                </p>
                <p className="mt-2 text-slate-400">
                  Load a local MP4. The app keeps the footage local and tags against timestamps.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
