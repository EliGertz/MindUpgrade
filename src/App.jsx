import { useState, useEffect, useRef } from "react";

const API = "http://localhost:3001";

// ── Utilities ─────────────────────────────────────────────────────────────────
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const pick = (arr, n) => shuffle(arr).slice(0, n);
const randItem = arr => arr[Math.floor(Math.random() * arr.length)];

const getTodayKey = () => new Date().toISOString().split("T")[0];
const getStreak = (history) => {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (history[key]?.score === 100) streak++;
    else if (i > 0) break;
  }
  return streak;
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const S = {
  sub: { color:"#aaa", fontSize:14, marginBottom:8, lineHeight:1.5 },
  badge: { background:"#1e1e1e", border:"1px solid #333", borderRadius:6, padding:"5px 12px", fontSize:14, color:"#e8ff6b" },
  input: { background:"#1a1a1a", border:"1px solid #333", borderRadius:8, padding:"10px 12px", color:"#fff", fontFamily:"inherit", fontSize:14, outline:"none", display:"block" },
  btn: { background:"#e8ff6b", color:"#0a0a0a", border:"none", borderRadius:6, padding:"10px 20px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit", width:"100%" },
  ghost: { background:"#1e1e1e", color:"#aaa", border:"1px solid #333", borderRadius:6, padding:"10px 20px", fontSize:14, cursor:"pointer", fontFamily:"inherit", width:"100%" },
  disabled: { background:"#1e1e1e", color:"#444", border:"1px solid #222", borderRadius:6, padding:"10px 20px", fontSize:14, cursor:"not-allowed", fontFamily:"inherit", width:"100%" },
  hint: { background:"#1e1e1e", color:"#FCD34D", border:"1px solid #333", borderRadius:6, padding:"10px 20px", fontSize:14, cursor:"pointer", fontFamily:"inherit" },
  resultRow: { display:"flex", gap:6, alignItems:"center", background:"#1a1a1a", border:"1px solid", borderRadius:6, padding:"6px 10px", fontSize:13 },
  variantTag: { display:"inline-block", background:"#1e1e1e", border:"1px solid #2a2a2a", borderRadius:4, padding:"2px 8px", fontSize:11, color:"#555", letterSpacing:1, marginBottom:12 },
};

const Prompt = ({ children }) => (
  <div style={{ background:"#1a1a1a", borderRadius:8, padding:"14px 16px", marginBottom:16, fontSize:15, color:"#ddd", lineHeight:1.6 }}>{children}</div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MEMORY — 3 variants
// ═════════════════════════════════════════════════════════════════════════════
const WORD_POOL = [
  "lantern","gravity","copper","whisper","marble","eclipse","thunder","fossil",
  "velvet","chimney","anchor","blossom","cactus","dagger","ember","feather",
  "glacier","harbor","insect","jungle","kettle","lemon","mirror","noodle",
  "oyster","pilgrim","quartz","ribbon","saddle","tundra","urchin","volcano",
  "walnut","yonder","zipper","acorn","bridge","candle","desert","falcon",
  "sponge","crystal","pepper","summit","lizard","cobalt","timber","velvet",
];

const NUMBER_SEQUENCES = [
  [7, 3, 9, 1, 5, 8, 2, 6],
  [4, 8, 1, 7, 3, 9, 5, 2],
  [6, 2, 5, 9, 1, 4, 8, 3],
];

const SYMBOL_GRIDS = [
  ["★","▲","●","■","♦","★","▲","●","■","♦","▲","●"],
  ["♠","♥","♣","♦","♠","♥","♣","♦","♠","♥","♣","♦"],
  ["△","○","□","◇","△","○","□","◇","△","○","□","◇"],
];

// Variant A: Word recall (original)
function MemoryWords({ onComplete, onClose }) {
  const [phase, setPhase] = useState("study");
  const [words] = useState(() => pick(WORD_POOL, 10));
  const [timeLeft, setTimeLeft] = useState(30);
  const [inputs, setInputs] = useState(Array(10).fill(""));
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (phase !== "study") return;
    if (timeLeft <= 0) { setPhase("recall"); return; }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const check = () => {
    const correct = inputs.filter((inp, i) => inp.trim().toLowerCase() === words[i].toLowerCase()).length;
    setScore(correct);
    if (correct >= 6) onComplete();
    setPhase("result");
  };

  return (
    <div>
      <span style={S.variantTag}>WORD RECALL</span>
      {phase === "study" && <>
        <p style={S.sub}>Memorise these 10 words in order. You have <strong style={{color:"#e8ff6b"}}>{timeLeft}s</strong>.</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, margin:"16px 0" }}>
          {words.map((w,i) => <span key={w} style={{...S.badge, color:"#aaa"}}><span style={{color:"#555",fontSize:11}}>{i+1}. </span>{w}</span>)}
        </div>
        <button style={S.ghost} onClick={() => setPhase("recall")}>I'm ready →</button>
      </>}
      {phase === "recall" && <>
        <p style={S.sub}>Type the 10 words in the correct order.</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, margin:"16px 0" }}>
          {inputs.map((v, i) => (
            <input key={i} style={S.input} placeholder={`Word ${i+1}`} value={v}
              onChange={e => setInputs(inp => { const n=[...inp]; n[i]=e.target.value; return n; })} />
          ))}
        </div>
        <button style={S.btn} onClick={check}>Check my memory</button>
      </>}
      {phase === "result" && <>
        <p style={S.sub}>You recalled <strong style={{color:"#e8ff6b"}}>{score}/10</strong> words correctly.</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, margin:"16px 0" }}>
          {words.map((w, i) => {
            const ok = inputs[i]?.trim().toLowerCase() === w.toLowerCase();
            return (
              <div key={w} style={{ ...S.resultRow, borderColor: ok ? "#6EE7B7" : "#FCA5A5" }}>
                <span style={{ color: ok ? "#6EE7B7" : "#FCA5A5" }}>{ok ? "✓" : "✗"}</span>
                <span style={{ color:"#aaa", fontSize:13 }}>{inputs[i] || "—"}</span>
                {!ok && <span style={{ color:"#555", fontSize:12 }}>({w})</span>}
              </div>
            );
          })}
        </div>
        {score >= 6
          ? <button style={S.btn} onClick={onClose}>Done ✓</button>
          : <><p style={{ color:"#FCA5A5", fontSize:13, marginBottom:10 }}>Need 6/10 to pass.</p>
            <button style={S.ghost} onClick={() => { setPhase("study"); setInputs(Array(10).fill("")); setTimeLeft(30); }}>Try again</button></>
        }
      </>}
    </div>
  );
}

