#!/usr/bin/env python3
"""
CHRONOS AI Agent - Multi-Model Orchestrator
Agente AI avanzado con capacidad de usar múltiples modelos de GitHub Models
"""

import os
import json
import asyncio
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum

try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
MODELS_ENDPOINT = "https://models.github.ai/inference"

class TaskType(Enum):
    REASONING = "reasoning"
    CODE = "code"
    VISION = "vision"
    FAST = "fast"
    MATH = "math"
    CREATIVE = "creative"
    GENERAL = "general"

@dataclass
class ModelConfig:
    provider: str
    model: str
    endpoint: str
    max_tokens: int = 4096
    temperature: float = 0.7

MODELS: Dict[TaskType, ModelConfig] = {
    TaskType.REASONING: ModelConfig("openai", "o3", MODELS_ENDPOINT, 16384, 0.1),
    TaskType.CODE: ModelConfig("mistral-ai", "codestral-2501", MODELS_ENDPOINT, 8192, 0.2),
    TaskType.VISION: ModelConfig("meta", "llama-3.2-90b-vision-instruct", MODELS_ENDPOINT, 4096, 0.7),
    TaskType.FAST: ModelConfig("openai", "gpt-4o", MODELS_ENDPOINT, 4096, 0.7),
    TaskType.MATH: ModelConfig("deepseek", "deepseek-r1-0528", MODELS_ENDPOINT, 8192, 0.1),
    TaskType.CREATIVE: ModelConfig("xai", "grok-3", MODELS_ENDPOINT, 4096, 0.9),
    TaskType.GENERAL: ModelConfig("openai", "gpt-5", MODELS_ENDPOINT, 8192, 0.7)
}

TASK_KEYWORDS = {
    TaskType.CODE: ["código", "code", "function", "bug", "error", "typescript", "python", "react"],
    TaskType.REASONING: ["analiza", "razona", "explica", "reasoning", "deduce", "estrategia"],
    TaskType.VISION: ["imagen", "image", "foto", "screenshot", "visual"],
    TaskType.MATH: ["matemática", "math", "calcular", "fórmula", "ecuación"],
    TaskType.CREATIVE: ["creativo", "historia", "poema", "humor", "idea"],
    TaskType.FAST: ["rápido", "quick", "simple", "breve", "resumen"]
}

SYSTEM_PROMPTS = {
    TaskType.REASONING: "Eres un experto en razonamiento y análisis profundo.",
    TaskType.CODE: "Eres un experto programador senior. Escribes código limpio y eficiente.",
    TaskType.VISION: "Eres un experto en análisis visual de imágenes.",
    TaskType.FAST: "Eres un asistente eficiente que proporciona respuestas concisas.",
    TaskType.MATH: "Eres un matemático experto. Resuelves problemas paso a paso.",
    TaskType.CREATIVE: "Eres un creativo brillante con imaginación ilimitada.",
    TaskType.GENERAL: "Eres CHRONOS, un asistente AI para gestión financiera empresarial."
}

class ChronosAgent:
    def __init__(self):
        self.history: List[Dict[str, str]] = []
        if HAS_HTTPX:
            self.client = httpx.AsyncClient(timeout=120.0)

    def classify_task(self, prompt: str) -> TaskType:
        prompt_lower = prompt.lower()
        scores = {t: 0 for t in TaskType}

        for task_type, keywords in TASK_KEYWORDS.items():
            for word in keywords:
                if word in prompt_lower:
                    scores[task_type] += 1

        max_score = max(scores.values())
        if max_score > 0:
            for task_type, score in scores.items():
                if score == max_score:
                    return task_type
        return TaskType.GENERAL

    async def call_model(self, prompt: str, task_type: Optional[TaskType] = None) -> str:
        if not HAS_HTTPX:
            return "Error: httpx no instalado. Ejecuta: pip install httpx"

        if task_type is None:
            task_type = self.classify_task(prompt)

        model_config = MODELS[task_type]

        messages = [
            {"role": "system", "content": SYSTEM_PROMPTS[task_type]},
            {"role": "user", "content": prompt}
        ]

        headers = {
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model_config.model,
            "messages": messages,
            "max_tokens": model_config.max_tokens,
            "temperature": model_config.temperature
        }

        try:
            response = await self.client.post(
                f"{model_config.endpoint}/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
        except Exception as e:
            return f"Error: {str(e)}"

    async def close(self):
        if HAS_HTTPX:
            await self.client.aclose()

async def main():
    print("🤖 CHRONOS AI Agent v2.0.0")
    print("=" * 50)
    print("\nModelos configurados:")
    for task_type, config in MODELS.items():
        print(f"  • {task_type.value}: {config.model}")
    print("\n✨ Agente listo para usar")

if __name__ == "__main__":
    asyncio.run(main())
