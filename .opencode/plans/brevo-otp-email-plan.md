# PLAN APROBADO — Email OTP vía Brevo (API HTTPS) + Modo Demo

> Aprobado por usuario: "vamos por el camino de brevo más opción 2 combinadas, fase por fase"
> Modo: se ejecuta FASE 1 + FASE 3 ahora; FASE 2 (cuenta Brevo) la hace el usuario después.

---

## 0. CONTEXTO DEL PROYECTO (para retomar sesión)

### Rutas
- **Frontend:** `C:\Users\Carol\OneDrive - Universidad Distrital Francisco José de Caldas\Documents\PROGRAMMING BOOTCAMP\WEB_PlanificadorTareas`
- **Backend:** `C:\Users\Carol\OneDrive - Universidad Distrital Francisco José de Caldas\Documents\PROGRAMMING BOOTCAMP\WebPlanificadorTareas_Backend\PlannerAppCP\PlannerAppCP`

### Despliegues
- Backend: `https://plannerappcp-backend.onrender.com` (Render, **plan FREE**)
- Frontend: `https://carolpinerostrujillo.github.io/Web_planificadorTareas/` (GitHub Pages, auto-deploy al hacer push a `main`)
- Swagger: `https://plannerappcp-backend.onrender.com/swagger-ui.html`

### Stack
- Backend: Java 21, Spring Boot 4.1.1, Spring Data JPA, PostgreSQL (Supabase), Lombok, SpringDoc/Swagger, Maven (`.\mvnw.cmd compile`)
- Frontend: Vanilla HTML/CSS/JS, Bootstrap 5.3.3, SweetAlert2 (sin build, solo git push)
- Correo: hasta ahora `spring-boot-starter-mail` + Gmail SMTP (**INÚTIL en Render free, ver §1**)

### BD (Supabase pooler)
- Host: `aws-0-us-east-2.pooler.supabase.com:5432`, db `postgres`
- User: `postgres.qpdoxtubdrxohqdiyumg`, pass: ver env var del proyecto (usada vía psql local en `C:\Program Files\PostgreSQL\17\bin\psql.exe`, var `PGPASSWORD`)
- Tablas: `tareas` (id, nombre, descripcion, categoria, fecha, hora, prioridad, status, `device_id`?, `user_email`?), `users` (id, device_id, email UNIQUE, recover_code, recover_code_expires, verified, created_at)
- `ddl-auto=update` → **nunca borra columnas/tablas**; columnas extra son inocuas
- Estado datos: 6 tareas (user_email='carol@gmail.com' o NULL); users: carolpy25m@gmail.com, caroll25m@gmail.com, constanza.w@hotmail.com

### Commits clave
- **Frontend (built):** `ffc82ca` fix modal OTP (Swal.fire anidado eliminado, timer en willClose) — ES EL ACTUAL EN `main`
- **Backend (built):** `4324d72` reforzar TLS Gmail — ES EL ACTUAL EN `main`
- **Rollback por si acaso (NO usar salvo decisión explícita):** frontend `daed08a`, backend `27c110f` (estado 16 sep 2026 sin email: `findAll()` compartido, sin AuthFilter/OTP/token)

### Comandos/atajos útiles
- Compilar backend: `cd <backend>; & .\mvnw.cmd compile -q *> $null; Write-Host "EXIT:$LASTEXITCODE"` (0=OK)
- Push: `git add -A; git commit -m "..."; git push` (en cada repo por separado)
- **`documentacion.md` del frontend requiere `git add -f`** si se modifica (está en .gitignore aparentemente)
- PowerShell 5.1: NO funciona `&&`, NO existen `head`/`tail` → usar `Select-Object -First/-Last`
- Code smell histórico: `Select-String`/`Write-Host` OK; comandos largos con `Sleep` >120s hacen timeout → dividir

---

## 1. DIAGNÓSTICO (CAUSA RAÍZ — RESUELTO, NO REINVESTIGAR)

**El correo nunca llegó y NUNCA va a llegar con SMTP en Render free.**

Evidencia (log de Render, 2026-10-06):
```
Error enviando email a caroll25m@gmail.com: Mail server connection failed.
org.eclipse.angus.mail.util.MailConnectException: Couldn't connect to host, port: smtp.gmail.com, 587; timeout 10000
java.net.SocketTimeoutException: Connect timed out
```
→ Timeout TCP puro: **la conexión ni siquiera llegó a autenticarse** (NO es problema de App Password ni de credenciales).

