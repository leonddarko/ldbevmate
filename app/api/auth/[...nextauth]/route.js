import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found");
        }
        

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role, // 🔥 inject role here
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // 🔥 attach role to token
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role; // 🔥 expose role to frontend
      return session;
    },
  },

  pages: {
    signIn: "/signin",       // 🔥 custom login page
    error: "/signin",        // 🔥 redirect errors here
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };