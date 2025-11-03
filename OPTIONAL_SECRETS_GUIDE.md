# Guía de Configuración de Secretos Opcionales

## 🔒 Secretos Opcionales para CI/CD Pipeline

El workflow CI/CD funciona perfectamente **sin ningún secreto configurado**. Los siguientes secretos son completamente opcionales y solo mejoran funcionalidades adicionales.

---

## 1. Docker Hub (OPCIONAL) 🐳

### Para qué sirve:
- Publicar automáticamente imágenes Docker en Docker Hub
- Compartir imágenes con tu equipo
- Desplegar desde Docker Hub en producción

### Cómo configurar:

#### Paso 1: Crear Token en Docker Hub
1. Ve a https://hub.docker.com/
2. Inicia sesión con tu cuenta
3. Ve a Account Settings → Security
4. Click en "New Access Token"
5. Nombre: `github-actions`
6. Permisos: `Read, Write, Delete`
7. Copia el token generado (solo se muestra una vez)

#### Paso 2: Agregar Secretos en GitHub
1. Ve a tu repositorio: https://github.com/Rene-Kuhm/backend-enterprice-proyecto
2. Settings → Secrets and variables → Actions
3. Click en "New repository secret"

**Secreto 1:**
- Name: `DOCKER_USERNAME`
- Value: Tu username de Docker Hub (ejemplo: `renekuhm`)

**Secreto 2:**
- Name: `DOCKER_PASSWORD`
- Value: El token que copiaste en Paso 1

### Resultado:
✅ Las imágenes se publicarán automáticamente en:
- `tu-username/enterprise-backend-api:latest`
- `tu-username/enterprise-backend-api:SHA-del-commit`

---

## 2. CodeQL / GitHub Advanced Security (OPCIONAL) 🔒

### Para qué sirve:
- Subir resultados de security scans a GitHub Security tab
- Ver vulnerabilidades en la interfaz de GitHub
- Recibir alertas de Dependabot

### Cómo habilitar:

#### Opción A: Repositorio Público (GRATIS)
1. Ve a Settings → Code security and analysis
2. Habilita "Dependency graph"
3. Habilita "Dependabot alerts"
4. Habilita "Dependabot security updates"
5. Habilita "Code scanning" → "Set up" → "Default"

#### Opción B: Repositorio Privado (requiere GitHub Advanced Security)
1. Requiere plan GitHub Enterprise
2. O hacer el repositorio público para usar estas features gratis

### Resultado:
✅ Los archivos SARIF de Trivy se subirán a GitHub Security
✅ Verás vulnerabilidades en la pestaña "Security" del repo

**Nota:** Si no habilitas esto, el workflow seguirá funcionando perfectamente. Los scans de Trivy se ejecutan igual, solo que no se suben los resultados a GitHub.

---

## 3. Codecov (OPCIONAL) 📊

### Para qué sirve:
- Visualizar cobertura de tests en dashboard bonito
- Comentarios automáticos en PRs con cambios de cobertura
- Badges de cobertura para el README

### Cómo configurar:

#### Paso 1: Crear cuenta en Codecov
1. Ve a https://codecov.io/
2. Inicia sesión con GitHub
3. Autoriza acceso a tu repositorio
4. Selecciona el repositorio `backend-enterprice-proyecto`

#### Paso 2: Copiar token
1. En Codecov, ve a Settings del repositorio
2. Copia el "Upload token"

#### Paso 3: Agregar secreto en GitHub
1. Ve a Settings → Secrets and variables → Actions
2. Click en "New repository secret"
3. Name: `CODECOV_TOKEN`
4. Value: El token de Codecov

### Resultado:
✅ Cobertura se sube automáticamente después de cada test
✅ Comentarios en PRs mostrando cambios de cobertura
✅ Dashboard en https://codecov.io/gh/Rene-Kuhm/backend-enterprice-proyecto

---

## 4. Snyk (OPCIONAL) 🛡️

### Para qué sirve:
- Análisis de vulnerabilidades en dependencias
- Sugerencias automáticas de fixes
- Monitoreo continuo de seguridad

### Cómo configurar:

#### Paso 1: Crear cuenta en Snyk
1. Ve a https://snyk.io/
2. Inicia sesión con GitHub
3. Autoriza acceso a tu repositorio

#### Paso 2: Obtener token
1. En Snyk, ve a Account Settings
2. Click en "General"
3. Copia el "Auth Token"

#### Paso 3: Agregar secreto en GitHub
1. Ve a Settings → Secrets and variables → Actions
2. Click en "New repository secret"
3. Name: `SNYK_TOKEN`
4. Value: El token de Snyk

