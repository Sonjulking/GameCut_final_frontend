import React, { useState, useEffect } from "react";
import axios from "axios";

export default function GuessTheRankGame() {
  const TIERS = ["아이언", "브론즈", "골드", "다이아"];
  const [videos, setVideos] = useState([]);
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/videos").then((res) => {
      setVideos(res.data);
      setOrder(res.data.map((_, i) => i).sort(() => 0.5 - Math.random()));
    });
  }, []);

  const submit = () => {
    if (!choice) {
      setError("등급을 선택해주세요");
      return;
    }
    setAnswers([...answers, choice]);
    setChoice(null);
    setError("");
    if (idx + 1 < order.length) setIdx(idx + 1);
    else setFinished(true);
  };

  if (!videos.length) return <div>Loading...</div>;
  if (finished) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-3xl mb-4">결과</h2>
        <ol className="list-decimal list-inside">
          {answers.map((a, i) => (
            <li key={i}>
              Round {i + 1}: {a}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const vid = videos[order[idx]].attachFile.realPath;
  return (
    <div className="p-6 text-center">
      <video src={vid} controls className="mx-auto w-full h-64 mb-4" />
      <p className="text-2xl mb-2">유저의 랭크는?</p>
      <div className="flex justify-center space-x-2 mb-2">
        {TIERS.map((t, i) => (
          <button
            key={i}
            onClick={() => {
              setChoice(t);
              setError("");
            }}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-xl shadow-lg ${
              choice === t ? "bg-blue-500 text-white" : "bg-white text-black"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 mb-2">{error}</p>}
      <button
        onClick={submit}
        className="px-8 py-3 bg-white text-black rounded-lg"
      >
        다음
      </button>
    </div>
  );
}