Fuente oficial — Render Changelog 2025-09-16:
> "Free web services will no longer allow outbound traffic to SMTP ports. Starting next week, free Render web services will block outbound network traffic to SMTP ports **25, 465, and 587**. Live across all regions by Friday, September 26th."
- URL: https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports
- Comunidad Render (2023): "We do not permit SMTP access from Render services, includes ports 25, 587 or 465... not something that we will unblock."

**Consecuencias:**
- ❌ Cambiar a 465/SSL → TAMBIÉN bloqueado. No sirve.
- ❌ App Password → irrelevante (nunca llega a auth).
- ❌ Ningún ajuste de `application.properties` de SMTP lo arregla.
- ✅ **HTTPS saliente SÍ funciona** (Render sirve tráfico HTTPS) → APIs de email por HTTPS = solución.
- El código actual NO está roto: generó código en BD, respondió 200, logueó bien el error.

---

## 2. DECISIÓN APROBADA

**Combinar:**
1. **Ruta principal → Brevo API (HTTPS)**: `POST https://api.brevo.com/v3/smtp/email` con header `api-key`. Plan free: 300 emails/día, sin tarjeta. Cuenta + sender la crea el usuario en FASE 2.
2. **Ruta fallback → Modo demo**: si no hay API key configurada (o `EMAIL_DEMO_MODE=true`), el backend devuelve `demoCode` en la respuesta y el frontend lo muestra con banner "MODO DEMO". **La demo nunca se rompe.**

**Orden:** FASE 1 (código) + FASE 3 (tests/docs) ahora → FASE 2 (usuario crea cuenta Brevo y pone env vars) después. Sin tocar código en FASE 2.

**Rollback descartado** (salvo que el usuario lo pida explícitamente): el OTP es el valor diferencial del portafolio; ya está implementado y probado (14/14 pruebas de seguridad previas).

### Nota de seguridad (queda documentada)
Con `EMAIL_DEMO_MODE=true`, un atacante podría leer el OTP por API (robo de tareas de ese email). Mitigaciones: rate limit 3 intentos/15 min existente + documentar en docs que es modo demo de portafolio. Alternativa discutida (NO implementada salvo petición): whitelist de emails de prueba.

---

## 3. FASE 1 — CAMBIOS DE CÓDIGO (yo, ~40 min)

### 3.1 Backend

**A) `src/main/resources/application.properties`**
- ELIMINAR todo el bloque `spring.mail.*` y el `logging.level...EmailService=DEBUG` (inútil en Render).
- AÑADIR:
```properties
# Email (Brevo API HTTPS — Render free bloquea SMTP 25/465/587)
email.api-key=${EMAIL_API_KEY:}
email.from=${EMAIL_FROM:PlannerApp <no-reply@example.com>}
email.demo-mode=${EMAIL_DEMO_MODE:true}
```
- NOTA: default `demo-mode=true` para que la demo funcione antes de FASE 2 (decidir al implementar si default true o false; sugiere **true** mientras no haya key).

**B) `service/EmailService.java` — REESCRIBIR por completo**
- Quitar `JavaMailSender`/`MimeMessage`/`MimeMessageHelper`/`jakarta.mail.*`.
- Usar `RestClient` de Spring (disponible en Spring Boot 4.x) o `RestTemplate`:
```java
@Service
public class EmailService {
    @Value("${email.api-key}") private String apiKey;
    @Value("${email.from}") private String from;

    // devuelven boolean
    public boolean sendRecoveryCode(String to, String code) {
        if (apiKey == null || apiKey.isBlank()) { log.warn("EMAIL_API_KEY ausente → sin envío"); return false; }
        try {
            Map<String,Object> body = Map.of(
                "sender", Map.of("name","PlannerApp","email", cleanFrom(from)),
                "to", List.of(Map.of("email", to)),
                "subject", "PlannerApp - Tu código de verificación",
                "textContent", "Hola,\n\nTu código de verificación es: " + code + "\n\nVálido 10 minutos, un solo uso.\n\n---\nPlannerApp"
            );
            // POST https://api.brevo.com/v3/smtp/email
            // headers: "api-key", apiKey; "Content-Type","application/json"
            // 2xx -> true; error -> log.error + false
            return true;
        } catch (Exception e) { log.error("Error enviando email a {} via Brevo: {}", to, e.getMessage()); return false; }
    }
}
```
- El `from` puede llegar como `"PlannerApp <a@b.com>"` → extraer solo la dirección para el campo `sender.email` (Brevo lo exige así).
- Mantener `log.info/error` (mismo patrón SLF4J actual).

