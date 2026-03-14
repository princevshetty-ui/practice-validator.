import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Target, GaugeCircle } from "lucide-react";
import axios from "axios";

const enterUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const resultContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const resultItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function GlassCard({ icon: Icon, title, children }) {
  return (
    <motion.section
      variants={resultItem}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center gap-2 text-cyan-300">
        <Icon size={18} />
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">{title}</h3>
      </div>
      {children}
    </motion.section>
  );
}

export default function App() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const scoreWidth = useMemo(() => {
    if (!result?.innovationScore) {
      return 0;
    }
    return Math.max(1, Math.min(100, result.innovationScore));
  }, [result]);

  async function handleValidate(event) {
    event.preventDefault();
    const trimmed = idea.trim();
    if (!trimmed) {
      setError("Please share your project idea before validating.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post("/api/validate", { idea: trimmed });
      setResult(response.data);
    } catch (requestError) {
      setError(requestError?.response?.data?.error || "Validation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-slate-100">
      <div className="pointer-events-none absolute -left-36 top-4 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-400/10 blur-3xl" />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={enterUp}
          className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">AI Smart Pitch Validator</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Turn a raw idea into a hackathon-ready pitch.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
            Convert your concept into a professional hook, align it with core SDGs, and assess innovation strength in seconds.
          </p>
        </motion.header>

        <motion.form
          initial="hidden"
          animate="visible"
          variants={enterUp}
          transition={{ delay: 0.12 }}
          onSubmit={handleValidate}
          className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl sm:p-7"
        >
          <label htmlFor="idea" className="mb-3 block text-sm font-semibold text-slate-200">
            Describe your project idea
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            rows={7}
            placeholder="Example: A multilingual AI copilot that helps informal workers find verified micro-jobs and auto-generates upskilling plans."
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-100 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/30"
          />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              type="submit"
              disabled={loading}
              className={`relative inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-black transition ${
                loading ? "bg-cyan-300" : "bg-cyan-400 hover:bg-cyan-300"
              }`}
            >
              {loading && (
                <span className="absolute -inset-1 rounded-xl border border-cyan-300/60 shadow-glow">
                  <motion.span
                    className="absolute inset-0 rounded-xl"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  />
                </span>
              )}
              <span className="relative z-10">{loading ? "Thinking..." : "Validate"}</span>
            </motion.button>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </div>
        </motion.form>

        {result ? (
          <motion.section
            key={result.hook}
            variants={resultContainer}
            initial="hidden"
            animate="visible"
            className="mt-8 grid gap-4"
          >
            <GlassCard icon={Lightbulb} title="The Hook">
              <p className="text-base leading-relaxed text-slate-100">{result.hook}</p>
              {result.note ? <p className="mt-2 text-xs text-amber-300">{result.note}</p> : null}
            </GlassCard>

            <GlassCard icon={Target} title="SDG Alignment">
              <div className="flex flex-wrap gap-2">
                {(result.sdgs || []).map((sdg) => (
                  <span
                    key={sdg}
                    className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100"
                  >
                    {sdg}
                  </span>
                ))}
              </div>
            </GlassCard>

            <GlassCard icon={GaugeCircle} title="Innovation Score">
              <div className="space-y-2">
                <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scoreWidth}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300"
                  />
                </div>
                <p className="text-sm font-semibold text-emerald-300">{scoreWidth}/100</p>
              </div>
            </GlassCard>
          </motion.section>
        ) : null}
      </main>
    </div>
  );
}
