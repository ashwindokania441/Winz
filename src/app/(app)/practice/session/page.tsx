import { requireUser } from "@/lib/session";
import { SessionRunner } from "@/components/SessionRunner";

export default async function PracticeSessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    subjectId?: string;
    topicId?: string;
    subtopicId?: string;
    wholeSyllabus?: string;
  }>;
}) {
  await requireUser();
  const sp = await searchParams;
  if (!sp.subjectId) {
    return <p className="text-coral">Missing subject. Start from Practice.</p>;
  }

  return (
    <SessionRunner
      mode="practice"
      subjectId={sp.subjectId}
      topicId={sp.topicId || null}
      subtopicId={sp.subtopicId || null}
      wholeSyllabus={sp.wholeSyllabus === "1"}
    />
  );
}
