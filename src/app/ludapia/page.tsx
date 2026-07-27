"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./ludapia.css";
import { initLudapiaGame } from "./game";

export default function LudapiaPage() {
  useEffect(() => {
    const cleanup = initLudapiaGame();
    return cleanup;
  }, []);

  return (
    <div className="ludapia-root">
      <div id="introScreen" className="intro-screen">
        <h1 className="intro-title">🕴️ 루다피아</h1>
        <p className="intro-sub">세계의 위인들이 모인 마을에 마피아가 숨어들었다...</p>
        <div id="introGrid" className="intro-grid" />
        <button id="introStartBtn" className="intro-start-btn">
          게임 시작
        </button>
        <Link href="/" className="intro-back-link">
          ← 루다월드로 돌아가기
        </Link>
      </div>

      <div className="ludapia-layout">
        <div className="ludapia-main">
          <div className="hud-bar">
            <span id="role" className="hud-item" />
            <span id="phase" className="hud-item" />
            <span className="hud-item">
              남은 시간: <b id="timer">0</b>초
            </span>
          </div>

          <div id="gameWrap" className="game-wrap">
            <canvas id="game" />
            <div id="hint" className="overlay-hint" />
            <div id="msg" className="overlay-msg" />
            <div id="space" className="overlay-space">
              스페이스바 연타!
            </div>

            <div id="charMenu" className="char-menu">
              <div id="charMenuHeader" className="char-menu-header" />
              <button data-act="friend">🤝 친구 요청</button>
              <button data-act="quest">🗺️ 모험 제안</button>
              <button data-act="trait">🎭 성향 보기</button>
              <button data-act="item">🎒 모험템 보기</button>
              <button data-act="level">⭐ 레벨 보기</button>
              <button data-act="praise">👍 님좀짱</button>
              <button data-act="report">🚩 신고하기</button>
            </div>

            <div id="voteBox" className="vote-box">
              <h3>🗳️ 투표하기</h3>
              <div id="voteList" />
            </div>
          </div>
        </div>

        <div className="ludapia-side">
          <div className="log-panel">
            <h3>📜 기록</h3>
            <div id="log" className="log-body" />
          </div>
          <div className="chat-panel">
            <h3>💬 채팅</h3>
            <div id="chatMessages" className="chat-body" />
            <div className="chat-input-row">
              <input id="chatInput" type="text" placeholder="메시지 입력..." />
              <button id="chatSendBtn">전송</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
