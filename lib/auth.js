import GoogleProvider     from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt              from "bcryptjs";
import { connectDB }       from "@/lib/mongodb";
import User                from "@/lib/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
      },
    }),
  ],

  callbacks: {
    // On Google sign-in: upsert the user into our own DB
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            name:     user.name,
            email:    user.email,
            googleId: user.id,
            image:    user.image,
          });
        } else if (!existing.googleId) {
          // Link Google account to existing local account
          existing.googleId = user.id;
          existing.image    = user.image;
          await existing.save();
        }
      }
      return true;
    },

    // Attach our DB _id to the JWT token on first sign-in
    async jwt({ token, user }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) token.id = dbUser._id.toString();
      }
      return token;
    },

    // Expose user.id to the client session
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
