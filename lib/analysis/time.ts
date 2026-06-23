export function formatTimestampLabel(totalSeconds: number): string {
  const safeTotal = Math.max(0, totalSeconds);
  let hours = Math.floor(safeTotal / 3600);
  let mins = Math.floor((safeTotal % 3600) / 60);
  let secs = Math.floor(safeTotal % 60);
  let ms = Math.round((safeTotal % 1) * 1000);

  if (ms === 1000) {
    ms = 0;
    secs += 1;
  }
  if (secs === 60) {
    secs = 0;
    mins += 1;
  }
  if (mins === 60) {
    mins = 0;
    hours += 1;
  }

  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(secs).padStart(2, "0");
  const formattedMs = String(ms).padStart(3, "0");

  if (hours > 0) {
    return `${hours}:${formattedMins}:${formattedSecs}.${formattedMs}`;
  }
  return `${formattedMins}:${formattedSecs}.${formattedMs}`;
}


