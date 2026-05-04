export const cookieStore = new Map<string, string>();

export function resetCookies(): void {
  cookieStore.clear();
}

export function setRawCookie(name: string, value: string): void {
  cookieStore.set(name, value);
}

export function getRawCookie(name: string): string | undefined {
  return cookieStore.get(name);
}
