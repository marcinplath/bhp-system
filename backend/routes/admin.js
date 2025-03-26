const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/roleMiddleware");
const pool = require("../database/db");
const {
  sendInvitationEmail,
  sendCompletionEmail,
} = require("../utils/emailSender");

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const bcrypt = require("bcrypt");

router.post("/create-user", authenticateToken, checkAdmin, async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email i hasło są wymagane." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at",
      [email, hashedPassword, role || "user"]
    );

    res
      .status(201)
      .json({ message: "Użytkownik utworzony", user: result.rows[0] });
  } catch (error) {
    console.error("Błąd podczas tworzenia użytkownika:", error);
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ error: "Użytkownik z tym emailem już istnieje." });
    }
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.get("/users", authenticateToken, checkAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role, created_at FROM users ORDER BY id ASC"
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error("Błąd pobierania użytkowników:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.delete("/users/:id", authenticateToken, checkAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Użytkownik nie istnieje." });
    }
    res.json({ message: "Użytkownik usunięty." });
  } catch (error) {
    console.error("Błąd usuwania użytkownika:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.post("/send-invitation", authenticateToken, async (req, res) => {
  const { email, inviter } = req.body;

  if (!email || !inviter) {
    return res
      .status(400)
      .json({ error: "Proszę podać email gościa i zapraszającego." });
  }

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ error: "Nieprawidłowy format adresu e-mail." });
  }

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log(`Tworzenie zaproszenia dla: ${email}, od: ${inviter}`);

    const result = await pool.query(
      "INSERT INTO invitations (email, inviter, expires_at) VALUES ($1, $2, $3) RETURNING *",
      [email, inviter, expiresAt]
    );

    const invitation = result.rows[0];
    const link = `http://localhost:5173/test/${invitation.link}`;

    console.log(`Wysłanie e-maila z linkiem: ${link}`);

    await sendInvitationEmail(email, link);

    res
      .status(201)
      .json({ message: "Zaproszenie zostało wysłane", invitation });
  } catch (error) {
    console.error("Błąd podczas wysyłania zaproszenia:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.post(
  "/resend-invitation/:id",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res
        .status(400)
        .json({ error: "Nieprawidłowy format ID zaproszenia." });
    }

    try {
      const result = await pool.query(
        "SELECT * FROM invitations WHERE id = $1",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Zaproszenie nie istnieje." });
      }

      const invitation = result.rows[0];

      if (invitation.status === "pending") {
        const link = `http://localhost:5173/test/${invitation.link}`;
        await sendInvitationEmail(invitation.email, link);
        return res
          .status(200)
          .json({ message: "Zaproszenie zostało ponownie wysłane." });
      }

      if (invitation.status === "completed") {
        if (!invitation.access_code) {
          return res
            .status(400)
            .json({ error: "Brak przypisanego kodu dostępu." });
        }

        await sendCompletionEmail(invitation.email, invitation.access_code);
        return res
          .status(200)
          .json({ message: "E-mail z kodem dostępu został ponownie wysłany." });
      }

      return res
        .status(400)
        .json({ error: "Nieobsługiwany status zaproszenia." });
    } catch (error) {
      console.error("Błąd podczas ponownego wysyłania zaproszenia:", error);
      res.status(500).json({ error: "Błąd serwera." });
    }
  }
);