// Variant B: Number sequence
function MemoryNumbers({ onComplete, onClose }) {
  const [phase, setPhase] = useState("study");
  const [seq] = useState(() => randItem(NUMBER_SEQUENCES));
  const [timeLeft, setTimeLeft] = useState(20);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (phase !== "study") return;
    if (timeLeft <= 0) { setPhase("recall"); return; }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const check = () => {
    const typed = input.replace(/\s+/g,"").split("").map(Number);
    const correct = typed.join("") === seq.join("");
    setResult(correct);
    if (correct) onComplete();
  };

  return (
    <div>
      <span style={S.variantTag}>NUMBER SEQUENCE</span>
      {phase === "study" && <>
        <p style={S.sub}>Memorise this number sequence. You have <strong style={{color:"#e8ff6b"}}>{timeLeft}s</strong>.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", margin:"24px 0", flexWrap:"wrap" }}>
          {seq.map((n,i) => (
            <div key={i} style={{ width:52, height:52, borderRadius:10, background:"#1e1e1e", border:"1px solid #333", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:700, color:"#e8ff6b" }}>{n}</div>
          ))}
        </div>
        <button style={S.ghost} onClick={() => setPhase("recall")}>I'm ready →</button>
      </>}
      {phase === "recall" && <>
        <p style={S.sub}>Type the numbers in the exact order (no spaces needed).</p>
        <input style={{ ...S.input, width:"100%", fontSize:22, letterSpacing:6, textAlign:"center", margin:"16px 0" }}
          placeholder="_ _ _ _ _ _ _ _" value={input} onChange={e => setInput(e.target.value)} maxLength={8} autoFocus />
        <button style={S.btn} onClick={check}>Check</button>
      </>}
      {result !== null && <>
        <div style={{ textAlign:"center", padding:"16px 0" }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{result ? "🔢" : "😬"}</div>
          <p style={S.sub}>{result ? "Perfect sequence!" : <>Wrong. The sequence was: <strong style={{color:"#e8ff6b"}}>{seq.join(" ")}</strong></>}</p>
        </div>
        {result
          ? <button style={S.btn} onClick={onClose}>Done ✓</button>
          : <button style={S.ghost} onClick={() => { setPhase("study"); setInput(""); setResult(null); setTimeLeft(20); }}>Try again</button>
        }
      </>}
    </div>
  );
}

// Variant C: Symbol pattern
function MemorySymbols({ onComplete, onClose }) {
  const [phase, setPhase] = useState("study");
  const [grid] = useState(() => randItem(SYMBOL_GRIDS));
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const uniqueSymbols = [...new Set(grid)];

  useEffect(() => {
    if (phase !== "study") return;
    if (timeLeft <= 0) { setPhase("recall"); return; }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const toggle = (sym) => {
    setSelected(s => s.includes(sym) ? s.filter(x=>x!==sym) : [...s, sym]);
  };

  const check = () => {
    const correct = selected.length === uniqueSymbols.length &&
      uniqueSymbols.every(s => selected.includes(s));
    setResult(correct);
    if (correct) onComplete();
  };

  return (
    <div>
      <span style={S.variantTag}>PATTERN RECALL</span>
      {phase === "study" && <>
        <p style={S.sub}>Remember all the unique symbols. You have <strong style={{color:"#e8ff6b"}}>{timeLeft}s</strong>.</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", margin:"20px 0" }}>
          {grid.map((sym,i) => (
            <div key={i} style={{ width:44, height:44, borderRadius:8, background:"#1e1e1e", border:"1px solid #333", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{sym}</div>
          ))}
        </div>
        <button style={S.ghost} onClick={() => setPhase("recall")}>I'm ready →</button>
      </>}
      {phase === "recall" && <>
        <p style={S.sub}>Select all the unique symbols that appeared.</p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", margin:"20px 0" }}>
          {["★","▲","●","■","♦","♠","♥","♣","△","○","□","◇"].map(sym => (
            <button key={sym} onClick={() => toggle(sym)} style={{
              width:52, height:52, borderRadius:10, fontSize:22, cursor:"pointer",
              background: selected.includes(sym) ? "#e8ff6b22" : "#1e1e1e",
              border: `2px solid ${selected.includes(sym) ? "#e8ff6b" : "#333"}`,
              color: selected.includes(sym) ? "#e8ff6b" : "#777",
              transition:"all .15s",
            }}>{sym}</button>
          ))}
        </div>
        <button style={S.btn} onClick={check}>Check</button>
      </>}
      {result !== null && <>
        <div style={{ textAlign:"center", padding:"16px 0" }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{result ? "✨" : "😬"}</div>
          <p style={S.sub}>{result ? "All symbols correct!" : <>Not quite. The symbols were: <strong style={{color:"#e8ff6b"}}>{uniqueSymbols.join(" ")}</strong></>}</p>
        </div>
        {result
          ? <button style={S.btn} onClick={onClose}>Done ✓</button>
          : <button style={S.ghost} onClick={() => { setPhase("study"); setSelected([]); setResult(null); setTimeLeft(15); }}>Try again</button>
        }
      </>}
    </div>
  );
}

function MemoryTask({ onComplete, onClose }) {
  const [variant] = useState(() => randItem([MemoryWords, MemoryNumbers, MemorySymbols]));
  const V = variant;
  return <V onComplete={onComplete} onClose={onClose} />;
}

// ═════════════════════════════════════════════════════════════════════════════
// FOCUS — 3 variants
// ═════════════════════════════════════════════════════════════════════════════
const FOCUS_PASSAGES = [
  "The quick brown fox jumps over the lazy dog near the riverbank every morning.",
  "Patience is not the ability to wait but how you act while you are waiting.",
  "In the middle of every difficulty lies an opportunity worth pursuing.",
];

const genMathProblem = () => {
  const steps = [];
  // Start with a round number that's divisible by 2,3,4,5 for clean divides
  const starts = [60, 80, 100, 120, 150, 180, 200, 240];
  let val = starts[Math.floor(Math.random() * starts.length)];
  steps.push(`Start with ${val}`);
  const numSteps = 4 + Math.floor(Math.random() * 2); // 4 or 5 steps
  for (let i = 0; i < numSteps; i++) {
    const divisors = [2, 3, 4, 5, 6].filter(d => val % d === 0 && val / d >= 10);
    const choices = ["add", "subtract", "multiply"];
    if (divisors.length > 0) choices.push("divide");
    const op = choices[Math.floor(Math.random() * choices.length)];
    if (op === "add") {
      const n = Math.floor(Math.random() * 40) + 5;
      val += n; steps.push(`Add ${n}`);
    } else if (op === "subtract") {
      const max = Math.min(val - 10, 50);
      const n = Math.floor(Math.random() * max) + 5;
      val -= n; steps.push(`Subtract ${n}`);
    } else if (op === "multiply") {
      const n = [2, 3][Math.floor(Math.random() * 2)];
      if (val * n < 2000) { val *= n; steps.push(`Multiply by ${n}`); }
      else { val += 10; steps.push(`Add 10`); }
    } else {
      const d = divisors[Math.floor(Math.random() * divisors.length)];
      val = val / d; steps.push(`Divide by ${d}`);
    }
  }
  return { steps, answer: val };
};

const FIND_THE_ODD = [
  { items: ["apple","mango","banana","hammer","grape"], odd: "hammer", category: "fruits" },
  { items: ["piano","guitar","trumpet","painting","violin"], odd: "painting", category: "instruments" },
  { items: ["Paris","Berlin","Tokyo","Amazon","Rome"], odd: "Amazon", category: "capitals" },
];

// Variant A: Typing test
function FocusTyping({ onComplete, onClose }) {
  const [passage] = useState(() => randItem(FOCUS_PASSAGES));
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setTyped(val);
    if (val.length >= passage.length) {
      let correct = 0;
      for (let i = 0; i < passage.length; i++) if (val[i] === passage[i]) correct++;
      const acc = Math.round((correct / passage.length) * 100);
      setResult(acc);
      if (acc >= 90) onComplete();
    }
  };

  return (
    <div>
      <span style={S.variantTag}>TYPING ACCURACY</span>
      {result === null ? <>
        <p style={S.sub}>Type this passage <strong>exactly</strong>. Accuracy ≥ 90% to pass.</p>
        <div style={{ background:"#1a1a1a", borderRadius:8, padding:"14px 16px", margin:"16px 0", lineHeight:2, fontSize:15 }}>
          {passage.split("").map((ch, i) => {
            let color = "#777";
            if (i < typed.length) color = typed[i] === ch ? "#e8ff6b" : "#FCA5A5";
            return <span key={i} style={{ color }}>{ch}</span>;
          })}
        </div>
        <textarea style={{ ...S.input, width:"100%", height:80, resize:"none", fontFamily:"monospace" }}
          placeholder="Start typing here..." value={typed} onChange={handleChange} autoFocus />
      </> : <>
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{result >= 90 ? "🎯" : "😬"}</div>
          <p style={S.sub}>Accuracy: <strong style={{ color: result >= 90 ? "#e8ff6b" : "#FCA5A5" }}>{result}%</strong></p>
        </div>
        {result >= 90
          ? <button style={S.btn} onClick={onClose}>Done ✓</button>
          : <button style={S.ghost} onClick={() => { setTyped(""); setResult(null); }}>Try again</button>
        }
      </>}
    </div>
  );
}

// Variant B: Mental math chain
function FocusMath({ onComplete, onClose }) {
  const [problem] = useState(() => genMathProblem());
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  const check = () => {
    const correct = parseInt(answer.trim()) === problem.answer;
    setResult(correct);
    if (correct) onComplete();
  };

  return (
    <div>
      <span style={S.variantTag}>MENTAL MATH</span>
      <p style={S.sub}>Follow each step in your head — no calculator!</p>
      <div style={{ margin:"16px 0" }}>
        {problem.steps.map((step, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#1a1a1a", borderRadius:8, marginBottom:6 }}>
            <span style={{ color:"#555", fontSize:12, fontWeight:600, width:20 }}>{i+1}.</span>
            <span style={{ color:"#ddd", fontSize:15 }}>{step}</span>
          </div>
        ))}
      </div>
      {result === null ? <>
        <input style={{ ...S.input, width:"100%", fontSize:22, textAlign:"center", marginBottom:10 }}
          type="number" placeholder="Your answer" value={answer} onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()} autoFocus />
        <button style={S.btn} onClick={check}>Submit</button>
      </> : <>
        <div style={{ textAlign:"center", padding:"16px 0" }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{result ? "🧮" : "😬"}</div>
          <p style={S.sub}>{result ? "Correct!" : <>Wrong. The answer was <strong style={{color:"#e8ff6b"}}>{problem.answer}</strong>.</>}</p>
        </div>
        {result
          ? <button style={S.btn} onClick={onClose}>Done ✓</button>
          : <button style={S.ghost} onClick={() => { setAnswer(""); setResult(null); }}>Try again</button>
        }
      </>}
    </div>
  );
}

// Variant C: Find the odd one out
function FocusOdd({ onComplete, onClose }) {
  const [problem] = useState(() => randItem(FIND_THE_ODD));
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const check = (item) => {
    setSelected(item);
    const correct = item === problem.odd;
    setResult(correct);
    if (correct) onComplete();
  };

  return (
    <div>
      <span style={S.variantTag}>ODD ONE OUT</span>
      <p style={S.sub}>Which one does <strong>not</strong> belong to the same group?</p>
      <div style={{ display:"flex", flexDirection:"column", gap:8, margin:"16px 0" }}>
        {problem.items.map(item => {
          let bg = "#1a1a1a", border = "#333", color = "#ddd";
          if (selected === item) {
            bg = result ? "#6EE7B722" : "#FCA5A522";
            border = result ? "#6EE7B7" : "#FCA5A5";
            color = result ? "#6EE7B7" : "#FCA5A5";
          }
          return (
            <button key={item} onClick={() => !result && check(item)} style={{
              background:bg, border:`1px solid ${border}`, borderRadius:8,
              padding:"12px 16px", color, fontSize:16, cursor: result ? "default" : "pointer",
              fontFamily:"inherit", textAlign:"left", transition:"all .15s",
            }}>{item}</button>
          );
        })}
      </div>
      {result !== null && <>
        <p style={{ color: result ? "#6EE7B7" : "#FCA5A5", fontSize:14, marginBottom:12 }}>
          {result ? `Correct! "${problem.odd}" is not a ${problem.category}.` : `Not quite. "${problem.odd}" doesn't belong — it's not a ${problem.category}.`}
        </p>
        {result
          ? <button style={S.btn} onClick={onClose}>Done ✓</button>
          : <button style={S.ghost} onClick={() => { setSelected(null); setResult(null); }}>Try again</button>
        }
      </>}
    </div>
  );
}

function FocusTask({ onComplete, onClose }) {
  const [variant] = useState(() => randItem([FocusTyping, FocusMath, FocusOdd]));
  const V = variant;
  return <V onComplete={onComplete} onClose={onClose} />;
}

// ═════════════════════════════════════════════════════════════════════════════
// THINKING — 3 variants
// ═════════════════════════════════════════════════════════════════════════════
const THINKING_PROMPTS = [
  "You wake up and discover you can no longer read. What are the first 3 things you do?",
  "A café is losing customers. List 3 specific creative reasons why and one fix for each.",
  "You have €100 and one free afternoon. How do you turn it into the most value for others?",
];

const PROS_CONS_TOPICS = [
  "Moving to a new city where you know nobody",
  "Quitting your job to start a business",
  "Deleting all social media permanently",
];

const WHAT_IF_PROMPTS = [
  "What if everyone on Earth could hear your thoughts for one hour?",
  "What if you woke up tomorrow as the leader of your country?",
  "What if you discovered your best friend had been lying to you for years?",
];

// Variant A: 3 ideas brainstorm
function ThinkingBrainstorm({ onComplete, onClose }) {
  const [prompt] = useState(() => randItem(THINKING_PROMPTS));
  const [answers, setAnswers] = useState(["","",""]);
  const [submitted, setSubmitted] = useState(false);
  const ready = answers.filter(a => a.trim().length > 10).length >= 3;
  const submit = () => { if (ready) { setSubmitted(true); onComplete(); } };

  return (
    <div>
      <span style={S.variantTag}>BRAINSTORM</span>
      <Prompt>{prompt}</Prompt>
      {!submitted ? <>
        <p style={S.sub}>Write 3 distinct ideas (10+ chars each).</p>
        {answers.map((a, i) => (
          <div key={i} style={{ marginBottom:10 }}>
            <label style={{ color:"#555", fontSize:11, letterSpacing:1.5 }}>IDEA {i+1}</label>
            <textarea style={{ ...S.input, width:"100%", height:68, resize:"none", marginTop:4 }}
              placeholder={`Your idea ${i+1}...`} value={a}
              onChange={e => setAnswers(ans => { const n=[...ans]; n[i]=e.target.value; return n; })} />
          </div>
        ))}
        <button style={ready ? S.btn : S.disabled} onClick={submit} disabled={!ready}>Submit</button>
      </> : <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>💡</div>
        <p style={S.sub}>Great thinking!</p>
        <button style={S.btn} onClick={onClose}>Done ✓</button>
      </div>}
    </div>
  );
}

// Variant B: Pros & Cons
function ThinkingProsCons({ onComplete, onClose }) {
  const [topic] = useState(() => randItem(PROS_CONS_TOPICS));
  const [pros, setPros] = useState(["",""]);
  const [cons, setCons] = useState(["",""]);
  const [submitted, setSubmitted] = useState(false);
  const ready = pros.every(p=>p.trim().length>5) && cons.every(c=>c.trim().length>5);
  const submit = () => { if (ready) { setSubmitted(true); onComplete(); } };

  return (
    <div>
      <span style={S.variantTag}>PROS & CONS</span>
      <Prompt>{topic}</Prompt>
      {!submitted ? <>
        <p style={S.sub}>Give 2 genuine pros and 2 genuine cons.</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, margin:"16px 0" }}>
          <div>
            <label style={{ color:"#6EE7B7", fontSize:11, letterSpacing:1.5 }}>✓ PROS</label>
            {pros.map((p,i) => (
              <textarea key={i} style={{ ...S.input, width:"100%", height:60, resize:"none", marginTop:6, borderColor:"#6EE7B733" }}
                placeholder={`Pro ${i+1}...`} value={p}
                onChange={e => setPros(arr => { const n=[...arr]; n[i]=e.target.value; return n; })} />
            ))}
          </div>
          <div>
            <label style={{ color:"#FCA5A5", fontSize:11, letterSpacing:1.5 }}>✗ CONS</label>
            {cons.map((c,i) => (
              <textarea key={i} style={{ ...S.input, width:"100%", height:60, resize:"none", marginTop:6, borderColor:"#FCA5A533" }}
                placeholder={`Con ${i+1}...`} value={c}
                onChange={e => setCons(arr => { const n=[...arr]; n[i]=e.target.value; return n; })} />
            ))}
          </div>
        </div>
        <button style={ready ? S.btn : S.disabled} onClick={submit} disabled={!ready}>Submit</button>
      </> : <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>⚖️</div>
        <p style={S.sub}>Well considered!</p>
        <button style={S.btn} onClick={onClose}>Done ✓</button>
      </div>}
    </div>
  );
}

// Variant C: What if scenario
function ThinkingWhatIf({ onComplete, onClose }) {
  const [prompt] = useState(() => randItem(WHAT_IF_PROMPTS));
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const ready = wordCount >= 30;
  const submit = () => { if (ready) { setSubmitted(true); onComplete(); } };

  return (
    <div>
      <span style={S.variantTag}>WHAT IF</span>
      <Prompt>{prompt}</Prompt>
      {!submitted ? <>
        <p style={S.sub}>Explore the scenario in at least <strong style={{color:"#e8ff6b"}}>30 words</strong>.</p>
        <textarea style={{ ...S.input, width:"100%", height:120, resize:"none", marginBottom:10 }}
          placeholder="Think it through..." value={answer} onChange={e => setAnswer(e.target.value)} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color: ready ? "#6EE7B7" : "#555", fontSize:13 }}>{wordCount} / 30 words</span>
          <button style={{ ...(ready ? S.btn : S.disabled), width:"auto", padding:"10px 24px" }} onClick={submit} disabled={!ready}>Submit</button>
        </div>
      </> : <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🌀</div>
        <p style={S.sub}>Imaginative thinking!</p>
        <button style={S.btn} onClick={onClose}>Done ✓</button>
      </div>}
    </div>
  );
}

function ThinkingTask({ onComplete, onClose }) {
  const [variant] = useState(() => randItem([ThinkingBrainstorm, ThinkingProsCons, ThinkingWhatIf]));
  const V = variant;
  return <V onComplete={onComplete} onClose={onClose} />;
}

// ═════════════════════════════════════════════════════════════════════════════
// PATIENCE — 3 variants
// ═════════════════════════════════════════════════════════════════════════════
const PATIENCE_DELAYS = [3000, 4500, 5000, 3500, 4000];

// Variant A: Reaction tap (original)
function PatienceTap({ onComplete, onClose }) {
  const [round, setRound] = useState(0);
  const [canTap, setCanTap] = useState(false);
  const [tapTime, setTapTime] = useState(null);
  const [results, setResults] = useState([]);
  const [tooEarly, setTooEarly] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const total = 3;

  useEffect(() => {
    if (done) return;
    setCanTap(false); setTooEarly(false);
    const delay = PATIENCE_DELAYS[round % PATIENCE_DELAYS.length] + Math.random() * 2000;
    timerRef.current = setTimeout(() => { setCanTap(true); setTapTime(Date.now()); }, delay);
    return () => clearTimeout(timerRef.current);
  }, [round, done]);

  const handleTap = () => {
    if (!canTap) { clearTimeout(timerRef.current); setTooEarly(true); return; }
    const reaction = Date.now() - tapTime;
    const nr = [...results, reaction];
    setResults(nr);
    if (nr.length >= total) { setDone(true); onComplete(); }
    else { setRound(r => r+1); }
  };

  const avg = results.length ? Math.round(results.reduce((a,b)=>a+b,0)/results.length) : null;

  return (
    <div>
      <span style={S.variantTag}>REACTION TAP</span>
      <p style={S.sub}>{done ? `All done! Average reaction: ${avg}ms` : `Round ${round+1} of ${total} — wait for green, then tap.`}</p>
      {!done && <div style={{ display:"flex", justifyContent:"center", margin:"32px 0" }}>
        {tooEarly
          ? <div style={{ textAlign:"center" }}>
              <div style={{ color:"#FCA5A5", fontSize:16, marginBottom:16 }}>Too early! Wait for green. 😅</div>
              <button style={S.ghost} onClick={() => { setTooEarly(false); setRound(r=>r); }}>Try again</button>
            </div>
          : <button onClick={handleTap} style={{
              width:140, height:140, borderRadius:"50%",
              background: canTap ? "#6EE7B7" : "#1e1e1e",
              border:`3px solid ${canTap?"#6EE7B7":"#333"}`,
              cursor:"pointer", fontSize: canTap?32:24,
              transition:"background .1s, border-color .1s",
              color: canTap?"#0a0a0a":"#444",
            }}>{canTap ? "TAP!" : "⏳"}</button>
        }
      </div>}
      {results.length > 0 && <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16, flexWrap:"wrap" }}>
        {results.map((r,i) => (
          <span key={i} style={{ background:"#1a1a1a", border:"1px solid #333", borderRadius:6, padding:"4px 12px", fontSize:12, color:"#6EE7B7" }}>{r}ms</span>
        ))}
      </div>}
      {done && <button style={S.btn} onClick={onClose}>Done ✓</button>}
    </div>
  );
}

