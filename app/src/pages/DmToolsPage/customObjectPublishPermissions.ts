export const CUSTOM_OBJECT_PUBLISH_PERMISSION_MESSAGE =
  "You must be a keeper user to publish content to the public.";

export function canPublishCustomObject(role: string | null | undefined) {
  return role === "keeper" || role === "admin";
}
