import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import connectDB from '@/lib/connectDB';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import SubAdmin from '@/models/SubAdmin';
import BecomePartner from '@/models/BecomePartner';
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: 'user-login',
      name: 'User Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email before logging in.');
        }

        return { id: user._id.toString(), name: user.name, email: user.email, isAdmin: false };
      },
    }),
    CredentialsProvider({
      id: 'vendor-login',
      name: 'Vendor Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB();

        // Find vendor by partnerUsername
        const vendor = await BecomePartner.findOne({
          partnerUsername: credentials.username,
          status: 'approved',
          isActive: true
        });

        if (!vendor) {
          throw new Error('Invalid username or account not approved');
        }

        // Check if we have a hashed password to verify
        if (vendor.partnerPassword) {
          // If password is hashed, use bcrypt to verify
          const isValidPassword = await bcrypt.compare(credentials.password, vendor.partnerPassword);
          if (!isValidPassword) {
            throw new Error('Invalid password');
          }
        }

        return {
          id: vendor._id.toString(),
          name: vendor.contactPerson || 'Vendor',
          email: vendor.email,
          role: 'vendor',
          isVendor: true
        };
      },
    }),
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        let admin = await Admin.findOne({ email: credentials.email });

        // If not an Admin, check if they are a SubAdmin
        if (!admin) {
          admin = await SubAdmin.findOne({ email: credentials.email });
        }

        if (!admin) {
          throw new Error("Invalid email or password");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, admin.password);
        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: admin._id.toString(),
          name: admin.fullName || "Admin",
          email: admin.email,
          isAdmin: admin.isAdmin || false,
          isSubAdmin: admin.isSubAdmin || false,
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      await connectDB();

      if (account.provider === "google") {
        const isAdmin = await Admin.findOne({ email: user.email });

        if (isAdmin) {
          throw new Error("Admin must log in with credentials.");
        }

        let existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          // Generate a unique username from Google profile or email
          let baseUsername = user.name?.replace(/\s+/g, '').toLowerCase() || user.email?.split('@')[0];
          let username = baseUsername;
          let suffix = 1;
          // Ensure username is unique
          while (await User.findOne({ username })) {
            username = `${baseUsername}${suffix++}`;
          }
          // Create a new user if they don't exist
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: 'Google',
            username,
            isVerified: true,
          });
          existingUser = newUser;
        }
        user.id = existingUser._id.toString();
      }

      return true;
    },

    async session({ session, token, user }) {
      session.user.id = token.sub || user?.id;
      session.user.isAdmin = token.isAdmin || false;
      session.user.isSubAdmin = token.isSubAdmin || false;
      session.user.isVendor = token.isVendor || false;
      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.isAdmin = user.isAdmin || false;
        token.isSubAdmin = user.isSubAdmin || false;
        token.isVendor = user.isVendor || false;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
    adminSignIn: '/admin/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
