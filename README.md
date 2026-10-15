# Highway to Shell

**Juego serio de ciberseguridad** de [Un Fantasma en el Sistema](https://www.unfantasmaenelsistema.com): un mismo ciberataque contra la empresa ficticia *CorpTarget S.A.*, vivido desde seis roles.

▶ **Jugar:** https://unfantasmaenelsistema.github.io/HIGHWAY-TO-SHELL/

| Rol | Valor principal | Fases |
|---|---|---|
| 💀 Hacker ético (Red Team) | Sigilo | Reconocimiento → Escaneo → Explotación → Post-explotación → Exfiltración → Cierre |
| 🛡️ Analista SOC | Control | Monitorización → Detección → Análisis → Contención → Erradicación → Recuperación |
| 👤 Usuario | Conciencia | Phishing → Vishing → USB → Bombardeo MFA → Fraude BEC → Respuesta |
| 👔 CISO | Confianza | Alerta → Riesgo → Extorsión → Comunicación → Recuperación → Post-mortem |
| 🔧 Técnico de sistemas | Control | Anomalía → Diagnóstico → Aislamiento → Forensics → Parches → Hardening |
| 🔍 Analista forense | Rigor | Preservación → Adquisición → Estático → Dinámico → Cronología → Informe |

## Cómo se juega

- Cada fase plantea una situación y cuatro decisiones, en orden aleatorio. El nivel de riesgo se descubre **después** de elegir.
- Si el valor principal del rol llega a 0, la operación fracasa.
- Al final obtienes un rango (S–D) y una **revisión de cada decisión** comparada con la mejor opción y su explicación.
- Teclado: `1`–`4` para elegir y `Enter` para continuar. Interfaz en español e inglés y tema claro/oscuro (se recuerdan entre visitas).

## Rigor del contenido

- IP de rangos de documentación (RFC 5737) y dominios reservados `.example` (RFC 2606).
- Referencias reales: CVE-2019-11510 y aviso CISA AA20-010A, RGPD (arts. 33 y 34), DORA, RFC 3227 (orden de volatilidad), estudio de la Universidad de Illinois sobre USB abandonados (2016) e informe IBM *Cost of a Data Breach 2024*.
- El rol Red Team es narrativo: plantea decisiones de alcance, sigilo y ética dentro de unas reglas de enfrentamiento, sin comandos de explotación.

## Estructura

```
index.html          maquetación
css/styles.css      estilos (tema claro/oscuro)
js/i18n.js          textos de interfaz ES/EN
js/scenarios.js     mundo común y formato de escenario
js/roles/*.js       un archivo por rol (6 fases, 4 decisiones por fase)
js/game.js          motor del juego
```

Para añadir o editar escenarios basta con tocar `js/roles/<rol>.js`; el formato está documentado en `js/scenarios.js`. Para probar en local: `python -m http.server` y abrir `http://localhost:8000`.

---

## English

**Highway to Shell** is a cybersecurity serious game: one attack against the fictitious *CorpTarget S.A.*, lived from six roles (red team, SOC, end user, CISO, sysadmin, forensics), six phases each. Choices are shuffled, risk is revealed after you pick, and the end screen ranks you and reviews every decision against the best option. Fully bilingual (ES/EN) with light/dark themes.

## Licencia / License

[MIT](LICENSE) © Un Fantasma en el Sistema
