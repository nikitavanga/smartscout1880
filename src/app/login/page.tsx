import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { LoginButton } from "@/components/auth/login-button"

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const error = params.error

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_25%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-center space-y-5">
            <div className="inline-flex w-fit items-center rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-300 backdrop-blur">
              Team 1880 • SmartScout Pilot
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Event-ready scouting,
                <span className="block bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  scheduling, and strategy
                </span>
              </h1>

              <p className="max-w-xl text-base leading-7 text-slate-300">
                Sign in with Google to access the pilot system for scheduling,
                live event dashboards, scouter assignments, and pre/post-match summaries.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-medium">Live stats</p>
                <p className="mt-1 text-xs text-slate-400">
                  Current event and match visibility
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-medium">Scheduler</p>
                <p className="mt-1 text-xs text-slate-400">
                  Scoutradioz-style assignment flow
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-medium">Summaries</p>
                <p className="mt-1 text-xs text-slate-400">
                  Pre-match and post-match evidence cards
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/85 text-white shadow-2xl backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Sign in</CardTitle>
                <p className="text-sm text-slate-400">
                  Use your approved Google account to continue.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {error === "auth_callback" ? (
                  <div className="rounded-xl border border-red-900 bg-red-950/60 p-3 text-sm text-red-200">
                    Authentication failed. Please try signing in again.
                  </div>
                ) : null}

                <LoginButton />

                <p className="text-xs leading-6 text-slate-500">
                  This pilot is restricted to approved users. If access fails,
                  check the allowed email list or domain configuration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
