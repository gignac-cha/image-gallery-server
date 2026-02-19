import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ffprobePath from '@ffprobe-installer/ffprobe';

const execFileAsync = promisify(execFile);

export interface VideoProbeResult {
  width: number;
  height: number;
  duration: number;
  codec: string;
  audioCodec?: string;
  framerate?: number;
}

export async function probeVideo(filePath: string): Promise<VideoProbeResult | null> {
  try {
    const { stdout } = await execFileAsync(ffprobePath.path, [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath,
    ]);

    const data = JSON.parse(stdout);
    const videoStream = data.streams?.find((s: { codec_type: string }) => s.codec_type === 'video');

    if (!videoStream) return null;

    const audioStream = data.streams?.find((s: { codec_type: string }) => s.codec_type === 'audio');
    const duration = parseFloat(data.format?.duration ?? videoStream.duration ?? '0');

    let framerate: number | undefined;
    if (videoStream.r_frame_rate) {
      const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
      if (den && den > 0) framerate = Math.round((num / den) * 100) / 100;
    }

    return {
      width: videoStream.width ?? 0,
      height: videoStream.height ?? 0,
      duration,
      codec: videoStream.codec_name ?? 'unknown',
      audioCodec: audioStream?.codec_name,
      framerate,
    };
  } catch {
    return null;
  }
}