// Variant B: Hold the button for exactly N seconds
function PatienceHold({ onComplete, onClose }) {
  const TARGET = 5;
  const [holding, setHolding] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const startRef = useRef(null);
  const intervalRef = useRef(null);

  const startHold = () => {
    setHolding(true);
    setElapsed(0);
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(((Date.now() - startRef.current) / 1000));
    }, 50);
  };

  const stopHold = () => {
    clearInterval(intervalRef.current);
    const held = (Date.now() - startRef.current) / 1000;
    setHolding(false);
    setElapsed(held);
    const diff = Math.abs(held - TARGET);
    const success = diff <= 0.5;
    setResult({ held: held.toFixed(2), diff: diff.toFixed(2), success });
    setAttempts(a => a+1);
    if (success) onComplete();
  };

  return (
    <div>
      <span style={S.variantTag}>HOLD THE BEAT</span>
      <p style={S.sub}>Hold the button for <strong style={{color:"#e8ff6b"}}>exactly {TARGET} seconds</strong>, then release. No counting out loud!</p>
      <div style={{ display:"flex", justifyContent:"center", margin:"28px 0" }}>
        <button
          onMouseDown={startHold} onMouseUp={stopHold}
          onTouchStart={e=>{e.preventDefault();startHold();}} onTouchEnd={e=>{e.preventDefault();stopHold();}}
          style={{
            width:140, height:140, borderRadius:"50%",
            background: holding ? "#C4B5FD" : "#1e1e1e",
            border:`3px solid ${holding?"#C4B5FD":"#333"}`,
            cursor:"pointer", fontSize:holding?28:16,
            color: holding?"#0a0a0a":"#666",
            userSelect:"none", transition:"background .1s",
          }}>
          {holding ? `${elapsed.toFixed(1)}s` : "HOLD"}
        </button>
      </div>
      {result && <>
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <p style={S.sub}>You held for <strong style={{color:"#e8ff6b"}}>{result.held}s</strong> — {result.diff}s off target.</p>
          {result.success
            ? <p style={{ color:"#6EE7B7", fontSize:14 }}>Within 0.5s — perfect timing! 🎯</p>
            : <p style={{ color:"#FCA5A5", fontSize:14 }}>Need to be within 0.5s of {TARGET}s.</p>
          }
        </div>
        {result.success
          ? <button style={S.btn} onClick={onClose}>Done ✓</button>
          : <button style={S.ghost} onClick={() => setResult(null)}>Try again</button>
        }
      </>}
    </div>
  );
}

