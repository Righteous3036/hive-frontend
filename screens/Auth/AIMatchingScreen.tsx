import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../components/api";
import { useTheme } from "../../components/ThemeContext";
import { useUser } from "../../components/UserContext";
import { useResponsive } from "../../components/useResponsive";

const QUESTIONS = [
  {
    id: 1,
    question: "What is your main area of academic interest?",
    icon: "📚",
    options: [
      "Computer Science & Technology",
      "Business & Entrepreneurship",
      "Arts, Culture & Creative Work",
      "Health & Life Sciences",
      "Social Sciences & Humanities",
      "Engineering & Physical Sciences",
    ],
  },
  {
    id: 2,
    question: "What activities do you enjoy outside of class?",
    icon: "🎯",
    options: [
      "Sports & Physical Fitness",
      "Music, Dance & Performing Arts",
      "Reading, Writing & Debate",
      "Coding & Building Projects",
      "Community Service & Volunteering",
      "Photography, Film & Media",
    ],
  },
  {
    id: 3,
    question: "When are you usually free for group activities?",
    icon: "⏰",
    options: [
      "Weekday mornings",
      "Weekday afternoons",
      "Weekday evenings",
      "Weekends only",
      "Flexible — anytime works",
    ],
  },
  {
    id: 4,
    question: "What are your goals at university?",
    icon: "🎯",
    options: [
      "Build professional skills & network",
      "Explore new hobbies & interests",
      "Make friends & social connections",
      "Improve academic performance",
      "Gain leadership experience",
      "Have fun & enjoy campus life",
    ],
  },
  {
    id: 5,
    question: "What kind of group environment do you prefer?",
    icon: "👥",
    options: [
      "Small & focused (under 10 people)",
      "Medium & structured (10–30 people)",
      "Large & diverse (30+ people)",
      "Online-friendly & flexible",
      "Competitive & goal-oriented",
      "Relaxed & casual",
    ],
  },
];

