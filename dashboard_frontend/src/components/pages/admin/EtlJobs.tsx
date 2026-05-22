export const AdminEtl = () => {
    return (
        <div className="mx-auto max-w-2xl">
            <h1 className="mb-6 text-2xl font-semibold">Admin: ETL Jobs</h1>

            <section className="mb-8 rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-medium">Job Statuses</h2>
                <p className="text-sm text-muted-foreground">
                    {/* TODO: fetch ETL job statuses from backend */}
                    ETL job status monitoring is not yet available. Backend endpoints for
                    ETL job management are planned.
                </p>
            </section>

            <section className="rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-medium">Job Logs</h2>
                <p className="text-sm text-muted-foreground">
                    {/* TODO: fetch ETL job logs from backend */}
                    ETL job log viewing is not yet available. Backend endpoints for log
                    retrieval are planned.
                </p>
            </section>
        </div>
    );
};
