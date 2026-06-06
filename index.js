import Anthropic from "@anthropic-ai/sdk";
import nodemailer from "nodemailer";

const client = new Anthropic();

async function generateNewsletter() {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{
      role: "user",
      content: `You are an expert in technology, AI and economy news. Search for today's top 5 news stories of the days
      Write a clean HTML email digest with:
      - A brief intro with today's date
      - 5 stories: headline, 2-sentence summary, source link and what's the evolution from previous news
      - A short closing note
      Return ONLY the HTML body content.`
    }]
  });

  return response.content
    .filter(block => block.type === "text")
    .map(block => block.text)
    .join("");
}

async function sendEmail(html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `📰 Daily News — ${new Date().toDateString()}`,
    html,
  });

  console.log("✅ Email sent successfully!");
}

const newsletter = await generateNewsletter();
await sendEmail(newsletter);
