"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function LoginButton() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)

      const supabase = createClient()

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className="h-11 w-full" onClick={handleGoogleLogin} disabled={loading}>
      {loading ? "Redirecting..." : "Continue with Google"}
    </Button>
  )
}