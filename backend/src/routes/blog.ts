import { Hono } from "hono";

import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
export const blogRoutes = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRoutes.use("/api/v1/blog/*", async (c, next) => {
  const jwt = c.req.header("Authorization");

  if (!jwt) {
    return c.status(401);
  }
  const token = jwt.split(" ")[1];
  const payload = await verify(token, c.env.JWT_SECRET);
  if (!payload) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  c.set("userId", payload.id as string);
  await next();
});

blogRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

const blog =  await prisma.blog.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: "1",
    },
  });

  return c.text("Hello Hono!");
});

blogRoutes.put("/api/v1/blog", (c) => {
  return c.text("Hello Hono!");
});
blogRoutes.get("/api/v1/blog/:id", (c) => {
  return c.text("Hello Hono!");
});
