export default function EventDetailLoading() {
  return (
    <div className="min-h-[100dvh] bg-white" role="status" aria-label="Memuat detail event">
      <div className="min-h-[510px] animate-pulse bg-surface-base motion-reduce:animate-none">
        <div className="mx-auto w-[min(1280px,calc(100%-32px))] py-16 sm:py-20 lg:py-24">
          <div className="h-4 w-48 rounded bg-primary-100" />
          <div className="mt-12 h-24 max-w-4xl rounded-2xl bg-primary-100" />
          <div className="mt-6 h-5 max-w-xl rounded bg-primary-100" />
        </div>
      </div>
      <div className="mx-auto grid w-[min(1280px,calc(100%-32px))] gap-10 py-16 sm:py-20 lg:grid-cols-[.7fr_1.3fr] lg:gap-12 lg:py-24">
        <div className="h-28 animate-pulse rounded-2xl bg-primary-100" />
        <div className="space-y-5">
          <div className="h-7 animate-pulse rounded bg-primary-100" />
          <div className="h-7 w-5/6 animate-pulse rounded bg-primary-100" />
          <div className="h-7 w-3/5 animate-pulse rounded bg-primary-100" />
        </div>
      </div>
    </div>
  );
}
