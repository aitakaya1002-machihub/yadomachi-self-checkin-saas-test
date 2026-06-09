import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">宿まちチェックイン</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">管理者ログイン</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            予約とチェックイン案内を管理します。
          </p>
        </div>
        <LoginForm nextPath={params?.next ?? "/dashboard"} />
      </div>
    </main>
  );
}
