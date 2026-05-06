import bcrypt from "bcrypt";

async function passwordHashed(passwordInText: string) {
  const salt = await bcrypt.genSalt(
    process.env.NODE_ENV === "production" ? 12 : 1,
  );

  return await bcrypt.hash(passwordInText, salt);
}

async function compareHash(passwordHashed: string, passwordInText: string) {
  return await bcrypt.compare(passwordInText, passwordHashed);
}

const passwordModel = {
  passwordHashed,
  compareHash,
};

export default passwordModel;
