import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettings } from "@/lib/db/settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await loadSettings();

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="設定"
        description="施設情報とチェックイン案内メールのテンプレートを管理します。"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">施設情報・メールテンプレート</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}

async function loadSettings() {
  try {
    return await getSettings();
  } catch (error) {
    if (error instanceof Error && error.message.includes("SUPABASE")) {
      return null;
    }

    throw error;
  }
}
