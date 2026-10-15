import ElectiveFilter from "@/components/ElectiveFilter";

export default function FilterPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
          Browser integration
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Filter the live catalog
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          Switch between the complete curriculum and electives while SWR keeps
          the browser request responsive.
        </p>
      </div>
      <ElectiveFilter />
    </main>
  );
}
