# 🎨 Guía de Shaders GLSL - CHRONOS

## ✅ Configuración Completada

El proyecto ahora tiene soporte completo para validación de shaders GLSL mediante
`glslangValidator`.

### 🔧 Instalado

- **glslangValidator**: v11.15.2
- **Ruta**: `/usr/bin/glslangValidator`
- **Extensiones soportadas**: `.glsl`, `.vert`, `.frag`, `.vs`, `.fs`

## 📁 Estructura de Shaders

```
app/shaders/
├── effects/              # Efectos post-procesamiento
│   ├── chromatic-aberration.glsl
│   ├── film-grain.glsl
│   └── vignette.glsl
├── fragment/             # Fragment shaders
│   └── [...]
├── noise/                # Generadores de ruido
│   └── [...]
├── utils/                # Utilidades GLSL
│   └── [...]
└── vertex/               # Vertex shaders
    └── [...]
```

## 🎯 Convenciones de Nomenclatura

### Extensiones de Archivo

| Extensión  | Tipo de Shader                  |
| ---------- | ------------------------------- |
| `.vert`    | Vertex Shader                   |
| `.frag`    | Fragment Shader                 |
| `.geom`    | Geometry Shader                 |
| `.comp`    | Compute Shader                  |
| `.vs.glsl` | Vertex Shader (alternativo)     |
| `.fs.glsl` | Fragment Shader (alternativo)   |
| `.glsl`    | Genérico (Fragment por defecto) |

### Validación Manual

Para validar un shader manualmente desde terminal:

```bash
# Vertex shader
glslangValidator -S vert app/shaders/vertex/basic.vert

# Fragment shader
glslangValidator -S frag app/shaders/fragment/pbr.frag

# Shader genérico (especificar tipo)
glslangValidator -S frag app/shaders/effects/vignette.glsl
```

## 🚀 Integración con VS Code

### Extensión GLSL Lint

La extensión `GraceGregory.glsl-linter` está configurada automáticamente en `.vscode/settings.json`:

```json
{
  "glsl-linter.validatorPath": "/usr/bin/glslangValidator",
  "glsl-linter.fileExtensions": {
    ".vs.glsl": "vert",
    ".fs.glsl": "frag",
    ".vert": "vert",
    ".frag": "frag",
    ".glsl": "frag"
  }
}
```

### Asociaciones de Archivo

```json
{
  "files.associations": {
    "*.glsl": "glsl",
    "*.vert": "glsl",
    "*.frag": "glsl",
    "*.vs": "glsl",
    "*.fs": "glsl"
  }
}
```

## ⚡ Características del Validador

### Opciones Comunes

```bash
# Generar SPIR-V (Vulkan)
glslangValidator -V shader.frag -o shader.spv

# Generar SPIR-V (OpenGL)
glslangValidator -G shader.frag -o shader.spv

# Output legible
glslangValidator -V -H shader.frag

# Debug information
glslangValidator -g shader.frag

# Optimización de tamaño
glslangValidator -Os shader.frag
```

### Targets Soportados

- `vulkan1.0`, `vulkan1.1`, `vulkan1.2`, `vulkan1.3`
- `opengl`
- `spirv1.0` - `spirv1.6`

## 📝 Plantilla de Shader Básico

### Vertex Shader (`.vert`)

```glsl
#version 450

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;

layout(location = 0) out vec3 vNormal;
layout(location = 1) out vec2 vTexCoord;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    gl_Position = uProjection * uView * worldPos;

    vNormal = mat3(transpose(inverse(uModel))) * aNormal;
    vTexCoord = aTexCoord;
}
```

### Fragment Shader (`.frag`)

```glsl
#version 450

layout(location = 0) in vec3 vNormal;
layout(location = 1) in vec2 vTexCoord;

layout(location = 0) out vec4 fragColor;

uniform sampler2D uTexture;
uniform vec3 uLightDir;
uniform vec3 uColor;

void main() {
    vec3 normal = normalize(vNormal);
    float light = max(dot(normal, uLightDir), 0.0);

    vec4 texColor = texture(uTexture, vTexCoord);
    fragColor = vec4(texColor.rgb * uColor * light, texColor.a);
}
```

## 🎨 Efectos Disponibles en CHRONOS

### 1. Chromatic Aberration

**Archivo**: `app/shaders/effects/chromatic-aberration.glsl`

Simula la aberración cromática de lentes reales.

### 2. Film Grain

**Archivo**: `app/shaders/effects/film-grain.glsl`

Añade ruido cinematográfico a la imagen.

### 3. Vignette

**Archivo**: `app/shaders/effects/vignette.glsl`

Oscurece los bordes de la imagen para focalizar la atención.

## 🔍 Debugging

### Errores Comunes

#### 1. "spawn glslangValidator ENOENT"

**Solución**: El validador no está instalado o no está en el PATH.

```bash
# Verificar instalación
which glslangValidator

# Si no está instalado (Alpine Linux)
sudo apk add --no-cache glslang
```

#### 2. "ERROR: 0:1: '' : version directive must appear on the first line"

**Solución**: La directiva `#version` debe ser la primera línea del shader.

```glsl
#version 450  // ✅ Correcto - primera línea

// ❌ Incorrecto
// Comentarios antes
#version 450
```

#### 3. "ERROR: linking shaders"

**Solución**: Los inputs/outputs entre vertex y fragment no coinciden.

```glsl
// vertex.vert
layout(location = 0) out vec3 vNormal;

// fragment.frag
layout(location = 0) in vec3 vNormal;  // ✅ Mismo location y tipo
```

## 🛠️ Comandos Útiles

```bash
# Validar todos los shaders del proyecto
find app/shaders -name "*.vert" -exec glslangValidator -S vert {} \;
find app/shaders -name "*.frag" -exec glslangValidator -S frag {} \;

# Compilar shaders a SPIR-V
for file in app/shaders/**/*.vert; do
  glslangValidator -V "$file" -o "${file%.vert}.spv"
done

# Verificar versión de glslang
glslangValidator --version
```

## 📚 Referencias

- [glslang GitHub](https://github.com/KhronosGroup/glslang)
- [GLSL Language Specification](https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.pdf)
- [SPIR-V Documentation](https://www.khronos.org/spir/)
- [Vulkan GLSL Guide](https://github.com/KhronosGroup/Vulkan-Guide/blob/master/chapters/hlsl.md)

## ✨ Mejores Prácticas

1. **Versionado**: Usa siempre una directiva de versión explícita (`#version 450`)
2. **Layouts**: Especifica `location` para todos los inputs/outputs
3. **Uniforms**: Agrupa uniforms relacionados en bloques UBO
4. **Validación**: Valida shaders antes de commit con `glslangValidator`
5. **Optimización**: Usa `-Os` para reducir tamaño del SPIR-V en producción
6. **Documentación**: Comenta las variables uniform y sus rangos esperados

---

**Última actualización**: Enero 2026 **Mantenido por**: CHRONOS Team