// Variant C: Delayed gratification — wait for the bigger reward
function PatienceDelay({ onComplete, onClose }) {
  const [phase, setPhase] = useState("intro"); // intro | waiting | won | failed
  const [countdown, setCountdown] = useState(12);

  useEffect(() => {
    if (phase !== "waiting") return;
    if (countdown <= 0) { setPhase("won"); onComplete(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const retry = () => { setPhase("intro"); setCountdown(12); };

  return (
    <div>
      <span style={S.variantTag}>DELAYED GRATIFICATION</span>
      {phase === "intro" && <>
        <p style={S.sub}>You have two options. Choose carefully.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10, margin:"20px 0" }}>
          <button style={S.btn} onClick={() => setPhase("waiting")}>
            ⏳ Wait 12 seconds — earn 3 points
          </button>
          <button style={S.ghost} onClick={() => setPhase("failed")}>
            Take 1 point now
          </button>
        </div>
        <p style={{ color:"#333", fontSize:12 }}>Patience is a skill. Train it.</p>
      </>}
      {phase === "waiting" && <>
        <p style={S.sub}>Hold on... <strong style={{color:"#C4B5FD"}}>{countdown}s</strong> left. Don't give up!</p>
        <div style={{ display:"flex", justifyContent:"center", margin:"28px 0" }}>
          <div style={{
            width:140, height:140, borderRadius:"50%",
            background:"#C4B5FD22", border:"3px solid #C4B5FD",
            display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column",
          }}>
            <span style={{ fontSize:42, fontWeight:700, color:"#C4B5FD", lineHeight:1 }}>{countdown}</span>
            <span style={{ fontSize:10, color:"#666", letterSpacing:1.5, marginTop:4 }}>SECONDS</span>
          </div>
        </div>
        <button style={S.ghost} onClick={() => setPhase("failed")}>Give up (take 1 point)</button>
      </>}
      {phase === "won" && <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🏆</div>
        <p style={S.sub}>You waited! Patience always pays off.</p>
        <button style={S.btn} onClick={onClose}>Done ✓</button>
      </div>}
      {phase === "failed" && <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>😅</div>
        <p style={S.sub}>You took the easy reward. Impulse wins this round.</p>
        <button style={S.ghost} onClick={retry}>Try again</button>
      </div>}
    </div>
  );
}

function PatienceTask({ onComplete, onClose }) {
  const [variant] = useState(() => randItem([PatienceTap, PatienceHold, PatienceDelay]));
  const V = variant;
  return <V onComplete={onComplete} onClose={onClose} />;
}

// ═════════════════════════════════════════════════════════════════════════════
// PROBLEM SOLVING — 3 variants
// ═════════════════════════════════════════════════════════════════════════════
const RIDDLES = [
  { q: "A farmer has 17 sheep. All but 9 die. How many sheep does he have left?", a: "9", hint: "Read it carefully — the answer is in the question.", open: false },
  { q: "What has keys but no locks, space but no room, and you can enter but can't go inside?", a: "keyboard", hint: "Think about everyday objects you use right now.", open: false },
  { q: "I speak without a mouth and hear without ears. I have no body but come alive with wind. What am I?", a: "echo", hint: "Think about what happens in mountains or caves.", open: false },
  { q: "The more you take, the more you leave behind. What am I?", a: "footsteps", hint: "Think about walking.", open: false },
  { q: "I have cities, but no houses live there. I have mountains, but no trees grow. I have water, but no fish swim. What am I?", a: "map", hint: "Think of something you use to navigate.", open: false },
  { q: "What gets wetter the more it dries?", a: "towel", hint: "You use it right after a shower.", open: false },
];

const LOGIC_PUZZLES = [
  { q: "Alice is older than Bob. Bob is older than Carol. Carol is older than Dave. Who is the youngest?", a: "dave", hint: "Follow the chain step by step.", open: false },
  { q: "A rooster lays an egg on top of a barn roof. Which way does it roll?", a: "roosters don't lay eggs", hint: "Read the question very carefully.", open: false },
  { q: "You have two buckets: one holds 3L, one holds 5L. How do you measure exactly 4L?", a: "", hint: "Fill the 5L, pour into 3L, empty 3L, pour remaining 2L into 3L, refill 5L, pour 1L into 3L.", open: true },
  { q: "If you're running a race and you pass the person in 2nd place, what position are you now in?", a: "2nd", hint: "You didn't pass the person in 1st place.", open: false },
  { q: "A woman shoots her husband, then holds him underwater for five minutes. Ten minutes later they go out to dinner together. How?", a: "", hint: "Think of a profession where 'shooting' and 'developing' mean something different.", open: true },
];

const PATTERN_PUZZLES = [
  { q: "What comes next? 2, 4, 8, 16, 32, ___", a: "64", hint: "Each number is doubled.", open: false },
  { q: "What comes next? 1, 1, 2, 3, 5, 8, ___", a: "13", hint: "Each number is the sum of the two before it.", open: false },
  { q: "What comes next? A, C, E, G, ___", a: "i", hint: "Think about every other letter in the alphabet.", open: false },
];

function ProblemRiddle({ onComplete, onClose }) {
  const [puzzle] = useState(() => randItem(RIDDLES));
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState(null);

  const check = () => {
    const clean = answer.trim().toLowerCase();
    const correct = clean === puzzle.a || clean.includes(puzzle.a);
    setResult(correct ? "correct" : "wrong");
    if (correct) onComplete();
  };

  return (
    <div>
      <span style={S.variantTag}>RIDDLE</span>
      <Prompt>{puzzle.q}</Prompt>
      {result === null && <>
        <input style={{ ...S.input, width:"100%", marginBottom:10 }} placeholder="Your answer..." value={answer}
          onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key==="Enter" && check()} autoFocus />
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ ...S.btn, flex:1, width:"auto" }} onClick={check}>Submit</button>
          <button style={{ ...S.hint, width:"auto" }} onClick={() => setShowHint(h=>!h)}>{showHint?"Hide":"Hint 💬"}</button>
        </div>
        {showHint && <p style={{ color:"#FCD34D", fontSize:13, marginTop:10 }}>{puzzle.hint}</p>}
      </>}
      {result === "correct" && <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🔓</div>
        <p style={S.sub}>Correct!</p>
        <button style={S.btn} onClick={onClose}>Done ✓</button>
      </div>}
      {result === "wrong" && <>
        <p style={{ color:"#FCA5A5", fontSize:14, marginBottom:10 }}>Not quite. Answer: <strong style={{color:"#e8ff6b"}}>{puzzle.a}</strong></p>
        <button style={S.ghost} onClick={() => { setResult(null); setAnswer(""); }}>Try again</button>
      </>}
    </div>
  );
}

