"use client";

import { useState, useEffect, useRef } from "react";

const colors = ["red", "green", "blue"];
type Mode = "speed" | "length" | "mix";

export default function Home() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [level, setLevel] = useState(1);
  const [flashing, setFlashing] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>("");
  const [detectedColor, setDetectedColor] = useState<string>("");
  const [difficulty, setDifficulty] = useState(1000);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [mode, setMode] = useState<Mode>("mix");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mode-dependent settings
  const getSequenceLength = () => mode === "length" ? 5 : 3;
  const getDifficulty = () => mode === "speed" ? Math.max(difficulty - 300, 300) : difficulty;

  const startGame = () => {
    const newSequence: string[] = [];
    for (let i = 0; i < getSequenceLength(); i++) {
      newSequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    setSequence(newSequence);
    setUserInputs([]);
    flashSequence(newSequence);
  };

  const flashSequence = async (seq: string[]) => {
    setFlashing(true);
    for (let color of seq) {
      setCurrentColor(color);
      await new Promise((res) => setTimeout(res, getDifficulty()));
      setCurrentColor("");
      await new Promise((res) => setTimeout(res, 200));
    }
    setFlashing(false);
  };

  useEffect(() => {
    if (cameraOn && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        });
    }
    if (!cameraOn && videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach(track => track.stop());
    }
  }, [cameraOn]);

  const detectColor = (): string => {
    if (!videoRef.current || !canvasRef.current) return "unknown";

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "unknown";

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;

    let rSum = 0, gSum = 0, bSum = 0, count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      if (brightness < 50 || brightness > 240) continue;

      rSum += r;
      gSum += g;
      bSum += b;
      count++;
    }

    if (count === 0) return "unknown";

    const rAvg = rSum / count;
    const gAvg = gSum / count;
    const bAvg = bSum / count;

    if (rAvg > gAvg && rAvg > bAvg) return "red";
    if (gAvg > rAvg && gAvg > bAvg) return "green";
    return "blue";
  };

  const startDetection = () => {
    setCountdown(5);

    const interval = setInterval(() => {
      setDetectedColor(detectColor());
      setCountdown(prev => {
        if (prev === null) return null;
        if (prev === 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmColor = () => {
    if (!detectedColor || detectedColor === "unknown") {
      alert("No color detected. Try again.");
      return;
    }

    const newInputs = [...userInputs, detectedColor];
    setUserInputs(newInputs);

    if (newInputs.length === sequence.length) {
      const correct = sequence.every((color, i) => color === newInputs[i]);
      alert(correct ? "Level Complete!" : "Wrong sequence!");
      setLevel(prev => correct ? prev + 1 : 1);
      setDifficulty(prev => Math.max(prev - 50, 300));
      startGame();
    }
  };

  const progress = Math.round((userInputs.length / sequence.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col items-center p-6">
      {/* Navbar */}
      <nav className="flex space-x-4 mb-6">
        {["mix", "speed", "length"].map((m) => (
          <button
            key={m}
            className={`px-4 py-2 rounded-lg font-semibold ${mode === m ? "bg-blue-500 text-white" : "bg-white text-gray-800 shadow-md"}`}
            onClick={() => setMode(m as Mode)}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </nav>

      <h1 className="text-3xl font-bold mb-4">Colour Memory Game</h1>
      <p className="mb-2 text-lg">Level: {level}</p>

      {/* Progress bar */}
      <div className="w-80 h-6 bg-gray-300 rounded-full mb-4">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Game controls */}
      <div className="flex space-x-4 mb-4">
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md" onClick={startGame} disabled={flashing}>Start Game</button>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md" onClick={() => setCameraOn(prev => !prev)}>
          {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
        </button>
      </div>

      {/* Flash display */}
      <div className="w-32 h-32 mb-4 rounded-2xl shadow-lg flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: currentColor || "#fff" }}>
        {currentColor && currentColor.toUpperCase()}
      </div>

      {/* Camera */}
      {cameraOn && (
        <video ref={videoRef} autoPlay width={300} height={200} className="rounded-lg shadow-lg mb-2" />
      )}
      <canvas ref={canvasRef} width={300} height={200} style={{ display: "none" }} />

      {/* Detection controls */}
      {sequence.length > 0 && !flashing && (
        <div className="flex flex-col items-center space-y-2">
          {countdown !== null ? (
            <p className="text-xl font-bold text-blue-600">Hold your card… Detecting in {countdown}s</p>
          ) : (
            <>
              <p className="text-lg">Detected Color: <span className="font-bold">{detectedColor}</span></p>
              <div className="flex space-x-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md" onClick={startDetection}>Start Detection</button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md" onClick={confirmColor}>Confirm Color</button>
              </div>
              <p>Step: {userInputs.length + 1} / {sequence.length}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
