"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Building2, X } from "lucide-react";

export default function BecomeRealtorModal() {
    const [form, setForm] = useState({
        agencyName: "",
        bio: "",
        phone: "",
        whatsapp: "",
        city: "",
        region: "",
        agreedToTerms: false,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.agreedToTerms) {
            return alert("You must agree to the Terms & Conditions.");
        }

        setLoading(true);

        try {
            const res = await fetch("/api/realtor/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            alert("Realtor profile created. Please sign in again.");

            await signOut({
                callbackUrl: "/sign-in",
            });

        } catch (err) {
            alert(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Trigger */}
            <button
                onClick={() =>
                    document
                        .getElementById("become_realtor_modal")
                        .showModal()
                }
                className="
                    absolute top-3 right-60 z-1000
                    btn btn-md rounded-full
                    bg-white
                    backdrop-blur-2xl
                    border border-blue-100/40
                    shadow-[0_0_20px_rgba(0,200,255,0.25)]
                    text-blue-900
                    flex items-center gap-2
                "
            >
                <span>Realtor</span>
                <Building2 size={20} />
            </button>

            {/* Modal */}
            <dialog id="become_realtor_modal" className="modal">
                <div
                    className="
                        modal-box
                        backdrop-blur-2xl
                        bg-white/80
                        border border-blue-100/40
                        rounded-3xl
                        p-6
                        max-w-md
                        text-blue-900
                    "
                >
                    {/* Close */}
                    <form method="dialog">
                        <button
                            className="
                                btn btn-sm btn-circle btn-ghost
                                absolute right-2 top-2
                            "
                        >
                            <X size={18} />
                        </button>
                    </form>

                    <h2 className="text-2xl font-bold text-blue-950 mb-4">
                        Create Realtor Profile
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-2">

                            {/* Agency */}
                            <div>
                                <label className="label text-xs">
                                    Agency Name
                                </label>

                                <input
                                    type="text"
                                    name="agencyName"
                                    required
                                    value={form.agencyName}
                                    onChange={handleChange}
                                    className="
                                        input input-sm
                                        bg-white/80
                                        border-none
                                        shadow
                                        rounded-full
                                        w-full
                                    "
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="label text-xs">
                                    Bio
                                </label>

                                <textarea
                                    name="bio"
                                    rows={3}
                                    value={form.bio}
                                    onChange={handleChange}
                                    className="
                                        textarea textarea-sm
                                        bg-white/80
                                        border-none
                                        shadow
                                        rounded-2xl
                                        w-full
                                    "
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="label text-xs">
                                    Phone
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="
                                        input input-sm
                                        bg-white/80
                                        border-none
                                        shadow
                                        rounded-full
                                        w-full
                                    "
                                />
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <label className="label text-xs">
                                    WhatsApp
                                </label>

                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={form.whatsapp}
                                    onChange={handleChange}
                                    className="
                                        input input-sm
                                        bg-white/80
                                        border-none
                                        shadow
                                        rounded-full
                                        w-full
                                    "
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label className="label text-xs">
                                    City
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    className="
                                        input input-sm
                                        bg-white/80
                                        border-none
                                        shadow
                                        rounded-full
                                        w-full
                                    "
                                />
                            </div>

                            {/* Region */}
                            <div>
                                <label className="label text-xs">
                                    Region
                                </label>

                                <input
                                    type="text"
                                    name="region"
                                    value={form.region}
                                    onChange={handleChange}
                                    className="
                                        input input-sm
                                        bg-white/80
                                        border-none
                                        shadow
                                        rounded-full
                                        w-full
                                    "
                                />
                            </div>

                            {/* Terms */}
                            <div className="mt-2">
                                <label className="flex items-start gap-3 text-xs cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="agreedToTerms"
                                        checked={form.agreedToTerms}
                                        onChange={handleChange}
                                        className="checkbox checkbox-xs checkbox-info border-0 bg-white mt-1"
                                    />

                                    <span className="leading-relaxed">
                                        I confirm that all property listings
                                        and information I provide will be
                                        genuine and accurate. Fraudulent or
                                        misleading listings may result in
                                        suspension or removal from the platform.
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                btn btn-md
                                btn-neutral
                                border-none
                                bg-blue-950
                                hover:bg-blue-950/90
                                w-full
                                rounded-full
                                text-white
                                mt-6
                            "
                        >
                            {loading
                                ? "Creating..."
                                : "Create Realtor Profile"}
                        </button>
                    </form>
                </div>
            </dialog>
        </>
    );
}