import type { components } from "@/lib/schema";

export type Course = components["schemas"]["Course"];
export type Enrollment = components["schemas"]["Enrollment"];

const API_URL = process.env.API_URL;

if (!API_URL) {
  throw new Error("API_URL is not set: create .env.local");
}

export async function getCourses(): Promise<Course[]> {
  const response = await fetch(`${API_URL}/courses`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<Course[]>;
}

export async function getCourse(id: string): Promise<Course | undefined> {
  const response = await fetch(`${API_URL}/courses/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<Course>;
}
