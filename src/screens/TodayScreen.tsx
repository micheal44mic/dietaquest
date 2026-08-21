import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { useStats } from "../hooks/useStats";
import { useToday } from "../hooks/useToday";
import { cyclePosition, dayFor, workoutFor } from "../game/cycle";
import { routineFor, XP } from "../game/derive";
import { WEIGHING_RULES } from "../data/program";
import { addDays, dateKey, fmtLong, parseKey } from "../lib/dates";
import { thousands } from "../lib/format";
import { Mascot } from "../components/Mascot";
import { XPBar } from "../components/XPBar";
import { StreakFlame } from "../components/StreakFlame";
import { StorageWarning } from "../components/StorageWarning";
import { MealQuestCard } from "../components/MealQuestCard";
import { RoutineCard } from "../components/RoutineCard";
import { ProgressRing } from "../components/ProgressRing";
import {
  CardioCard,
  StepsCard,
  WaterTracker,
  WeightCard,
} from "../components/ExtraQuests";
import { WorkoutScreen } from "./WorkoutScreen";
import { DayNav } from "../components/DayNav";
import { DayPreview } from "./DayPreview";
import { fx } from "../fx/FxLayer";

const KIND_STYLE: Record<string, { bg: string; text: string }> = {
  upper: { bg: "bg-berry-soft", text: "text-berry-dark" },
  lower: { bg: "bg-grape-soft", text: "text-grape-dark" },
  riposo: { bg: "bg-sky-soft", text: "text-sky-dark" },
};

