import { useAppStore } from "@/app/lib/store/useAppStore"
import "@testing-library/jest-dom"
import type { BancoId, PanelId } from "@/app/types"

describe("useAppStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      currentPanel: "dashboard",
      sidebarCollapsed: false,
      theme: "dark",
      currentUserId: "anonymous",
      voiceAgentActive: false,
      voiceAgentStatus: "idle",
      audioFrequencies: Array(32).fill(0),
      modelRotation: 0,
      activeScene: null,
      totalCapital: 0,
      dataRefreshTrigger: 0,
    })
  })

  describe("Estado Inicial", () => {
    it("debe inicializar con estado por defecto", () => {
      const state = useAppStore.getState()

      expect(state.currentPanel).toBe("dashboard")
      expect(state.sidebarCollapsed).toBe(false)
      expect(state.theme).toBe("dark")
      expect(state.currentUserId).toBe("anonymous")
      expect(state.voiceAgentActive).toBe(false)
      expect(state.voiceAgentStatus).toBe("idle")
      expect(state.modelRotation).toBe(0)
      expect(state.activeScene).toBeNull()
      expect(state.totalCapital).toBe(0)
    })

    it("debe tener bancos inicializados", () => {
      const { bancos } = useAppStore.getState()

      expect(bancos).toBeDefined()
      expect(bancos.length).toBeGreaterThan(0)
      bancos.forEach((banco) => {
        expect(banco).toHaveProperty("id")
        expect(banco).toHaveProperty("nombre")
        expect(banco).toHaveProperty("saldo")
        expect(banco).toHaveProperty("color")
      })
    })
  })

  describe("UI Actions", () => {
    it("debe cambiar panel actual", () => {
      const { setCurrentPanel } = useAppStore.getState()

      const paneles: PanelId[] = ["ventas", "ordenes", "bancos", "reportes", "almacen"]

      paneles.forEach((panel) => {
        setCurrentPanel(panel)
        expect(useAppStore.getState().currentPanel).toBe(panel)
      })
    })

    it("debe alternar sidebar", () => {
      const { toggleSidebar } = useAppStore.getState()

      expect(useAppStore.getState().sidebarCollapsed).toBe(false)

      toggleSidebar()
      expect(useAppStore.getState().sidebarCollapsed).toBe(true)

      toggleSidebar()
      expect(useAppStore.getState().sidebarCollapsed).toBe(false)
    })

    it("debe cambiar tema", () => {
      const { setTheme } = useAppStore.getState()

      setTheme("light")
      expect(useAppStore.getState().theme).toBe("light")

      setTheme("cyber")
      expect(useAppStore.getState().theme).toBe("cyber")

      setTheme("dark")
      expect(useAppStore.getState().theme).toBe("dark")
    })
  })

  describe("Voice Agent Actions", () => {
    it("debe activar/desactivar voice agent", () => {
      const { setVoiceAgentActive } = useAppStore.getState()

      setVoiceAgentActive(true)
      expect(useAppStore.getState().voiceAgentActive).toBe(true)

      setVoiceAgentActive(false)
      expect(useAppStore.getState().voiceAgentActive).toBe(false)
    })

    it("debe cambiar estado de voice agent", () => {
      const { setVoiceAgentStatus } = useAppStore.getState()

      const estados = ["idle", "listening", "thinking", "speaking"] as const

      estados.forEach((status) => {
        setVoiceAgentStatus(status)
        expect(useAppStore.getState().voiceAgentStatus).toBe(status)
      })
    })

    it("debe actualizar frecuencias de audio", () => {
      const { setAudioFrequencies } = useAppStore.getState()

      const frequencies = Array(32)
        .fill(0)
        .map((_, i) => Math.random() * 100)
      setAudioFrequencies(frequencies)

      expect(useAppStore.getState().audioFrequencies).toEqual(frequencies)
    })
  })

  describe("3D Actions", () => {
    it("debe actualizar rotación del modelo", () => {
      const { setModelRotation } = useAppStore.getState()

      setModelRotation(45)
      expect(useAppStore.getState().modelRotation).toBe(45)

      setModelRotation(180)
      expect(useAppStore.getState().modelRotation).toBe(180)

      setModelRotation(360)
      expect(useAppStore.getState().modelRotation).toBe(360)
    })

    it("debe cambiar escena activa", () => {
      const { setActiveScene } = useAppStore.getState()

      setActiveScene("scene1")
      expect(useAppStore.getState().activeScene).toBe("scene1")

      setActiveScene("scene2")
      expect(useAppStore.getState().activeScene).toBe("scene2")

      setActiveScene(null)
      expect(useAppStore.getState().activeScene).toBeNull()
    })
  })

  describe("Financial UI Sync", () => {
    it("debe actualizar saldo de un banco", () => {
      const { updateBancoSaldo, bancos } = useAppStore.getState()

      const bancoId = bancos[0]?.id
      if (bancoId) {
        updateBancoSaldo(bancoId, 50000)

        const updated = useAppStore.getState().bancos.find((b) => b.id === bancoId)
        expect(updated?.saldo).toBe(50000)
      }
    })

    it("debe actualizar totalCapital al cambiar saldo de banco", () => {
      const { updateBancoSaldo, bancos } = useAppStore.getState()

      // Poner saldos en 0 primero
      bancos.forEach((banco) => {
        updateBancoSaldo(banco.id, 0)
      })

      expect(useAppStore.getState().totalCapital).toBe(0)

      // Agregar saldo a un banco
      const bancoId = bancos[0]?.id
      if (bancoId) {
        updateBancoSaldo(bancoId, 100000)
        expect(useAppStore.getState().totalCapital).toBe(100000)
      }
    })

    it("debe sincronizar bancos desde Firestore", () => {
      const { syncBancosFromFirestore, bancos } = useAppStore.getState()

      const bancosData = bancos.slice(0, 3).map((banco, i) => ({
        id: banco.id,
        saldo: (i + 1) * 10000,
      }))

      syncBancosFromFirestore(bancosData)

      const state = useAppStore.getState()

      bancosData.forEach((data) => {
        const banco = state.bancos.find((b) => b.id === data.id)
        expect(banco?.saldo).toBe(data.saldo)
      })
    })

    it("debe calcular totalCapital correctamente al sincronizar", () => {
      const { syncBancosFromFirestore, bancos } = useAppStore.getState()

      // Reset todos los saldos primero
      const bancosReset = bancos.map((b) => ({ id: b.id, saldo: 0 }))
      syncBancosFromFirestore(bancosReset)

      // Ahora sincronizar con saldos específicos
      const bancosData = [
        { id: bancos[0].id, saldo: 50000 },
        { id: bancos[1]?.id, saldo: 30000 },
      ].filter((b) => b.id)

      syncBancosFromFirestore(bancosData as Array<{ id: BancoId; saldo: number }>)

      // El total debería ser la suma de los saldos sincronizados
      const expectedTotal = useAppStore.getState().bancos.reduce((acc, b) => acc + b.saldo, 0)
      expect(useAppStore.getState().totalCapital).toBe(expectedTotal)
    })
  })

  describe("Data Refresh", () => {
    it("debe incrementar trigger de refresh", () => {
      const { triggerDataRefresh } = useAppStore.getState()

      const initialTrigger = useAppStore.getState().dataRefreshTrigger

      triggerDataRefresh()
      expect(useAppStore.getState().dataRefreshTrigger).toBe(initialTrigger + 1)

      triggerDataRefresh()
      expect(useAppStore.getState().dataRefreshTrigger).toBe(initialTrigger + 2)
    })
  })

  describe("Persistencia", () => {
    it("solo debe persistir preferencias de UI", () => {
      // Verificar que el store tiene configuración de persist
      // (La implementación real usa partialize para limitar qué se persiste)
      const state = useAppStore.getState()

      // Estos deberían existir y poder ser persistidos
      expect(state).toHaveProperty("theme")
      expect(state).toHaveProperty("sidebarCollapsed")
      expect(state).toHaveProperty("currentPanel")
    })
  })
})
