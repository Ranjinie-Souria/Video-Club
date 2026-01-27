import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { useRef, useState } from 'react'

/**
 * FFmpeg and helper functions. 
 * Makes sure that FFmpeg engine is loaded only once and shared across the application.
 */
export function useFFmpeg() {
  const [loaded, setLoaded] = useState(false)
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const load = async () => {
    if (loaded) return

    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'
    const ffmpeg = new FFmpeg()

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      //workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
    })

    ffmpegRef.current = ffmpeg
    setLoaded(true)
  }

  const convert = async (file: File, desiredFormat: string) => {
    if (!ffmpegRef.current) throw new Error('FFmpeg not loaded yet');

    const ffmpeg = ffmpegRef.current;

    const sentFormat =
      file.type?.split('/')[1] ||
      file.name.split('.').pop()?.toLowerCase() ||
      'mp4';

    await ffmpeg.writeFile(`input.${sentFormat}`, await fetchFile(file));
    
    if(desiredFormat.toLowerCase() === 'webm'){
      await ffmpeg.exec([
      "-i", `input.${sentFormat}`,
      "-c:v", "libvpx",     
      "-c:a", "libvorbis",  
      `output.webm`
    ]);
    }
    else{
      await ffmpeg.exec([
        '-i', `input.${sentFormat}`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        `output.${desiredFormat}`
      ]);
    }

    const fileData = await ffmpeg.readFile(`output.${desiredFormat}`);
    const data = fileData as Uint8Array;

    const arrayBuffer = data.buffer as unknown as ArrayBuffer;

    return new Blob([arrayBuffer], {
      type: `video/${desiredFormat}`,
    });
  }

  return { loaded, load, convert }
}