**C) `controller/AuthController.java` — ajustar `safeSendEmail` y respuestas**
- Actualmente: `private void safeSendEmail(...)` con Thread + try/catch (respuesta siempre 200 uniforme).
- Nuevo diseño:
  - `safeSendEmail` → `devuelve boolean` (o guarda resultado).
  - Si envío OK → respuesta normal: `{"message":"Si el email es válido, recibirás un código de verificación"}` (texto exacto actual, NO cambiar por anti-enumeración).
  - Si envío FALLA y `email.demo-mode=true` → misma respuesta **+ campo extra `"demoCode": "123456"`**.
  - Si FALLA y demo=false → respuesta normal sin demoCode + log del error (igual que hoy).
- Enviar siempre en Thread (no bloquear la petición) — PERO para demoMode hay que saber el resultado. Diseño a implementar:
  - **Opción elegida (decidir al codificar):** enviar de forma síncrona-pero-rápida con timeout corto (Brevo HTTPS responde <1s; el timeout de 10s solo aplica si falla) y capturar booleano antes de armar la respuesta. El Thread asíncrono ya no es necesario porque HTTPS no se cuelga como SMTP. → simplifica y permite devolver `demoCode`.
  - Quitar el `new Thread(...)` si se va síncrono (documentar en commit).
- **Aplica a ENDPOINTS:** `POST /api/auth/register` y `POST /api/auth/send-code` (ambos generan código).
- El resto de AuthController (rate limit 3/15min, código 6 dígitos con `SecureRandom`, expiración 10 min, un solo uso, respuesta uniforme, `verify-code` → token HMAC) **NO SE TOCA**.

**D) `pom.xml`**
- Quitar dependencia `spring-boot-starter-mail` (ya no hay SMTP).

### 3.2 Frontend

**E) `JS/taskManager.js`**
- `registerEmail(email)` y `sendRecoveryCode(email)`: al parsear la respuesta, capturar `data.demoCode || null` y:
  - devolver `{success, message, demoCode}` (ajustar constructores de retorno en ambos),
  - o guardar en `this.lastDemoCode` (elegir al codificar; sugiere **devolverlo en el objeto** para no tener estado global).
- El manejo de errores 429/400 existente se mantiene.

**F) `JS/index.js`**
- Flujo `btnNavVincular` y `btnNavRecuperar`: tras `registerEmail`/`sendRecoveryCode` OK, si `demoCode` existe → llamar `pedirCodigoVerificacion(email, resendCallback, demoCode)`.
- `pedirCodigoVerificacion(email, resendCallback, demoCode)`:
  - si `demoCode` viene → en el `html` del SweetAlert añadir banner ámbar: *"MODO DEMO — este entorno no envía correo real (Render bloquea SMTP). Tu código: **XXXXXX**"* y **prellenar** el input con `demoCode`.
  - si no → igual que ahora (mensaje "Revisa Spam/Correo no deseado" + countdown 10:00 + botón Reenviar).
  - **NO romper** lo ya corregido: `let timer` + `willClose: () => clearInterval(timer)` + **NO llamar `Swal.fire()` dentro de `didOpen`** (bug ya corregido en `ffc82ca`, no reintroducir).
- El flujo posterior (`verifyAndLogin` → `migrateLocalToBackend` → badge → render) **NO cambia**.

### 3.3 Verificación FASE 1
1. `node --check JS/index.js` y `node --check JS/taskManager.js` → sin salida = OK
2. Backend `.\mvnw.cmd compile` → `EXIT:0`
3. Commit + push **ambos** repos → Render redespliega (~1-2 min), GitHub Pages (~1 min)

---

## 4. FASE 2 — USUARIO (después, ~10 min, SIN tocar código)

