import React, { useEffect, useState } from "react";
import { useFFmpeg } from "../../utils/ffmpegUtils";

export const VideoConverter = () => {
  const { loaded, load, convert } = useFFmpeg();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("mp4");
  const [isConverting, setIsConverting] = useState(false);

  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !loaded) return;

    setIsConverting(true);

    try {console.log("file size (MB):", selectedFile.size / 1024 / 1024);
        console.log("file type:", selectedFile.type);

      const blob = await convert(selectedFile, outputFormat);

      setConvertedBlob(blob);

      const url = URL.createObjectURL(blob);
      setVideoURL(url);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob || !selectedFile) return;

    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement("a");

    const filename = selectedFile.name.split(".")[0] + "." + outputFormat;

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="converter">
      <div className="form-group">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isConverting}
        />
        {selectedFile && <p>Selected: {selectedFile.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="format" >Output Format : </label>
        <select
          id="format"
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
          disabled={isConverting}
        >
          <option value="mp4">MP4</option>
          <option value="webm">WebM</option>
          <option value="mkv">MKV</option>
        </select>
      </div>

      <button className="center" onClick={handleConvert} disabled={!selectedFile || isConverting}>
        {isConverting ? "Converting..." : "Convert"}
      </button>

      {videoURL && (
        <div className="converted-video center">
          <video controls src={videoURL} width={600} />
        </div>
      )}

      {convertedBlob && (
        <button  onClick={handleDownload}>
          Download
        </button>
      )}
    </div>
  );
};