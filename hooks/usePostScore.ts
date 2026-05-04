import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useSportsStore } from "../stores/sportsStore";
import { Match, Post } from "../types";

interface SetScore {
  p1: string;
  p2: string;
}

export function usePostScore() {
  const { activeSports } = useSportsStore();
  const [showScore, setShowScore] = useState(false);
  const [sets, setSets] = useState<SetScore[]>([{ p1: "", p2: "" }]);

  const validSets = sets.filter((s) => s.p1 !== "" && s.p2 !== "");
  const hasScore = showScore && validSets.length > 0;

  const reset = (initialSets?: Array<{ p1: number; p2: number }>) => {
    if (initialSets) {
      setShowScore(true);
      setSets(initialSets.map((s) => ({ p1: String(s.p1), p2: String(s.p2) })));
    } else {
      setShowScore(false);
      setSets([{ p1: "", p2: "" }]);
    }
  };

  const addSet = () => {
    if (sets.length < 5) setSets((prev) => [...prev, { p1: "", p2: "" }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSet = (index: number, field: "p1" | "p2", value: string) => {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const hideScore = () => {
    setShowScore(false);
    setSets([{ p1: "", p2: "" }]);
  };

  const submitScore = async (
    post: Post,
    userId: string,
  ): Promise<{ updatedMatch: Match | undefined; updatedMatchId: string | undefined }> => {
    const scoreAdded   = !post.match_id && hasScore;
    const scoreChanged = !!post.match_id && hasScore;
    const scoreRemoved = !!post.match_id && !showScore;

    let updatedMatch: Match | undefined = post.match;
    let updatedMatchId: string | undefined = post.match_id;

    const parsedSets = validSets.map((s) => ({
      p1: parseInt(s.p1) || 0,
      p2: parseInt(s.p2) || 0,
    }));

    if (scoreAdded) {
      const { data: newMatch, error } = await supabase
        .from("matches")
        .insert({
          player1_id: userId,
          player2_id: userId,
          sport: post.match?.sport ?? activeSports[0] ?? "tennis",
          score: { sets: parsedSets },
          validated: false,
        })
        .select()
        .single();
      if (error) throw error;
      updatedMatch = newMatch;
      updatedMatchId = newMatch.id;
    } else if (scoreChanged) {
      const { error } = await supabase
        .from("matches")
        .update({ score: { sets: parsedSets } })
        .eq("id", post.match_id);
      if (error) throw error;
      updatedMatch = { ...post.match!, score: { sets: parsedSets } };
    } else if (scoreRemoved) {
      const { error } = await supabase.from("matches").delete().eq("id", post.match_id!);
      if (error) throw error;
      updatedMatch = undefined;
      updatedMatchId = undefined;
    }

    return { updatedMatch, updatedMatchId };
  };

  return {
    showScore,
    setShowScore,
    sets,
    validSets,
    hasScore,
    addSet,
    removeSet,
    updateSet,
    hideScore,
    reset,
    submitScore,
  };
}
