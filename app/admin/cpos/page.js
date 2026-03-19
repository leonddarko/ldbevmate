"use client";

import { ArrowLeft, AtSign, BadgeAlert, BadgeCheck, Building, Dot, User } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminCPOPage() {
  const [cpos, setCpos] = useState([]);
  const [loadingId, setLoadingId] = useState(null);


  useEffect(() => {
    fetch("/api/admin/cpos")
      .then(res => res.json())
      .then(data => setCpos(data));
  }, []);


  async function updateCPOStatus(id, verified) {
    try {
      setLoadingId(id);

      const res = await fetch(`/api/admin/cpos/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      // ✅ Update UI without reload
      setCpos((prev) =>
        prev.map((cpo) =>
          cpo._id === id ? { ...cpo, verified } : cpo
        )
      );

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="h-screen flex flex-col justify-start items-center py-12 px-6 md:py-24 md:px-12 overflow-y-auto">
      <Building size={30} className=" text-blue-950" />
      <h1 className="text-xl font-bold my-2">Manage CPOs</h1>

      <Link href="/admin">
        <button
          className="btn btn-xs bg-blue-950 text-white border-none rounded-full shadow flex justify-between mt-4"
        >

          <span
            type="submit"
            className="flex justify-center items-center gap-2 font-semibold">
            <ArrowLeft size={13} />
            Back
          </span>

        </button>
      </Link>
      {/* <Dot size={30} className=" text-blue-950 mb-4" /> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

        {cpos.map(cpo => (
          <div key={cpo._id} className="card bg-blue-100/20 backdrop-blur-md p-4 rounded-3xl shadow-sm hover:shadow-[0_0_20px_rgba(0,200,255,0.4)] cursor-pointer transition-all duration-200 min-w-xs">
            <p className=" text-blue-950 font-medium">{cpo.companyName}</p>
            <p className="text-sm opacity-70 flex justify-start items-center gap-1">
              <AtSign size={15} className=" text-blue-950" />
              {cpo.user?.email}
            </p>
            <p className="text-sm opacity-70 flex justify-start items-center gap-1">
              <User size={15} className=" text-blue-950" />
              {cpo.user?.name}
            </p>


            <div className=" flex justify-end items-center gap-1 mt-2">
              {/* Verify Button  */}
              {cpo.verified === false && (<>
                <button
                  disabled={loadingId === cpo._id}
                  className="btn btn-xs bg-green-900 text-white border-none rounded-full shadow flex justify-between"
                  onClick={() => updateCPOStatus(cpo._id, true)}
                >
                  {loadingId === cpo._id ?
                    <span
                      type="submit"
                      className="flex justify-center items-center gap-2 font-semibold">
                      Verifying...
                    </span>
                    :
                    <span
                      type="submit"
                      className="flex justify-center items-center gap-2 font-semibold">
                      <BadgeCheck size={13} />
                      Verify
                    </span>
                  }
                </button>

              </>)}

              {/* Refute Button  */}
              {cpo.verified === true && (
                <>
                  <button
                    disabled={loadingId === cpo._id}
                    className="btn btn-xs bg-red-700 text-white border-none rounded-full shadow flex justify-between"
                    onClick={() => updateCPOStatus(cpo._id, false)}
                  >
                    {loadingId === cpo._id ?
                      <span
                        type="submit"
                        className="flex justify-center items-center gap-2 font-semibold">
                        Refuting...
                      </span>
                      :
                      <span
                        type="submit"
                        className="flex justify-center items-center gap-2 font-semibold">
                        <BadgeAlert size={13} />
                        Refute
                      </span>
                    }
                  </button>
                </>
              )}

            </div>

          </div>
        ))}
      </div>
    </div>
  );
}