### Resultado:
✅ Análisis de vulnerabilidades en cada push
✅ PRs automáticos con fixes de seguridad
✅ Dashboard de seguridad en Snyk

---

## 5. Slack Notifications (OPCIONAL) 📢

### Para qué sirve:
- Notificaciones de deployments exitosos/fallidos
- Alertas de errores en producción
- Integración con equipo

### Cómo configurar:

#### Paso 1: Crear Webhook de Slack
1. Ve a https://api.slack.com/apps
2. Click en "Create New App" → "From scratch"
3. Nombre: `GitHub Actions`
4. Workspace: Selecciona tu workspace
5. Ve a "Incoming Webhooks"
6. Activa "Activate Incoming Webhooks"
7. Click en "Add New Webhook to Workspace"
8. Selecciona el canal (ejemplo: `#deployments`)
9. Copia la Webhook URL

#### Paso 2: Agregar secreto en GitHub
1. Ve a Settings → Secrets and variables → Actions
2. Click en "New repository secret"
3. Name: `SLACK_WEBHOOK`
4. Value: La URL del webhook

#### Paso 3: Agregar step al workflow (si quieres)
```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployment ${{ job.status }}!",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Deployment to Production*\nStatus: ${{ job.status }}\nCommit: ${{ github.sha }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## ⚡ Resumen de Prioridades

### 🔥 Alta Prioridad (si vas a producción):
1. **CodeQL / GitHub Security** - Para ver vulnerabilidades
2. **Docker Hub** - Para publicar imágenes

### 🟡 Media Prioridad (mejora workflow):
3. **Codecov** - Para tracking de cobertura
4. **Snyk** - Para security scanning avanzado

### 🔵 Baja Prioridad (nice to have):
5. **Slack Notifications** - Para notificaciones al equipo

---

## 🚫 Lo que NO necesitas configurar:

- ❌ **Secrets de base de datos**: El workflow usa PostgreSQL en memoria
- ❌ **Secrets de Redis**: El workflow usa Redis en memoria
- ❌ **JWT secrets**: El workflow usa secrets de test hardcodeados
- ❌ **API keys externas**: No son necesarias para CI/CD

---

## 🎯 Recomendación para Empezar:

**Si es un proyecto personal/aprendizaje:**
- No configures nada, el workflow funciona perfecto sin secretos
- Considera Docker Hub si quieres compartir imágenes

**Si es un proyecto profesional:**
1. Habilita GitHub Security (gratis para repos públicos)
2. Configura Docker Hub para publicar imágenes
3. Agrega Codecov para tracking de cobertura
4. Considera Snyk para security avanzado

**Si es un proyecto enterprise:**
1. Configura todos los secretos
2. Habilita GitHub Advanced Security
3. Integra con Slack/MS Teams para notificaciones
4. Considera herramientas adicionales (Datadog, New Relic, etc.)

---

## 📝 Checklist de Configuración

Marca lo que hayas configurado:

- [ ] Docker Hub credentials (`DOCKER_USERNAME`, `DOCKER_PASSWORD`)
- [ ] GitHub Advanced Security habilitado
- [ ] Codecov token (`CODECOV_TOKEN`)
- [ ] Snyk token (`SNYK_TOKEN`)
- [ ] Slack webhook (`SLACK_WEBHOOK`)

---

## ❓ FAQ

**P: ¿El workflow falla si no configuro estos secretos?**
R: No, el workflow pasa exitosamente. Solo se omiten las features opcionales.

**P: ¿Cuánto cuesta configurar estos servicios?**
R: Todos tienen planes gratuitos para proyectos open source o pequeños equipos.

**P: ¿Puedo probar el workflow antes de configurar secretos?**
R: Sí, el workflow está diseñado para funcionar sin ninguna configuración adicional.

**P: ¿Necesito configurar algo para que pasen los tests?**
R: No, los tests usan bases de datos en memoria y no requieren configuración.

---

## 🔗 Links Útiles

- Docker Hub: https://hub.docker.com/
- GitHub Security: https://github.com/features/security
- Codecov: https://codecov.io/
- Snyk: https://snyk.io/
- Slack API: https://api.slack.com/

---

## 📧 Soporte

Si tienes problemas configurando algún secreto:
1. Revisa los logs del workflow en GitHub Actions
2. Verifica que el nombre del secreto sea exacto (case-sensitive)
3. Asegúrate de que el token/credential sea válido
4. Revisa los permisos del token en la plataforma correspondiente
