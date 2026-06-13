import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout icon={LogIn} title="Welcome back" subtitle="Log in to your account">
      {error && (
        <div className="p-3 mb-4 text-sm rounded-lg bg-destructive/10 text-destructive">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" autoFocus
              placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input id="password" type="password" autoComplete="current-password"
              placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...</> : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}