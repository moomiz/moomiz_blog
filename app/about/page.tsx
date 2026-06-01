import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <Card className="p-8">
          <h1 className="text-3xl font-bold">소개</h1>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              Moomiz Tech Log는 단순한 기술 구현 기록을 넘어,{" "}
              <strong className="text-foreground">왜(Why)</strong> 그 기술을
              선택했는지와{" "}
              <strong className="text-foreground">AI와 어떻게 협업했는지</strong>
              를 투명하게 남기는 블로그입니다.
            </p>
            <p>
              모든 포스트는 5단계 Tech-Log 템플릿(Context → Prompting →
              Collaboration → Implementation → Takeaway)을 따릅니다.
            </p>
            <p>
              관리자 에디터에서 AI 가독성 최적화 파이프라인을 통해 초안을
              다듬고, Diff View로 변경 사항을 검토한 뒤 발행할 수 있습니다.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
