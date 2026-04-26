import orchestrator from "@/tests/orchestrators";
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import user from "@/models/user";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  //await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

afterAll(() => {});

describe("Model user", () => {
  test("Cria um usuario com sucesso", async () => {
    const newUser = {
      firstName: "teste",
      lastName: "Silva",
      email: "test@example.com",
      password: "sodsoskosoo",
    };

    const result = await user.create(newUser);

    expect(result).toHaveProperty("id");
    expect(uuidVersion(result.id)).toBe(7);
  });

  test("Falha ao criar usuario com email duplicado", async () => {
    const userDuplicado = {
      firstName: "teste",
      lastName: "Silva",
      email: "email@duplicado.com",
      password: "sodsoskosoo",
    };

    const result = await user.create(userDuplicado);

    expect(result).toHaveProperty("id");

    expect(user.create(userDuplicado)).rejects.toThrow(
      "Esse usuario ja existe",
    );
  });
});