router.get("/invitations", authenticateToken, async (req, res) => {
  try {
    let result;
    if (req.user.role === "admin") {
      result = await pool.query(
        "SELECT * FROM invitations ORDER BY created_at DESC"
      );
    } else {
      result = await pool.query(
        "SELECT * FROM invitations WHERE inviter = $1 ORDER BY created_at DESC",
        [req.user.email]
      );
    }
    res.status(200).json({ invitations: result.rows });
  } catch (error) {
    console.error("Błąd podczas pobierania zaproszeń:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.put("/invitations/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { email, expires_at } = req.body;

  try {
    const existingInvitation = await pool.query(
      "SELECT * FROM invitations WHERE id = $1",
      [id]
    );
    if (existingInvitation.rowCount === 0) {
      return res.status(404).json({ error: "Zaproszenie nie istnieje." });
    }
    if (expires_at && new Date(expires_at) < new Date()) {
      return res
        .status(400)
        .json({ error: "Data wygaśnięcia musi być w przyszłości." });
    }

    if (email && !isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: "Nieprawidłowy format adresu e-mail." });
    }

    const invitation = existingInvitation.rows[0];
    const updatedEmail = email || invitation.email;
    const updatedExpiresAt = expires_at || invitation.expires_at;

    if (req.user.role !== "admin" && req.user.email !== invitation.inviter) {
      return res.status(403).json({ error: "Brak uprawnień do edycji." });
    }

    await pool.query(
      "UPDATE invitations SET email = $1, expires_at = $2 WHERE id = $3 RETURNING *",
      [updatedEmail, updatedExpiresAt, id]
    );

    res.status(200).json({ message: "Zaproszenie zostało zaktualizowane." });
  } catch (error) {
    console.error("Błąd podczas edytowania zaproszenia:", error);
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.delete("/invitations/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const invitationResult = await pool.query(
      "SELECT * FROM invitations WHERE id = $1",
      [id]
    );
    if (invitationResult.rowCount === 0) {
      return res.status(404).json({ error: "Zaproszenie nie istnieje." });
    }

    const invitation = invitationResult.rows[0];

    if (req.user.role !== "admin" && req.user.email !== invitation.inviter) {
      return res.status(403).json({ error: "Brak uprawnień do usunięcia." });
    }

    await pool.query("DELETE FROM invitations WHERE id = $1", [id]);
    res.status(200).json({ message: "Zaproszenie zostało usunięte." });
  } catch (error) {
    console.error("Błąd podczas usuwania zaproszenia:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.get("/questions", authenticateToken, checkAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM questions ORDER BY id ASC");
    res.status(200).json({ questions: result.rows });
  } catch (error) {
    console.error("Błąd pobierania pytań:", error);
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.post("/questions", authenticateToken, checkAdmin, async (req, res) => {
  const { question_text, option_a, option_b, option_c, correct_option } =
    req.body;

  if (
    !question_text ||
    !option_a ||
    !option_b ||
    !option_c ||
    !correct_option
  ) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." });
  }

  if (!["A", "B", "C"].includes(correct_option)) {
    return res.status(400).json({
      error: "Poprawna odpowiedź musi być jedną z wartości: A, B lub C.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO questions (question_text, option_a, option_b, option_c, correct_option) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [question_text, option_a, option_b, option_c, correct_option]
    );

    res
      .status(201)
      .json({ message: "Pytanie zostało dodane.", question: result.rows[0] });
  } catch (error) {
    console.error("Błąd dodawania pytania:", error);
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.put(
  "/questions/:id",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { question_text, option_a, option_b, option_c, correct_option } =
      req.body;

    if (
      !question_text ||
      !option_a ||
      !option_b ||
      !option_c ||
      !correct_option
    ) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane." });
    }

    if (!["A", "B", "C"].includes(correct_option)) {
      return res.status(400).json({
        error: "Poprawna odpowiedź musi być jedną z wartości: A, B lub C.",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE questions 
            SET question_text = $1, option_a = $2, option_b = $3, option_c = $4, correct_option = $5
            WHERE id = $6 RETURNING *`,
        [question_text, option_a, option_b, option_c, correct_option, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Pytanie nie istnieje." });
      }

      res.status(200).json({
        message: "Pytanie zostało zaktualizowane.",
        question: result.rows[0],
      });
    } catch (error) {
      console.error("Błąd edytowania pytania:", error);
      res.status(500).json({ error: "Błąd serwera." });
    }
  }
);
router.delete(
  "/questions/:id",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM questions WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Pytanie nie istnieje." });
      }

      res.status(200).json({ message: "Pytanie zostało usunięte." });
    } catch (error) {
      console.error("Błąd usuwania pytania:", error);
      res.status(500).json({ error: "Błąd serwera." });
    }
  }
);

module.exports = router;