export function TodayScreen() {
  const today = useToday();
  // Si tiene lo scostamento e non la data, così a mezzanotte "oggi" resta oggi
  const [offset, setOffset] = useState(0);
  const date = dateKey(addDays(parseKey(today), offset));
  const isFuture = offset > 0;
  const isPast = offset < 0;

  const settings = useAppStore((s) => s.settings);
  const meals = useAppStore((s) => s.logs[date]?.meals);
  const setMealStatus = useAppStore((s) => s.setMealStatus);
  const stats = useStats();
  const [inWorkout, setInWorkout] = useState(false);

  const pos = cyclePosition(settings, date);
  const program = dayFor(pos.programDay);
  const exercises = workoutFor(pos, settings);
  const routine = routineFor(program.kind === "riposo");
  const day = stats.perDay[date];

  // Legato alla data: cambiando giorno non devono partire fuochi d'artificio a vuoto
  const lastPerfect = useRef<{ date: string; perfect: boolean }>({
    date,
    perfect: day?.perfect ?? false,
  });
  useEffect(() => {
    const perfect = day?.perfect ?? false;
    const prev = lastPerfect.current;
    if (prev.date === date && perfect && !prev.perfect) fx.fireworks();
    lastPerfect.current = { date, perfect };
  }, [day?.perfect, date]);

  const shift = (delta: number) => {
    setInWorkout(false);
    setOffset((o) => o + delta);
  };

  const style = KIND_STYLE[program.kind];

  if (inWorkout && exercises) {
    return (
      <WorkoutScreen
        date={date}
        title={program.title}
        rirNote={program.rirNote}
        exercises={exercises}
        onClose={() => setInWorkout(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Testata */}
      <div className="flex items-center gap-3">
        <div className="float-slow shrink-0">
          <Mascot mood={day?.perfect ? "cheer" : "happy"} size={64} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold">
            Ciao, {settings.name}! 👋
          </h1>
          <p className="text-xs font-bold text-mute">
            {stats.levelInfo.titleEmoji} {stats.levelInfo.title}
          </p>
        </div>
        <StreakFlame streak={stats.streak} />
      </div>

      <StorageWarning />

      <XPBar info={stats.levelInfo} />

      {/* Dove sei nel programma */}
      <div className="card space-y-3 p-4">
        <DayNav
          date={date}
          offset={offset}
          onShift={shift}
          onToday={() => setOffset(0)}
        />
        <div className="flex items-center gap-3 border-t-2 border-line pt-3">
          <div
            className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl ${style.bg}`}
          >
            <span
              className={`text-[9px] leading-none font-extrabold ${style.text}`}
            >
              {pos.beforeStart ? "DAL" : "GIORNO"}
            </span>
            <span
              className={`text-lg leading-none font-extrabold ${style.text}`}
            >
              {pos.beforeStart
                ? parseKey(settings.startDate).getDate()
                : pos.programDay}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-extrabold">
              {pos.beforeStart ? "Non è ancora iniziato" : program.title}
            </h2>
            {!pos.beforeStart && program.subtitle && (
              <p className="text-[11px] leading-tight font-bold text-ink/70">
                {program.subtitle}
              </p>
            )}
            <p className="text-xs font-bold text-mute">
              {pos.beforeStart
                ? `Il giorno 1 parte ${fmtLong(parseKey(settings.startDate))}`
                : `Settimana ${pos.week} · ${thousands(program.steps)} passi`}
            </p>
          </div>
          {!isFuture && (
            <div className="text-right">
              <div className="text-lg font-extrabold text-sun-dark">
                +{day?.xp ?? 0}
              </div>
              <div className="text-[10px] font-extrabold text-mute">XP</div>
            </div>
          )}
        </div>
      </div>

      {/* Prima della data di inizio non c'è niente da spuntare: segnare pasti
          fuori dal programma sporcherebbe XP, streak e medie */}
      {pos.beforeStart && (
        <div className="card border-grape! bg-grape-soft! p-4 text-center">
          <div className="text-3xl">🌅</div>
          <h3 className="mt-1 text-base font-extrabold text-grape-dark">
            Si comincia {fmtLong(parseKey(settings.startDate))}
          </h3>
          <p className="mt-1 text-xs font-bold text-mute">
            Da lì parte il giorno 1 con Upper A. Nel frattempo puoi sfogliare i
            giorni avanti con la freccia per vedere i pasti e fare la spesa.
          </p>
        </div>
      )}

      {isFuture && !pos.beforeStart && (
        <DayPreview program={program} exercises={exercises} />
      )}

      {isPast && (
        <div className="card border-sky! bg-sky-soft! p-3 text-center">
          <div className="text-sm font-extrabold text-sky-dark">
            🕐 Stai guardando un giorno passato
          </div>
          <div className="text-xs font-bold text-mute">
            Puoi ancora segnare quello che avevi dimenticato
          </div>
        </div>
      )}

      {/* Promemoria del giorno */}
      {!isFuture &&
        !pos.beforeStart &&
        program.notes?.map((n) => (
          <div
            key={n}
            className="card border-sun! bg-sun-soft! p-3 text-sm font-extrabold text-sun-dark"
          >
            📌 {n}
          </div>
        ))}

      {/* Rampa di ingresso e scarico: entrambe previste dal piano */}
      {!isFuture && !pos.beforeStart && pos.isIntro && program.workout && (
        <div className="card border-grape! bg-grape-soft! p-3">
          <div className="text-sm font-extrabold text-grape-dark">
            🌱 Settimana {pos.week} di ingresso
          </div>
          <div className="text-xs font-bold text-mute">
            Alzate laterali a 4 serie e collo a 1 serie per direzione
            {pos.week <= 1 && ", con circa 2 RIR anche sugli isolamenti"}. Dalla
            terza settimana si sale al volume pieno.
          </div>
        </div>
      )}

      {!isFuture && !pos.beforeStart && pos.deloadDue && (
        <div className="card border-tang! bg-tang-soft! p-3">
          <div className="text-sm font-extrabold text-tang-dark">
            🪫 Scarico consigliato
          </div>
          <div className="text-xs font-bold text-mute">
            Sei alla settimana {pos.week}: il piano prevede, dopo 6-8 settimane,
            una settimana con circa metà delle serie e 3-4 RIR, poi si
            rivalutano misure e prestazioni.
          </div>
        </div>
      )}

      {!isFuture && !pos.beforeStart && (
        <>
          {/* Riepilogo pasti */}
          <div className="card flex items-center gap-3 p-4">
            <ProgressRing
              pct={day ? day.mealsEaten / day.mealsTotal : 0}
              size={52}
              stroke={6}
            >
              <span className="text-xs font-extrabold text-leaf-dark">
                {day?.mealsEaten ?? 0}/{program.meals.length}
              </span>
            </ProgressRing>
            <div className="flex-1">
              <h2 className="text-base font-extrabold">
                {isPast ? "Pasti del giorno" : "Pasti di oggi"} · modello{" "}
                {program.dietModel}
              </h2>
              <p className="text-xs font-bold text-mute">
                {program.targets.kcal} · {program.targets.protein} P ·{" "}
                {program.targets.carbs} C · {program.targets.fat} G
              </p>
            </div>
          </div>

          <AnimatePresence>
            {day?.perfect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="card border-sun! bg-gradient-to-r from-sun-soft to-tang-soft p-4 text-center shadow-[0_3px_0_var(--color-sun)]!"
              >
                <motion.div
                  className="text-2xl font-extrabold text-tang-dark"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  🌟 GIORNATA PERFETTA! 🌟
                </motion.div>
                <div className="text-sm font-extrabold text-sun-dark">
                  Pasti, seduta, creatina e sonno: tutto fatto
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pasti */}
          <div className="space-y-3">
            {program.meals.map((meal) => (
              <MealQuestCard
                key={meal.id}
                meal={meal}
                status={meals?.[meal.id]}
                onChange={(status) => setMealStatus(date, meal.id, status)}
              />
            ))}
          </div>

          <details className="card p-4">
            <summary className="cursor-pointer text-sm font-extrabold">
              📏 Come pesare gli alimenti
            </summary>
            <ul className="mt-2 space-y-0.5">
              {WEIGHING_RULES.map((r) => (
                <li key={r} className="text-xs font-semibold text-ink/75">
                  • {r}
                </li>
              ))}
            </ul>
          </details>

          {/* Seduta del giorno */}
          <h2 className="pt-1 text-lg font-extrabold">
            {isPast ? "L’impegno del giorno 💪" : "L’impegno di oggi 💪"}
          </h2>
          {exercises ? (
            <button
              onClick={() => setInWorkout(true)}
              className={`btn3d card w-full p-4 text-left [--btn-shadow:var(--color-line)] ${
                day?.workoutComplete ? "border-tang! bg-tang-soft!" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <ProgressRing
                  pct={
                    day && day.setsTotal ? day.setsLogged / day.setsTotal : 0
                  }
                  size={48}
                  stroke={6}
                  color="var(--color-tang)"
                >
                  <span className="text-[11px] font-extrabold text-tang-dark">
                    {day?.setsLogged ?? 0}/{day?.setsTotal ?? 0}
                  </span>
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold">
                    {day?.workoutComplete
                      ? "Seduta completata!"
                      : program.title}
                  </h3>
                  <p className="text-xs font-bold text-mute">
                    {day?.workoutComplete
                      ? "Bestia! 🎉"
                      : `16:30 · ${exercises.length} esercizi · +${XP.set} XP a serie`}
                  </p>
                </div>
                <span className="shrink-0 text-2xl">
                  {day?.workoutComplete ? "💪" : "▶️"}
                </span>
              </div>
            </button>
          ) : (
            program.cardio && <CardioCard date={date} cardio={program.cardio} />
          )}

          {/* Routine */}
          <RoutineCard date={date} items={routine} />

          {/* Extra */}
          <div className="space-y-3">
            <StepsCard date={date} goal={program.steps} />
            <WaterTracker date={date} />
            <WeightCard date={date} />
          </div>
        </>
      )}
    </div>
  );
}
