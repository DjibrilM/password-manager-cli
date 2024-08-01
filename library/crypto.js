const {
  createCipheriv,
  randomBytes,
  createDecipheriv,
  pbkdf2Sync,
} = require("crypto");

class Crypto {
  static deriveKey(passphrase, salt, keyLength = 32) {
    try {
      return pbkdf2Sync(passphrase, salt, 100000, keyLength, "sha256");
    } catch (error) {
      console.error("Key derivation failed:", error);
      throw error;
    }
  }

  static encrypt(message, providedSalt, providedIV) {
    try {
      const iv = providedIV ? providedIV : randomBytes(15);
      const salt = providedSalt ? providedSalt : randomBytes(16);
      const key = this.deriveKey(message, salt);

      const cipher = createCipheriv("aes-256-ocb", key, iv, {
        authTagLength: 16,
      });

      //encrypt the message
      const encryptedMessage =
        cipher.update(message, "utf-8", "hex") + cipher.final("hex");

      return { encryptedMessage, iv, salt }; //return the encypted message, the IV(initialization vector) and the salt  
    } catch (error) {
      throw new Error(error);
    }
  }

  static encryptChildPassword(message, key) {
    const iv = randomBytes(15);
    const cipher = createCipheriv("aes-256-ocb", key, iv, {
      authTagLength: 16,
    });

    //encrypt the message
    const encryptedMessage =
      cipher.update(message, "utf-8", "hex") + cipher.final("hex");

    const authTag = cipher.getAuthTag();
    return { encryptedMessage, iv, authTag }; //return the encypted message and the IV(initialization vector)
  }

  static decrypt(encryptedMessage, key, iv, authTag) {
    try {
      const decipher = createDecipheriv("aes-256-ocb", key, iv, {
        authTagLength: 16,
      });

      decipher.setAuthTag(authTag);

      let decryptedMessage = decipher.update(encryptedMessage, "hex", "utf-8");
      decryptedMessage += decipher.final("utf-8");

      return decryptedMessage;
    } catch (error) {
      console.log(error);
      console.log("Failed to decipher the encrypted message 🥵");
    }
  }

  static compare(message, iv, salt, encryptedMessage) {
    return (
      this.encrypt(message, salt, iv).encryptedMessage === encryptedMessage
    );
  }
}

module.exports = Crypto;
