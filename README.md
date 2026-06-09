# 宿まちチェックイン

一棟貸し宿向けのセルフチェックイン SaaS MVP です。大型ホテル向け PMS ではなく、小規模な宿オーナーが予約、暗証番号、案内メール、ゲスト向け入室情報を管理するための最小構成です。

## 技術構成

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Supabase Auth
- Resend
- Vercel

## 主な画面

- `/login` 管理者ログイン
- `/dashboard` 今日の業務
- `/reservations` 予約一覧
- `/reservations/new` 予約登録
- `/reservations/[id]` 予約詳細・メール送信・暗証番号管理
- `/settings` 施設情報・メールテンプレート設定
- `/guest/checkin/[token]` ゲスト向けチェックイン案内

## ローカルセットアップ

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

`http://localhost:3000` を開きます。

## 環境変数

ローカルでは `.env.local`、Vercel では Project Settings の Environment Variables に設定します。

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CHECKIN_EMAIL_FROM=
```

`SUPABASE_SERVICE_ROLE_KEY` と `RESEND_API_KEY` は公開しないでください。

## セキュリティ注意

`.env.local` は秘密情報を含むため、GitHub にコミットしないでください。
`.env.local.example` のみを共有してください。

## Supabase 設定

1. Supabase で新しい Project を作成します。
2. SQL Editor で [supabase/migrations/20260602193000_initial_schema.sql](./supabase/migrations/20260602193000_initial_schema.sql) を実行します。
3. Project Settings → API から以下を取得します。
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
4. Authentication → Users で管理者ユーザーを1名作成します。
5. Authentication → URL Configuration で Site URL を設定します。
   - local: `http://localhost:3000`
   - production: Vercel の公開 URL

MVP では管理者ロールは1種類のみです。`/dashboard`, `/reservations`, `/settings`, `/api/reservations/*` はログイン必須です。

## Resend 設定

1. Resend で API Key を作成します。
2. API Key を `RESEND_API_KEY` に設定します。
3. 送信元メールアドレスを `CHECKIN_EMAIL_FROM` に設定します。
   - 開発中は `onboarding@resend.dev` でも動作確認できます。
   - 本番では独自ドメインを Resend に認証してから、そのドメインのメールアドレスを使ってください。
4. `/settings` でメール件名テンプレートと本文テンプレートを編集します。

## Vercel デプロイ

1. GitHub リポジトリを Vercel に Import します。
2. Framework Preset は `Next.js` を選択します。
3. Environment Variables に上記の環境変数を登録します。
4. Build Command はデフォルトのままで問題ありません。

```bash
npm run build
```

5. デプロイ後、`NEXT_PUBLIC_APP_URL` を本番 URL に変更します。
6. Supabase Authentication の Site URL も本番 URL に変更します。

## 動作確認

```bash
npm run typecheck
npm run lint
npm run build
```

このリポジトリでは上記コマンドが成功する状態にしています。

## メールテンプレート変数

`/settings` のメールテンプレートでは以下を差し込めます。

```txt
{{guest_name}}
{{property_name}}
{{checkin_date}}
{{checkout_date}}
{{pin_code}}
{{guest_page_url}}
{{emergency_contact}}
```

メール送信後は `mail_logs` に結果を保存し、成功時は予約ステータスを `mail_sent` に更新します。
