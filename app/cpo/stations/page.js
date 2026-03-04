import AddStationModal from "@/components/ui/AddStationModal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function StationsPage() {

  const session = await getServerSession(authOptions);
  console.log(session?.user);


  return (
    <div className="py-6 md:pt-24 px-4 md:px-10 h-3/4 rounded-lg bg-white/70 shadow-sm overflow-scroll">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl text-blue-950 font-bold">Your Stations</h1>
        {/* <Link
          href="/cpo/stations/new"
          className="btn btn-sm flex justify-start gap-2 bg-blue-950 border-none text-white rounded-full"
        >
          <span>Add Station</span>
          <Plus size={15} />

        </Link> */}

        <AddStationModal Operator={session?.user} />
      </div>

      <div className="backdrop-blur-2xl bg-blue-100/40 border border-blue-100/50 rounded-3xl p-6">
        <p className="text-xs">No stations yet.</p>
      </div>
    </div>
  );
}