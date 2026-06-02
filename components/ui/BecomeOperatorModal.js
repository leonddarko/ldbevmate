"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { EvCharger, Plus, X } from "lucide-react";

export default function BecomeOperatorModal() {
    const [form, setForm] = useState({
        companyName: "",
        contactPhone: "",
        contactEmail: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/cpo/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            alert("Operator profile created. Please sign in again.");

            // 🔥 Force JWT refresh
            await signOut({ callbackUrl: "/sign-in" });
        } catch (err) {
            alert(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() =>
                    document.getElementById("become_operator_modal").showModal()
                }
                className="absolute top-3 right-18 z-1000 
                            btn btn-md rounded-full 
                            bg-white
                            backdrop-blur-2xl border border-blue-100/40
                            shadow-[0_0_20px_rgba(0,200,255,0.25)]
                            flex items-center justify-center
                            text-blue-900
        "
            >
                <div>
                    Become a CPO
                </div>
                <EvCharger size={20} />
            </button>

            {/* Modal */}
            <dialog id="become_operator_modal" className="modal">
                <div className="modal-box backdrop-blur-2xl 
                bg-white/80 border border-blue-100/40 rounded-3xl p-6 max-w-md text-blue-900">
                    {/* Close */}
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            <X size={18} />
                        </button>
                    </form>

                    <h2 className="text-2xl font-bold text-blue-950 mb-4">
                        Create Operator Profile
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            {/* Company Name */}
                            <div>
                                <label className="label text-xs">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    required
                                    className="input input-sm bg-white/80 border border-none shadow rounded-full w-full"
                                    value={form.companyName}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="label text-xs">Contact Phone</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="contactPhone"
                                    className="input input-sm bg-white/80 border border-none shadow rounded-full w-full"
                                    value={form.contactPhone}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="label text-xs">Contact Email</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    className="input input-sm bg-white/80 border border-none shadow rounded-full w-full"
                                    value={form.contactEmail}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-md btn-neutral border-none bg-blue-950 hover:bg-blue-950/90 w-full rounded-full text-white mt-6"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Operator Profile"}
                        </button>
                    </form>
                </div>
            </dialog>
        </>
    );
}