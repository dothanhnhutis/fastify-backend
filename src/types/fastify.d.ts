interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
  priority?: "low" | "medium" | "high";
  // signed?: boolean;
  // partitioned?: boolean;
  // encode?: (val: string) => string;
}

type User = {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  created_at: Date;
  updated_at: Date;
};

type Role = {
  id: string;
  name: string;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
};

type Session = {
  id: string;
  provider: "google" | "credential";
  userId: string;
  cookie: CookieOptions;
  ip: string;
  userAgent: UAParser.IResult;
  lastAccess: Date;
  createAt: Date;
};

type Warehouse = {
  id: string;
  name: string;
  address: string;
  created_at: Date;
  updated_at: Date;
};

type Packaging = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

type ReqInfo = {
  userId: string;
  ip: string;
  userAgentRaw: string;
  provider: "credential" | "google";
  cookie?: CookieOptions;
};

type Metadata = {
  totalItem: number;
  totalPage: number;
  hasNextPage: number | boolean;
  limit: number;
  itemStart: number;
  itemEnd: number;
};