1. Crear cuenta gratis **https://www.brevo.com** (sin tarjeta; free 300 emails/día; cuenta puede requerir aprobación para enviar)
2. Brevo → **Senders** → añadir `carolpy25m@gmail.com` → abrir esa bandeja y **clic de confirmación**
   - *Riesgo conocido:* Brevo podría requerir dominio propio o demorar aprobación; si no acepta gmail.com → se queda en modo demo (funciona igual, documentado)
3. Brevo → **SMTP & API** → **API keys** → crear (transaccional)
4. **Render → PlannerAppCP_Backend → Environment** añadir/actualizar:
   - `EMAIL_API_KEY` = `xkeysib-...`
   - `EMAIL_FROM` = `carolpy25m@gmail.com`  (o `"PlannerApp <carolpy25m@gmail.com>"`)
   - `EMAIL_DEMO_MODE` = `false`
   - Save → Render redespliega solo
5. Eliminar env vars viejas `MAIL_HOST/MAIL_PORT/MAIL_USERNAME/MAIL_PASSWORD` (opcional, ya inútiles)
6. Probar envío real → debe llegar a Inbox/Spam

---

## 5. FASE 3 — TESTS E2E + DOCUMENTACIÓN (yo, ~30 min)

### 5.1 Batería de pruebas (navegador incógnito + API)
| # | Prueba | Esperado |
|---|---|---|
| 1 | Anónimo: crear tareas → recargar | Persisten (localStorage) |
| 2 | Vincular email → OTP (modal correcto, countdown, sin popup OK) | Ingresa código (real o demoCode) → "Email vinculado", badge visible, tareas migradas a backend |
| 3 | Segundo email en otra pestaña | Ve SOLO sus tareas (aislamiento) |
| 4 | Recuperar tareas (nueva pestaña incógnita) | Restaura desde backend |
| 5 | Desvincular | Vuelve a localStorage |
| 6 | Código incorrecto / reutilizado / expirado (10 min) | 400 |
| 7 | 4 intentos en <15 min | 429 rate limit |
| 8 | GET/PUT/DELETE sin token / token inválido | 401 + `handleSessionExpired` |
| 9 | GET/PUT/DELETE con token de otro email | 403 |
| 10 | Compilar + `node --check` | OK |

Gotchas de testing: código expira **10 min**; rate limit **3/15 min** por email (esperar o usar otro email); Render **cold start** puede dar 500 la primera vez tras dormir (esperar ~60s); verificar estado con psql:
```sql
SELECT email, verified, recover_code, recover_code_expires FROM users;
SELECT id, nombre, user_email FROM tareas;
```

### 5.2 Documentación
- **`documentacion.md` (frontend, requiere `git add -f`):** actualizar Sección 17 con:
  - Diagnóstico de plataforma: Render free bloquea SMTP 25/465/587 (changelog 2025-09-16) → timeout `MailConnectException`
  - Arquitectura de correo: **API Brevo por HTTPS** + **modo demo fallback** (`EMAIL_DEMO_MODE`)
  - Tabla de pruebas de seguridad (14 previas + nuevas)
  - Nota honesta sobre seguridad del modo demo
- **README:** badges, link demo, screenshot, link Swagger, resumen de features (OTP, HMAC, rate limit, ownership, migración local→nube)

---

## 6. ESTADO ACTUAL DE LA SESIÓN

- [x] Fix modal OTP (bug `Swal.fire()` en `didOpen`) → commit `ffc82ca` frontend
- [x] Mejoras SMTP previas (MimeMessage, TLS) → commits `31fd86d`, `fd2fed2`, `4324d72` backend — **quedan obsoletas, se eliminan en FASE 1**
- [x] Diagnóstico causa raíz (Render bloquea SMTP) — **cerrado**
- [x] Aprobación usuario: Brevo + modo demo, fase por fase
- [ ] **FASE 1: implementar (EMPEZAR AQUÍ)**
- [ ] **FASE 3: tests + docs**
- [ ] **FASE 2: usuario configura Brevo + env vars en Render**
- [ ] Prueba final con correo real

### Pendiente inmediato al retomar
Ejecutar FASE 1 §3 (backend: EmailService reescritura, AuthController demoCode, properties, pom → compilar → push; frontend: taskManager + index.js → node --check → push). Luego FASE 3 §5.
