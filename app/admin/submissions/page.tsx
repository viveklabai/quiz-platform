import { AdminShell } from "@/src/components/admin/AdminShell";
import { Button } from "@/src/components/ui/Button";
import { Card, CardGrid } from "@/src/components/ui/Card";
import {
  getSubmissionFilterOptions,
  getSubmissions,
} from "./actions";
import { SubmissionList } from "./submission-list";

export const dynamic = "force-dynamic";

type AdminSubmissionsPageProps = PageProps<"/admin/submissions">;

export default async function AdminSubmissionsPage({
  searchParams,
}: AdminSubmissionsPageProps) {
  const params = await searchParams;
  const questionId =
    typeof params.questionId === "string" ? params.questionId : undefined;
  const teamId =
    typeof params.teamId === "string" ? params.teamId : undefined;

  const [filterOptions, submissions] = await Promise.all([
    getSubmissionFilterOptions(),
    getSubmissions({ questionId, teamId }),
  ]);

  const totalGraded = submissions.filter((submission) => submission.grade).length;
  const totalUngraded = submissions.length - totalGraded;

  const stats = {
    totalSubmissions: submissions.length,
    totalTeamsSubmitted: new Set(submissions.map((s) => s.teamId)).size,
    totalGraded,
    totalUngraded,
  };

  return (
    <AdminShell
      title="Submissions"
      description="Review team answers, grade submissions, and track activity."
    >
      <CardGrid>
        <Card title="Total Submissions" value={stats.totalSubmissions} />
        <Card
          title="Total Teams Submitted"
          value={stats.totalTeamsSubmitted}
        />
        <Card title="Total Graded" value={stats.totalGraded} />
        <Card title="Total Ungraded" value={stats.totalUngraded} />
      </CardGrid>

      <form
        method="get"
        className="mt-8 flex flex-col gap-4 rounded-xl border border-foreground/10 p-6 sm:flex-row sm:items-end"
      >
        <div className="flex flex-col gap-1.5 sm:flex-1">
          <label htmlFor="questionId" className="text-sm font-medium">
            Question
          </label>
          <select
            id="questionId"
            name="questionId"
            value={questionId ?? ""}
            className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground/40"
          >
            <option value="">All questions</option>
            {filterOptions.questions.map((question) => (
              <option key={question.id} value={question.id}>
                {question.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:flex-1">
          <label htmlFor="teamId" className="text-sm font-medium">
            Team
          </label>
          <select
            id="teamId"
            name="teamId"
            value={teamId ?? ""}
            className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground/40"
          >
            <option value="">All teams</option>
            {filterOptions.teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit">Apply Filters</Button>
          {(questionId || teamId) && (
            <Button href="/admin/submissions" variant="secondary">
              Clear
            </Button>
          )}
        </div>
      </form>

      {submissions.length === 0 ? (
        <section className="mt-8 rounded-xl border border-dashed border-foreground/20 p-8 text-center">
          <p className="text-foreground/60">No submissions found.</p>
        </section>
      ) : (
        <div className="mt-8">
          <SubmissionList submissions={submissions} />
        </div>
      )}
    </AdminShell>
  );
}
