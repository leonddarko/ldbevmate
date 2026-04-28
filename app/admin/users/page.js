"use client";

import { ArrowLeft, Dot, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div className="h-screen flex flex-col justify-start items-center py-12 px-6 md:py-24 md:px-12 overflow-y-auto">

      <Users size={30} className=" text-blue-950" />
      <h1 className="text-xl font-bold text-blue-950">Manage Users</h1>

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

      <div className=" h-3/3 rounded-3xl overflow-y-auto p-4 mt-4 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {users.map(user => (
            <div key={user._id} className="card bg-blue-100/20 backdrop-blur-md p-4 rounded-3xl shadow-sm hover:shadow-[0_0_20px_rgba(0,200,255,0.4)] cursor-pointer transition-all duration-200 min-w-xs">
              <p className=" text-blue-950 font-medium">{user.name}</p>
              <p className="text-sm opacity-70">{user.email}</p>
              {user.role === "user" && (<>
                <p className="text-xs font-bold text-blue-950">User</p>
              </>)}
              {user.role === "cpo" && (<>
                <p className="text-xs font-bold text-blue-950">CPO</p>
              </>)}
              {user.role === "admin" && (<>
                <p className="text-xs font-bold text-blue-950">Admin</p>
              </>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}