function ProblemLogic({ onComplete, onClose }) {
  const [puzzle] = useState(() => randItem(LOGIC_PUZZLES));
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState(null);

  const check = () => {
    const clean = answer.trim().toLowerCase();
    const correct = puzzle.open ? clean.length >= 20 : clean === puzzle.a || clean.includes(puzzle.a);
    setResult(correct ? "correct" : "wrong");
    if (correct) onComplete();
  };

  return (
    <div>
      <span style={S.variantTag}>LOGIC PUZZLE</span>
      <Prompt>{puzzle.q}</Prompt>
      {result === null && <>
        <textarea style={{ ...S.input, width:"100%", height:80, resize:"none", marginBottom:10 }}
          placeholder="Your answer..." value={answer} onChange={e => setAnswer(e.target.value)} />
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ ...S.btn, flex:1, width:"auto" }} onClick={check}>Submit</button>
          <button style={{ ...S.hint, width:"auto" }} onClick={() => setShowHint(h=>!h)}>{showHint?"Hide":"Hint 💬"}</button>
        </div>
        {showHint && <p style={{ color:"#FCD34D", fontSize:13, marginTop:10 }}>{puzzle.hint}</p>}
      </>}
      {result === "correct" && <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🧩</div>
        <p style={S.sub}>Solved!</p>
        <button style={S.btn} onClick={onClose}>Done ✓</button>
      </div>}
      {result === "wrong" && <>
        <p style={{ color:"#FCA5A5", fontSize:14, marginBottom:10 }}>Not quite. {!puzzle.open && <>Answer: <strong style={{color:"#e8ff6b"}}>{puzzle.a}</strong></>}</p>
        <button style={S.ghost} onClick={() => { setResult(null); setAnswer(""); }}>Try again</button>
      </>}
    </div>
  );
}

