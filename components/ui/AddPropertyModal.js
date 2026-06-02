"use client";

import { Plus, X } from "lucide-react";
import AddPropertyForm from "./AddPropertyForm";

export default function AddPropertyModal() {

    return (
        <>
            {/* Trigger */}
            <button
                onClick={() =>
                    document
                        .getElementById("addproperty_modal")
                        .showModal()
                }
                type="button"
                className="
                    btn btn-sm
                    flex justify-start gap-2
                    backdrop-blur-xl
                    bg-white/80
                    border border-blue-100/20
                    shadow-sm
                    text-blue-950
                    rounded-full
                    z-10
                "
            >

                <span>Add Property</span>

                <Plus size={15} />

            </button>

            {/* Modal */}
            <dialog id="addproperty_modal" className="modal">

                <div
                    className="
                        modal-box
                        backdrop-blur-2xl
                        bg-white/80
                        border border-blue-100/40
                        rounded-3xl
                        shadow-2xl
                        p-6
                        max-w-2xl
                    "
                >

                    {/* Close */}
                    <form method="dialog">

                        <button
                            className="
                                btn-sm
                                btn-circle
                                btn-ghost
                                absolute
                                right-2
                                top-2
                            "
                        >

                            <X
                                size={20}
                                className="text-red-900 m-auto"
                            />

                        </button>

                    </form>

                    {/* Header */}
                    <div className="mb-5">

                        <h1
                            className="
                                text-xl
                                text-blue-950
                                font-notosans
                                font-bold
                                leading-none
                            "
                        >
                            Add Property
                        </h1>

                        <span
                            className="
                                label-text
                                text-xs
                                text-blue-950
                            "
                        >
                            Fill out the form and add property.
                        </span>

                    </div>

                    <AddPropertyForm
                        onSuccess={() =>
                            window.location.reload()
                        }
                    />

                </div>

            </dialog>
        </>
    );
}