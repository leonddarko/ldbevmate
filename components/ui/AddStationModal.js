"use client"

import { Plus, X } from "lucide-react"
import AddStationForm from "./AddStationForm"

export default function AddStationModal({ Operator }) {
    console.log(Operator.role);
    
    return (
        <>
            <button
                onClick={() => document.getElementById('addstation_modal').showModal()}
                type="button"
                className="btn btn-sm flex justify-start gap-2 
                backdrop-blur-xl bg-blue-300/10 border border-blue-100/20 shadow-sm 
                text-blue-950 rounded-full"
            >
                <span>Add Station</span>
                <Plus size={15} />
            </button>


            <dialog id="addstation_modal" className="modal">
                <div className="modal-box backdrop-blur-2xl bg-blue-100/40 border border-blue-100/50 rounded-3xl shadow-2xl p-6 max-w-lg">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            <X size={20} className="text-red-900 m-auto" />
                        </button>
                    </form>
                    <div className="mb-5">
                        <h1 className="text-xl text-blue-950 font-notosans font-bold leading-none">Add Station</h1>
                        <span className="label-text text-xs text-blue-950">Fill out the form and add station.</span>
                    </div>

                    <AddStationForm
                        operatorId={Operator?.id}
                        onSuccess={() => window.location.reload()}
                    />
                </div>
            </dialog>
        </>
    )
}