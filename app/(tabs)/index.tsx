import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#EDE4D3",
  card: "#FBF7EE",
  ink: "#2E2621",
  inkSoft: "#5B4F42",
  rust: "#B0532A",
  olive: "#6B7A4F",
  mustard: "#D2A24C",
  line: "#D9CCB2",
};

const CASES = {
  hunger: {
    tag: "LOW FUEL",
    title: "Your blood sugar is probably driving the bus.",
    body: "Feelings get a lot louder on an empty stomach. This one might not be as deep as it feels right now.",
    tip: "Get some protein and carbs in you, then check back in on how you feel in 30 minutes.",
  },
  sleep: {
    tag: "SLEEP DEBT",
    title: "You're running on not enough rest.",
    body: "Under-slept brains amplify irritation and sadness and mute patience. Very on-brand for how you're feeling.",
    tip: "If you can get a real nap or an early night tonight, revisit the 'big feelings' after.",
  },
  dehydration: {
    tag: "DEHYDRATED",
    title: "Simple, unglamorous, probably true: you need water.",
    body: "Mild dehydration shows up as fog, low mood, and a kind of flat irritability.",
    tip: "Drink a full glass now, then reassess in twenty minutes.",
  },
  physical: {
    tag: "BIOLOGICAL WEATHER",
    title: "This might just be your body's weather system today.",
    body: "Hormonal shifts, muscle fatigue from training, or an oncoming cold can tank mood before any other symptom shows up.",
    tip: "Be extra gentle with yourself today — treat this like a physical thing, not a character flaw.",
  },
  restlessness: {
    tag: "PENT-UP ENERGY",
    title: "Your body might just want to move.",
    body: "Sometimes a bad mood is really restlessness with nowhere to go.",
    tip: "A short walk or a few minutes of stretching can shift this faster than thinking your way out.",
  },
  relational: {
    tag: "RELATIONAL ACHE",
    title: "Something with another person is sitting unresolved.",
    body: "Conflict, distance, or something left unsaid tends to sit in the chest until it's actually addressed or accepted.",
    tip: "You don't have to fix it today. Naming it honestly — even just to yourself — usually loosens it a bit.",
  },
  overwhelm: {
    tag: "UNFINISHED BUSINESS",
    title: "There's a task quietly weighing on you.",
    body: "Open loops take up more emotional space than the task itself usually deserves.",
    tip: "Write down the very next tiny step. You don't have to finish it — just shrink it.",
  },
  anticipation: {
    tag: "ANTICIPATORY DREAD",
    title: "You're bracing for something that hasn't happened yet.",
    body: "Your mind is spending energy on a future that's still uncertain, which is exhausting in the present.",
    tip: "Ask yourself: is there one thing you could actually prepare, or is this one to consciously set down for now?",
  },
  loneliness: {
    tag: "UNDER-CONNECTED",
    title: "You might be missing real connection, not more alone time.",
    body: "Too much solitude can start to feel like low mood before it registers as loneliness.",
    tip: "Reach out to one person today, even with something small. Low-effort contact still counts.",
  },
  burnout: {
    tag: "NO WHITE SPACE",
    title: "You haven't had room to just exist.",
    body: "Constant people and tasks, with no unstructured time, quietly drains you even when everything is technically fine.",
    tip: "Protect one block of genuinely unscheduled time in the next day or two — no productivity allowed.",
  },
  disappointment: {
    tag: "UNMET EXPECTATION",
    title: "Something didn't go the way you hoped.",
    body: "Even small letdowns — plans falling through, an outcome you'd quietly counted on — leave a real residue.",
    tip: "Let yourself name what you were actually hoping for. Skipping that step tends to make it linger longer.",
  },
  comparison: {
    tag: "THE COMPARISON SPIRAL",
    title: "You might be measuring yourself against a moving target.",
    body: "Feeling behind or 'not enough' is rarely about the actual facts of where you are — it's about the comparison itself.",
    tip: "Try listing what you'd tell a friend in your exact situation. You're usually kinder to them than to yourself.",
  },
  environment: {
    tag: "ENVIRONMENTAL DRAG",
    title: "Your surroundings might be working against you.",
    body: "Clutter, noise, bad lighting, or just being cooped up can lower mood without you clocking it as the cause.",
    tip: "Change your physical setting for ten minutes — different room, outside, anywhere with more light or air.",
  },
  overstimulation: {
    tag: "SCREEN SATURATION",
    title: "Your nervous system might just be overstimulated.",
    body: "Heavy scrolling and screen time keep your brain in low-grade alert mode, which reads as irritability or flatness later.",
    tip: "Put the phone somewhere out of reach for twenty minutes and let your eyes rest on something far away.",
  },
  transition: {
    tag: "SHIFTING GROUND",
    title: "Something around you is changing, even if it's a good change.",
    body: "New routines, endings, or upcoming transitions unsettle your sense of footing, whether or not the change itself is positive.",
    tip: "Name out loud what's changing. Uncertainty feels smaller once it's specific instead of vague.",
  },
  sedentary: {
    tag: "STAGNANT BODY",
    title: "Your body might be asking for movement it hasn't gotten.",
    body: "Long stretches without moving can flatten mood in a way that's easy to mistake for something emotional.",
    tip: "Even five minutes of stretching or a walk around the block can shift this faster than expected.",
  },
  self_criticism: {
    tag: "HARSH INNER VOICE",
    title: "The way you're talking to yourself might be the actual problem.",
    body: "A critical inner voice can generate the exact same heaviness as an external bad day, just from the inside.",
    tip: "Notice the next self-critical thought and ask: would I say this to someone I love? Then say the kinder version instead.",
  },
  practical_stress: {
    tag: "LOGISTICAL WEIGHT",
    title: "Money, logistics, or planning stress might be the quiet drag.",
    body: "Practical stressors don't always feel dramatic, but they sit in the background and tax your mood all day.",
    tip: "Write down the specific practical thing. A vague worry feels heavier than a named one.",
  },
  stimulant_crash: {
    tag: "STIMULANT CRASH",
    title: "You might be coming down off caffeine or sugar.",
    body: "A crash after a spike can feel a lot like sadness or low motivation, especially a few hours after the fact.",
    tip: "Have some water and a small protein snack rather than reaching for more caffeine or sugar.",
  },
  seasonal: {
    tag: "SEASONAL DRAG",
    title: "The weather or time of year might be pulling your mood down.",
    body: "Less daylight, gray skies, or seasonal shifts genuinely affect mood and energy, not just in a vague way.",
    tip: "Get outside or near a bright window for a few minutes today, even briefly.",
  },
  grief: {
    tag: "SOMETHING YOU MISS",
    title: "This might be grief or missing something, showing up quietly.",
    body: "Loss doesn't only mean death — missing a person, place, or chapter of life can surface as low mood with no obvious trigger.",
    tip: "Let yourself name what or who you're missing, even briefly. Naming it tends to soften the weight a little.",
  },
  free_floating_anxiety: {
    tag: "FREE-FLOATING ANXIETY",
    title: "There might be anxious energy without a clear target.",
    body: "Sometimes anxiety shows up before your mind has pinned down what it's actually about.",
    tip: "Try grounding for a minute — name five things you can see, four you can hear, three you can touch.",
  },
  support_gap: {
    tag: "SUPPORT GAP",
    title: "You might be carrying this without enough backup.",
    body: "Feeling low is heavier when it feels like no one around you actually knows what's going on.",
    tip: "Tell one person, even briefly, what's actually going on for you today.",
  },
  purpose_drift: {
    tag: "PURPOSE DRIFT",
    title: "You might feel disconnected from what actually matters to you.",
    body: "Going through the motions without a sense of why can quietly flatten mood over time.",
    tip: "Think of one small thing today that would feel meaningful, not just productive, and do that instead.",
  },
  unnamed: {
    tag: "UNLABELED SIGNAL",
    title: "Case open — no single cause stands out, and that's okay.",
    body: "Not every low mood has a clean cause. Sometimes it's a quiet buildup of several small things rather than one big one.",
    tip: "Try free-writing for five minutes with no goal. The reason sometimes surfaces sideways.",
  },
};

