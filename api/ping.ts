// Zero-dependency health probe. Confirms that /api TypeScript functions execute
// on this project at all (isolates platform/build issues from app code).
export default function handler(_req: any, res: any) {
  res.status(200).json({ ok: true, pong: true, runtime: "vercel", at: new Date().toISOString() });
}
