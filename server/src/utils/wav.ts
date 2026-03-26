import wav from "wav";

export async function saveWaveFile(filename: string, pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2) {
  return new Promise<void>((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on("finish", () => resolve());
    writer.on("error", (err) => reject(err));

    writer.write(pcmData);
    writer.end();
  });
}
