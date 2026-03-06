import AddStationModal from "@/components/ui/AddStationModal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import connectDB from "@/lib/db";
import CPO from "@/models/CPO";
import Station from "@/models/Station";
import CPOStationCard from "@/components/ui/CPOStationCard";

export default async function StationsPage() {

  const session = await getServerSession(authOptions);
  // console.log(session?.user);

  if (!session) {
    return <div>Unauthorized</div>;
  }

  await connectDB();

  const cpo = await CPO.findOne({ user: session.user.id });

  const stations = await Station.find({ cpo: cpo._id }).lean();

  return (
    <div className="py-6 md:pt-24 px-4 md:px-10 h-screen rounded-lg bg-white/70 shadow-sm overflow-scroll">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl text-blue-950 font-bold">Your Stations</h1>
        <AddStationModal />
      </div>
      <CPOStationCard Stations={stations.reverse()} />
    </div>
  );
}