function ProblemPattern({ onComplete, onClose }) {
  const [puzzle] = useState(() => randItem(PATTERN_PUZZLES));
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  const check = () => {
    const correct = answer.trim().toLowerCase() === puzzle.a.toLowerCase();
    setResult(correct ? "correct" : "wrong");
    if (correct) onComplete();
  };

  return (
    <div>
      <span style={S.variantTag}>PATTERN</span>
      <Prompt>{puzzle.q}</Prompt>
      {result === null && <>
        <input style={{ ...S.input, width:"100%", fontSize:20, textAlign:"center", marginBottom:10 }}
          placeholder="Next in sequence..." value={answer} onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key==="Enter" && check()} autoFocus />
        <button style={S.btn} onClick={check}>Submit</button>
      </>}
      {result === "correct" && <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>✅</div>
        <p style={S.sub}>Pattern cracked!</p>
        <button style={S.btn} onClick={onClose}>Done ✓</button>
      </div>}
      {result === "wrong" && <>
        <p style={{ color:"#FCA5A5", fontSize:14, marginBottom:10 }}>Not quite. The answer is <strong style={{color:"#e8ff6b"}}>{puzzle.a}</strong>. Hint: {puzzle.hint}</p>
        <button style={S.ghost} onClick={() => { setResult(null); setAnswer(""); }}>Try again</button>
      </>}
    </div>
  );
}

function ProblemTask({ onComplete, onClose }) {
  const [variant] = useState(() => randItem([ProblemRiddle, ProblemLogic, ProblemPattern]));
  const V = variant;
  return <V onComplete={onComplete} onClose={onClose} />;
}

// ═════════════════════════════════════════════════════════════════════════════
// WRITING — 3 variants
// ═════════════════════════════════════════════════════════════════════════════
const WRITING_PROMPTS_REFLECTIVE = [
  "Write about a moment when you changed your mind about something important.",
  "Describe your perfect ordinary Tuesday in vivid, specific detail.",
  "Tell the story of an object near you — where it came from, what it has witnessed.",
];

const WRITING_PROMPTS_LETTER = [
  "Write a short letter to your 10-years-younger self. What do you most need them to know?",
  "Write a thank-you letter to someone who shaped you — but never send it.",
  "Write a letter from your future self, 10 years from now.",
];

const WRITING_PROMPTS_STORY = [
  "Write the opening paragraph of a story that begins: \"Nobody expected the library to catch fire.\"",
  "Write a scene: two strangers share an umbrella in the rain for 3 minutes.",
  "Write a story in exactly 6 sentences. It must include a door, a secret, and a number.",
];

function WritingReflective({ onComplete, onClose }) {
  const [prompt] = useState(() => randItem(WRITING_PROMPTS_REFLECTIVE));
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const submit = () => { setSubmitted(true); onComplete(); };

  return (
    <div>
      <span style={S.variantTag}>REFLECTION</span>
      <Prompt>{prompt}</Prompt>
      {!submitted ? <>
        <p style={S.sub}>Write at least <strong style={{color:"#e8ff6b"}}>50 words</strong>.</p>
        <textarea style={{ ...S.input, width:"100%", height:160, resize:"vertical", marginBottom:10 }}
          placeholder="Write freely..." value={text} onChange={e => setText(e.target.value)} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color: wordCount>=50 ? "#6EE7B7" : "#555", fontSize:13 }}>{wordCount} / 50 words</span>
          <button style={{ ...(wordCount>=50?S.btn:S.disabled), width:"auto", padding:"10px 24px" }} onClick={submit} disabled={wordCount<50}>Submit</button>
        </div>
      </> : <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>✍️</div>
        <p style={S.sub}>Beautifully done.</p>
        <button style={S.btn} onClick={onClose}>Done ✓</button>
      </div>}
    </div>
  );
}

