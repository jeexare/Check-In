import { Case, CASES, COLORS, Option, QUESTIONS } from "@/data/moodData";
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

const HISTORY_KEY = "mood-sessions";
type HistoryEntry = { date: string; tags: string[] };

export default function CheckInScreen() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
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

  function computeSuspects(scoreMap: Record<string, number>): Case[] {
    const entries = Object.entries(scoreMap).filter(([, v]) => v > 0);
    if (entries.length === 0) return [CASES.unnamed];
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0][1];
    return entries
      .filter(([, v]) => v >= top - 1)
      .slice(0, 2)
      .map(([k]) => CASES[k]);
  }

  async function saveSession(suspects: Case[]) {
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

  function choose(opt: Option) {
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
    const counts: Record<string, number> = {};
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
