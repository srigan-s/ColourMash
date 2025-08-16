"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head"; 


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
  const [showStartCountdown, setShowStartCountdown] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [stars, setStars] = useState(0);
  const [result, setResult] = useState<"win" | "lose" | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gameRef = useRef<HTMLDivElement | null>(null);
  const scrollToGame = () => gameRef.current?.scrollIntoView({ behavior: "smooth" });

  const getSequenceLength = () => (mode === "length" ? 5 : 3);
  const getDifficulty = () =>
    mode === "speed" ? Math.max(difficulty - 300, 300) : difficulty;

  const stopCameraTracks = () => {
    const media = videoRef.current?.srcObject as MediaStream | null;
    if (media) media.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const exitGame = () => {
    stopCameraTracks();
    setCameraOn(false);
    setGameActive(false);
    setShowStartCountdown(false);
    setFlashing(false);
    setSequence([]);
    setUserInputs([]);
    setCurrentColor("");
    setDetectedColor("");
    setCountdown(null);
    setResult(null);
  };

  const startGame = () => {
    setShowStartCountdown(true);
    setDetectedColor("");
    setUserInputs([]);
    setGameActive(true);
    setResult(null);

    let counter = 3;
    setCurrentColor(counter.toString());
    const countdownInterval = setInterval(() => {
      counter--;
      if (counter > 0) setCurrentColor(counter.toString());
      else if (counter === 0) setCurrentColor("GO!");
      else {
        clearInterval(countdownInterval);
        setTimeout(() => {
          setShowStartCountdown(false);
          setCurrentColor("");
          beginSequence();
        }, 800);
      }
    }, 1000);
  };

  const beginSequence = () => {
    const newSequence: string[] = [];
    for (let i = 0; i < getSequenceLength(); i++)
      newSequence.push(colors[Math.floor(Math.random() * colors.length)]);
    setSequence(newSequence);
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
    if (cameraOn && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Camera error:", err));
    }
    if (!cameraOn) stopCameraTracks();
  }, [cameraOn]);

  const detectColor = (): string => {
    if (!videoRef.current || !canvasRef.current) return "unknown";
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "unknown";

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < 50 || brightness > 240) continue;
      rSum += r; gSum += g; bSum += b; count++;
    }

    if (count === 0) return "unknown";
    const rAvg = rSum / count, gAvg = gSum / count, bAvg = bSum / count;
    if (rAvg > gAvg && rAvg > bAvg) return "red";
    if (gAvg > rAvg && gAvg > bAvg) return "green";
    return "blue";
  };

  const startDetection = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setDetectedColor(detectColor());
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev === 1) { clearInterval(interval); return null; }
        return (prev || 0) - 1;
      });
    }, 1000);
  };

  const confirmColor = () => {
    if (!detectedColor || detectedColor === "unknown") return;
    const newInputs = [...userInputs, detectedColor];
    setUserInputs(newInputs);
    if (newInputs.length === sequence.length) {
      const correct = sequence.every((c, i) => c === newInputs[i]);
      setResult(correct ? "win" : "lose");
      if (correct) setStars((prev) => prev + 1);
    }
  };

  const progress = sequence.length
    ? Math.round((userInputs.length / sequence.length) * 100)
    : 0;

  return (
    <div className="scroll-smooth">
      <Head>
        <title>ColourMash - Pattern Therapy</title>
      </Head>

      {/* ================= Landing Section ================= */}
      <section className="flex flex-col items-center justify-center text-center min-h-screen px-6 animate-fadeIn">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-pulse">
          🎨 Welcome to ColourMash
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mb-10 leading-relaxed">
          ColourMash helps <span className="text-yellow-300 font-bold">Alzheimer’s</span> and <span className="text-yellow-300 font-bold">dementia patients</span> improve memory using pattern recognition with physical objects.
        </p>
        <div className="bg-white/10 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-lg mb-10 animate-fadeIn">
          <h2 className="text-2xl md:text-3xl mb-4 text-yellow-300 font-bold">Our Mission</h2>
          <p className="text-base md:text-lg leading-relaxed">
            To provide playful, engaging memory training that strengthens cognitive pathways and makes learning fun.
          </p>
        </div>
        <button
          onClick={scrollToGame}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-xl text-white font-bold text-lg shadow-md transform hover:scale-105 transition-transform duration-300"
        >
          🚀 Play Now
        </button>
      </section>

      {/* ================= Game Section ================= */}
      <section ref={gameRef} className="flex flex-col items-center justify-center mt-20 min-h-screen animate-fadeIn">
        {/* ================= Your Game UI ================= */}
        <nav className="flex space-x-4 mb-6 overflow-x-auto pb-2 scrollbar-hide w-full">
          <div className="flex space-x-4 mx-auto">
            {["mix", "speed", "length"].map((m) => (
              <button
                key={m}
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap shadow-md transition-all duration-300 ${
                  mode === m ? "bg-blue-500 text-white" : "bg-white text-gray-800"
                }`}
                onClick={() => setMode(m as Mode)}
              >
                {m.toUpperCase()}
              </button>
            ))}
            <button className="px-4 py-2 rounded-full bg-green-500 text-white shadow-md" onClick={startGame}>START GAME</button>
            <button className="px-4 py-2 rounded-full bg-red-500 text-white shadow-md" onClick={() => setCameraOn((prev) => !prev)}>
              {cameraOn ? "TURN CAMERA OFF" : "TURN CAMERA ON"}
            </button>
            <button className="px-4 py-2 rounded-full bg-gray-500 text-white shadow-md" onClick={exitGame}>EXIT GAME</button>
          </div>
        </nav>

        <h1 className="text-3xl font-bold mb-2 hover:text-purple-700 transition-all">ColourMash</h1>
        <p className="mb-2 text-lg">Level: {level} ⭐ Stars: {stars}</p>

        <div className="w-80 h-6 bg-gray-300 rounded-full mb-4">
          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {showStartCountdown ? (
          <div className="w-32 h-32 mb-4 rounded-2xl shadow-lg flex items-center justify-center text-5xl font-bold text-white animate-pulse bg-purple-600">
            {currentColor}
          </div>
        ) : (
          <div className="w-32 h-32 mb-4 rounded-2xl shadow-lg flex items-center justify-center text-xl font-bold text-white transition-colors" style={{ backgroundColor: currentColor || "#fff" }}>
            {currentColor && currentColor.toUpperCase()}
          </div>
        )}

        {cameraOn && <video ref={videoRef} autoPlay playsInline muted width={300} height={200} className="rounded-lg shadow-lg mb-2" />}
        <canvas ref={canvasRef} width={300} height={200} style={{ display: "none" }} />

        {gameActive && !flashing && !showStartCountdown && (
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

        {/* RESULT MODAL */}
        {result && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
              {result === "win" ? (
                <>
                  <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Congrats! Level Complete 🎉</h2>
                  <div className="flex space-x-4 justify-center">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md" onClick={() => { setLevel((prev) => prev + 1); setResult(null); startGame(); }}>Next Level</button>
                    <button className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md" onClick={exitGame}>Exit</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Sorry! Wrong Sequence ❌</h2>
                  <div className="flex space-x-4 justify-center">
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow-md" onClick={() => { setResult(null); startGame(); }}>Try Again</button>
                    <button className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md" onClick={exitGame}>Exit</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 1s ease forwards; }
      `}</style>
    </div>
  );
}