import { NextResponse } from "next/server";
import { sendCheckinGuideMail } from "@/lib/mail/send-checkin-guide";

type SendMailRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: SendMailRouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { ok: false, message: "予約IDが指定されていません。" },
      { status: 400 },
    );
  }

  try {
    const result = await sendCheckinGuideMail(id);

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? `メール送信処理に失敗しました。${error.message}`
            : "メール送信処理に失敗しました。",
      },
      { status: 500 },
    );
  }
}
