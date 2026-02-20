"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plug } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

        const res = await fetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(form),
        });

        const data = await res.json();
        console.log(data);
        

        if (!res.ok) {
            setError(data.message);
            setLoading(false);
            return;
        }

        router.push("/signin");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black
        bg-[url(/backgroundimages/ev-charging-station.jpg)] bg-cover bg-center bg-no-repeat bg-fixed
        px-6">
            <div
                className="
          w-full max-w-md
          bg-white/10
          backdrop-blur-2xl
          border border-white/10
          rounded-4xl
          p-8
          shadow-2xl
          text-white
          hover:border-white/50
          transition
        "
            >
                <h2 className="text-3xl font-bold text-center mb-6">
                    Create Account
                </h2>

                {error && (
                    <div className="alert alert-error mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        className="input input-bordered w-full bg-white/10 text-white rounded-full focus:outline-0 focus:border-white/30"
                        required
                    />

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
                bg-blue-600/80 hover:bg-blue-700
                transition-all 
                duration-200
                text-white
            "
                    >
                        {loading ?
                            <span className="flex justify-center items-center gap-2 font-semibold">
                                <Plug size={20} className=" animate-ping" />
                                Creating...
                            </span>
                            : "Sign Up"}
                    </button>
                </form>

                <p className="text-sm text-white mt-6 text-center">
                    Already have an account?{" "}
                    <span
                        className="text-blue-700 cursor-pointer"
                        onClick={() => router.push("/signin")}
                    >
                        Sign in
                    </span>
                </p>
            </div>
        </div>
    );
}