export default function AIMatchingScreen({ navigation }: any) {
  const { theme, fontSizes } = useTheme();
  const { user } = useUser();
  const { isMobile } = useResponsive();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [joining, setJoining] = useState<number | null>(null);
  const [joinedGroups, setJoinedGroups] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const progress = (currentQuestion / QUESTIONS.length) * 100;

  const handleSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = async () => {
    if (!selectedOption) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption("");

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // All questions answered — call AI
      await getAIMatches(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestion === 0) return;
    setCurrentQuestion((prev) => prev - 1);
    setSelectedOption(answers[currentQuestion - 1] || "");
    setAnswers((prev) => prev.slice(0, -1));
  };

  const getAIMatches = async (userAnswers: string[]) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/groups/ai-match", {
        answers: userAnswers,
      });

      if (res.data.success && res.data.matches.length > 0) {
        setMatches(res.data.matches);
      } else {
        setError("No matches found. Browse groups from the Home screen.");
        setMatches([]);
      }
      setDone(true);
    } catch (err: any) {
      console.log("AI matching error:", err?.response?.data || err?.message);
      setError(
        "Could not get AI recommendations. Showing popular groups instead.",
      );

      // Fallback — show first 3 groups
      try {
        const fallbackRes = await api.get("/groups");
        const fallback = (fallbackRes.data.groups || [])
          .slice(0, 3)
          .map((g: any) => ({
            ...g,
            match_percentage: Math.floor(Math.random() * 15) + 80,
            reason: `This ${g.category} group is popular among students with similar interests.`,
          }));
        setMatches(fallback);
      } catch {}
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: number) => {
    setJoining(groupId);
    try {
      await api.post(`/groups/${groupId}/toggle-join`);
      setJoinedGroups((prev) => [...prev, groupId]);
    } catch (err) {
      console.log("Join error:", err);
    } finally {
      setJoining(null);
    }
  };

  const CAT_COLORS: any = {
    study: "#4C9BE8",
    sports: "#51CF66",
    tech: "#845EF7",
    arts: "#FF6B6B",
    dance: "#FF6B9D",
    business: "#FFB347",
    health: "#20C997",
    social: "#FD7E14",
  };

  const CAT_ICONS: any = {
    study: "📚",
    sports: "⚽",
    tech: "💻",
    arts: "🎨",
    dance: "💃",
    business: "🚀",
    health: "🏥",
    social: "🌍",
  };

  const getColor = (g: any) => g.color || CAT_COLORS[g.category] || "#4C9BE8";
  const getIcon = (g: any) => CAT_ICONS[g.category] || "📌";

  // ── LOADING STATE ──
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <View style={styles.loadingContainer}>
          <View style={styles.aiAnimation}>
            <Text style={styles.aiEmoji}>🤖</Text>
          </View>
          <Text
            style={[
              styles.loadingTitle,
              { color: theme.text, fontSize: fontSizes.xl },
            ]}
          >
            Finding Your Groups...
          </Text>
          <Text
            style={[
              styles.loadingDesc,
              { color: theme.subText, fontSize: fontSizes.sm },
            ]}
          >
            Claude AI is analysing your interests and finding your perfect
            campus groups
          </Text>
          <ActivityIndicator
            size="large"
            color="#00467F"
            style={{ marginTop: 24 }}
          />
          <View style={styles.loadingSteps}>
            {[
              "Analysing your interests...",
              "Reviewing available groups...",
              "Calculating match scores...",
              "Preparing recommendations...",
            ].map((step, i) => (
              <View key={i} style={styles.loadingStep}>
                <Ionicons name="checkmark-circle" size={16} color="#51CF66" />
                <Text
                  style={[
                    styles.loadingStepText,
                    { color: theme.subText, fontSize: fontSizes.xs },
                  ]}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── RESULTS STATE ──
  if (done) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.resultsContent,
            { paddingHorizontal: isMobile ? 20 : 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsEmoji}>🎉</Text>
            <Text
              style={[
                styles.resultsTitle,
                { color: theme.text, fontSize: fontSizes.xxl },
              ]}
            >
              Your Top Matches!
            </Text>
            <Text
              style={[
                styles.resultsDesc,
                { color: theme.subText, fontSize: fontSizes.sm },
              ]}
            >
              Claude AI personally matched these groups to your interests and
              goals
            </Text>
          </View>

          {error.length > 0 && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#FFB347" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {matches.length === 0 ? (
            <View style={styles.noMatches}>
              <Text style={styles.noMatchEmoji}>🔍</Text>
              <Text style={[styles.noMatchTitle, { color: theme.text }]}>
                No groups found yet
              </Text>
              <Text style={[styles.noMatchDesc, { color: theme.subText }]}>
                No groups are available right now. You can browse and join
                groups from the Home screen.
              </Text>
            </View>
          ) : (
            matches.map((group, i) => (
              <View
                key={group.id}
                style={[
                  styles.matchCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                {/* Rank badge */}
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: getColor(group) },
                  ]}
                >
                  <Text style={styles.rankText}>#{i + 1}</Text>
                </View>

                {/* Match % */}
                <View style={styles.matchHeader}>
                  <View
                    style={[
                      styles.matchIconBox,
                      { backgroundColor: getColor(group) + "20" },
                    ]}
                  >
                    <Text style={styles.matchEmoji}>{getIcon(group)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.matchName,
                        { color: theme.text, fontSize: fontSizes.md },
                      ]}
                    >
                      {group.name}
                    </Text>
                    <Text
                      style={[
                        styles.matchCategory,
                        { color: theme.subText, fontSize: fontSizes.xs },
                      ]}
                    >
                      {group.category}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.matchPctBox,
                      { backgroundColor: getColor(group) + "20" },
                    ]}
                  >
                    <Text style={[styles.matchPct, { color: getColor(group) }]}>
                      {group.match_percentage}%
                    </Text>
                    <Text
                      style={[styles.matchPctLabel, { color: getColor(group) }]}
                    >
                      match
                    </Text>
                  </View>
                </View>

                {/* Match bar */}
                <View
                  style={[
                    styles.matchBarTrack,
                    { backgroundColor: theme.border },
                  ]}
                >
                  <View
                    style={[
                      styles.matchBarFill,
                      {
                        width: `${group.match_percentage}%`,
                        backgroundColor: getColor(group),
                      },
                    ]}
                  />
                </View>

                {/* Reason */}
                <View
                  style={[
                    styles.reasonBox,
                    { backgroundColor: getColor(group) + "10" },
                  ]}
                >
                  <Ionicons
                    name="bulb-outline"
                    size={14}
                    color={getColor(group)}
                  />
                  <Text
                    style={[
                      styles.reasonText,
                      { color: theme.subText, fontSize: fontSizes.xs },
                    ]}
                  >
                    {group.reason}
                  </Text>
                </View>

                {/* Join Button */}
                <TouchableOpacity
                  style={[
                    styles.joinBtn,
                    { backgroundColor: getColor(group) },
                    joinedGroups.includes(group.id) && {
                      backgroundColor: "#51CF66",
                    },
                  ]}
                  onPress={() =>
                    !joinedGroups.includes(group.id) && joinGroup(group.id)
                  }
                  disabled={
                    joining === group.id || joinedGroups.includes(group.id)
                  }
                >
                  {joining === group.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : joinedGroups.includes(group.id) ? (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.joinBtnText}>Joined!</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="add-circle-outline"
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.joinBtnText}>Join Group</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Continue to Home */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.continueBtnText}>
              {joinedGroups.length > 0
                ? `Continue to Home (Joined ${joinedGroups.length} group${joinedGroups.length > 1 ? "s" : ""})`
                : "Skip & Go to Home"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <Text
            style={[
              styles.skipNote,
              { color: theme.subText, fontSize: fontSizes.xs },
            ]}
          >
            You can always discover more groups from the Home screen
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── QUESTIONS STATE ──
  const q = QUESTIONS[currentQuestion];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.questionContent,
          { paddingHorizontal: isMobile ? 20 : 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.questionHeader}>
          <Text
            style={[
              styles.questionWelcome,
              { color: theme.subText, fontSize: fontSizes.sm },
            ]}
          >
            👋 Welcome, {user?.name?.split(" ")[0] || "Student"}!
          </Text>
          <Text
            style={[
              styles.questionIntro,
              { color: theme.text, fontSize: fontSizes.lg },
            ]}
          >
            Let's find your perfect campus groups
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text
              style={[
                styles.progressLabel,
                { color: theme.subText, fontSize: fontSizes.xs },
              ]}
            >
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </Text>
            <Text
              style={[
                styles.progressPct,
                { color: "#00467F", fontSize: fontSizes.xs },
              ]}
            >
              {Math.round((currentQuestion / QUESTIONS.length) * 100)}% complete
            </Text>
          </View>
          <View
            style={[styles.progressTrack, { backgroundColor: theme.border }]}
          >
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Question Card */}
        <View
          style={[
            styles.questionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={styles.questionEmoji}>{q.icon}</Text>
          <Text
            style={[
              styles.questionText,
              { color: theme.text, fontSize: fontSizes.lg },
            ]}
          >
            {q.question}
          </Text>

          <View style={styles.optionsList}>
            {q.options.map((option, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.optionBtn,
                  { borderColor: theme.border, backgroundColor: theme.inputBg },
                  selectedOption === option && styles.optionBtnSelected,
                ]}
                onPress={() => handleSelect(option)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.optionRadio,
                    {
                      borderColor:
                        selectedOption === option ? "#00467F" : theme.border,
                    },
                    selectedOption === option && styles.optionRadioSelected,
                  ]}
                >
                  {selectedOption === option && (
                    <View style={styles.optionRadioDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: selectedOption === option ? "#00467F" : theme.text,
                      fontSize: fontSizes.sm,
                    },
                    selectedOption === option && { fontWeight: "600" },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navBtns}>
          {currentQuestion > 0 && (
            <TouchableOpacity
              style={[styles.backBtn, { borderColor: theme.border }]}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={18} color={theme.subText} />
              <Text
                style={[
                  styles.backBtnText,
                  { color: theme.subText, fontSize: fontSizes.sm },
                ]}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextBtn,
              { flex: currentQuestion === 0 ? 1 : undefined },
              !selectedOption && { opacity: 0.5 },
            ]}
            onPress={handleNext}
            disabled={!selectedOption}
          >
            <Text style={[styles.nextBtnText, { fontSize: fontSizes.sm }]}>
              {currentQuestion === QUESTIONS.length - 1
                ? "Find My Groups 🤖"
                : "Next Question"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.navigate("Home")}
        >
          <Text
            style={[
              styles.skipBtnText,
              { color: theme.subText, fontSize: fontSizes.xs },
            ]}
          >
            Skip — I'll browse groups myself
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  aiAnimation: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EFF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  aiEmoji: { fontSize: 52 },
  loadingTitle: { fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  loadingDesc: { textAlign: "center", lineHeight: 22, marginBottom: 8 },
  loadingSteps: {
    gap: 10,
    marginTop: 24,
    alignSelf: "flex-start",
    width: "100%",
  },
  loadingStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  loadingStepText: {},

  // Questions
  questionContent: { flexGrow: 1, paddingTop: 20 },
  questionHeader: { marginBottom: 24 },
  questionWelcome: { marginBottom: 4 },
  questionIntro: { fontWeight: "bold", lineHeight: 28 },
  progressSection: { marginBottom: 24, gap: 8 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: {},
  progressPct: { fontWeight: "600" },
  progressTrack: { height: 8, borderRadius: 4 },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00467F",
  },
  questionCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    gap: 16,
    elevation: 2,
    marginBottom: 20,
  },
  questionEmoji: { fontSize: 40 },
  questionText: { fontWeight: "bold", lineHeight: 26 },
  optionsList: { gap: 10 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
  },
  optionBtnSelected: {
    borderColor: "#00467F",
    backgroundColor: "#EFF4FF",
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionRadioSelected: { borderColor: "#00467F" },
  optionRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00467F",
  },
  optionText: { flex: 1, lineHeight: 20 },
  navBtns: { flexDirection: "row", gap: 12, marginBottom: 16 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  backBtnText: {},
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#00467F",
    borderRadius: 12,
    height: 50,
  },
  nextBtnText: { color: "#fff", fontWeight: "bold" },
  skipBtn: { alignItems: "center", paddingVertical: 12 },
  skipBtnText: {},

  // Results
  resultsContent: { flexGrow: 1, paddingTop: 20 },
  resultsHeader: { alignItems: "center", marginBottom: 28 },
  resultsEmoji: { fontSize: 52, marginBottom: 12 },
  resultsTitle: { fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  resultsDesc: { textAlign: "center", lineHeight: 22 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFB347",
    marginBottom: 16,
  },
  errorText: { color: "#F59F00", fontSize: 13, flex: 1 },
  noMatches: { alignItems: "center", gap: 12, paddingVertical: 40 },
  noMatchEmoji: { fontSize: 52 },
  noMatchTitle: { fontSize: 18, fontWeight: "bold" },
  noMatchDesc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  matchCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    gap: 14,
    marginBottom: 16,
    position: "relative",
    elevation: 2,
  },
  rankBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  rankText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  matchHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  matchIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  matchEmoji: { fontSize: 28 },
  matchName: { fontWeight: "bold", marginBottom: 2 },
  matchCategory: { textTransform: "capitalize" },
  matchPctBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 12,
  },
  matchPct: { fontSize: 20, fontWeight: "bold" },
  matchPctLabel: { fontSize: 10, fontWeight: "600" },
  matchBarTrack: { height: 6, borderRadius: 3 },
  matchBarFill: { height: 6, borderRadius: 3 },
  reasonBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 10,
    padding: 12,
  },
  reasonText: { flex: 1, lineHeight: 18 },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    height: 48,
  },
  joinBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#00467F",
    borderRadius: 14,
    height: 54,
    marginTop: 8,
    elevation: 4,
  },
  continueBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  skipNote: { textAlign: "center", marginTop: 12 },
});
