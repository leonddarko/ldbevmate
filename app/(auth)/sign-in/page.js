"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plug } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    const errorParam = searchParams.get("error");

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // 🚀 Redirect if already logged in
    useEffect(() => {
        if (status === "authenticated") {
            if (session.user.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        }
    }, [status, session, router]);

    useEffect(() => {
        if (errorParam) {
            setError("Invalid email or password");
        }
    }, [errorParam]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        });

        if (res.error) {
            console.log(res.error);
            setError("Invalid email or password");
            setLoading(false);
            return;
        }

        router.refresh(); // triggers session update
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url(/backgroundimages/ev-charging-station.jpg)] bg-cover bg-center bg-no-repeat bg-fixed px-6">
            <div
                className="
          w-full max-w-sm
          bg-white/10
          backdrop-blur-2xl
          border border-white
          rounded-3xl
          py-6 px-8
          shadow-2xl
          text-white
          relative
          overflow-hidden
        "
            >
                {/* Glow Aura */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-20 blur-2xl rounded-4xl animate-pulse"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-semibold text-center mb-6">
                        Welcome
                    </h2>

                    {error && (
                        <div className="alert alert-error mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-2">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            className="input input-bordered w-full bg-white/10 text-white rounded-full focus:outline-0 focus:border-white/30"
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleChange}
                            className="input input-bordered w-full bg-white/10 text-white rounded-full focus:outline-0 focus:border-white/30"
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                            w-full
                            py-2
                            rounded-full 
                            border-none
                            bg-blue-950 hover:bg-blue-950/90
                            transition-all 
                            duration-200
                            text-white
              "
                        >
                            {loading ?
                                <span className="flex justify-center items-center gap-2 font-semibold">
                                    <Plug size={20} className=" animate-ping" />
                                    Signing in...
                                </span>
                                : "Login"}
                        </button>
                    </form>

                    <p className="text-sm text-white/60 mt-6 text-center">
                        Don’t have an account?{" "}
                        <span
                            className="text-blue-950 cursor-pointer"
                            onClick={() => router.push("/sign-up")}
                        >
                            Sign Up
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}