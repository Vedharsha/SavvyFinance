import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy
  passport.use(
    new LocalStrategy(async (username: string, password: string, done: (err: Error | null, user?: SelectUser | false, info?: { message: string }) => void) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (err: any) {
        return done(err);
      }
    })
  );

  // Serialize / Deserialize
  passport.serializeUser((user: SelectUser, done: (err: Error | null, id?: string) => void) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done: (err: Error | null, user?: SelectUser | false) => void) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err: any) {
      done(err);
    }
  });

  // Registration route
  app.post("/api/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;

      if (!username || !password || !email || !firstName || !lastName) {
        return res.status(400).json({ error: "All fields are required." });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
      });

      req.login(user, (err: Error | undefined) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error: any) {
      if (
        error.message === "Username already exists." ||
        error.message === "Email already exists."
      ) {
        return res.status(400).json({ error: error.message });
      }
      console.error("Error during registration:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });

  // Login route
  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (err: Error | null, user?: SelectUser | false, info?: { message?: string }) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!user) {
          return res.status(401).json({ error: info?.message || "Invalid credentials" });
        }
        req.login(user, (err: Error | undefined) => {
          if (err) {
            console.error("Login session error:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
          res.status(200).json(user);
        });
      }
    )(req, res, next);
  });

  // Logout
  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err: Error | undefined) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
