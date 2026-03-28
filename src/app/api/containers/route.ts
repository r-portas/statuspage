import { getComposeGroups } from "@/lib/docker";

export async function GET() {
  try {
    const groups = await getComposeGroups();
    return Response.json({ groups });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to connect to Docker";
    return Response.json({ error: message }, { status: 500 });
  }
}
