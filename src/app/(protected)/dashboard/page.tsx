import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm text-slate-400">Authenticated session</p>
                        <h1 className="text-3xl font-bold tracking-tight">1880 Scouting Pilot</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Signed in as {user?.email}
                        </p>
                    </div>

                    <LogoutButton />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-slate-800 bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle>Auth complete</CardTitle>
                        </CardHeader>
                        
                        <CardContent className="text-sm text-slate-400">
                            Google Sign-In and protected routing are working.
                        </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle>Next branch</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-400">
                            Build the Supabase schema for roles, users, events, teams, and assignments.
                        </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle>Pilot direction</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-400">
                            Keep this branch auth-only. Scheduler, TBA sync, and summaries come next.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}