function WritingLetter({ onComplete, onClose }) {
  const [prompt] = useState(() => randItem(WRITING_PROMPTS_LETTER));
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const submit = () => { setSubmitted(true); onComplete(); };

  return (
    <div>
      <span style={S.variantTag}>LETTER</span>
      <Prompt>{prompt}</Prompt>
      {!submitted ? <>
        <p style={S.sub}>At least <strong style={{color:"#e8ff6b"}}>40 words</strong>. Write it like a real letter.</p>
        <textarea style={{ ...S.input, width:"100%", height:160, resize:"vertical", marginBottom:10 }}
          placeholder="Dear..." value={text} onChange={e => setText(e.target.value)} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color: wordCount>=40 ? "#6EE7B7" : "#555", fontSize:13 }}>{wordCount} / 40 words</span>
          <button style={{ ...(wordCount>=40?S.btn:S.disabled), width:"auto", padding:"10px 24px" }} onClick={submit} disabled={wordCount<40}>Submit</button>
        </div>
      </> : <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>💌</div>
        <p style={S.sub}>That letter is yours to keep.</p>
        <button style={S.btn} onClick={onClose}>Done ✓</button>
      </div>}
    </div>
  );
}

function WritingStory({ onComplete, onClose }) {
  const [prompt] = useState(() => randItem(WRITING_PROMPTS_STORY));
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const submit = () => { setSubmitted(true); onComplete(); };

  return (
    <div>
      <span style={S.variantTag}>STORY</span>
      <Prompt>{prompt}</Prompt>
      {!submitted ? <>
        <p style={S.sub}>At least <strong style={{color:"#e8ff6b"}}>30 words</strong>. Make it vivid.</p>
        <textarea style={{ ...S.input, width:"100%", height:160, resize:"vertical", marginBottom:10 }}
          placeholder="Once..." value={text} onChange={e => setText(e.target.value)} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color: wordCount>=30 ? "#6EE7B7" : "#555", fontSize:13 }}>{wordCount} / 30 words</span>
          <button style={{ ...(wordCount>=30?S.btn:S.disabled), width:"auto", padding:"10px 24px" }} onClick={submit} disabled={wordCount<30}>Submit</button>
        </div>
      </> : <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>📖</div>
        <p style={S.sub}>Great story!</p>
        <button style={S.btn} onClick={onClose}>Done ✓</button>
      </div>}
    </div>
  );
}

