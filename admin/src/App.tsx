import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="login"><p>Loading…</p></div>;
  if (!session) return <Login />;
  return <Dashboard user={session.user} />;
}

export type { User };
