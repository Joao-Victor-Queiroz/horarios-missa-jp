export function PageTitle({ title }: { title: string }) {
  return (
    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
      {title}
    </h1>
  );
}
