import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FeedbackRequest = {
  name?: string;
  email?: string;
  message?: string;
  blogTitle?: string;
  blogSlug?: string;
  blogUrl?: string;
  timestamp?: string;
};

function formatSubmittedAt(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}

function buildEmailBody(data: Required<FeedbackRequest>): string {
  return [
    "New Blog Feedback",
    "",
    "Article:",
    data.blogTitle,
    "",
    
    "URL:",
    data.blogUrl,
    "",
    "Submitted:",
    formatSubmittedAt(data.timestamp),
    "",
    "Name:",
    data.name,
    "",
    "Email:",
    data.email,
    "",
    "---",
    "",
    "Message:",
    "",
    data.message,
    "",
    "---",
  ].join("\n");
}

function validatePayload(body: FeedbackRequest): string | null {
  if (!body.name?.trim()) {
    return "Name is required.";
  }

  if (!body.email?.trim()) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(body.email.trim())) {
    return "Please enter a valid email address.";
  }

  if (!body.message?.trim()) {
    return "Message is required.";
  }

  if (!body.blogTitle?.trim() || !body.blogSlug?.trim() || !body.blogUrl?.trim()) {
    return "Blog context is missing.";
  }

  if (!body.timestamp?.trim()) {
    return "Timestamp is missing.";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const receiverEmail = process.env.FEEDBACK_RECEIVER_EMAIL?.trim();
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

    if (!apiKey || !receiverEmail || !fromEmail) {
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as FeedbackRequest;
    const validationError = validatePayload(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const payload = {
      name: body.name!.trim(),
      email: body.email!.trim(),
      message: body.message!.trim(),
      blogTitle: body.blogTitle!.trim(),
      blogSlug: body.blogSlug!.trim(),
      blogUrl: body.blogUrl!.trim(),
      timestamp: body.timestamp!.trim(),
    };

    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from: fromEmail,
      to: receiverEmail,
      replyTo: payload.email,
      subject: `Blog Feedback: ${payload.blogTitle}`,
      text: buildEmailBody(payload),
    });

    if (response.error) {
      return NextResponse.json(
        { error: "Failed to send feedback." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send feedback." },
      { status: 500 },
    );
  }
}
