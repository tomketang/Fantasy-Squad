import { useEffect, useState } from "react";
import { BattleView, type Run } from "@/components/fantasy/BattleView";
import { Adventure, Arena, Camp, Codex, Intro, Shop } from "@/components/fantasy/Screens";
import { NAV, type TabId } from "@/components/fantasy/ui";
import { setSfxEnabled, unlockAudio } from "@/game/sfx";
import { useSave } from "@/game/store";

export function FantasyApp() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabId>("camp");
  const [run, setRun] = useState<Run | null>(null);
  const banner = useSave((s) => s.banner);
  const seenIntro = useSave((s) => s.seenIntro);
  const sound = useSave((s) => s.sound);
  const dismissIntro = useSave((s) => s.dismissIntro);

  useEffect(() => {
    let alive = true;
    const unsub = useSave.persist.onFinishHydration(() => {
      useSave.getState().rollClock();
      if (alive) setReady(true);
    });
    void useSave.persist.rehydrate();
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    setSfxEnabled(sound);
  }, [sound]);

  useEffect(() => {
    const onPointer = () => unlockAudio();
    window.addEventListener("pointerdown", onPointer, { once: true });
    return () => window.removeEventListener("pointerdown", onPointer);
  }, []);

  if (!ready) {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper text-ink">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-teal">FANTASY SQUAD</p>
          <h1 className="font-display text-4xl">奇幻小队</h1>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-meadow">
      <div className={`app-shell mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-x-hidden ${banner === "meadow" ? "bg-paper" : ""}`} data-banner={banner}>
        <main className="nav-pad flex-1 px-4 pt-4">
          {tab === "camp" && <Camp onFight={setRun} />}
          {tab === "codex" && <Codex />}
          {tab === "adventure" && <Adventure onFight={setRun} />}
          {tab === "arena" && <Arena onFight={setRun} />}
          {tab === "shop" && <Shop />}
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-center" aria-label="主导航">
          <div className="nav-bar flex w-full max-w-lg border-t border-line bg-card">
            {NAV.map((item) => {
              const Icon = item.icon;
              const on = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${on ? "text-teal" : "text-ink-soft"}`}
                  onClick={() => setTab(item.id)}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
        {!seenIntro && <Intro onDone={dismissIntro} />}
        {run && <BattleView key={`${run.kind}-${run.id}-${run.nonce}`} run={run} onClose={() => setRun(null)} />}
      </div>
    </div>
  );
}
