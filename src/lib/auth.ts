import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { getDbAsync } from "./db";

export type Agent = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  photo_url: string;
};

export async function createSession(agentId: string): Promise<string> {
  const db = await getDbAsync();
  const id = uuid();
  db.prepare("INSERT INTO sessions (id, agent_id) VALUES (?, ?)").run(id, agentId);
  return id;
}

export async function getAgentFromSession(sessionId: string): Promise<Agent | null> {
  if (!sessionId) return null;
  const db = await getDbAsync();
  const row = db
    .prepare(
      "SELECT a.id, a.name, a.company, a.email, a.phone, a.photo_url FROM sessions s JOIN agents a ON a.id = s.agent_id WHERE s.id = ?"
    )
    .get(sessionId) as Agent | undefined;
  return row ?? null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await getDbAsync();
  db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

export async function createAgent(
  name: string,
  email: string,
  password: string,
  company: string,
  phone: string
): Promise<Agent> {
  const db = await getDbAsync();
  const id = uuid();
  const pw = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT INTO agents (id, name, company, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, name, company, email, phone, pw);
  return { id, name, company, email, phone, photo_url: "" };
}

export async function getAgentByEmail(
  email: string
): Promise<(Agent & { password: string }) | null> {
  const db = await getDbAsync();
  const row = db
    .prepare("SELECT * FROM agents WHERE email = ?")
    .get(email) as (Agent & { password: string }) | undefined;
  return row ?? null;
}

export async function verifyAgentPassword(
  email: string,
  password: string
): Promise<{ agent: Agent; sessionId: string } | null> {
  const agent = await getAgentByEmail(email);
  if (!agent || !bcrypt.compareSync(password, agent.password)) return null;
  const sessionId = await createSession(agent.id);
  return {
    agent: {
      id: agent.id,
      name: agent.name,
      company: agent.company,
      email: agent.email,
      phone: agent.phone,
      photo_url: agent.photo_url,
    },
    sessionId,
  };
}