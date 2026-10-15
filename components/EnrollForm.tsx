"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { Enrollment } from "@/lib/courses";

type EnrollFormProps = {
  courseId: string;
};

type FormStatus = "idle" | "sending" | "done" | "rejected" | "error";

type ValidationResponse = {
  detail?: Array<{ msg?: string }>;
};

export default function EnrollForm({ courseId }: EnrollFormProps) {
  const [studentName, setStudentName] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/enrollments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, studentName }),
        },
      );

      if (response.status === 422) {
        const payload = (await response.json()) as ValidationResponse;
        setStatus("rejected");
        setMessage(
          payload.detail?.[0]?.msg ?? "The server rejected the enrollment data.",
        );
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const enrollment = (await response.json()) as Enrollment;
      setStatus("done");
      setMessage(`You are enrolled. Enrollment number: ${enrollment.id}`);
    } catch {
      setStatus("error");
      setMessage("Enrollment failed. Check the API and try again.");
    }
  }

  const isSending = status === "sending";
  const isSuccess = status === "done";

  return (
    <section className="border-t border-border bg-blue-50/60 px-6 py-8 sm:px-10">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
          Registration
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Enroll in this course
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter your name. FastAPI validates the request and returns your
          enrollment number.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-2 text-sm font-bold text-foreground">
            Student name
            <input
              name="studentName"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="Aigerim"
              autoComplete="name"
              required
              disabled={isSending}
              aria-describedby="enrollment-status"
              className="min-h-11 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-base font-normal shadow-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-200 disabled:cursor-wait disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={isSending}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-strong px-5 py-2.5 font-bold text-white shadow-sm transition duration-200 hover:bg-blue-900 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          >
            <Send aria-hidden="true" className="h-4 w-4" />
            {isSending ? "Enrolling…" : "Enroll"}
          </button>
        </form>

        <p
          id="enrollment-status"
          aria-live="polite"
          className={`mt-3 min-h-6 text-sm font-semibold ${
            isSuccess ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {message}
        </p>
      </div>
    </section>
  );
}
