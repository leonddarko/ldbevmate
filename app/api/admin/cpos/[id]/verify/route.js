import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CPO from "@/models/CPO";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    await connectDB();

    const session = await getServerSession(authOptions);

    // 🔐 Admin only
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { verified } = await req.json();

    // 1. Get CPO first (we need the user ID)
    const cpo = await CPO.findById(id);

    if (!cpo) {
      return NextResponse.json(
        { message: "CPO not found" },
        { status: 404 }
      );
    }

    // 2. Update CPO verification
    cpo.verified = verified;
    await cpo.save();

    // 3. Update linked User role
    const newRole = verified ? "cpo" : "user";

    await User.findByIdAndUpdate(cpo.user, {
      role: newRole,
    });

    return NextResponse.json({
      message: "CPO + User updated",
      cpo,
      role: newRole,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}


// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import CPO from "@/models/CPO";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// export async function PATCH(req, context) {
//     try {

//         const { params } = context;
//         const { id } = await params; // ✅ unwrap params

//         await connectDB();

//         const session = await getServerSession(authOptions);

//         // 🔐 Only admins allowed
//         if (!session || session.user.role !== "admin") {
//             return NextResponse.json(
//                 { message: "Unauthorized" },
//                 { status: 403 }
//             );
//         }

//         const { verified } = await req.json();

//         const cpo = await CPO.findByIdAndUpdate(
//             id,
//             { verified },
//             { new: true }
//         );

//         if (!cpo) {
//             return NextResponse.json(
//                 { message: "CPO not found" },
//                 { status: 404 }
//             );
//         }

//         return NextResponse.json({
//             message: "CPO updated",
//             cpo,
//         });

//     } catch (err) {
//         console.error(err);
//         return NextResponse.json(
//             { message: "Server error" },
//             { status: 500 }
//         );
//     }
// }