function WritingTask({ onComplete, onClose }) {
  const [variant] = useState(() => randItem([WritingReflective, WritingLetter, WritingStory]));
  const V = variant;
  return <V onComplete={onComplete} onClose={onClose} />;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════════════════════
const TASKS = [
  { id: "memory",   icon: "🧠", label: "Memory",          color: "#6EE7B7" },
  { id: "focus",    icon: "🎯", label: "Focus",            color: "#93C5FD" },
  { id: "thinking", icon: "💡", label: "Thinking",         color: "#FCD34D" },
  { id: "patience", icon: "⏳", label: "Patience",         color: "#C4B5FD" },
  { id: "problem",  icon: "🔐", label: "Problem Solving",  color: "#FCA5A5" },
  { id: "writing",  icon: "✍️", label: "Writing",          color: "#F9A8D4" },
];

const taskComponents = { memory:MemoryTask, focus:FocusTask, thinking:ThinkingTask, patience:PatienceTask, problem:ProblemTask, writing:WritingTask };

export default function MindUpgrade() {
  const [screen, setScreen] = useState("login");
  const [inputEmail, setInputEmail] = useState("");
  const [completed, setCompleted] = useState({});
  const [history, setHistory] = useState({});
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fireworks, setFireworks] = useState(false);
  const [fwParticles, setFwParticles] = useState([]);
  const [miniParticles, setMiniParticles] = useState([]);

  const todayKey = getTodayKey();

  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem("mu_email");
        if (saved) {
          const res = await fetch(`${API}/data/${encodeURIComponent(saved)}`);
          if (res.ok) {
            const data = await res.json();
            setCompleted(data.history?.[todayKey]?.completed || {});
            setHistory(data.history || {});
            setScreen("app");
          } else {
            localStorage.removeItem("mu_email");
          }
        }
      } catch(e) { console.error("Server unreachable", e); }
      setLoading(false);
    })();
  }, []);

  const login = async () => {
    if (!inputEmail.includes("@")) return;
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail }),
      });
      if (!res.ok) { alert("Server error. Is the server running?"); return; }
      const data = await res.json();
      setCompleted(data.history?.[todayKey]?.completed || {});
      setHistory(data.history || {});
      localStorage.setItem("mu_email", inputEmail);
      setScreen("app");
    } catch(e) {
      alert("Cannot reach server. Make sure it is running on localhost:3001");
    }
  };

  const logout = () => {
    localStorage.removeItem("mu_email");
    setInputEmail(""); setCompleted({}); setHistory({}); setScreen("login");
  };

  const genFwParticles = () => {
    const colors = ["#e8ff6b","#6EE7B7","#93C5FD","#F9A8D4","#FCA5A5","#C4B5FD","#fff","#ffd700"];
    const bursts = [{x:30,y:30},{x:70,y:25},{x:20,y:65},{x:80,y:60},{x:50,y:45}];
    return bursts.flatMap(b =>
      Array.from({length:16}, (_, i) => {
        const angle = (i/16)*Math.PI*2 + (Math.random()-0.5)*0.4;
        const dist = 80 + Math.random()*140;
        return {
          id: Math.random(),
          ox: b.x + (Math.random()-0.5)*4,
          oy: b.y + (Math.random()-0.5)*4,
          tx: Math.cos(angle)*dist,
          ty: Math.sin(angle)*dist,
          color: colors[Math.floor(Math.random()*colors.length)],
          delay: Math.random()*0.7,
          dur: 1.2+Math.random()*0.8,
          size: 5+Math.random()*5,
          round: Math.random()>0.5,
        };
      })
    );
  };

  const markComplete = async (taskId) => {
    const isNew = !completed[taskId];
    const nc = { ...completed, [taskId]: true };
    setCompleted(nc);
    const count = Object.values(nc).filter(Boolean).length;
    const score = count === TASKS.length ? 100 : Math.min(99, Math.round((count / TASKS.length) * 100));
    const nh = { ...history, [todayKey]: { completed: nc, score } };
    setHistory(nh);
    const email = localStorage.getItem("mu_email");
    if (email) {
      await fetch(`${API}/data/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: nh }),
      });
    }
    if (!isNew) return;
    if (score === 100) {
      const particles = genFwParticles();
      setFwParticles(particles);
      setFireworks(true);
      setTimeout(() => { setFireworks(false); setFwParticles([]); }, 5000);
    } else {
      const confetti = Array.from({length:20}, (_, i) => ({
        id: Math.random(),
        left: Math.random()*100,
        color: ["#e8ff6b","#6EE7B7","#93C5FD","#F9A8D4","#FCA5A5","#C4B5FD"][i%6],
        delay: Math.random()*0.4,
        size: 6+Math.random()*5,
      }));
      setMiniParticles(confetti);
      setTimeout(() => setMiniParticles([]), 2000);
    }
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const score = completedCount === TASKS.length ? 100 : Math.min(99, Math.round((completedCount / TASKS.length) * 100));
  const streak = getStreak(history);
  const ActiveComp = activeTask ? taskComponents[activeTask] : null;

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ color:"#444", fontFamily:"monospace" }}>Loading...</span>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", fontFamily:"'DM Sans', sans-serif", color:"#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing:border-box; }
        .conf { position:fixed; border-radius:2px; animation:fall 1.8s ease-in forwards; pointer-events:none; z-index:9999; }
        @keyframes fall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(80vh) rotate(540deg);opacity:0} }
        @keyframes fw { 0%{transform:translate(0,0) scale(1.2);opacity:1} 80%{opacity:.8} 100%{transform:translate(var(--fw-x),var(--fw-y)) scale(0);opacity:0} }
        .trow { background:#111; border:1px solid #1e1e1e; border-radius:12px; padding:16px 18px; display:flex; align-items:center; gap:14px; margin-bottom:10px; transition:border-color .2s, transform .15s; cursor:pointer; }
        .trow:hover { border-color:#444; transform:translateY(-1px); }
        .trow.done { border-color:#e8ff6b33; background:#111a00; }
        .sbtn { border:none; border-radius:6px; padding:7px 16px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:opacity .2s; }
        .li { width:100%; padding:14px 16px; background:#1a1a1a; border:1px solid #333; border-radius:6px; color:#fff; font-family:inherit; font-size:16px; outline:none; }
        .li:focus { border-color:#e8ff6b; }
        .li::placeholder { color:#555; }
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,.88); z-index:100; display:flex; align-items:center; justify-content:center; padding:16px; }
        .mbox { background:#111; border:1px solid #2a2a2a; border-radius:16px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; padding:24px; }
        textarea:focus, input:focus { outline:none !important; border-color:#444 !important; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#111} ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px}
      `}</style>

      {miniParticles.map(p=>(
        <div key={p.id} className="conf" style={{ left:`${p.left}%`, top:0, width:p.size, height:p.size, background:p.color, animationDelay:`${p.delay}s` }} />
      ))}

      {fireworks && fwParticles.map(p=>(
        <div key={p.id} style={{
          position:'fixed', left:`${p.ox}%`, top:`${p.oy}%`,
          width:p.size, height:p.size, borderRadius:p.round?'50%':'2px',
          background:p.color, zIndex:9999, pointerEvents:'none',
          boxShadow:`0 0 6px ${p.color}`,
          '--fw-x':`${p.tx}px`, '--fw-y':`${p.ty}px`,
          animation:`fw ${p.dur}s ease-out ${p.delay}s both`,
        }} />
      ))}

      {screen === "login" && (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ width:"100%", maxWidth:380, textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:8 }}>🧠</div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:46, fontWeight:900, color:"#fff", margin:"0 0 6px", letterSpacing:"-2px" }}>MindUpgrade</h1>
            <p style={{ color:"#444", fontSize:14, margin:"0 0 44px" }}>Train your mind. Every single day.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <input className="li" type="email" placeholder="your@email.com" value={inputEmail}
                onChange={e=>setInputEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
              <button onClick={login} style={{ padding:"14px", background:"#e8ff6b", color:"#0a0a0a", border:"none", borderRadius:6, fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                Enter →
              </button>
            </div>
            <p style={{ color:"#2a2a2a", fontSize:12, marginTop:20 }}>No password needed. Data lives on the server.</p>
          </div>
        </div>
      )}

      {screen === "app" && (
        <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px 80px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:26 }}>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:26, fontWeight:900, margin:0, letterSpacing:"-0.5px" }}>🧠 MindUpgrade</h1>
            <button onClick={logout} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>Sign out</button>
          </div>

          <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:16, padding:"20px 22px", display:"flex", alignItems:"center", gap:22, marginBottom:28 }}>
            <div style={{ position:"relative", width:76, height:76, flexShrink:0 }}>
              <svg width="76" height="76" style={{ transform:"rotate(-90deg)" }}>
                <circle cx="38" cy="38" r="32" fill="none" stroke="#1e1e1e" strokeWidth="6"/>
                <circle cx="38" cy="38" r="32" fill="none" stroke="#e8ff6b" strokeWidth="6"
                  strokeDasharray={`${2*Math.PI*32}`} strokeDashoffset={`${2*Math.PI*32*(1-score/100)}`}
                  strokeLinecap="round" style={{ transition:"stroke-dashoffset .5s ease" }}/>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:19, fontWeight:700, lineHeight:1 }}>{score}</span>
                <span style={{ fontSize:9, color:"#555", letterSpacing:1.5 }}>SCORE</span>
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ marginBottom:10 }}>
                <div style={{ color:"#444", fontSize:10, letterSpacing:1.5, marginBottom:2 }}>TODAY</div>
                <div style={{ fontSize:14, fontWeight:500 }}>{completedCount} / {TASKS.length} tasks done</div>
              </div>
              <div>
                <div style={{ color:"#444", fontSize:10, letterSpacing:1.5, marginBottom:2 }}>STREAK</div>
                <div style={{ fontSize:14, fontWeight:500 }}>{streak > 0 ? `🔥 ${streak} day${streak!==1?"s":""}` : "— start today"}</div>
              </div>
            </div>
          </div>

          <p style={{ color:"#444", fontSize:11, letterSpacing:2, textTransform:"uppercase", margin:"0 0 4px" }}>
            {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
          </p>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:20, margin:"0 0 18px", fontWeight:700 }}>
            {score===100?"Perfect Day 🏆":score>=60?"More than halfway!":"Today's Workout"}
          </h2>

          {TASKS.map(task => {
            const done = !!completed[task.id];
            return (
              <div key={task.id} className={`trow ${done?"done":""}`} onClick={() => setActiveTask(task.id)}>
                <span style={{ fontSize:26 }}>{task.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, letterSpacing:1.5, color: done ? "#e8ff6b" : task.color, textTransform:"uppercase", marginBottom:2 }}>{task.label}</div>
                  <div style={{ fontSize:13, color:"#555" }}>{done ? "Completed ✓" : "Tap to begin"}</div>
                </div>
                {!done
                  ? <button className="sbtn" onClick={e=>{e.stopPropagation();setActiveTask(task.id);}}
                      style={{ background:`${task.color}22`, color:task.color, border:`1px solid ${task.color}44` }}>Start</button>
                  : <button className="sbtn" onClick={e=>{e.stopPropagation();setActiveTask(task.id);}}
                      style={{ background:"#1a1a1a", color:"#555", border:"1px solid #2a2a2a" }}>↺ Play again</button>
                }
              </div>
            );
          })}

        </div>
      )}

      {activeTask && ActiveComp && (
        <div className="overlay" onClick={() => setActiveTask(null)}>
          <div className="mbox" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:26 }}>{TASKS.find(t=>t.id===activeTask)?.icon}</span>
                <div>
                  <div style={{ fontSize:10, color:"#555", letterSpacing:1.5, textTransform:"uppercase" }}>Today's Exercise</div>
                  <div style={{ fontSize:18, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>
                    {TASKS.find(t=>t.id===activeTask)?.label}
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTask(null)} style={{ background:"none", border:"none", color:"#555", fontSize:24, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>
            <div style={{ height:1, background:"#1e1e1e", marginBottom:18 }} />
            <ActiveComp onComplete={() => markComplete(activeTask)} onClose={() => setActiveTask(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