const QUESTIONS = [
  {
    q: "When did you last eat something real?",
    options: [
      { label: "Within the last couple hours", points: {} },
      { label: "It's been a while", points: { hunger: 2 } },
      { label: "Honestly, I skipped a meal", points: { hunger: 3 } },
    ],
  },
  {
    q: "How did you sleep last night?",
    options: [
      { label: "Slept great", points: {} },
      { label: "Okay, not amazing", points: { sleep: 1 } },
      { label: "Rough, or not enough", points: { sleep: 3 } },
    ],
  },
  {
    q: "Water and physical state today?",
    options: [
      { label: "Hydrated, feeling fine", points: {} },
      { label: "Barely had water", points: { dehydration: 3 } },
      { label: "Something feels physically off", points: { physical: 3 } },
    ],
  },
  {
    q: "Restless, antsy, like your body wants to move?",
    options: [
      { label: "Not really", points: {} },
      { label: "A little", points: { restlessness: 1 } },
      { label: "Yes, very", points: { restlessness: 3 } },
    ],
  },
  {
    q: "Is there a specific person on your mind right now?",
    options: [
      { label: "No", points: {} },
      { label: "Sort of, in the background", points: { relational: 1 } },
      { label: "Yes, definitely", points: { relational: 3 } },
    ],
  },
  {
    q: "Any task, deadline, or unfinished thing hanging over you?",
    options: [
      { label: "No, I'm clear", points: {} },
      { label: "A little", points: { overwhelm: 1 } },
      { label: "Yes, it's looming", points: { overwhelm: 3 } },
    ],
  },
  {
    q: "Are you dreading or worrying about something coming up?",
    options: [
      { label: "No", points: {} },
      { label: "A little", points: { anticipation: 1 } },
      { label: "Yes, a lot", points: { anticipation: 3 } },
    ],
  },
  {
    q: "Did something not go the way you hoped recently?",
    options: [
      { label: "No", points: {} },
      { label: "A little disappointing", points: { disappointment: 1 } },
      { label: "Yeah, that stung", points: { disappointment: 3 } },
    ],
  },
  {
    q: "Lately, has it been nonstop people and tasks, or a lot of solo time?",
    options: [
      { label: "Good balance", points: {} },
      { label: "Nonstop, no room to breathe", points: { burnout: 3 } },
      { label: "Mostly alone, actually", points: { loneliness: 3 } },
    ],
  },
  {
    q: "Any 'I'm behind' or 'not enough' thoughts running in the background?",
    options: [
      { label: "No", points: {} },
      { label: "Sometimes", points: { comparison: 1 } },
      { label: "Yes, a lot", points: { comparison: 3 } },
    ],
  },
  {
    q: "How's your physical environment right now?",
    options: [
      { label: "Fine, no complaints", points: {} },
      { label: "Kind of grating", points: { environment: 1 } },
      { label: "Definitely getting to me", points: { environment: 3 } },
    ],
  },
  {
    q: "How much screen time or scrolling today, honestly?",
    options: [
      { label: "Pretty normal", points: {} },
      { label: "More than usual", points: { overstimulation: 1 } },
      { label: "A lot, on and off all day", points: { overstimulation: 3 } },
    ],
  },
  {
    q: "Anything changing lately — routine, living situation, a plan, an ending?",
    options: [
      { label: "No, things are steady", points: {} },
      { label: "Something's shifting", points: { transition: 2 } },
      { label: "Yes, a big change", points: { transition: 3 } },
    ],
  },
  {
    q: "Have you moved your body at all today?",
    options: [
      { label: "Yes, got some movement in", points: {} },
      { label: "Barely, mostly sitting", points: { sedentary: 2 } },
      { label: "No, completely still all day", points: { sedentary: 3 } },
    ],
  },
  {
    q: "What's your inner voice sounding like today?",
    options: [
      { label: "Pretty neutral or kind", points: {} },
      { label: "A little harsh", points: { self_criticism: 1 } },
      { label: "Really critical of myself", points: { self_criticism: 3 } },
    ],
  },
  {
    q: "Any money, logistics, or planning stuff nagging at you?",
    options: [
      { label: "No, nothing like that", points: {} },
      { label: "A little in the background", points: { practical_stress: 1 } },
      { label: "Yes, a lot", points: { practical_stress: 3 } },
    ],
  },
  {
    q: "How much caffeine or sugar have you had today?",
    options: [
      { label: "Normal amount for me", points: {} },
      { label: "More than usual", points: { stimulant_crash: 1 } },
      { label: "A lot, and now I'm crashing", points: { stimulant_crash: 3 } },
    ],
  },
  {
    q: "How's the weather or daylight been affecting you?",
    options: [
      { label: "No real effect", points: {} },
      { label: "A bit gray or draining", points: { seasonal: 1 } },
      { label: "Definitely weighing on me", points: { seasonal: 3 } },
    ],
  },
  {
    q: "Is there anything — or anyone — you've been missing lately?",
    options: [
      { label: "No, not really", points: {} },
      { label: "A little, now that I think about it", points: { grief: 2 } },
      { label: "Yes, it's been on my mind", points: { grief: 3 } },
    ],
  },
  {
    q: "Do you feel anxious without being able to say why?",
    options: [
      { label: "No", points: {} },
      {
        label: "A little, in the background",
        points: { free_floating_anxiety: 1 },
      },
      {
        label: "Yes, and I can't pin it down",
        points: { free_floating_anxiety: 3 },
      },
    ],
  },
  {
    q: "Does it feel like people around you actually know what's going on with you?",
    options: [
      { label: "Yes, I feel supported", points: {} },
      { label: "Sort of, not fully", points: { support_gap: 1 } },
      { label: "No, pretty alone in it", points: { support_gap: 3 } },
    ],
  },
  {
    q: "Does today feel connected to anything that actually matters to you?",
    options: [
      { label: "Yes, it does", points: {} },
      {
        label: "Not really, just going through motions",
        points: { purpose_drift: 2 },
      },
      {
        label: "No, it feels pretty disconnected",
        points: { purpose_drift: 3 },
      },
    ],
  },
];

