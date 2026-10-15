// ========================= HIGHWAY TO SHELL — datos =========================
// Cada rol vive en js/roles/<id>.js y se registra con ROLES.push({...}).
//
// Mundo común (el mismo incidente visto desde seis roles):
//   Empresa ficticia:  CorpTarget S.A. (sector financiero, ~500 empleados)
//   Dominio AD:        corptarget.local    · correo: corptarget.com
//   IP pública VPN:    198.51.100.15 (Pulse Secure 9.0R1, CVE-2019-11510)
//   IP del atacante:   203.0.113.47        · exfiltración DNS: *.exfil.attacker.example
//   Red interna:       10.10.10.0/24 — CORPDC01 .5 · FILESERVER01 .10 · BACKUP01 .20
//                      SQL01 .30 · JGARCIA-PC .44 (cuenta comprometida: jgarcia)
//   Incidente:         INC-2025-0847 — noche del lunes 17/03/2025 (UTC)
//   Todas las IP son de rangos de documentación (RFC 5737); los dominios .example son reservados (RFC 2606).
//
// Formato de escenario:
//   phase, title, body: {es, en}   (body admite HTML estático de confianza)
//   term: texto de terminal (ver renderTerminal en game.js; ⟪es|en⟫ = segmento bilingüe)
//   choices: [{ t:{es,en}, f:{es,en}, risk:'low'|'med'|'high', xp, fx:{stat:delta} }]
//   La mejor opción es la de mayor XP (debe ser única por escenario).

const ROLES = [];

// Plantilla "raw" para terminales: las barras invertidas (C:\Users, \host) se respetan tal cual.
const R = String.raw;
