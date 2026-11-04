import { requireUser } from "@/lib/session";
import { SessionRunner } from "@/components/SessionRunner";

export default async function TestSessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    subjectId?: string;
    topicId?: string;
    subtopicId?: string;
    wholeSyllabus?: string;
    difficulty?: string;
  }>;
}) {
  await requireUser();
  const sp = await searchParams;
  if (!sp.subjectId) {
    return <p className="text-coral">Missing subject. Start from Test.</p>;
  }

  return (
    <SessionRunner
      mode="test"
      subjectId={sp.subjectId}
      topicId={sp.topicId || null}
      subtopicId={sp.subtopicId || null}
      difficulty={sp.difficulty || "high"}
      wholeSyllabus={sp.wholeSyllabus === "1"}
    />
  );
}