const HISTORY_KEY = "mood-sessions";

export default function CheckInScreen() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({});
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (raw) setHistory(JSON.parse(raw));
      } catch (e) {
        // no history yet
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, []);

  function computeSuspects(scoreMap) {
    const entries = Object.entries(scoreMap).filter(([, v]) => v > 0);
    if (entries.length === 0) return [CASES.unnamed];
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0][1];
    return entries
      .filter(([, v]) => v >= top - 1)
      .slice(0, 2)
      .map(([k]) => CASES[k]);
  }

  async function saveSession(suspects) {
    const entry = {
      date: new Date().toISOString(),
      tags: suspects.map((s) => s.tag),
    };
    const updated = [...history, entry].slice(-50);
    setHistory(updated);
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      // save failed silently
    }
  }

  function choose(opt) {
    const next = { ...scores };
    Object.entries(opt.points).forEach(([k, v]) => {
      next[k] = (next[k] || 0) + v;
    });
    setScores(next);

    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setDone(true);
      saveSession(computeSuspects(next));
    }
  }

  function restart() {
    setStep(0);
    setScores({});
    setDone(false);
  }

  function patternTally() {
    const counts = {};
    history.forEach((entry) =>
      entry.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      }),
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  const question = QUESTIONS[step];
  const suspects = done ? computeSuspects(scores) : [];
  const tally = patternTally();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CASE FILE · WHY DO I FEEL THIS WAY</Text>
          <Text style={styles.qCounter}>
            {done ? "CLOSED" : `Q${step + 1} / ${QUESTIONS.length}`}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${done ? 100 : Math.round((step / QUESTIONS.length) * 100)}%`,
              },
            ]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {!done ? (
            <View>
              <Text style={styles.question}>{question.q}</Text>
              {question.options.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={styles.optionButton}
                  onPress={() => choose(opt)}
                >
                  <Text style={styles.optionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View>
              {suspects.map((result, i) => (
                <View key={i} style={i > 0 ? styles.secondSuspect : null}>
                  <View style={styles.tagRow}>
                    <View style={styles.tagPill}>
                      <Text style={styles.tagText}>{result.tag}</Text>
                    </View>
                    <Text style={styles.tagLabel}>
                      {i === 0 && suspects.length > 1
                        ? "leading theory"
                        : i === 1
                          ? "also possible"
                          : ""}
                    </Text>
                  </View>
                  <Text style={styles.resultTitle}>{result.title}</Text>
                  <Text style={styles.resultBody}>{result.body}</Text>
                  <View style={styles.tipBox}>
                    <Text style={styles.tipText}>{result.tip}</Text>
                  </View>
                </View>
              ))}

              <Text style={styles.disclaimer}>
                This is a quick guess based on patterns, not a diagnosis — if
                this feeling sticks around or feels heavier than usual, it's
                worth talking to someone you trust or a professional.
              </Text>

              {historyLoaded && history.length > 1 && (
                <View style={styles.patternsBox}>
                  <Text style={styles.patternsTitle}>
                    YOUR PATTERNS ({history.length} CASES ON FILE)
                  </Text>
                  {tally.map(([tag, count]) => (
                    <View key={tag} style={styles.tallyRow}>
                      <View
                        style={[styles.tallyBar, { width: 16 + count * 14 }]}
                      />
                      <Text style={styles.tallyText}>
                        {tag} · {count}×
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.restartButton} onPress={restart}>
                <Text style={styles.restartText}>Reopen the case</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16,
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.line,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: COLORS.inkSoft,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  qCounter: { fontSize: 11, letterSpacing: 1.2, color: COLORS.rust },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.bg,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: COLORS.mustard },
  body: { padding: 20 },
  question: {
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.ink,
    marginBottom: 20,
    fontWeight: "600",
  },
  optionButton: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  optionText: { fontSize: 14, color: COLORS.ink, fontWeight: "500" },
  secondSuspect: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    borderStyle: "dashed",
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  tagPill: {
    backgroundColor: COLORS.mustard,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  tagLabel: { fontSize: 11, color: COLORS.inkSoft },
  resultTitle: {
    fontSize: 21,
    lineHeight: 27,
    color: COLORS.ink,
    marginBottom: 10,
    fontWeight: "600",
  },
  resultBody: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.inkSoft,
    marginBottom: 14,
  },
  tipBox: {
    backgroundColor: COLORS.bg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.olive,
    padding: 12,
    borderRadius: 2,
  },
  tipText: { fontSize: 14, lineHeight: 20, color: COLORS.ink },
  disclaimer: {
    fontSize: 12,
    color: COLORS.inkSoft,
    marginTop: 18,
    marginBottom: 18,
    lineHeight: 17,
  },
  patternsBox: {
    marginBottom: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  patternsTitle: {
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.inkSoft,
    marginBottom: 10,
  },
  tallyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  tallyBar: { height: 8, backgroundColor: COLORS.olive, borderRadius: 4 },
  tallyText: { fontSize: 11, color: COLORS.inkSoft },
  restartButton: {
    backgroundColor: COLORS.rust,
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
  },
  restartText: { color: COLORS.card, fontSize: 14, fontWeight: "600" },
});
