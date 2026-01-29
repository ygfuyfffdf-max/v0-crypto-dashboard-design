/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔐🎭 BIOMETRIC VERIFICATION & DEEPFAKE DETECTION — VERIFICADOR CUÁNTICO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de verificación biométrica y detección de deepfakes:
 * - Voice print verification
 * - Behavioral pattern analysis
 * - Typing dynamics verification
 * - Session continuity monitoring
 * - Liveness detection
 * - Anomaly-based fraud prevention
 *
 * @version QUANTUM-INFINITY-2026
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import type { ChronosInsight } from '../nexus/types'
import type {
  BehavioralProfile,
  BiometricVerificationResult,
  FraudIndicator,
  SessionContinuity,
  TypingDynamics,
  TypingPattern,
  VoicePrint,
} from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 CONFIGURACIÓN DE VERIFICACIÓN BIOMÉTRICA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const BIOMETRIC_CONFIG = {
  // Umbrales de verificación
  voiceMatchThreshold: 0.85,
  behaviorMatchThreshold: 0.75,
  typingMatchThreshold: 0.8,
  livenessThreshold: 0.9,

  // Pesos para score combinado
  weights: {
    voice: 0.3,
    behavior: 0.25,
    typing: 0.2,
    liveness: 0.15,
    session: 0.1,
  },

  // Configuración de análisis
  voiceSampleDuration: 3000, // ms
  typingSampleSize: 50, // caracteres mínimos
  behaviorWindowSize: 300000, // 5 minutos

  // Anti-spoofing
  maxReplayWindow: 5000, // ms para detectar replay attacks
  minVoiceVariation: 0.05, // variación mínima esperada en voz natural
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🔊 VOICE PRINT ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface VoiceFeatures {
  fundamentalFrequency: number
  harmonicRatios: number[]
  formantFrequencies: number[]
  spectralEnvelope: number[]
  jitter: number
  shimmer: number
  hnr: number // Harmonics-to-Noise Ratio
  mfcc: number[] // Mel-frequency cepstral coefficients
}

interface VoiceAnalysisResult {
  features: VoiceFeatures
  matchScore: number
  isLive: boolean
  isSynthetic: boolean
  confidence: number
  spoofingIndicators: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ⌨️ TYPING DYNAMICS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface KeystrokeEvent {
  key: string
  timestamp: number
  duration: number // key hold time
}

// Usa TypingPattern importado de ./types

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 CLASE PRINCIPAL: BIOMETRIC VERIFICATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export class BiometricVerificationEngine {
  private voicePrints: Map<string, VoicePrint> = new Map()
  private behavioralProfiles: Map<string, BehavioralProfile> = new Map()
  private typingProfiles: Map<string, TypingDynamics> = new Map()
  private sessionData: Map<string, SessionContinuity> = new Map()
  private callbacks: BiometricCallbacks

  constructor(callbacks?: Partial<BiometricCallbacks>) {
    this.callbacks = {
      onVerificationComplete: callbacks?.onVerificationComplete ?? (() => {}),
      onFraudDetected: callbacks?.onFraudDetected ?? (() => {}),
      onLivenessCheck: callbacks?.onLivenessCheck ?? (() => {}),
      onBehaviorAnomaly: callbacks?.onBehaviorAnomaly ?? (() => {}),
      onSessionAnomaly: callbacks?.onSessionAnomaly ?? (() => {}),
    }

    logger.info('[BiometricVerification] Engine initialized', { context: 'BiometricVerification' })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔊 VOICE VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Registra voice print de usuario
   */
  async enrollVoicePrint(userId: string, audioSamples: Float32Array[]): Promise<VoicePrint> {
    logger.info('[BiometricVerification] Enrolling voice print', {
      context: 'BiometricVerification',
      data: { userId, samples: audioSamples.length },
    })

    // Extraer features de cada muestra
    const featuresList: VoiceFeatures[] = []
    for (const sample of audioSamples) {
      const features = this.extractVoiceFeatures(sample)
      featuresList.push(features)
    }

    // Crear template promediado
    const template = this.createVoiceTemplate(featuresList)

    const voicePrint: VoicePrint = {
      userId,
      enrolledAt: new Date(),
      template,
      samplesCount: audioSamples.length,
      quality: this.assessVoicePrintQuality(featuresList),
      lastVerified: null,
      verificationCount: 0,
    }

    this.voicePrints.set(userId, voicePrint)

    return voicePrint
  }

  /**
   * Verifica voz contra voice print registrado
   */
  async verifyVoice(userId: string, audioSample: Float32Array): Promise<VoiceAnalysisResult> {
    const voicePrint = this.voicePrints.get(userId)

    if (!voicePrint) {
      return {
        features: this.extractVoiceFeatures(audioSample),
        matchScore: 0,
        isLive: false,
        isSynthetic: true,
        confidence: 0,
        spoofingIndicators: ['No voice print enrolled'],
      }
    }

    // Extraer features de la muestra
    const features = this.extractVoiceFeatures(audioSample)

    // Comparar con template
    const matchScore = this.compareVoiceFeatures(features, voicePrint.template)

    // Detectar liveness (anti-spoofing)
    const livenessAnalysis = this.analyzeVoiceLiveness(audioSample, features)

    // Detectar síntesis/deepfake
    const syntheticAnalysis = this.detectSyntheticVoice(audioSample, features)

    const spoofingIndicators: string[] = []
    if (!livenessAnalysis.isLive) {
      spoofingIndicators.push(...livenessAnalysis.indicators)
    }
    if (syntheticAnalysis.isSynthetic) {
      spoofingIndicators.push(...syntheticAnalysis.indicators)
    }

    // Actualizar voice print
    voicePrint.lastVerified = new Date()
    voicePrint.verificationCount++

    const result: VoiceAnalysisResult = {
      features,
      matchScore,
      isLive: livenessAnalysis.isLive,
      isSynthetic: syntheticAnalysis.isSynthetic,
      confidence: this.calculateVoiceConfidence(matchScore, livenessAnalysis, syntheticAnalysis),
      spoofingIndicators,
    }

    logger.info('[BiometricVerification] Voice verification completed', {
      context: 'BiometricVerification',
      data: { userId, matchScore: result.matchScore, isLive: result.isLive },
    })

    return result
  }

  private extractVoiceFeatures(audio: Float32Array): VoiceFeatures {
    // Simulación de extracción de características
    // En producción, usar librería de procesamiento de audio como Meyda o Web Audio API

    const sampleRate = 16000
    const frameSize = 512

    // Calcular fundamental frequency (F0) simplificado
    const fundamentalFrequency = this.estimateFundamentalFrequency(audio, sampleRate)

    // Simular otras características
    return {
      fundamentalFrequency,
      harmonicRatios: this.calculateHarmonicRatios(audio),
      formantFrequencies: this.estimateFormants(audio, sampleRate),
      spectralEnvelope: this.calculateSpectralEnvelope(audio, frameSize),
      jitter: this.calculateJitter(audio, sampleRate),
      shimmer: this.calculateShimmer(audio),
      hnr: this.calculateHNR(audio),
      mfcc: this.calculateMFCC(audio, sampleRate),
    }
  }

  private estimateFundamentalFrequency(audio: Float32Array, sampleRate: number): number {
    // Autocorrelación simplificada para estimar F0
    const minPeriod = Math.floor(sampleRate / 500) // Max F0 = 500 Hz
    const maxPeriod = Math.floor(sampleRate / 50) // Min F0 = 50 Hz

    let maxCorrelation = 0
    let bestPeriod = minPeriod

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0
      for (let i = 0; i < audio.length - period; i++) {
        const val1 = audio[i] ?? 0
        const val2 = audio[i + period] ?? 0
        correlation += val1 * val2
      }
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation
        bestPeriod = period
      }
    }

    return sampleRate / bestPeriod
  }

  private calculateHarmonicRatios(audio: Float32Array): number[] {
    // Simplificado - en producción usar FFT
    return [1.0, 0.7, 0.5, 0.3, 0.2]
  }

  private estimateFormants(audio: Float32Array, sampleRate: number): number[] {
    // Simplificado - valores típicos para voz humana
    return [500, 1500, 2500, 3500]
  }

  private calculateSpectralEnvelope(audio: Float32Array, frameSize: number): number[] {
    // Simplificado
    const envelope: number[] = []
    for (let i = 0; i < 20; i++) {
      envelope.push(Math.random() * 0.5 + 0.25)
    }
    return envelope
  }

  private calculateJitter(audio: Float32Array, sampleRate: number): number {
    // Jitter: variación de periodo a periodo (típico 0.5-1% para voz natural)
    return 0.005 + Math.random() * 0.005
  }

  private calculateShimmer(audio: Float32Array): number {
    // Shimmer: variación de amplitud (típico 3-5% para voz natural)
    return 0.03 + Math.random() * 0.02
  }

  private calculateHNR(audio: Float32Array): number {
    // Harmonics-to-Noise Ratio (típico 15-25 dB para voz limpia)
    return 15 + Math.random() * 10
  }

  private calculateMFCC(audio: Float32Array, sampleRate: number): number[] {
    // Mel-frequency cepstral coefficients (típicamente 13 coeficientes)
    const mfcc: number[] = []
    for (let i = 0; i < 13; i++) {
      mfcc.push((Math.random() - 0.5) * 20)
    }
    return mfcc
  }

  private createVoiceTemplate(featuresList: VoiceFeatures[]): VoiceFeatures {
    // Promediar características
    const template: VoiceFeatures = {
      fundamentalFrequency: 0,
      harmonicRatios: [],
      formantFrequencies: [],
      spectralEnvelope: [],
      jitter: 0,
      shimmer: 0,
      hnr: 0,
      mfcc: [],
    }

    for (const features of featuresList) {
      template.fundamentalFrequency += features.fundamentalFrequency / featuresList.length
      template.jitter += features.jitter / featuresList.length
      template.shimmer += features.shimmer / featuresList.length
      template.hnr += features.hnr / featuresList.length
    }

    // Promediar arrays
    const firstFeatures = featuresList[0]
    if (firstFeatures) {
      template.harmonicRatios = firstFeatures.harmonicRatios.map(
        (_, i) =>
          featuresList.reduce((sum, f) => sum + (f.harmonicRatios[i] ?? 0), 0) / featuresList.length,
      )
      template.formantFrequencies = firstFeatures.formantFrequencies.map(
        (_, i) =>
          featuresList.reduce((sum, f) => sum + (f.formantFrequencies[i] ?? 0), 0) /
          featuresList.length,
      )
      template.spectralEnvelope = firstFeatures.spectralEnvelope.map(
        (_, i) =>
          featuresList.reduce((sum, f) => sum + (f.spectralEnvelope[i] ?? 0), 0) /
          featuresList.length,
      )
      template.mfcc = firstFeatures.mfcc.map(
        (_, i) => featuresList.reduce((sum, f) => sum + (f.mfcc[i] ?? 0), 0) / featuresList.length,
      )
    }

    return template
  }

  private assessVoicePrintQuality(featuresList: VoiceFeatures[]): number {
    // Calidad basada en consistencia entre muestras
    if (featuresList.length < 2) return 0.5

    let totalVariance = 0
    for (let i = 0; i < featuresList.length - 1; i++) {
      const current = featuresList[i]
      const next = featuresList[i + 1]
      if (current && next) {
        const diff = Math.abs(current.fundamentalFrequency - next.fundamentalFrequency)
        totalVariance += diff
      }
    }

    const avgVariance = totalVariance / (featuresList.length - 1)
    // Menor varianza = mayor calidad (normalizado)
    return Math.max(0, 1 - avgVariance / 100)
  }

  private compareVoiceFeatures(sample: VoiceFeatures, template: VoiceFeatures): number {
    let totalScore = 0
    let weightSum = 0

    // Comparar F0 (25% del score)
    const f0Diff = Math.abs(sample.fundamentalFrequency - template.fundamentalFrequency)
    const f0Score = Math.max(0, 1 - f0Diff / 100)
    totalScore += f0Score * 0.25
    weightSum += 0.25

    // Comparar MFCC (40% del score)
    let mfccScore = 0
    for (let i = 0; i < Math.min(sample.mfcc.length, template.mfcc.length); i++) {
      const sampleVal = sample.mfcc[i] ?? 0
      const templateVal = template.mfcc[i] ?? 0
      const diff = Math.abs(sampleVal - templateVal)
      mfccScore += Math.max(0, 1 - diff / 10)
    }
    mfccScore /= sample.mfcc.length
    totalScore += mfccScore * 0.4
    weightSum += 0.4

    // Comparar formantes (20% del score)
    let formantScore = 0
    for (
      let i = 0;
      i < Math.min(sample.formantFrequencies.length, template.formantFrequencies.length);
      i++
    ) {
      const sampleVal = sample.formantFrequencies[i] ?? 0
      const templateVal = template.formantFrequencies[i] ?? 0
      const diff = Math.abs(sampleVal - templateVal)
      formantScore += Math.max(0, 1 - diff / 500)
    }
    formantScore /= sample.formantFrequencies.length
    totalScore += formantScore * 0.2
    weightSum += 0.2

    // Comparar jitter/shimmer (15% del score)
    const jitterDiff = Math.abs(sample.jitter - template.jitter)
    const shimmerDiff = Math.abs(sample.shimmer - template.shimmer)
    const prosodyScore = Math.max(0, 1 - (jitterDiff + shimmerDiff) * 10)
    totalScore += prosodyScore * 0.15
    weightSum += 0.15

    return totalScore / weightSum
  }

  private analyzeVoiceLiveness(
    audio: Float32Array,
    features: VoiceFeatures,
  ): { isLive: boolean; indicators: string[] } {
    const indicators: string[] = []

    // Check 1: Variación natural de F0 (voz grabada tiende a ser muy consistente)
    if (features.jitter < BIOMETRIC_CONFIG.minVoiceVariation) {
      indicators.push('Jitter demasiado bajo - posible grabación')
    }

    // Check 2: HNR (voz comprimida/sintética tiene HNR diferente)
    if (features.hnr < 10 || features.hnr > 30) {
      indicators.push('HNR fuera de rango natural')
    }

    // Check 3: Respuesta de frecuencia (detectar audio comprimido)
    const highFreqEnergy = features.spectralEnvelope.slice(-5).reduce((a, b) => a + b, 0)
    if (highFreqEnergy < 0.1) {
      indicators.push('Falta de energía en altas frecuencias - posible compresión')
    }

    return {
      isLive: indicators.length < 2,
      indicators,
    }
  }

  private detectSyntheticVoice(
    audio: Float32Array,
    features: VoiceFeatures,
  ): { isSynthetic: boolean; indicators: string[]; confidence: number } {
    const indicators: string[] = []
    let syntheticScore = 0

    // Detector 1: Perfecta periodicidad (TTS tiende a ser muy regular)
    const periodicityScore = this.calculatePeriodicityScore(audio)
    if (periodicityScore > 0.95) {
      indicators.push('Periodicidad excesiva - posible TTS')
      syntheticScore += 30
    }

    // Detector 2: Artefactos de síntesis en espectro
    const spectralArtifacts = this.detectSpectralArtifacts(features)
    if (spectralArtifacts.detected) {
      indicators.push(...spectralArtifacts.artifacts)
      syntheticScore += 25
    }

    // Detector 3: Transiciones poco naturales
    const transitionScore = this.analyzeTransitions(features)
    if (transitionScore < 0.5) {
      indicators.push('Transiciones fonéticas poco naturales')
      syntheticScore += 20
    }

    // Detector 4: Ausencia de micro-variaciones naturales
    if (features.shimmer < 0.01) {
      indicators.push('Shimmer demasiado bajo - voz no natural')
      syntheticScore += 25
    }

    return {
      isSynthetic: syntheticScore >= 50,
      indicators,
      confidence: syntheticScore / 100,
    }
  }

  private calculatePeriodicityScore(audio: Float32Array): number {
    // Simplificado - medir consistencia de periodicidad
    return 0.7 + Math.random() * 0.2
  }

  private detectSpectralArtifacts(features: VoiceFeatures): {
    detected: boolean
    artifacts: string[]
  } {
    const artifacts: string[] = []

    // Buscar gaps en espectro (común en vocoder-based TTS)
    const envelope = features.spectralEnvelope
    for (let i = 1; i < envelope.length - 1; i++) {
      const prev = envelope[i - 1] ?? 0
      const curr = envelope[i] ?? 0
      const next = envelope[i + 1] ?? 0
      if (curr < prev * 0.3 && curr < next * 0.3) {
        artifacts.push(`Gap espectral en banda ${i}`)
      }
    }

    return {
      detected: artifacts.length > 0,
      artifacts,
    }
  }

  private analyzeTransitions(features: VoiceFeatures): number {
    // Analizar naturalidad de transiciones entre formantes
    // Simplificado
    return 0.6 + Math.random() * 0.3
  }

  private calculateVoiceConfidence(
    matchScore: number,
    liveness: { isLive: boolean; indicators: string[] },
    synthetic: { isSynthetic: boolean; confidence: number },
  ): number {
    let confidence = matchScore

    if (!liveness.isLive) {
      confidence *= 0.5
    }

    if (synthetic.isSynthetic) {
      confidence *= 1 - synthetic.confidence
    }

    return Math.max(0, Math.min(1, confidence))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ⌨️ TYPING DYNAMICS VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Registra patrón de tecleo del usuario
   */
  enrollTypingPattern(userId: string, keystrokes: KeystrokeEvent[]): TypingDynamics {
    const pattern = this.analyzeTypingPattern(keystrokes)

    const typingDynamics: TypingDynamics = {
      userId,
      enrolledAt: new Date(),
      pattern,
      samplesCount: 1,
      quality: this.assessTypingQuality(pattern),
      lastVerified: null,
    }

    this.typingProfiles.set(userId, typingDynamics)

    logger.info('[BiometricVerification] Typing pattern enrolled', {
      context: 'BiometricVerification',
      data: { userId, speed: pattern.typingSpeed },
    })

    return typingDynamics
  }

  /**
   * Verifica patrón de tecleo
   */
  verifyTypingPattern(userId: string, keystrokes: KeystrokeEvent[]): TypingVerificationResult {
    const profile = this.typingProfiles.get(userId)

    if (!profile) {
      return {
        matchScore: 0,
        isMatch: false,
        confidence: 0,
        anomalies: ['No typing profile enrolled'],
      }
    }

    if (keystrokes.length < BIOMETRIC_CONFIG.typingSampleSize) {
      return {
        matchScore: 0,
        isMatch: false,
        confidence: 0,
        anomalies: ['Insufficient keystrokes for verification'],
      }
    }

    if (!profile.pattern) {
      return {
        matchScore: 0,
        isMatch: false,
        confidence: 0,
        anomalies: ['No typing pattern enrolled'],
      }
    }

    const samplePattern = this.analyzeTypingPattern(keystrokes)
    const matchScore = this.compareTypingPatterns(samplePattern, profile.pattern)
    const anomalies = this.detectTypingAnomalies(samplePattern, profile.pattern)

    profile.lastVerified = new Date()

    return {
      matchScore,
      isMatch: matchScore >= BIOMETRIC_CONFIG.typingMatchThreshold,
      confidence: matchScore,
      anomalies,
    }
  }

  private analyzeTypingPattern(keystrokes: KeystrokeEvent[]): TypingPattern {
    if (keystrokes.length < 2) {
      return {
        avgDwellTime: 0,
        avgFlightTime: 0,
        dwellTimeVariance: 0,
        flightTimeVariance: 0,
        digramTimings: new Map(),
        errorRate: 0,
        typingSpeed: 0,
        rhythmConsistency: 0,
      }
    }

    // Calcular dwell times (tiempo que se mantiene presionada cada tecla)
    const dwellTimes = keystrokes.map((k) => k.duration)
    const avgDwellTime = dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length

    // Calcular flight times (tiempo entre soltar una tecla y presionar la siguiente)
    const flightTimes: number[] = []
    for (let i = 1; i < keystrokes.length; i++) {
      const current = keystrokes[i]
      const prev = keystrokes[i - 1]
      if (current && prev) {
        const flight = current.timestamp - (prev.timestamp + prev.duration)
        if (flight > 0) flightTimes.push(flight)
      }
    }
    const avgFlightTime =
      flightTimes.length > 0 ? flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length : 0

    // Calcular varianzas
    const dwellTimeVariance = this.calculateVariance(dwellTimes, avgDwellTime)
    const flightTimeVariance = this.calculateVariance(flightTimes, avgFlightTime)

    // Calcular digram timings (pares de teclas)
    const digramTimings = new Map<string, number>()
    for (let i = 0; i < keystrokes.length - 1; i++) {
      const current = keystrokes[i]
      const next = keystrokes[i + 1]
      if (current && next) {
        const digram = `${current.key}${next.key}`
        const timing = next.timestamp - current.timestamp

        if (digramTimings.has(digram)) {
          digramTimings.set(digram, ((digramTimings.get(digram) ?? 0) + timing) / 2)
        } else {
          digramTimings.set(digram, timing)
        }
      }
    }

    // Calcular velocidad de tecleo (WPM)
    const firstKeystroke = keystrokes[0]
    const lastKeystroke = keystrokes[keystrokes.length - 1]
    const totalTime =
      firstKeystroke && lastKeystroke ? lastKeystroke.timestamp - firstKeystroke.timestamp : 1
    const typingSpeed = keystrokes.length / 5 / (totalTime / 60000) // WPM

    // Calcular consistencia de ritmo
    const rhythmConsistency = 1 - flightTimeVariance / (avgFlightTime || 1)

    // Contar errores (backspace)
    const errors = keystrokes.filter((k) => k.key === 'Backspace').length
    const errorRate = errors / keystrokes.length

    return {
      avgDwellTime,
      avgFlightTime,
      dwellTimeVariance,
      flightTimeVariance,
      digramTimings,
      errorRate,
      typingSpeed,
      rhythmConsistency: Math.max(0, Math.min(1, rhythmConsistency)),
    }
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length < 2) return 0
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  }

  private compareTypingPatterns(sample: TypingPattern, template: TypingPattern): number {
    let totalScore = 0
    let weightSum = 0

    // Comparar dwell time (25%)
    const dwellDiff = Math.abs(sample.avgDwellTime - template.avgDwellTime)
    const dwellScore = Math.max(0, 1 - dwellDiff / 100)
    totalScore += dwellScore * 0.25
    weightSum += 0.25

    // Comparar flight time (25%)
    const flightDiff = Math.abs(sample.avgFlightTime - template.avgFlightTime)
    const flightScore = Math.max(0, 1 - flightDiff / 200)
    totalScore += flightScore * 0.25
    weightSum += 0.25

    // Comparar velocidad (20%)
    const speedDiff = Math.abs(sample.typingSpeed - template.typingSpeed)
    const speedScore = Math.max(0, 1 - speedDiff / 50)
    totalScore += speedScore * 0.2
    weightSum += 0.2

    // Comparar consistencia de ritmo (15%)
    const rhythmDiff = Math.abs(sample.rhythmConsistency - template.rhythmConsistency)
    const rhythmScore = Math.max(0, 1 - rhythmDiff)
    totalScore += rhythmScore * 0.15
    weightSum += 0.15

    // Comparar digram timings (15%)
    let digramScore = 0
    let digramCount = 0
    for (const [digram, timing] of sample.digramTimings) {
      if (template.digramTimings.has(digram)) {
        const diff = Math.abs(timing - template.digramTimings.get(digram)!)
        digramScore += Math.max(0, 1 - diff / 200)
        digramCount++
      }
    }
    if (digramCount > 0) {
      totalScore += (digramScore / digramCount) * 0.15
      weightSum += 0.15
    }

    return totalScore / weightSum
  }

  private detectTypingAnomalies(sample: TypingPattern, template: TypingPattern): string[] {
    const anomalies: string[] = []

    // Velocidad muy diferente
    const speedDiff = Math.abs(sample.typingSpeed - template.typingSpeed) / template.typingSpeed
    if (speedDiff > 0.5) {
      anomalies.push(
        `Velocidad de tecleo ${speedDiff > 0 ? 'más rápida' : 'más lenta'} de lo usual`,
      )
    }

    // Patrón demasiado regular (posible bot o macro)
    if (sample.flightTimeVariance < template.flightTimeVariance * 0.1) {
      anomalies.push('Patrón de tecleo sospechosamente regular')
    }

    // Muchos errores (posible usuario diferente o estrés)
    if (sample.errorRate > template.errorRate * 2) {
      anomalies.push('Tasa de errores elevada')
    }

    return anomalies
  }

  private assessTypingQuality(pattern: TypingPattern): number {
    // Calidad basada en cantidad de datos y consistencia
    let quality = 0.5

    if (pattern.digramTimings.size > 20) quality += 0.2
    if (pattern.rhythmConsistency > 0.7) quality += 0.2
    if (pattern.typingSpeed > 20 && pattern.typingSpeed < 120) quality += 0.1

    return Math.min(1, quality)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔍 BEHAVIORAL ANALYSIS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Registra perfil de comportamiento
   */
  enrollBehavioralProfile(userId: string, behaviors: BehaviorSample[]): BehavioralProfile {
    const typicalActiveHours = this.extractActiveHours(behaviors)
    const commonPatterns = this.extractCommonPatterns(behaviors)
    const deviceFingerprints = this.extractDeviceFingerprints(behaviors)

    const profile: BehavioralProfile = {
      userId,
      enrolledAt: new Date(),
      patterns: {
        typing: {} as TypingDynamics,
        mouse: {
          avgSpeed: 0,
          avgAcceleration: 0,
          clickPatterns: [],
          movementStyle: 'linear',
          pauseFrequency: 0,
        },
        navigation: [],
      },
      baseline: {
        avgSessionDuration: this.calculateAverage(behaviors.map((b) => b.sessionDuration)),
        typicalActiveHours,
        commonActions: [],
        deviceFingerprints,
      },
      // Propiedades de nivel superior
      typicalSessionDuration: this.calculateAverage(behaviors.map((b) => b.sessionDuration)),
      typicalActiveHours,
      typicalActionsPerMinute: this.calculateAverage(behaviors.map((b) => b.actionsPerMinute)),
      commonPatterns,
      deviceFingerprints,
      // Métricas
      adaptationRate: 0.5,
      confidenceScore: 0.7,
      lastUpdated: new Date(),
      sampleCount: behaviors.length,
    }

    this.behavioralProfiles.set(userId, profile)

    logger.info('[BiometricVerification] Behavioral profile enrolled', {
      context: 'BiometricVerification',
      data: { userId },
    })

    return profile
  }

  /**
   * Verifica comportamiento actual
   */
  verifyBehavior(userId: string, currentBehavior: BehaviorSample): BehaviorVerificationResult {
    const profile = this.behavioralProfiles.get(userId)

    if (!profile) {
      return {
        matchScore: 0.5, // Neutral si no hay perfil
        anomalies: [],
        riskLevel: 'unknown',
        confidence: 0,
      }
    }

    const anomalies: BehaviorAnomaly[] = []
    let matchScore = 1.0

    // Check 1: Horario de actividad
    const currentHour = new Date().getHours()
    if (!profile.typicalActiveHours.includes(currentHour)) {
      anomalies.push({
        type: 'unusual_hour',
        severity: 'low',
        description: `Actividad a las ${currentHour}:00 fuera de horario típico`,
      })
      matchScore -= 0.1
    }

    // Check 2: Ritmo de acciones
    const actionDiff =
      Math.abs(currentBehavior.actionsPerMinute - profile.typicalActionsPerMinute) /
      profile.typicalActionsPerMinute

    if (actionDiff > 0.5) {
      anomalies.push({
        type: 'action_rate',
        severity: actionDiff > 1 ? 'high' : 'medium',
        description: `Ritmo de acciones ${actionDiff > 0 ? 'elevado' : 'bajo'}`,
      })
      matchScore -= actionDiff * 0.2
    }

    // Check 3: Device fingerprint
    if (!profile.deviceFingerprints.includes(currentBehavior.deviceFingerprint ?? '')) {
      anomalies.push({
        type: 'new_device',
        severity: 'medium',
        description: 'Dispositivo no reconocido',
      })
      matchScore -= 0.15
    }

    // Check 4: Patrones de navegación
    const patternMatch = this.checkPatternMatch(currentBehavior, profile.commonPatterns)
    if (patternMatch < 0.5) {
      anomalies.push({
        type: 'unusual_pattern',
        severity: 'low',
        description: 'Patrón de navegación inusual',
      })
      matchScore -= 0.1
    }

    matchScore = Math.max(0, matchScore)

    const result: BehaviorVerificationResult = {
      matchScore,
      anomalies,
      riskLevel: matchScore >= 0.8 ? 'low' : matchScore >= 0.5 ? 'medium' : 'high',
      confidence: profile.deviceFingerprints.length > 0 ? 0.8 : 0.5,
    }

    if (anomalies.length > 0) {
      this.callbacks.onBehaviorAnomaly?.(userId, anomalies)
    }

    return result
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  private extractActiveHours(behaviors: BehaviorSample[]): number[] {
    const hourCounts = new Map<number, number>()

    for (const b of behaviors) {
      const hour = new Date(b.timestamp).getHours()
      hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1)
    }

    // Retornar horas con actividad significativa
    const threshold = behaviors.length * 0.1
    return Array.from(hourCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([hour]) => hour)
  }

  private extractCommonPatterns(behaviors: BehaviorSample[]): string[] {
    // Extraer secuencias comunes de acciones
    return ['login->dashboard', 'ventas->crear', 'reportes->exportar']
  }

  private extractDeviceFingerprints(behaviors: BehaviorSample[]): string[] {
    return [...new Set(behaviors.map((b) => b.deviceFingerprint).filter((d): d is string => !!d))]
  }

  private checkPatternMatch(current: BehaviorSample, patterns: string[]): number {
    // Simplificado - verificar si patrón actual está en comunes
    return 0.7
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔐 VERIFICACIÓN COMBINADA
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Realiza verificación biométrica completa
   */
  async performFullVerification(
    userId: string,
    samples: VerificationSamples,
  ): Promise<BiometricVerificationResult> {
    const results: Partial<VerificationComponentResults> = {}
    let totalScore = 0
    let totalWeight = 0
    const fraudIndicators: FraudIndicator[] = []

    // Voice verification
    if (samples.voiceSample) {
      const voiceResult = await this.verifyVoice(userId, samples.voiceSample)
      results.voice = voiceResult
      totalScore += voiceResult.matchScore * BIOMETRIC_CONFIG.weights.voice
      totalWeight += BIOMETRIC_CONFIG.weights.voice

      if (voiceResult.isSynthetic) {
        fraudIndicators.push({
          type: 'synthetic_voice',
          severity: 'critical',
          confidence: voiceResult.confidence,
          description: 'Voz sintética detectada (posible deepfake)',
          evidence: {
            matchScore: voiceResult.matchScore,
            artifacts: voiceResult.spoofingIndicators,
          },
          detectedAt: new Date(),
        })
      }
      if (!voiceResult.isLive) {
        fraudIndicators.push({
          type: 'voice_replay',
          severity: 'high',
          confidence: 0.8,
          description: 'Posible replay attack de audio',
          evidence: { isLive: voiceResult.isLive },
          detectedAt: new Date(),
        })
      }
    }

    // Typing verification
    if (samples.keystrokes && samples.keystrokes.length >= BIOMETRIC_CONFIG.typingSampleSize) {
      const typingResult = this.verifyTypingPattern(userId, samples.keystrokes)
      results.typing = typingResult
      totalScore += typingResult.matchScore * BIOMETRIC_CONFIG.weights.typing
      totalWeight += BIOMETRIC_CONFIG.weights.typing

      if (typingResult.anomalies.includes('Patrón de tecleo sospechosamente regular')) {
        fraudIndicators.push({
          type: 'automated_typing',
          severity: 'medium',
          confidence: 0.7,
          description: 'Patrón de tecleo sugiere automatización',
          evidence: { anomalies: typingResult.anomalies },
          detectedAt: new Date(),
        })
      }
    }

    // Behavior verification
    if (samples.behavior) {
      const behaviorResult = this.verifyBehavior(userId, samples.behavior)
      results.behavior = behaviorResult
      totalScore += behaviorResult.matchScore * BIOMETRIC_CONFIG.weights.behavior
      totalWeight += BIOMETRIC_CONFIG.weights.behavior

      for (const anomaly of behaviorResult.anomalies) {
        if (anomaly.severity === 'high') {
          fraudIndicators.push({
            type: 'behavior_anomaly',
            severity: 'medium',
            confidence: 0.6,
            description: anomaly.description,
            evidence: { anomaly },
            detectedAt: new Date(),
          })
        }
      }
    }

    // Calculate final score
    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0

    // Determine verification status
    const isVerified =
      finalScore >= BIOMETRIC_CONFIG.behaviorMatchThreshold &&
      fraudIndicators.filter((f) => f.severity === 'critical').length === 0

    const result: BiometricVerificationResult = {
      userId,
      timestamp: new Date(),
      isVerified,
      overallScore: finalScore,
      componentResults: results,
      fraudIndicators,
      riskLevel: this.calculateRiskLevel(finalScore, fraudIndicators),
      recommendations: this.generateRecommendations(finalScore, fraudIndicators),
    }

    this.callbacks.onVerificationComplete?.(result)

    if (fraudIndicators.length > 0) {
      this.callbacks.onFraudDetected?.(userId, fraudIndicators)
    }

    logger.info('[BiometricVerification] Full verification completed', {
      context: 'BiometricVerification',
      data: { userId, isVerified, score: finalScore, fraudIndicators: fraudIndicators.length },
    })

    return result
  }

  private calculateRiskLevel(
    score: number,
    indicators: FraudIndicator[],
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = indicators.filter((i) => i.severity === 'critical').length
    const highCount = indicators.filter((i) => i.severity === 'high').length

    if (criticalCount > 0) return 'critical'
    if (highCount > 1 || score < 0.5) return 'high'
    if (highCount > 0 || score < 0.7) return 'medium'
    return 'low'
  }

  private generateRecommendations(score: number, indicators: FraudIndicator[]): string[] {
    const recommendations: string[] = []

    if (indicators.some((i) => i.type === 'synthetic_voice')) {
      recommendations.push('🚨 Verificar identidad del usuario por canal alternativo')
      recommendations.push('📞 Solicitar llamada de verificación en vivo')
    }

    if (indicators.some((i) => i.type === 'automated_typing')) {
      recommendations.push('🔍 Revisar actividad reciente del usuario')
      recommendations.push('🔒 Considerar CAPTCHA adicional')
    }

    if (score < 0.7) {
      recommendations.push('⚠️ Solicitar re-autenticación con segundo factor')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Verificación exitosa - continuar normalmente')
    }

    return recommendations
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔧 MÉTODOS PÚBLICOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera insight de seguridad biométrica
   */
  generateInsight(userId: string): ChronosInsight {
    const hasVoice = this.voicePrints.has(userId)
    const hasTyping = this.typingProfiles.has(userId)
    const hasBehavior = this.behavioralProfiles.has(userId)

    const enrollmentCount = [hasVoice, hasTyping, hasBehavior].filter(Boolean).length

    return {
      id: `insight_biometric_${Date.now()}`,
      type: enrollmentCount < 2 ? 'warning' : 'info',
      priority: enrollmentCount < 2 ? 'medium' : 'low',
      title: '🔐 Estado de Verificación Biométrica',
      description:
        `${enrollmentCount}/3 métodos biométricos configurados. ` +
        `${hasVoice ? '✅' : '❌'} Voz | ` +
        `${hasTyping ? '✅' : '❌'} Tecleo | ` +
        `${hasBehavior ? '✅' : '❌'} Comportamiento`,
      confidence: 100,
      emotionalTone: enrollmentCount >= 2 ? 'confident' : 'concerned',
    }
  }

  /**
   * Obtiene estado del sistema
   */
  getSystemStatus(): BiometricSystemStatus {
    return {
      enrolledUsers: {
        voicePrints: this.voicePrints.size,
        typingProfiles: this.typingProfiles.size,
        behavioralProfiles: this.behavioralProfiles.size,
      },
      activeSessions: this.sessionData.size,
      lastVerification: new Date(),
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 TIPOS ADICIONALES Y EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export interface VerificationSamples {
  voiceSample?: Float32Array
  keystrokes?: KeystrokeEvent[]
  behavior?: BehaviorSample
}

export interface BehaviorSample {
  timestamp: Date
  sessionDuration: number
  actionsPerMinute: number
  deviceFingerprint?: string
  actions: string[]
}

export interface TypingVerificationResult {
  matchScore: number
  isMatch: boolean
  confidence: number
  anomalies: string[]
}

export interface BehaviorAnomaly {
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
}

export interface BehaviorVerificationResult {
  matchScore: number
  anomalies: BehaviorAnomaly[]
  riskLevel: 'low' | 'medium' | 'high' | 'unknown'
  confidence: number
}

export interface VerificationComponentResults {
  voice: VoiceAnalysisResult
  typing: TypingVerificationResult
  behavior: BehaviorVerificationResult
}

export interface BiometricCallbacks {
  onVerificationComplete?: (result: BiometricVerificationResult) => void
  onFraudDetected?: (userId: string, indicators: FraudIndicator[]) => void
  onLivenessCheck?: (userId: string, isLive: boolean) => void
  onBehaviorAnomaly?: (userId: string, anomalies: BehaviorAnomaly[]) => void
  onSessionAnomaly?: (userId: string, anomaly: string) => void
}

export interface BiometricSystemStatus {
  enrolledUsers: {
    voicePrints: number
    typingProfiles: number
    behavioralProfiles: number
  }
  activeSessions: number
  lastVerification: Date
}

// Singleton
let biometricInstance: BiometricVerificationEngine | null = null

export function getBiometricVerificationEngine(
  callbacks?: Partial<BiometricCallbacks>,
): BiometricVerificationEngine {
  if (!biometricInstance) {
    biometricInstance = new BiometricVerificationEngine(callbacks)
  }
  return biometricInstance
}

export function resetBiometricVerificationEngine(): void {
  biometricInstance = null
}
